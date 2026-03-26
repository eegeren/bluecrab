import "server-only"

import { Prisma, ReportReason } from "@prisma/client"
import {
  getMockCommunityBySlug,
  getMockCommunityPageData,
  getMockCommunityModerationData,
  getMockExploreData,
  getMockHomeFeed,
  getMockNotificationsData,
  getMockPostPageData,
  getMockProfilePageData,
  getMockSavedPosts,
  getMockSearchResults,
  getMockShellData,
} from "@/lib/mock-data"
import { hasDatabaseUrl, prisma } from "@/lib/prisma"

const FEED_PAGE_SIZE = 12
const COMMENT_PAGE_SIZE = 20

function pagination(page = 1, pageSize = FEED_PAGE_SIZE) {
  const currentPage = Number.isFinite(page) && page > 0 ? page : 1
  return {
    currentPage,
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  }
}

const postBaseInclude = {
  author: true,
  community: true,
  votes: true,
} satisfies Prisma.PostInclude

const commentBaseInclude = {
  author: true,
  votes: true,
  replies: {
    include: {
      author: true,
      votes: true,
      replies: {
        include: {
          author: true,
          votes: true,
        },
        orderBy: [{ score: "desc" }, { createdAt: "asc" }],
      },
    },
    orderBy: [{ score: "desc" }, { createdAt: "asc" }],
  },
} satisfies Prisma.CommentInclude

export async function getShellData(userId?: string) {
  if (!hasDatabaseUrl) {
    const mock = getMockShellData()
    return {
      ...mock,
      featuredCommunities: mock.trendingCommunities.slice(0, 2),
      unreadCount: userId ? 2 : 0,
    }
  }

  const [trendingCommunities, recommendedCommunities, trendingPosts, featuredCommunities, unreadCount] = await Promise.all([
    prisma.community.findMany({
      take: 5,
      orderBy: [{ memberCount: "desc" }, { createdAt: "desc" }],
    }),
    prisma.community.findMany({
      take: 4,
      where: userId
        ? {
            members: {
              none: { userId },
            },
          }
        : undefined,
      orderBy: [{ createdAt: "desc" }],
    }),
    prisma.post.findMany({
      take: 5,
      include: { community: true },
      orderBy: [{ hotScore: "desc" }, { score: "desc" }, { commentCount: "desc" }, { createdAt: "desc" }],
      where: { isRemoved: false, isDeleted: false },
    }),
    prisma.community.findMany({
      take: 2,
      where: { isFeatured: true },
      orderBy: [{ memberCount: "desc" }, { createdAt: "desc" }],
    }),
    userId
      ? prisma.notification.count({
          where: { userId, isRead: false },
        })
      : Promise.resolve(0),
  ])

  return {
    trendingCommunities,
    recommendedCommunities,
    trendingPosts,
    featuredCommunities,
    unreadCount,
  }
}

function getFeedWhere(sort: string, userId?: string): Prisma.PostWhereInput | undefined {
  const hiddenFilter = userId
    ? {
        hiddenBy: {
          none: { userId },
        },
      }
    : {}

  if (sort === "following" && userId) {
    return {
      ...hiddenFilter,
      isRemoved: false,
      isDeleted: false,
      community: {
        members: {
          some: { userId },
        },
      },
    }
  }

  return {
    ...hiddenFilter,
    isRemoved: false,
    isDeleted: false,
    moderationState: "VISIBLE",
  }
}

export async function getHomeFeed(sort: string, userId?: string, page = 1) {
  const { currentPage, skip, take } = pagination(page)

  if (!hasDatabaseUrl) {
    const posts = getMockHomeFeed(sort)
    return {
      posts: posts.slice(skip, skip + take),
      page: currentPage,
      hasMore: posts.length > skip + take,
      onboarding: userId
        ? {
            needsOnboarding: true,
            interests: ["Product", "Startups", "Design"],
            suggestedCommunities: getMockShellData().recommendedCommunities.slice(0, 3),
          }
        : null,
    }
  }

  const where = getFeedWhere(sort, userId)

  const preferencePromise = userId
    ? prisma.userPreference.findUnique({
        where: { userId },
      })
    : Promise.resolve(null)
  const suggestedCommunitiesPromise = userId
    ? prisma.community.findMany({
        take: 3,
        where: {
          members: {
            none: { userId },
          },
        },
        orderBy: [{ isFeatured: "desc" }, { memberCount: "desc" }],
      })
    : Promise.resolve([])

  const [rawPosts, preference, suggestedCommunities] = await Promise.all([
    prisma.post.findMany({
      skip,
      take: sort === "for-you" ? 40 : take + 1,
      where,
      include: { ...postBaseInclude, flair: true, project: true },
      orderBy: sort === "for-you" ? [{ hotScore: "desc" }, { createdAt: "desc" }] : feedOrder(sort),
    }),
    preferencePromise,
    suggestedCommunitiesPromise,
  ])

  const rankedPosts =
    sort === "for-you"
      ? rawPosts
          .map((post) => {
            const interestBoost = preference?.interests.some((interest) =>
              [post.community.category, post.topicCategory, post.templateType].join(" ").toLowerCase().includes(interest.toLowerCase()),
            )
              ? 18
              : 0
            const featuredBoost = post.community.memberCount > 900 ? 8 : 0
            const feedbackBoost = post.postMode === "FEEDBACK" ? 6 : 0
            return { post, rank: post.hotScore + post.score + interestBoost + featuredBoost + feedbackBoost }
          })
          .sort((a, b) => b.rank - a.rank)
          .map((item) => item.post)
      : rawPosts

  const posts = sort === "for-you" ? rankedPosts.slice(0, take + 1) : rankedPosts

  return {
    posts: posts.slice(0, take),
    page: currentPage,
    hasMore: posts.length > take,
    onboarding: userId
      ? {
          needsOnboarding: !preference?.onboardingCompleted,
          interests: preference?.interests ?? [],
          suggestedCommunities,
        }
      : null,
  }
}

export async function getExploreData(userId?: string) {
  if (!hasDatabaseUrl) {
    const mock = getMockExploreData()
    return {
      ...mock,
      featuredCommunities: mock.communities.slice(0, 2),
    }
  }

  const [communities, posts, featuredCommunities] = await Promise.all([
    prisma.community.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
        members: userId
          ? {
              where: { userId },
              select: { id: true },
            }
          : false,
      },
      where: { isDiscoverable: true },
      orderBy: [{ isFeatured: "desc" }, { memberCount: "desc" }, { createdAt: "desc" }],
    }),
    prisma.post.findMany({
      take: 8,
      include: { community: true, author: true, votes: true, flair: true },
      where: { isRemoved: false, isDeleted: false },
      orderBy: [{ hotScore: "desc" }, { score: "desc" }, { commentCount: "desc" }],
    }),
    prisma.community.findMany({
      where: { isFeatured: true },
      take: 3,
      orderBy: [{ memberCount: "desc" }],
    }),
  ])

  return { communities, posts, featuredCommunities }
}

function feedOrder(sort: string): Prisma.PostOrderByWithRelationInput[] {
  if (sort === "latest") {
    return [{ createdAt: "desc" }]
  }

  if (sort === "top") {
    return [{ score: "desc" }, { commentCount: "desc" }, { createdAt: "desc" }]
  }

  return [{ isStickied: "desc" }, { hotScore: "desc" }, { score: "desc" }, { createdAt: "desc" }]
}

export async function getCommunityPageData(slug: string, sort: string, userId?: string, page = 1) {
  const { currentPage, skip, take } = pagination(page)

  if (!hasDatabaseUrl) {
    const mock = getMockCommunityPageData(slug)
    return mock
      ? {
          ...mock,
          posts: mock.posts.slice(skip, skip + take),
          page: currentPage,
          hasMore: mock.posts.length > skip + take,
        }
      : null
  }

  const community = await prisma.community.findUnique({
    where: { slug },
    include: {
      createdBy: true,
      rules: {
        orderBy: { position: "asc" },
      },
      flairs: true,
      members: userId
        ? {
            where: { userId },
          }
        : {
            take: 0,
          },
      _count: {
        select: { posts: true },
      },
    },
  })

  if (!community) {
    return null
  }

  const posts = await prisma.post.findMany({
    where: { communityId: community.id, isRemoved: false, isDeleted: false },
    include: { ...postBaseInclude, flair: true },
    orderBy: feedOrder(sort),
    skip,
    take: take + 1,
  })

  return {
    community,
    posts: posts.slice(0, take),
    page: currentPage,
    hasMore: posts.length > take,
  }
}

export async function getCommunityBySlug(slug: string, userId?: string) {
  if (!hasDatabaseUrl) {
    return getMockCommunityBySlug(slug)
  }

  return prisma.community.findUnique({
    where: { slug },
    include: {
      flairs: true,
      rules: {
        orderBy: { position: "asc" },
      },
      members: userId
        ? {
            where: { userId },
          }
        : false,
    },
  })
}

export async function getPostPageData(postId: string, userId?: string, commentPage = 1) {
  const { currentPage, skip, take } = pagination(commentPage, COMMENT_PAGE_SIZE)

  if (!hasDatabaseUrl) {
    const mock = getMockPostPageData(postId)
    return mock
      ? {
          ...mock,
          comments: mock.post.comments.slice(skip, skip + take),
          commentPage: currentPage,
          hasMoreComments: mock.post.comments.length > skip + take,
        }
      : null
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: true,
      community: true,
      project: {
        include: {
          updates: {
            orderBy: [{ createdAt: "desc" }],
            take: 5,
          },
        },
      },
      flair: true,
      votes: true,
    },
  })

  if (!post) {
    return null
  }

  const membership = userId
    ? await prisma.communityMember.findUnique({
        where: {
          userId_communityId: {
            userId,
            communityId: post.communityId,
          },
        },
      })
    : null

  const topLevelComments = await prisma.comment.findMany({
    where: {
      postId,
      parentId: null,
      isDeleted: false,
    },
    include: commentBaseInclude,
    orderBy: [{ score: "desc" }, { createdAt: "asc" }],
    skip,
    take: take + 1,
  })

  return {
    post,
    membership,
    comments: topLevelComments.slice(0, take),
    commentPage: currentPage,
    hasMoreComments: topLevelComments.length > take,
  }
}

export async function getProfilePageData(username: string, userId?: string) {
  if (!hasDatabaseUrl) {
    return getMockProfilePageData(username)
  }

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      posts: {
        include: { ...postBaseInclude, flair: true, project: true },
        orderBy: [{ createdAt: "desc" }],
        take: 12,
      },
      comments: {
        include: {
          post: {
            include: {
              community: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
        take: 12,
      },
      memberships: {
        include: { community: true },
        take: 8,
      },
      projects: {
        include: {
          updates: {
            orderBy: [{ createdAt: "desc" }],
            take: 5,
          },
        },
        orderBy: [{ updatedAt: "desc" }],
        take: 6,
      },
      reputationEntries: {
        orderBy: [{ score: "desc" }],
      },
    },
  })

  if (!user) {
    return null
  }

  const [postKarma, commentKarma] = await Promise.all([
    prisma.post.aggregate({
      _sum: { score: true },
      where: { authorId: user.id, isDeleted: false },
    }),
    prisma.comment.aggregate({
      _sum: { score: true },
      where: { authorId: user.id, isDeleted: false },
    }),
  ])

  const viewerMemberships = userId
    ? await prisma.communityMember.findMany({
        where: {
          userId,
          communityId: {
            in: user.memberships.map((membership) => membership.communityId),
          },
        },
      })
    : []

  return {
    user,
    karma: (postKarma._sum.score ?? 0) + (commentKarma._sum.score ?? 0),
    viewerMemberships,
    totalReputation: user.reputationEntries.reduce((sum, entry) => sum + entry.score, 0),
  }
}

export async function getSearchResults(query: string, scope?: string) {
  if (!hasDatabaseUrl) {
    return getMockSearchResults(query, scope)
  }

  const postWhere: Prisma.PostWhereInput = {
    AND: [
      scope ? { community: { slug: scope } } : {},
      {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { body: { contains: query, mode: "insensitive" } },
          { community: { name: { contains: query, mode: "insensitive" } } },
        ],
      },
    ],
  }

  const [posts, communities, users] = await Promise.all([
    prisma.post.findMany({
      where: postWhere,
      include: { ...postBaseInclude, flair: true },
      take: 20,
      orderBy: [{ isPromoted: "desc" }, { hotScore: "desc" }, { score: "desc" }],
    }),
    prisma.community.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { slug: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 12,
      orderBy: [{ memberCount: "desc" }],
    }),
    prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { bio: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 12,
      orderBy: [{ createdAt: "desc" }],
    }),
  ])

  return { posts, communities, users }
}

export async function getNotificationsPageData(userId?: string, username?: string) {
  if (!hasDatabaseUrl) {
    return getMockNotificationsData(username)
  }
  if (!userId) {
    return { notifications: [], unreadCount: 0 }
  }

  const notifications = await prisma.notification.findMany({
    where: { userId },
    include: {
      actor: true,
      post: {
        include: {
          community: true,
        },
      },
      comment: true,
    },
    orderBy: [{ createdAt: "desc" }],
    take: 50,
  })

  return {
    notifications,
    unreadCount: notifications.filter((item) => !item.isRead).length,
  }
}

export async function getSavedPostsData(userId?: string, username?: string) {
  if (!hasDatabaseUrl) {
    return getMockSavedPosts(username)
  }
  if (!userId) return []

  const saved = await prisma.savedItem.findMany({
    where: { userId, postId: { not: null }, type: "POST" },
    include: {
      post: {
        include: { ...postBaseInclude, flair: true },
      },
    },
    orderBy: [{ createdAt: "desc" }],
  })

  return saved.map((item) => item.post).filter(Boolean)
}

export async function getCommunityModerationData(slug: string, userId?: string) {
  if (!hasDatabaseUrl) {
    return getMockCommunityModerationData(slug)
  }

  const base = await getCommunityPageData(slug, "trending", userId)
  if (!base) return null

  const [reports, queuePosts, actions] = await Promise.all([
    prisma.report.findMany({
      where: {
        OR: [
          { post: { community: { slug } } },
          { comment: { post: { community: { slug } } } },
        ],
      },
      include: {
        user: true,
        post: {
          include: { community: true, author: true },
        },
        comment: {
          include: { author: true },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    }),
    prisma.post.findMany({
      where: {
        community: { slug },
        OR: [{ moderationState: "PENDING" }, { isRemoved: true }],
      },
      include: { ...postBaseInclude, flair: true },
      orderBy: [{ createdAt: "desc" }],
    }),
    prisma.moderationAction.findMany({
      where: { community: { slug } },
      include: {
        actor: true,
        post: {
          include: { community: true, author: true },
        },
      },
      orderBy: [{ createdAt: "desc" }],
      take: 20,
    }),
  ])

  const insights = {
    memberGrowth: [base.community.memberCount - 18, base.community.memberCount - 14, base.community.memberCount - 9, base.community.memberCount - 5, base.community.memberCount - 2, base.community.memberCount],
    postsOverTime: [2, 4, 3, 6, 5, base.posts.length],
    commentsOverTime: [3, 5, 6, 7, 10, base.posts.reduce((sum, post) => sum + post.commentCount, 0)],
    reportsCount: reports.length,
    removalsCount: queuePosts.filter((post) => post.isRemoved).length,
    activeContributors: base.posts.slice(0, 5).map((post) => ({
      user: post.author,
      score: post.score,
    })),
  }

  return { ...base, reports, queuePosts, actions, insights }
}

export async function getAdminDashboardData(userId?: string) {
  if (!hasDatabaseUrl) {
    return {
      reports: reportsSample(),
      audits: [],
      communities: [],
      counts: {
        openReports: 1,
        flaggedUsers: 1,
        featuredCommunities: 2,
      },
    }
  }

  if (!userId) {
    return null
  }

  const [reports, audits, communities, bannedUsers] = await Promise.all([
    prisma.report.findMany({
      include: {
        user: true,
        post: { include: { community: true, author: true } },
        comment: { include: { post: { include: { community: true } }, author: true } },
      },
      orderBy: [{ createdAt: "desc" }],
      take: 20,
    }),
    prisma.adminAuditLog.findMany({
      include: { actor: true },
      orderBy: [{ createdAt: "desc" }],
      take: 20,
    }),
    prisma.community.findMany({
      where: { isFeatured: true },
      orderBy: [{ memberCount: "desc" }],
      take: 6,
    }),
    prisma.bannedUser.count(),
  ])

  return {
    reports,
    audits,
    communities,
    counts: {
      openReports: reports.filter((report) => report.status === "OPEN").length,
      flaggedUsers: bannedUsers,
      featuredCommunities: communities.length,
    },
  }
}

export async function getProjectPageData(slug: string) {
  if (!hasDatabaseUrl) {
    const profiles = [getMockProfilePageData("ege"), getMockProfilePageData("maya")].filter(Boolean)
    for (const profile of profiles as Array<NonNullable<ReturnType<typeof getMockProfilePageData>>>) {
      const project = profile.user.projects.find((item: any) => item.slug === slug)
      if (project) {
        return {
          ...project,
          user: profile.user,
          posts: profile.user.posts.filter((post: any) => post.projectId === project.id),
        }
      }
    }
    return null
  }

  return prisma.project.findUnique({
    where: { slug },
    include: {
      user: true,
      updates: {
        orderBy: [{ createdAt: "desc" }],
      },
      posts: {
        include: { ...postBaseInclude, flair: true, project: true },
        orderBy: [{ createdAt: "desc" }],
        take: 10,
      },
    },
  })
}

function reportsSample() {
  return [
    {
      id: "mock-report",
      status: "OPEN",
      reason: "RULE_BREAK",
      createdAt: new Date(),
      user: { username: "noah" },
      post: { title: "Needs verification before promotion", community: { slug: "signal-desk" }, author: { username: "sena" } },
      comment: null,
    },
  ]
}

export const reportReasons: Array<{ value: ReportReason; label: string }> = [
  { value: "SPAM", label: "Spam" },
  { value: "HARASSMENT", label: "Harassment" },
  { value: "RULE_BREAK", label: "Breaks community rules" },
  { value: "MISINFORMATION", label: "Misinformation" },
  { value: "OTHER", label: "Other" },
]
