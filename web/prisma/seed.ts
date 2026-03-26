import {
  CommunityType,
  FlairColor,
  MemberRole,
  ModerationActionType,
  ModerationState,
  NotificationType,
  PostMode,
  PostType,
  ProjectStage,
  ReputationCategory,
  PrismaClient,
  ReportReason,
  SavedItemType,
  TemplateType,
} from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  await prisma.communityModeratorNote.deleteMany()
  await prisma.adminAuditLog.deleteMany()
  await prisma.projectUpdate.deleteMany()
  await prisma.project.deleteMany()
  await prisma.userReputation.deleteMany()
  await prisma.moderationAction.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.report.deleteMany()
  await prisma.bannedUser.deleteMany()
  await prisma.hiddenPost.deleteMany()
  await prisma.savedItem.deleteMany()
  await prisma.commentVote.deleteMany()
  await prisma.postVote.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.postDraft.deleteMany()
  await prisma.post.deleteMany()
  await prisma.autoModerationRule.deleteMany()
  await prisma.communityFlair.deleteMany()
  await prisma.communityRule.deleteMany()
  await prisma.approvedUser.deleteMany()
  await prisma.communityMember.deleteMany()
  await prisma.community.deleteMany()
  await prisma.userPreference.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await hash("password123", 10)
  const now = new Date()

  const users = await Promise.all([
    ["ege", "Founder energy, shipping product and collecting interesting communities.", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"],
    ["maya", "Design systems, AI UX, and the side of the internet that still feels curated.", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"],
    ["noah", "Backend engineer, espresso loyalist, writes too many comments in code and in threads.", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80"],
    ["sena", "Culture writer watching creator tools, media shifts, and internet rituals.", "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80"],
    ["atlas", "Hardware, cities, and ambitious side projects that probably need a spreadsheet.", "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=200&q=80"],
    ["lina", "Creator economy operator obsessed with retention, loops, and community behavior.", "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=200&q=80"],
  ].map(([username, bio, avatar]) =>
    prisma.user.create({
      data: {
        username,
        email: `${username}@bluecrab.dev`,
        passwordHash,
        bio,
        avatar,
        preferences: {
          create: {
            theme: "dark",
            showNsfw: false,
            showSpoilers: true,
            publicActivity: true,
            compactMode: username === "noah",
            onboardingCompleted: username !== "lina",
            interests: username === "lina" ? [] : username === "sena" ? ["Media", "Product"] : ["Startups", "Design"],
          },
        },
      },
    }),
  ))

  const userMap = Object.fromEntries(users.map((user) => [user.username, user]))

  const communities = await Promise.all([
    prisma.community.create({
      data: {
        name: "Product Pulse",
        slug: "product-pulse",
        description: "High-signal discussion about product design, growth experiments, and launch lessons.",
        avatar: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=200&q=80",
        banner: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80",
        category: "Product",
        activeCount: 214,
        type: CommunityType.PUBLIC,
        isFeatured: true,
        featuredLabel: "Staff pick",
        allowPollPosts: true,
        welcomeMessage: "Post real experiments, real failures, and real screenshots.",
        createdById: userMap.maya.id,
      },
    }),
    prisma.community.create({
      data: {
        name: "Ship Station",
        slug: "ship-station",
        description: "A builder community for indie launches, architecture tradeoffs, and shipping every week.",
        avatar: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=200&q=80",
        banner: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1400&q=80",
        category: "Startups",
        activeCount: 143,
        type: CommunityType.PUBLIC,
        isFeatured: true,
        featuredLabel: "Builder favorite",
        allowPollPosts: true,
        requirePostApproval: false,
        welcomeMessage: "Show what shipped, what broke, and what changed after launch.",
        createdById: userMap.ege.id,
      },
    }),
    prisma.community.create({
      data: {
        name: "Signal Desk",
        slug: "signal-desk",
        description: "News analysis, platform strategy, and the social products shaping the next five years.",
        avatar: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=200&q=80",
        banner: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80",
        category: "Media",
        activeCount: 97,
        type: CommunityType.RESTRICTED,
        requirePostApproval: true,
        allowPollPosts: false,
        welcomeMessage: "Primary sources first. Summaries without evidence get removed.",
        createdById: userMap.sena.id,
      },
    }),
    prisma.community.create({
      data: {
        name: "Frame by Frame",
        slug: "frame-by-frame",
        description: "Visual culture, cinematography, and image-first conversations with actual taste.",
        avatar: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=200&q=80",
        banner: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1400&q=80",
        category: "Visual Culture",
        activeCount: 58,
        type: CommunityType.PUBLIC,
        allowTextPosts: true,
        allowImagePosts: true,
        allowLinkPosts: true,
        welcomeMessage: "Credit the work. Add context. Lazy moodboard dumping gets removed.",
        createdById: userMap.atlas.id,
      },
    }),
  ])

  const communityMap = Object.fromEntries(communities.map((community) => [community.slug, community]))

  const rulesByCommunity = {
    "product-pulse": [
      ["Use specifics", "Vague takes without examples or screenshots may be removed."],
      ["Stay product-focused", "Growth, onboarding, interaction design, monetization, and retention are all in scope."],
      ["No recycled hot takes", "If the point has been made everywhere else, bring fresh evidence or framing."],
    ],
    "ship-station": [
      ["Show your work", "Talk about decisions, tradeoffs, and outcomes rather than vague wins."],
      ["No launch spam", "One thoughtful launch thread beats ten link drops."],
      ["Be honest about metrics", "Vanity screenshots without context do not help anyone."],
    ],
    "signal-desk": [
      ["Link sources", "If the conversation starts from a news event, include the source."],
      ["Speculation must be labeled", "Separate reporting from opinion."],
      ["No rage bait", "Emotionally manipulative summary framing gets removed."],
    ],
    "frame-by-frame": [
      ["Credit artists", "Always name the filmmaker, photographer, or studio when known."],
      ["Context over aesthetics", "Explain why the work matters."],
      ["No low-effort dumps", "Mass image posting without commentary is removable."],
    ],
  } as const

  for (const [slug, rules] of Object.entries(rulesByCommunity)) {
    for (const [index, [title, description]] of rules.entries()) {
      await prisma.communityRule.create({
        data: {
          communityId: communityMap[slug].id,
          title,
          description,
          position: index,
        },
      })
    }
  }

  const flairDefs = [
    ["product-pulse", "Teardown", FlairColor.SKY],
    ["product-pulse", "Retention", FlairColor.EMERALD],
    ["product-pulse", "Hot Take", FlairColor.AMBER],
    ["ship-station", "Launch", FlairColor.EMERALD],
    ["ship-station", "Architecture", FlairColor.SLATE],
    ["ship-station", "Feedback", FlairColor.SKY],
    ["signal-desk", "Analysis", FlairColor.SKY],
    ["signal-desk", "Source Drop", FlairColor.ROSE],
    ["frame-by-frame", "Moodboard", FlairColor.AMBER],
    ["frame-by-frame", "Breakdown", FlairColor.EMERALD],
  ] as const

  const flairs = []
  for (const [slug, label, color] of flairDefs) {
    flairs.push(
      await prisma.communityFlair.create({
        data: {
          communityId: communityMap[slug].id,
          label,
          color,
          allowUserSelect: true,
          modOnly: false,
        },
      }),
    )
  }
  const flairMap = Object.fromEntries(flairs.map((flair) => [`${flair.communityId}:${flair.label}`, flair]))

  for (const community of communities) {
    const ownerId = community.createdById
    await prisma.communityMember.create({
      data: {
        userId: ownerId,
        communityId: community.id,
        role: MemberRole.OWNER,
        userFlair: "Founder",
      },
    })
  }

  const membershipPairs = [
    ["ege", "product-pulse", MemberRole.MODERATOR, "Shipwright"],
    ["ege", "signal-desk", MemberRole.MEMBER, ""],
    ["maya", "ship-station", MemberRole.MODERATOR, "Designer"],
    ["maya", "signal-desk", MemberRole.MEMBER, ""],
    ["noah", "product-pulse", MemberRole.MEMBER, "Systems"],
    ["noah", "ship-station", MemberRole.MEMBER, "Infra"],
    ["sena", "product-pulse", MemberRole.MEMBER, "Editor"],
    ["sena", "frame-by-frame", MemberRole.MODERATOR, "Curator"],
    ["atlas", "ship-station", MemberRole.MEMBER, "Operator"],
    ["atlas", "signal-desk", MemberRole.MEMBER, ""],
    ["lina", "product-pulse", MemberRole.MEMBER, "Growth"],
    ["lina", "ship-station", MemberRole.MEMBER, "Growth"],
    ["lina", "frame-by-frame", MemberRole.MEMBER, ""],
  ] as const

  for (const [username, slug, role, userFlair] of membershipPairs) {
    await prisma.communityMember.upsert({
      where: {
        userId_communityId: {
          userId: userMap[username].id,
          communityId: communityMap[slug].id,
        },
      },
      update: { role, userFlair },
      create: {
        userId: userMap[username].id,
        communityId: communityMap[slug].id,
        role,
        userFlair,
      },
    })
  }

  for (const community of communities) {
    const count = await prisma.communityMember.count({ where: { communityId: community.id } })
    await prisma.community.update({ where: { id: community.id }, data: { memberCount: count } })
  }

  await prisma.approvedUser.create({
    data: {
      userId: userMap.noah.id,
      communityId: communityMap["signal-desk"].id,
    },
  })

  await prisma.autoModerationRule.createMany({
    data: [
      {
        communityId: communityMap["signal-desk"].id,
        name: "Block AI slop domains",
        blockedDomain: "loweffortnews.example",
        action: "remove",
      },
      {
        communityId: communityMap["ship-station"].id,
        name: "Catch guaranteed riches spam",
        keyword: "10000 MRR overnight",
        action: "report",
      },
    ],
  })

  await prisma.userReputation.createMany({
    data: [
      { userId: userMap.ege.id, category: ReputationCategory.INDIE_HACKER, score: 92 },
      { userId: userMap.maya.id, category: ReputationCategory.SAAS_BUILDER, score: 88 },
      { userId: userMap.noah.id, category: ReputationCategory.AI_DEVELOPER, score: 74 },
      { userId: userMap.lina.id, category: ReputationCategory.GROWTH_EXPERT, score: 63 },
    ],
  })

  const projects = await Promise.all([
    prisma.project.create({
      data: {
        userId: userMap.ege.id,
        name: "BlueCrab Studio",
        slug: "bluecrab-studio",
        description: "A builder-first community layer with structured feedback loops and AI summaries.",
        stage: ProjectStage.LAUNCHING,
      },
    }),
    prisma.project.create({
      data: {
        userId: userMap.maya.id,
        name: "Metric Garden",
        slug: "metric-garden",
        description: "A visual analytics product for founder dashboards and launch reviews.",
        stage: ProjectStage.MVP,
      },
    }),
  ])
  const projectMap = Object.fromEntries(projects.map((project) => [project.slug, project]))

  await prisma.projectUpdate.createMany({
    data: [
      {
        projectId: projectMap["bluecrab-studio"].id,
        title: "Switched home feed to builder intent",
        content: "The feed now favors feedback-heavy threads and structured updates from followed communities.",
      },
      {
        projectId: projectMap["bluecrab-studio"].id,
        title: "Added AI summaries",
        content: "Long threads now get a fast read layer instead of forcing every visitor to parse the full discussion.",
      },
      {
        projectId: projectMap["metric-garden"].id,
        title: "First 10 design partners onboarded",
        content: "The product is finally getting real founder workflows instead of hypothetical dashboards.",
      },
    ],
  })

  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: "What makes a community homepage feel alive in the first 10 seconds?",
        body: "I keep seeing feeds that technically have content but still feel dead. Which signals create immediate momentum: density, comments, recognizable faces, or editorial curation?",
        type: PostType.TEXT,
        postMode: PostMode.DISCUSSION,
        templateType: TemplateType.GENERAL_DISCUSSION,
        topicCategory: ReputationCategory.INDIE_HACKER,
        authorId: userMap.maya.id,
        communityId: communityMap["product-pulse"].id,
        flairId: flairMap[`${communityMap["product-pulse"].id}:Teardown`].id,
        aiSummary: {
          summary: "Builders are debating what makes a community homepage feel alive immediately instead of empty.",
          keyInsights: ["Debate density matters more than volume.", "Recognizable contributors create trust faster."],
          topPoints: ["Context beats generic feed furniture.", "Comments are stronger proof of life than views."],
        },
        aiSummaryUpdatedAt: now,
        score: 84,
        hotScore: 93.2,
        commentCount: 4,
        isPromoted: true,
        promotedLabel: "Promoted insight",
      },
    }),
    prisma.post.create({
      data: {
        title: "We swapped generic onboarding for topic picks and 7-day retention jumped",
        body: "The change was small: interests first, account creation second. We used those selections to hydrate follow suggestions and early feed ranking. Curious how others sequence that moment.",
        type: PostType.TEXT,
        postMode: PostMode.FEEDBACK,
        templateType: TemplateType.GROWTH_QUESTION,
        topicCategory: ReputationCategory.GROWTH_EXPERT,
        structuredPostData: {
          channel: "Onboarding",
          currentExperiment: "Interest selection before auth",
          metric: "7-day retention",
          blocker: "Need stronger first-post conversion",
        },
        aiSummary: {
          summary: "The post asks whether intent-based onboarding should happen before account creation to improve retention.",
          keyInsights: ["Topic picks reduce early feed randomness.", "The next problem is converting new users into contributors."],
          topPoints: ["Activation improved after reducing empty-feed risk.", "Builders want examples of stronger first actions."],
        },
        aiSummaryUpdatedAt: now,
        authorId: userMap.ege.id,
        communityId: communityMap["ship-station"].id,
        projectId: projectMap["bluecrab-studio"].id,
        flairId: flairMap[`${communityMap["ship-station"].id}:Launch`].id,
        score: 71,
        hotScore: 82.8,
        commentCount: 3,
      },
    }),
    prisma.post.create({
      data: {
        title: "Best product teardown newsletters right now",
        linkUrl: "https://www.lennysnewsletter.com/",
        body: "Looking for reads that go deeper than growth screenshots and vanity metrics.",
        type: PostType.LINK,
        postMode: PostMode.DISCUSSION,
        templateType: TemplateType.GENERAL_DISCUSSION,
        topicCategory: ReputationCategory.SAAS_BUILDER,
        authorId: userMap.sena.id,
        communityId: communityMap["signal-desk"].id,
        flairId: flairMap[`${communityMap["signal-desk"].id}:Source Drop`].id,
        moderationState: ModerationState.PENDING,
        score: 24,
        hotScore: 21.4,
        commentCount: 0,
      },
    }),
    prisma.post.create({
      data: {
        title: "A dark UI can still feel expensive instead of heavy",
        body: "The difference seems to be contrast discipline, typography, and where you reserve bright color. Sharing this moodboard because it nails that balance.",
        imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80",
        type: PostType.IMAGE,
        postMode: PostMode.SHOWCASE,
        templateType: TemplateType.BUILD_IN_PUBLIC,
        topicCategory: ReputationCategory.INDIE_HACKER,
        structuredPostData: {
          projectName: "Metric Garden",
          currentStage: "MVP",
          shippedThisWeek: "Homepage redesign and visual system cleanup",
          keyLearning: "Premium feeling comes from restraint, not volume",
          nextMilestone: "Ship shareable insight cards",
        },
        aiSummary: {
          summary: "This showcase post argues that premium dark UIs are defined more by restraint, spacing, and typography than by decoration.",
          keyInsights: ["Contrast discipline matters more than gradients.", "Commenters want more production examples."],
          topPoints: ["Reserve bright accents for meaning.", "The hierarchy has to read instantly."],
        },
        aiSummaryUpdatedAt: now,
        authorId: userMap.atlas.id,
        communityId: communityMap["frame-by-frame"].id,
        projectId: projectMap["metric-garden"].id,
        flairId: flairMap[`${communityMap["frame-by-frame"].id}:Moodboard`].id,
        score: 49,
        hotScore: 58.7,
        commentCount: 1,
        isSpoiler: false,
      },
    }),
    prisma.post.create({
      data: {
        title: "How are you handling community moderation before you have a trust and safety team?",
        body: "I only want MVP-grade tooling, but I do not want moderators to feel powerless. Reports, removals, and community rules feel mandatory. What else is non-negotiable?",
        type: PostType.TEXT,
        postMode: PostMode.FEEDBACK,
        templateType: TemplateType.SAAS_FEEDBACK,
        topicCategory: ReputationCategory.INDIE_HACKER,
        structuredPostData: {
          whatIBuilt: "Community platform moderation stack",
          targetUsers: "Community operators and moderators",
          currentTraction: "Early teams using it privately",
          feedbackWanted: "What tools are essential before hiring trust and safety?",
        },
        authorId: userMap.noah.id,
        communityId: communityMap["ship-station"].id,
        flairId: flairMap[`${communityMap["ship-station"].id}:Feedback`].id,
        score: 57,
        hotScore: 63.4,
        commentCount: 2,
      },
    }),
    prisma.post.create({
      data: {
        title: "Which startup dashboards still have genuinely original UI?",
        body: "Not asking for Dribbble bait. I mean products with structure, hierarchy, and interaction quality that actually hold up in production.",
        type: PostType.TEXT,
        postMode: PostMode.ROAST,
        templateType: TemplateType.GENERAL_DISCUSSION,
        topicCategory: ReputationCategory.SAAS_BUILDER,
        authorId: userMap.sena.id,
        communityId: communityMap["product-pulse"].id,
        flairId: flairMap[`${communityMap["product-pulse"].id}:Hot Take`].id,
        score: 38,
        hotScore: 40.2,
        commentCount: 2,
        isStickied: true,
      },
    }),
    prisma.post.create({
      data: {
        title: "Should community feeds default to hot or latest?",
        body: "Poll to test whether product communities prefer immediate freshness or ranked quality by default.",
        type: PostType.POLL,
        postMode: PostMode.FEEDBACK,
        templateType: TemplateType.GROWTH_QUESTION,
        topicCategory: ReputationCategory.GROWTH_EXPERT,
        pollOptions: ["Hot", "Latest", "Remember my preference"],
        authorId: userMap.lina.id,
        communityId: communityMap["product-pulse"].id,
        flairId: flairMap[`${communityMap["product-pulse"].id}:Retention`].id,
        score: 19,
        hotScore: 26.1,
        commentCount: 1,
      },
    }),
  ])

  const postMap = Object.fromEntries(posts.map((post) => [post.title, post]))

  const comments = await Promise.all([
    prisma.comment.create({
      data: {
        body: "Recognizable communities have a rhythm. You need at least one post with active debate, one with social proof, and one newcomer-friendly thread above the fold.",
        authorId: userMap.ege.id,
        postId: postMap["What makes a community homepage feel alive in the first 10 seconds?"].id,
        score: 12,
      },
    }),
    prisma.comment.create({
      data: {
        body: "I would add local context. If I can tell why this space exists and who it is for, I stay longer.",
        authorId: userMap.sena.id,
        postId: postMap["What makes a community homepage feel alive in the first 10 seconds?"].id,
        score: 8,
      },
    }),
    prisma.comment.create({
      data: {
        body: "We saw similar results. Interest selection is effectively the first moderation act because it shapes what noise the user sees.",
        authorId: userMap.maya.id,
        postId: postMap["We swapped generic onboarding for topic picks and 7-day retention jumped"].id,
        score: 7,
      },
    }),
    prisma.comment.create({
      data: {
        body: "Reports plus fast moderator removal is enough for the first version. The real failure mode is hiding that a rule exists but not enforcing it.",
        authorId: userMap.atlas.id,
        postId: postMap["How are you handling community moderation before you have a trust and safety team?"].id,
        score: 10,
      },
    }),
    prisma.comment.create({
      data: {
        body: "Hot by default, but only if the formula does not hide new quality posts for days.",
        authorId: userMap.noah.id,
        postId: postMap["Should community feeds default to hot or latest?"].id,
        score: 6,
      },
    }),
  ])

  await prisma.comment.create({
    data: {
      body: "This is exactly why I like community-specific sidebars. They can explain the vibe faster than a long description.",
      authorId: userMap.noah.id,
      postId: postMap["What makes a community homepage feel alive in the first 10 seconds?"].id,
      parentId: comments[0].id,
      score: 4,
    },
  })

  const postVotes = [
    ["ege", "What makes a community homepage feel alive in the first 10 seconds?", 1],
    ["sena", "What makes a community homepage feel alive in the first 10 seconds?", 1],
    ["atlas", "What makes a community homepage feel alive in the first 10 seconds?", 1],
    ["maya", "We swapped generic onboarding for topic picks and 7-day retention jumped", 1],
    ["noah", "We swapped generic onboarding for topic picks and 7-day retention jumped", 1],
    ["atlas", "We swapped generic onboarding for topic picks and 7-day retention jumped", 1],
    ["ege", "Best product teardown newsletters right now", 1],
    ["maya", "Best product teardown newsletters right now", 1],
    ["noah", "How are you handling community moderation before you have a trust and safety team?", 1],
    ["sena", "Which startup dashboards still have genuinely original UI?", 1],
    ["atlas", "Which startup dashboards still have genuinely original UI?", 1],
    ["lina", "Should community feeds default to hot or latest?", 1],
  ] as const

  for (const [username, title, value] of postVotes) {
    await prisma.postVote.create({
      data: {
        userId: userMap[username].id,
        postId: postMap[title].id,
        value,
      },
    })
  }

  const commentVotes = [
    ["maya", comments[0].id, 1],
    ["noah", comments[0].id, 1],
    ["ege", comments[2].id, 1],
    ["sena", comments[3].id, 1],
  ] as const

  for (const [username, commentId, value] of commentVotes) {
    await prisma.commentVote.create({
      data: {
        userId: userMap[username].id,
        commentId,
        value,
      },
    })
  }

  await prisma.postDraft.createMany({
    data: [
      {
        userId: userMap.ege.id,
        communityId: communityMap["ship-station"].id,
        title: "Draft: postmortem on launch week support volume",
        body: "Still drafting the details, but support load was the hidden tax on launch week.",
        type: PostType.TEXT,
      },
      {
        userId: userMap.maya.id,
        communityId: communityMap["product-pulse"].id,
        title: "Draft: premium dark UI examples that actually convert",
        body: "Collecting examples before posting.",
        type: PostType.LINK,
      },
    ],
  })

  await prisma.savedItem.createMany({
    data: [
      {
        userId: userMap.ege.id,
        type: SavedItemType.POST,
        postId: postMap["A dark UI can still feel expensive instead of heavy"].id,
      },
      {
        userId: userMap.maya.id,
        type: SavedItemType.POST,
        postId: postMap["How are you handling community moderation before you have a trust and safety team?"].id,
      },
      {
        userId: userMap.noah.id,
        type: SavedItemType.COMMENT,
        commentId: comments[0].id,
      },
    ],
  })

  await prisma.hiddenPost.create({
    data: {
      userId: userMap.lina.id,
      postId: postMap["Best product teardown newsletters right now"].id,
    },
  })

  await prisma.report.createMany({
    data: [
      {
        userId: userMap.noah.id,
        postId: postMap["Best product teardown newsletters right now"].id,
        reason: ReportReason.RULE_BREAK,
        details: "Missing primary source context for a restricted discussion space.",
      },
      {
        userId: userMap.maya.id,
        commentId: comments[3].id,
        reason: ReportReason.OTHER,
        details: "Borderline moderation advice, worth review but not abusive.",
        status: "REVIEWED",
      },
    ],
  })

  await prisma.notification.createMany({
    data: [
      {
        userId: userMap.maya.id,
        actorId: userMap.ege.id,
        postId: postMap["What makes a community homepage feel alive in the first 10 seconds?"].id,
        commentId: comments[0].id,
        type: NotificationType.POST_REPLY,
        body: "ege replied to your post in Product Pulse.",
      },
      {
        userId: userMap.ege.id,
        actorId: userMap.noah.id,
        postId: postMap["What makes a community homepage feel alive in the first 10 seconds?"].id,
        commentId: comments[0].id,
        type: NotificationType.COMMENT_REPLY,
        body: "noah replied to your comment.",
      },
      {
        userId: userMap.sena.id,
        actorId: userMap.maya.id,
        postId: postMap["Best product teardown newsletters right now"].id,
        type: NotificationType.MOD_ACTION,
        body: "Your post was sent to the moderation queue in Signal Desk.",
      },
      {
        userId: userMap.lina.id,
        actorId: userMap.ege.id,
        type: NotificationType.ONBOARDING,
        body: "Pick a few interests and join your first communities to improve your feed.",
      },
    ],
  })

  await prisma.moderationAction.createMany({
    data: [
      {
        communityId: communityMap["signal-desk"].id,
        actorId: userMap.sena.id,
        postId: postMap["Best product teardown newsletters right now"].id,
        actionType: ModerationActionType.APPROVE_POST,
        note: "Approved after adding proper sourcing context.",
      },
      {
        communityId: communityMap["product-pulse"].id,
        actorId: userMap.maya.id,
        postId: postMap["Which startup dashboards still have genuinely original UI?"].id,
        actionType: ModerationActionType.STICKY_POST,
        note: "Pinned for weekly design discussion.",
      },
    ],
  })

  await prisma.communityModeratorNote.create({
    data: {
      communityId: communityMap["signal-desk"].id,
      authorId: userMap.sena.id,
      subjectUserId: userMap.noah.id,
      body: "Thoughtful contributor, approved for restricted posting.",
    },
  })

  await prisma.bannedUser.create({
    data: {
      communityId: communityMap["signal-desk"].id,
      userId: userMap.atlas.id,
      reason: "Repeated low-context external link drops.",
    },
  })

  await prisma.adminAuditLog.createMany({
    data: [
      {
        actorUserId: userMap.sena.id,
        type: "REPORT_REVIEW",
        targetId: postMap["Best product teardown newsletters right now"].id,
        summary: "Reviewed restricted-community sourcing report.",
      },
      {
        actorUserId: userMap.maya.id,
        type: "FEATURE_COMMUNITY",
        targetId: communityMap["product-pulse"].id,
        summary: "Featured Product Pulse on explore surface.",
      },
    ],
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
