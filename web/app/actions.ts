"use server"

import { MemberRole, ModerationActionType, ModerationState, NotificationType, PostMode, PostType, ReportReason, ReputationCategory, TemplateType } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { generateDiscussionSummary } from "@/lib/ai-summary"
import { hasDatabaseUrl, prisma } from "@/lib/prisma"
import {
  createSession,
  destroySession,
  getSessionUser,
  hashPassword,
  requireUser,
  verifyPassword,
} from "@/lib/session"
import { slugify } from "@/lib/utils"

function revalidatePostPaths(postId: string, slug: string) {
  revalidatePath("/")
  if (postId) {
    revalidatePath(`/post/${postId}`)
  }
  if (slug) {
    revalidatePath(`/c/${slug}`)
  }
  revalidatePath("/explore")
}

async function enforceRateLimit(userId: string, action: "post" | "comment" | "vote" | "report", windowMinutes: number, maxCount: number) {
  if (!hasDatabaseUrl) return null

  const since = new Date(Date.now() - windowMinutes * 60 * 1000)
  let count = 0

  if (action === "post") {
    count = await prisma.post.count({ where: { authorId: userId, createdAt: { gte: since } } })
  }
  if (action === "comment") {
    count = await prisma.comment.count({ where: { authorId: userId, createdAt: { gte: since } } })
  }
  if (action === "vote") {
    const [postVotes, commentVotes] = await Promise.all([
      prisma.postVote.count({ where: { userId, createdAt: { gte: since } } }),
      prisma.commentVote.count({ where: { userId, createdAt: { gte: since } } }),
    ])
    count = postVotes + commentVotes
  }
  if (action === "report") {
    count = await prisma.report.count({ where: { userId, createdAt: { gte: since } } })
  }

  if (count >= maxCount) {
    return `Slow down. Too many ${action}s in a short period.`
  }

  return null
}

function hasBlockedLink(text?: string | null) {
  if (!text) return false
  const blocked = ["bit.ly", "tinyurl.com", "loweffortnews.example"]
  return blocked.some((domain) => text.toLowerCase().includes(domain))
}

export async function registerAction(_: unknown, formData: FormData) {
  if (!hasDatabaseUrl) {
    return { error: "Authentication requires a configured database." }
  }
  if (hasBlockedLink(String(formData.get("username") || ""))) {
    return { error: "Choose a normal username." }
  }
  const schema = z.object({
    username: z.string().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/),
    email: z.string().email(),
    password: z.string().min(8),
  })

  const parsed = schema.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: "Check your sign up details and try again." }
  }

  const username = parsed.data.username.toLowerCase()
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email: parsed.data.email.toLowerCase() }],
    },
  })

  if (existing) {
    return { error: "That username or email is already in use." }
  }

  const user = await prisma.user.create({
    data: {
      username,
      email: parsed.data.email.toLowerCase(),
      passwordHash: await hashPassword(parsed.data.password),
    },
  })

  await createSession(user.id)
  redirect("/")
}

export async function loginAction(_: unknown, formData: FormData) {
  if (!hasDatabaseUrl) {
    return { error: "Authentication requires a configured database." }
  }
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  })

  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: "Enter a valid email and password." }
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  })

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: "Invalid credentials." }
  }

  await createSession(user.id)
  redirect("/")
}

export async function logoutAction() {
  await destroySession()
  redirect("/login")
}

export async function createCommunityAction(_: unknown, formData: FormData) {
  const user = await requireUser()

  const schema = z.object({
    name: z.string().min(3).max(40),
    slug: z.string().min(3).max(40),
    description: z.string().min(20).max(220),
    avatar: z.string().url().or(z.literal("")),
    banner: z.string().url().or(z.literal("")),
    rules: z.string().min(10),
  })

  const parsed = schema.safeParse({
    name: formData.get("name"),
    slug: slugify(String(formData.get("slug") || formData.get("name") || "")),
    description: formData.get("description"),
    avatar: formData.get("avatar"),
    banner: formData.get("banner"),
    rules: formData.get("rules"),
  })

  if (!parsed.success) {
    return { error: "Fill out all community details and provide at least one rule." }
  }

  let community
  try {
    community = await prisma.community.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description,
        avatar: parsed.data.avatar,
        banner: parsed.data.banner,
        createdById: user.id,
        rules: {
          create: parsed.data.rules
            .split("\n")
            .map((rule) => rule.trim())
            .filter(Boolean)
            .map((rule, index) => ({
              title: `Rule ${index + 1}`,
              description: rule,
              position: index,
            })),
        },
        members: {
          create: {
            userId: user.id,
            role: MemberRole.MODERATOR,
          },
        },
      },
    })
  } catch {
    return { error: "That community slug is already taken." }
  }

  revalidatePath("/")
  redirect(`/c/${community.slug}`)
}

export async function createPostAction(_: unknown, formData: FormData) {
  const user = await requireUser()
  const rateLimited = await enforceRateLimit(user.id, "post", 30, 5)
  if (rateLimited) return { error: rateLimited }

  const schema = z.object({
    communitySlug: z.string().min(1),
    title: z.string().min(8).max(180),
    body: z.string().max(12000).optional(),
    type: z.nativeEnum(PostType),
    postMode: z.nativeEnum(PostMode),
    templateType: z.nativeEnum(TemplateType),
    topicCategory: z.nativeEnum(ReputationCategory),
    projectId: z.string().optional(),
    structuredPostData: z.string().optional(),
    flairId: z.string().optional(),
    isNsfw: z.string().optional(),
    isSpoiler: z.string().optional(),
    imageUrl: z.string().url().or(z.literal("")).optional(),
    linkUrl: z.string().url().or(z.literal("")).optional(),
  })

  const parsed = schema.safeParse({
    communitySlug: formData.get("communitySlug"),
    title: formData.get("title"),
    body: formData.get("body") || undefined,
    type: formData.get("type"),
    postMode: formData.get("postMode") || "DISCUSSION",
    templateType: formData.get("templateType") || "GENERAL_DISCUSSION",
    topicCategory: formData.get("topicCategory") || "INDIE_HACKER",
    projectId: formData.get("projectId") || undefined,
    structuredPostData: formData.get("structuredPostData") || undefined,
    flairId: formData.get("flairId") || undefined,
    isNsfw: formData.get("isNsfw") || undefined,
    isSpoiler: formData.get("isSpoiler") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
    linkUrl: formData.get("linkUrl") || undefined,
  })

  if (!parsed.success) {
    return { error: "Your post is missing required fields." }
  }

  const community = await prisma.community.findUnique({
    where: { slug: parsed.data.communitySlug },
  })

  if (!community) {
    return { error: "Community not found." }
  }

  const membership = await prisma.communityMember.findUnique({
    where: {
      userId_communityId: {
        userId: user.id,
        communityId: community.id,
      },
    },
  })

  if (!membership) {
    return { error: "Join the community before posting." }
  }

  if (hasBlockedLink(parsed.data.linkUrl || parsed.data.body || parsed.data.title)) {
    return { error: "This post contains a blocked or suspicious link." }
  }

  const duplicate = await prisma.post.findFirst({
    where: {
      communityId: community.id,
      authorId: user.id,
      title: parsed.data.title,
      createdAt: { gte: new Date(Date.now() - 12 * 60 * 60 * 1000) },
    },
  })
  if (duplicate) {
    return { error: "That post looks like a recent duplicate." }
  }

  let structuredPostData: Record<string, string> | null = null
  if (parsed.data.structuredPostData) {
    try {
      const parsedJson = JSON.parse(parsed.data.structuredPostData)
      if (parsedJson && typeof parsedJson === "object") {
        structuredPostData = parsedJson as Record<string, string>
      }
    } catch {
      return { error: "Structured fields could not be parsed." }
    }
  }

  const post = await prisma.post.create({
    data: {
      title: parsed.data.title,
      body: parsed.data.body,
      type: parsed.data.type,
      postMode: parsed.data.postMode,
      templateType: parsed.data.templateType,
      topicCategory: parsed.data.topicCategory,
      projectId: parsed.data.projectId || null,
      structuredPostData: structuredPostData ?? undefined,
      imageUrl: parsed.data.type === PostType.IMAGE ? parsed.data.imageUrl : null,
      linkUrl: parsed.data.type === PostType.LINK ? parsed.data.linkUrl : null,
      flairId: parsed.data.flairId || null,
      isNsfw: parsed.data.isNsfw === "on",
      isSpoiler: parsed.data.isSpoiler === "on",
      moderationState: community.requirePostApproval ? ModerationState.PENDING : ModerationState.VISIBLE,
      authorId: user.id,
      communityId: community.id,
      aiSummary: generateDiscussionSummary({
        title: parsed.data.title,
        body: parsed.data.body,
      }),
      aiSummaryUpdatedAt: new Date(),
    },
  })

  if (parsed.data.projectId && parsed.data.templateType === TemplateType.BUILD_IN_PUBLIC && parsed.data.body) {
    await prisma.projectUpdate.create({
      data: {
        projectId: parsed.data.projectId,
        title: parsed.data.title,
        content: parsed.data.body,
      },
    })
  }

  await prisma.userReputation.upsert({
    where: {
      userId_category: {
        userId: user.id,
        category: parsed.data.topicCategory,
      },
    },
    update: {
      score: {
        increment: parsed.data.postMode === PostMode.SHOWCASE ? 8 : parsed.data.postMode === PostMode.FEEDBACK ? 6 : 4,
      },
    },
    create: {
      userId: user.id,
      category: parsed.data.topicCategory,
      score: parsed.data.postMode === PostMode.SHOWCASE ? 8 : parsed.data.postMode === PostMode.FEEDBACK ? 6 : 4,
    },
  })

  if (community.requirePostApproval) {
    await prisma.notification.create({
      data: {
        userId: community.createdById,
        actorId: user.id,
        postId: post.id,
        type: NotificationType.MOD_ACTION,
        body: `${user.username} submitted a post to ${community.name} for review.`,
      },
    })
  }

  revalidatePath("/")
  revalidatePath(`/c/${community.slug}`)
  redirect(`/post/${post.id}`)
}

export async function saveDraftAction(_: unknown, formData: FormData) {
  const user = await requireUser()
  const communitySlug = String(formData.get("communitySlug") || "")
  const community = communitySlug ? await prisma.community.findUnique({ where: { slug: communitySlug } }) : null

  await prisma.postDraft.create({
    data: {
      userId: user.id,
      communityId: community?.id ?? null,
      title: String(formData.get("title") || "Untitled draft"),
      body: String(formData.get("body") || ""),
      type: PostType[String(formData.get("type") || "TEXT") as keyof typeof PostType] ?? PostType.TEXT,
      imageUrl: String(formData.get("imageUrl") || "") || null,
      linkUrl: String(formData.get("linkUrl") || "") || null,
    },
  })

  revalidatePath("/settings")
  revalidatePath(`/c/${communitySlug}/submit`)
  return { success: "Draft saved." }
}

export async function createProjectAction(_: unknown, formData: FormData) {
  const user = await requireUser()

  const schema = z.object({
    name: z.string().min(3).max(48),
    description: z.string().min(12).max(260),
    stage: z.enum(["IDEA", "MVP", "LAUNCHING", "GROWING", "PROFITABLE"]),
  })

  const parsed = schema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    stage: formData.get("stage") || "IDEA",
  })

  if (!parsed.success) {
    return { error: "Project details are incomplete." }
  }

  const slug = slugify(`${user.username}-${parsed.data.name}`)

  await prisma.project.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      stage: parsed.data.stage,
    },
  })

  revalidatePath(`/u/${user.username}`)
  return { success: "Project added to your build-in-public profile." }
}

export async function generatePostSummaryAction(formData: FormData) {
  const user = await requireUser()
  const postId = String(formData.get("postId") || "")
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      comments: {
        where: { isDeleted: false, isRemoved: false },
        orderBy: [{ score: "desc" }],
        take: 8,
      },
    },
  })

  if (!post || post.authorId !== user.id) {
    return
  }

  await prisma.post.update({
    where: { id: postId },
    data: {
      aiSummary: generateDiscussionSummary({
        title: post.title,
        body: post.body,
        comments: post.comments.map((comment) => ({ body: comment.body, score: comment.score })),
      }),
      aiSummaryUpdatedAt: new Date(),
    },
  })

  revalidatePath(`/post/${postId}`)
}

export async function toggleMembershipAction(formData: FormData) {
  const user = await requireUser()
  const communityId = String(formData.get("communityId") || "")
  const slug = String(formData.get("slug") || "")

  const membership = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId: user.id, communityId } },
  })
  const ban = await prisma.bannedUser.findUnique({
    where: { userId_communityId: { userId: user.id, communityId } },
  })

  if (membership) {
    await prisma.communityMember.delete({ where: { id: membership.id } })
    const memberCount = await prisma.communityMember.count({ where: { communityId } })
    await prisma.community.update({ where: { id: communityId }, data: { memberCount } })
  } else {
    if (ban) {
      return
    }
    await prisma.communityMember.create({ data: { userId: user.id, communityId } })
    const memberCount = await prisma.communityMember.count({ where: { communityId } })
    await prisma.community.update({ where: { id: communityId }, data: { memberCount } })
  }

  revalidatePath("/")
  revalidatePath("/explore")
  revalidatePath(`/c/${slug}`)
}

export async function votePostAction(formData: FormData) {
  const user = await requireUser()
  const rateLimited = await enforceRateLimit(user.id, "vote", 10, 80)
  if (rateLimited) return
  const postId = String(formData.get("postId") || "")
  const communitySlug = String(formData.get("communitySlug") || "")
  const intent = String(formData.get("intent") || "")
  const value = intent === "down" ? -1 : 1

  const existing = await prisma.postVote.findUnique({
    where: {
      userId_postId: {
        userId: user.id,
        postId,
      },
    },
  })

  if (existing?.value === value) {
    await prisma.postVote.delete({ where: { id: existing.id } })
  } else if (existing) {
    await prisma.postVote.update({
      where: { id: existing.id },
      data: { value },
    })
  } else {
    await prisma.postVote.create({
      data: {
        userId: user.id,
        postId,
        value,
      },
    })
  }

  const score = await prisma.postVote.aggregate({
    _sum: { value: true },
    where: { postId },
  })

  await prisma.post.update({
    where: { id: postId },
    data: { score: score._sum.value ?? 0 },
  })

  revalidatePostPaths(postId, communitySlug)
}

export async function voteCommentAction(formData: FormData) {
  const user = await requireUser()
  const rateLimited = await enforceRateLimit(user.id, "vote", 10, 80)
  if (rateLimited) return
  const commentId = String(formData.get("commentId") || "")
  const postId = String(formData.get("postId") || "")
  const communitySlug = String(formData.get("communitySlug") || "")
  const intent = String(formData.get("intent") || "")
  const value = intent === "down" ? -1 : 1

  const existing = await prisma.commentVote.findUnique({
    where: {
      userId_commentId: {
        userId: user.id,
        commentId,
      },
    },
  })

  if (existing?.value === value) {
    await prisma.commentVote.delete({ where: { id: existing.id } })
  } else if (existing) {
    await prisma.commentVote.update({ where: { id: existing.id }, data: { value } })
  } else {
    await prisma.commentVote.create({ data: { userId: user.id, commentId, value } })
  }

  const score = await prisma.commentVote.aggregate({
    _sum: { value: true },
    where: { commentId },
  })

  await prisma.comment.update({
    where: { id: commentId },
    data: { score: score._sum.value ?? 0 },
  })

  revalidatePostPaths(postId, communitySlug)
}

export async function createCommentAction(formData: FormData) {
  const user = await requireUser()
  const rateLimited = await enforceRateLimit(user.id, "comment", 15, 20)
  if (rateLimited) return
  const postId = String(formData.get("postId") || "")
  const parentId = String(formData.get("parentId") || "") || null
  const communitySlug = String(formData.get("communitySlug") || "")
  const body = String(formData.get("body") || "").trim()

  if (body.length < 2) {
    return
  }

  if (hasBlockedLink(body)) {
    return
  }

  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post || post.isLocked) {
    return
  }

  if (parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentId } })
    if (parent?.isLocked) {
      return
    }
  }

  await prisma.comment.create({
    data: {
      body,
      authorId: user.id,
      postId,
      parentId,
    },
  })

  if (post && post.authorId !== user.id) {
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        actorId: user.id,
        postId,
        type: NotificationType.POST_REPLY,
        body: `${user.username} replied in one of your threads.`,
      },
    })
  }

  const commentCount = await prisma.comment.count({ where: { postId } })
  await prisma.post.update({ where: { id: postId }, data: { commentCount } })

  await prisma.userReputation.upsert({
    where: {
      userId_category: {
        userId: user.id,
        category: post.topicCategory,
      },
    },
    update: { score: { increment: 2 } },
    create: {
      userId: user.id,
      category: post.topicCategory,
      score: 2,
    },
  })

  revalidatePostPaths(postId, communitySlug)
}

export async function toggleSavePostAction(formData: FormData) {
  const user = await requireUser()
  const postId = String(formData.get("postId") || "")
  const communitySlug = String(formData.get("communitySlug") || "")
  const existing = await prisma.savedItem.findFirst({
    where: { userId: user.id, postId, type: "POST" },
  })

  if (existing) {
    await prisma.savedItem.delete({ where: { id: existing.id } })
  } else {
    await prisma.savedItem.create({
      data: { userId: user.id, postId, type: "POST" },
    })
  }

  revalidatePath(`/u/${user.username}/saved`)
  revalidatePostPaths(postId, communitySlug)
}

export async function toggleHidePostAction(formData: FormData) {
  const user = await requireUser()
  const postId = String(formData.get("postId") || "")
  const existing = await prisma.hiddenPost.findUnique({
    where: {
      userId_postId: {
        userId: user.id,
        postId,
      },
    },
  })

  if (existing) {
    await prisma.hiddenPost.delete({ where: { id: existing.id } })
  } else {
    await prisma.hiddenPost.create({ data: { userId: user.id, postId } })
  }

  revalidatePath("/")
  revalidatePath(`/u/${user.username}/saved`)
}

export async function deleteOwnPostAction(formData: FormData) {
  const user = await requireUser()
  const postId = String(formData.get("postId") || "")
  const communitySlug = String(formData.get("communitySlug") || "")

  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post || post.authorId !== user.id) {
    return
  }

  await prisma.post.update({
    where: { id: postId },
    data: {
      title: "[deleted]",
      body: "This post was deleted by its author.",
      isDeleted: true,
    },
  })
  revalidatePath("/")
  revalidatePath(`/c/${communitySlug}`)
  redirect("/")
}

export async function deleteOwnCommentAction(formData: FormData) {
  const user = await requireUser()
  const commentId = String(formData.get("commentId") || "")
  const postId = String(formData.get("postId") || "")
  const communitySlug = String(formData.get("communitySlug") || "")

  const comment = await prisma.comment.findUnique({ where: { id: commentId } })
  if (!comment || comment.authorId !== user.id) {
    return
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: {
      body: "[deleted]",
      isDeleted: true,
    },
  })
  const commentCount = await prisma.comment.count({ where: { postId } })
  await prisma.post.update({ where: { id: postId }, data: { commentCount } })
  revalidatePostPaths(postId, communitySlug)
}

async function ensureModerator(userId: string, communityId: string) {
  const membership = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId, communityId } },
  })

  return membership?.role === MemberRole.MODERATOR || membership?.role === MemberRole.OWNER
}

export async function moderateRemovePostAction(formData: FormData) {
  const user = await requireUser()
  const postId = String(formData.get("postId") || "")
  const communitySlug = String(formData.get("communitySlug") || "")

  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post || !(await ensureModerator(user.id, post.communityId))) {
    return
  }

  await prisma.post.update({
    where: { id: postId },
    data: {
      isRemoved: true,
      moderationState: ModerationState.REMOVED,
    },
  })
  await prisma.moderationAction.create({
    data: {
      communityId: post.communityId,
      actorId: user.id,
      postId,
      actionType: ModerationActionType.REMOVE_POST,
      note: "Removed by moderator.",
    },
  })
  revalidatePath("/")
  revalidatePath(`/c/${communitySlug}`)
  redirect(`/c/${communitySlug}`)
}

export async function moderateRemoveCommentAction(formData: FormData) {
  const user = await requireUser()
  const commentId = String(formData.get("commentId") || "")
  const postId = String(formData.get("postId") || "")
  const communitySlug = String(formData.get("communitySlug") || "")

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { post: true },
  })
  if (!comment || !(await ensureModerator(user.id, comment.post.communityId))) {
    return
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: {
      isRemoved: true,
      moderationState: ModerationState.REMOVED,
    },
  })
  await prisma.moderationAction.create({
    data: {
      communityId: comment.post.communityId,
      actorId: user.id,
      commentId,
      postId,
      actionType: ModerationActionType.REMOVE_COMMENT,
      note: "Removed by moderator.",
    },
  })
  const commentCount = await prisma.comment.count({ where: { postId } })
  await prisma.post.update({ where: { id: postId }, data: { commentCount } })
  revalidatePostPaths(postId, communitySlug)
}

export async function reportContentAction(formData: FormData) {
  const user = await requireUser()
  const rateLimited = await enforceRateLimit(user.id, "report", 30, 15)
  if (rateLimited) return
  const postId = String(formData.get("postId") || "") || null
  const commentId = String(formData.get("commentId") || "") || null
  const postPageId = String(formData.get("postPageId") || "")
  const communitySlug = String(formData.get("communitySlug") || "")
  const reason = ReportReason[String(formData.get("reason") || "OTHER") as keyof typeof ReportReason] ?? ReportReason.OTHER

  await prisma.report.create({
    data: {
      userId: user.id,
      postId,
      commentId,
      reason,
    },
  })

  revalidatePostPaths(postPageId || postId || "", communitySlug)
}

export async function completeOnboardingAction(_: unknown, formData: FormData) {
  const user = await requireUser()
  const interests = String(formData.get("interests") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6)

  if (!hasDatabaseUrl) {
    return { success: "Onboarding saved." }
  }

  await prisma.userPreference.upsert({
    where: { userId: user.id },
    update: {
      onboardingCompleted: true,
      interests,
    },
    create: {
      userId: user.id,
      onboardingCompleted: true,
      interests,
    },
  })

  revalidatePath("/")
  revalidatePath("/explore")
  return { success: "Your feed preferences are updated." }
}

export async function markNotificationsReadAction() {
  const user = await requireUser()
  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  })
  revalidatePath("/notifications")
}

export async function updateCommunitySettingsAction(_: unknown, formData: FormData) {
  const user = await requireUser()
  const communityId = String(formData.get("communityId") || "")

  const membership = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId: user.id, communityId } },
  })

  if (!membership || (membership.role !== MemberRole.MODERATOR && membership.role !== MemberRole.OWNER)) {
    return { error: "You do not have permission to manage this community." }
  }

  const schema = z.object({
    name: z.string().min(3).max(48),
    description: z.string().min(20).max(260),
    welcomeMessage: z.string().max(240),
    category: z.string().min(2).max(40),
    type: z.enum(["PUBLIC", "RESTRICTED", "PRIVATE"]),
    postPermission: z.string().min(3).max(20),
    commentPermission: z.string().min(3).max(20),
    archiveOldPosts: z.string().optional(),
    requirePostApproval: z.string().optional(),
    isDiscoverable: z.string().optional(),
  })

  const parsed = schema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    welcomeMessage: formData.get("welcomeMessage") || "",
    category: formData.get("category") || "General",
    type: formData.get("type"),
    postPermission: formData.get("postPermission") || "members",
    commentPermission: formData.get("commentPermission") || "members",
    archiveOldPosts: formData.get("archiveOldPosts") || undefined,
    requirePostApproval: formData.get("requirePostApproval") || undefined,
    isDiscoverable: formData.get("isDiscoverable") || undefined,
  })

  if (!parsed.success) {
    return { error: "Community settings could not be saved." }
  }

  const community = await prisma.community.update({
    where: { id: communityId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      welcomeMessage: parsed.data.welcomeMessage,
      category: parsed.data.category,
      type: parsed.data.type,
      postPermission: parsed.data.postPermission,
      commentPermission: parsed.data.commentPermission,
      archiveOldPosts: parsed.data.archiveOldPosts === "on",
      requirePostApproval: parsed.data.requirePostApproval === "on",
      isDiscoverable: parsed.data.isDiscoverable === "on",
    },
  })

  await prisma.communityRule.deleteMany({ where: { communityId } })
  const rules = String(formData.get("rules") || "")
    .split("\n")
    .map((rule) => rule.trim())
    .filter(Boolean)

  for (const [index, rule] of rules.entries()) {
    await prisma.communityRule.create({
      data: {
        communityId,
        title: `Rule ${index + 1}`,
        description: rule,
        position: index,
      },
    })
  }

  await prisma.moderationAction.create({
    data: {
      communityId,
      actorId: user.id,
      actionType: ModerationActionType.UPDATE_SETTINGS,
      note: "Updated community settings and rules.",
    },
  })

  revalidatePath(`/c/${community.slug}`)
  revalidatePath(`/c/${community.slug}/about`)
  revalidatePath(`/c/${community.slug}/rules`)
  revalidatePath(`/c/${community.slug}/moderation`)
  return { success: "Community settings saved." }
}

export async function moderatePostAction(formData: FormData) {
  const user = await requireUser()
  const postId = String(formData.get("postId") || "")
  const slug = String(formData.get("communitySlug") || "")
  const action = String(formData.get("action") || "")
  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post || !(await ensureModerator(user.id, post.communityId))) return

  if (action === "approve") {
    await prisma.post.update({
      where: { id: postId },
      data: { moderationState: ModerationState.APPROVED, isRemoved: false, approvedAt: new Date() },
    })
    await prisma.moderationAction.create({
      data: { communityId: post.communityId, actorId: user.id, postId, actionType: ModerationActionType.APPROVE_POST, note: "Approved post." },
    })
  }
  if (action === "remove") {
    await prisma.post.update({
      where: { id: postId },
      data: { moderationState: ModerationState.REMOVED, isRemoved: true },
    })
    await prisma.moderationAction.create({
      data: { communityId: post.communityId, actorId: user.id, postId, actionType: ModerationActionType.REMOVE_POST, note: "Removed post." },
    })
  }
  if (action === "lock") {
    await prisma.post.update({ where: { id: postId }, data: { isLocked: true } })
    await prisma.moderationAction.create({
      data: { communityId: post.communityId, actorId: user.id, postId, actionType: ModerationActionType.LOCK_POST, note: "Locked post." },
    })
  }
  if (action === "sticky") {
    await prisma.post.update({ where: { id: postId }, data: { isStickied: true } })
    await prisma.moderationAction.create({
      data: { communityId: post.communityId, actorId: user.id, postId, actionType: ModerationActionType.STICKY_POST, note: "Stickied post." },
    })
  }

  revalidatePostPaths(postId, slug)
  revalidatePath(`/c/${slug}/moderation`)
  revalidatePath(`/c/${slug}/moderation/queue`)
  revalidatePath(`/c/${slug}/moderation/reports`)
}

export async function updateSettingsAction(_: unknown, formData: FormData) {
  const user = await requireUser()

  const schema = z.object({
    username: z.string().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/),
    bio: z.string().max(240),
    avatar: z.string().url().or(z.literal("")),
    showNsfw: z.string().optional(),
    showSpoilers: z.string().optional(),
    publicActivity: z.string().optional(),
    compactMode: z.string().optional(),
  })

  const parsed = schema.safeParse({
    username: String(formData.get("username") || "").toLowerCase(),
    bio: String(formData.get("bio") || ""),
    avatar: String(formData.get("avatar") || ""),
    showNsfw: String(formData.get("showNsfw") || "") || undefined,
    showSpoilers: String(formData.get("showSpoilers") || "") || undefined,
    publicActivity: String(formData.get("publicActivity") || "") || undefined,
    compactMode: String(formData.get("compactMode") || "") || undefined,
  })

  if (!parsed.success) {
    return { error: "Settings could not be saved." }
  }

  const conflict = await prisma.user.findFirst({
    where: {
      username: parsed.data.username,
      id: { not: user.id },
    },
  })

  if (conflict) {
    return { error: "That username is already taken." }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      username: parsed.data.username,
      bio: parsed.data.bio,
      avatar: parsed.data.avatar,
      preferences: {
        upsert: {
          update: {
            showNsfw: parsed.data.showNsfw === "on",
            showSpoilers: parsed.data.showSpoilers === "on",
            publicActivity: parsed.data.publicActivity === "on",
            compactMode: parsed.data.compactMode === "on",
          },
          create: {
            showNsfw: parsed.data.showNsfw === "on",
            showSpoilers: parsed.data.showSpoilers === "on",
            publicActivity: parsed.data.publicActivity === "on",
            compactMode: parsed.data.compactMode === "on",
          },
        },
      },
    },
  })

  revalidatePath(`/u/${parsed.data.username}`)
  revalidatePath("/settings")

  return { success: "Settings saved." }
}

export async function getViewer() {
  return getSessionUser()
}
