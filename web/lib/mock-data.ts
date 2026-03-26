const now = new Date()

const users = [
  {
    id: "mock-ege",
    username: "ege",
    email: "ege@bluecrab.dev",
    bio: "Founder energy, shipping product and collecting interesting communities.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "mock-maya",
    username: "maya",
    email: "maya@bluecrab.dev",
    bio: "Design systems, AI UX, and community-first product thinking.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "mock-sena",
    username: "sena",
    email: "sena@bluecrab.dev",
    bio: "Culture writer watching creator tools, media shifts, and internet rituals.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "mock-noah",
    username: "noah",
    email: "noah@bluecrab.dev",
    bio: "Backend engineer, espresso loyalist, and moderation tooling realist.",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "mock-atlas",
    username: "atlas",
    email: "atlas@bluecrab.dev",
    bio: "Hardware, cities, and visual systems with strong points of view.",
    avatar: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=200&q=80",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "mock-lina",
    username: "lina",
    email: "lina@bluecrab.dev",
    bio: "Growth operator focused on activation, retention, and better community loops.",
    avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=200&q=80",
    createdAt: now,
    updatedAt: now,
  },
]

const communities = [
  {
    id: "community-product-pulse",
    name: "Product Pulse",
    slug: "product-pulse",
    description: "High-signal discussion about product design, growth experiments, and launch lessons.",
    avatar: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=200&q=80",
    banner: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80",
    rules: ["Bring specifics, not vague takes.", "Share examples when possible.", "No spam."],
    memberCount: 1280,
    activeCount: 214,
    category: "Product",
    type: "PUBLIC",
    postPermission: "members",
    commentPermission: "members",
    allowTextPosts: true,
    allowImagePosts: true,
    allowLinkPosts: true,
    allowPollPosts: true,
    archiveOldPosts: false,
    requirePostApproval: false,
    isDiscoverable: true,
    isFeatured: true,
    featuredLabel: "Staff pick",
    welcomeMessage: "Post real experiments, real failures, and real screenshots.",
    createdById: "mock-maya",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "community-ship-station",
    name: "Ship Station",
    slug: "ship-station",
    description: "A builder community for indie launches, architecture tradeoffs, and shipping every week.",
    avatar: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=200&q=80",
    banner: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1400&q=80",
    rules: ["Show your work.", "Be honest about metrics.", "Critique the product, not the builder."],
    memberCount: 940,
    activeCount: 143,
    category: "Startups",
    type: "PUBLIC",
    postPermission: "members",
    commentPermission: "members",
    allowTextPosts: true,
    allowImagePosts: true,
    allowLinkPosts: true,
    allowPollPosts: true,
    archiveOldPosts: false,
    requirePostApproval: false,
    isDiscoverable: true,
    isFeatured: true,
    featuredLabel: "Builder favorite",
    welcomeMessage: "Show what shipped, what broke, and what changed after launch.",
    createdById: "mock-ege",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "community-signal-desk",
    name: "Signal Desk",
    slug: "signal-desk",
    description: "News analysis, platform strategy, and the social products shaping the next five years.",
    avatar: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=200&q=80",
    banner: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80",
    rules: ["Link primary sources.", "Avoid rage-bait summaries.", "Label speculation clearly."],
    memberCount: 760,
    activeCount: 97,
    category: "Media",
    type: "RESTRICTED",
    postPermission: "approved",
    commentPermission: "members",
    allowTextPosts: true,
    allowImagePosts: false,
    allowLinkPosts: true,
    allowPollPosts: false,
    archiveOldPosts: false,
    requirePostApproval: true,
    isDiscoverable: true,
    isFeatured: false,
    featuredLabel: "",
    welcomeMessage: "Primary sources first.",
    createdById: "mock-sena",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "community-frame-by-frame",
    name: "Frame by Frame",
    slug: "frame-by-frame",
    description: "Visual culture, cinematography, and image-first conversations with actual taste.",
    avatar: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=200&q=80",
    banner: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1400&q=80",
    rules: ["Credit artists.", "Context over aesthetics.", "No low-effort dumps."],
    memberCount: 580,
    activeCount: 58,
    category: "Visual Culture",
    type: "PUBLIC",
    postPermission: "members",
    commentPermission: "members",
    allowTextPosts: true,
    allowImagePosts: true,
    allowLinkPosts: true,
    allowPollPosts: false,
    archiveOldPosts: false,
    requirePostApproval: false,
    isDiscoverable: true,
    isFeatured: false,
    featuredLabel: "",
    welcomeMessage: "Credit the work and add context.",
    createdById: "mock-atlas",
    createdAt: now,
    updatedAt: now,
  },
]

const memberships = [
  { id: "m1", userId: "mock-ege", communityId: "community-ship-station", role: "MODERATOR", createdAt: now },
  { id: "m2", userId: "mock-maya", communityId: "community-product-pulse", role: "OWNER", createdAt: now },
  { id: "m3", userId: "mock-sena", communityId: "community-signal-desk", role: "OWNER", createdAt: now },
  { id: "m4", userId: "mock-atlas", communityId: "community-frame-by-frame", role: "OWNER", createdAt: now },
  { id: "m5", userId: "mock-noah", communityId: "community-product-pulse", role: "MEMBER", createdAt: now },
  { id: "m6", userId: "mock-lina", communityId: "community-product-pulse", role: "MEMBER", createdAt: now },
]

const notifications = [
  {
    id: "notif-1",
    userId: "mock-maya",
    actorId: "mock-ege",
    postId: "post-1",
    commentId: "comment-1",
    type: "POST_REPLY",
    body: "ege replied to your thread in Product Pulse.",
    isRead: false,
    createdAt: now,
  },
  {
    id: "notif-2",
    userId: "mock-sena",
    actorId: "mock-maya",
    postId: "post-3",
    commentId: null,
    type: "MOD_ACTION",
    body: "Your post is waiting in the moderation queue.",
    isRead: false,
    createdAt: now,
  },
]

const savedItems = [
  { id: "saved-1", userId: "mock-ege", type: "POST", postId: "post-1", commentId: null, createdAt: now },
  { id: "saved-2", userId: "mock-ege", type: "POST", postId: "post-2", commentId: null, createdAt: now },
]

const reports = [
  {
    id: "report-1",
    userId: "mock-noah",
    postId: "post-3",
    commentId: null,
    reason: "RULE_BREAK",
    details: "Needs primary source context.",
    status: "OPEN",
    createdAt: now,
  },
]

const moderationActions = [
  {
    id: "mod-1",
    communityId: "community-signal-desk",
    actorId: "mock-sena",
    postId: "post-3",
    commentId: null,
    actionType: "APPROVE_POST",
    note: "Approved after source review.",
    createdAt: now,
  },
]

const reputationEntries = [
  { id: "rep-1", userId: "mock-ege", category: "INDIE_HACKER", score: 92 },
  { id: "rep-2", userId: "mock-maya", category: "SAAS_BUILDER", score: 88 },
  { id: "rep-3", userId: "mock-noah", category: "AI_DEVELOPER", score: 74 },
  { id: "rep-4", userId: "mock-lina", category: "GROWTH_EXPERT", score: 63 },
]

const projects = [
  {
    id: "project-1",
    userId: "mock-ege",
    name: "BlueCrab Studio",
    slug: "bluecrab-studio",
    description: "A builder-first community layer with structured feedback loops and AI summaries.",
    stage: "LAUNCHING",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "project-2",
    userId: "mock-maya",
    name: "Metric Garden",
    slug: "metric-garden",
    description: "A visual analytics product for founder dashboards and launch reviews.",
    stage: "MVP",
    createdAt: now,
    updatedAt: now,
  },
]

const projectUpdates = [
  { id: "project-update-1", projectId: "project-1", title: "Switched home feed to builder intent", content: "The feed now favors feedback-heavy threads and structured updates from followed communities.", createdAt: now },
  { id: "project-update-2", projectId: "project-1", title: "Added AI summaries", content: "Long threads now get a fast read layer instead of forcing every visitor to parse the full comment tree.", createdAt: now },
  { id: "project-update-3", projectId: "project-2", title: "First 10 design partners onboarded", content: "The product is finally getting real founder workflows instead of hypothetical dashboards.", createdAt: now },
]

const posts = [
  {
    id: "post-1",
    title: "What makes a community homepage feel alive in the first 10 seconds?",
    body: "I keep seeing feeds that technically have content but still feel dead. Which signals create immediate momentum: density, comments, recognizable faces, or editorial curation?",
    type: "TEXT",
    postMode: "DISCUSSION",
    templateType: "GENERAL_DISCUSSION",
    topicCategory: "INDIE_HACKER",
    structuredPostData: null,
    aiSummary: {
      summary: "The thread argues that a community homepage feels alive when visitors see active debate, recognizable people, and clear proof of why the space exists.",
      keyInsights: ["Debate density matters more than raw post count.", "Recognizable repeat contributors create trust faster."],
      topPoints: ["Newcomers need context above the fold.", "Comments are stronger proof of life than view counts."],
    },
    aiSummaryUpdatedAt: now,
    imageUrl: null,
    linkUrl: null,
    authorId: "mock-maya",
    communityId: "community-product-pulse",
    projectId: null,
    flair: { id: "flair-1", label: "Teardown" },
    score: 84,
    hotScore: 93,
    commentCount: 3,
    isNsfw: false,
    isSpoiler: false,
    isLocked: false,
    isStickied: false,
    isRemoved: false,
    isDeleted: false,
    isPromoted: true,
    promotedLabel: "Promoted insight",
    moderationState: "VISIBLE",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "post-2",
    title: "We swapped generic onboarding for topic picks and 7-day retention jumped",
    body: "Interests first, account creation second. Those selections hydrate suggestions and early ranking. Curious how others sequence that moment.",
    type: "TEXT",
    postMode: "FEEDBACK",
    templateType: "GROWTH_QUESTION",
    topicCategory: "GROWTH_EXPERT",
    structuredPostData: {
      channel: "Onboarding",
      currentExperiment: "Interest selection before auth",
      metric: "7-day retention",
      blocker: "Need stronger first-post conversion",
    },
    aiSummary: {
      summary: "Builders are comparing whether intent-based onboarding should happen before account creation to increase retention.",
      keyInsights: ["Topic picks make recommendations feel less random.", "Users still need a strong first action after onboarding."],
      topPoints: ["Retention lifted after reducing empty-feed risk.", "The next problem is converting new users into contributors."],
    },
    aiSummaryUpdatedAt: now,
    imageUrl: null,
    linkUrl: null,
    authorId: "mock-ege",
    communityId: "community-ship-station",
    projectId: "project-1",
    flair: { id: "flair-2", label: "Launch" },
    score: 61,
    hotScore: 78,
    commentCount: 1,
    isNsfw: false,
    isSpoiler: false,
    isLocked: false,
    isStickied: false,
    isRemoved: false,
    isDeleted: false,
    isPromoted: false,
    promotedLabel: "",
    moderationState: "VISIBLE",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "post-3",
    title: "Best product teardown newsletters right now",
    body: "Looking for reads that go deeper than growth screenshots and vanity metrics.",
    type: "LINK",
    postMode: "DISCUSSION",
    templateType: "GENERAL_DISCUSSION",
    topicCategory: "SAAS_BUILDER",
    structuredPostData: null,
    aiSummary: null,
    aiSummaryUpdatedAt: null,
    imageUrl: null,
    linkUrl: "https://www.lennysnewsletter.com/",
    authorId: "mock-sena",
    communityId: "community-signal-desk",
    projectId: null,
    flair: { id: "flair-3", label: "Source Drop" },
    score: 43,
    hotScore: 52,
    commentCount: 0,
    isNsfw: false,
    isSpoiler: false,
    isLocked: false,
    isStickied: false,
    isRemoved: false,
    isDeleted: false,
    isPromoted: false,
    promotedLabel: "",
    moderationState: "PENDING",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "post-4",
    title: "A dark UI can still feel expensive instead of heavy",
    body: "The difference seems to be contrast discipline, typography, and where you reserve bright color.",
    type: "IMAGE",
    postMode: "SHOWCASE",
    templateType: "BUILD_IN_PUBLIC",
    topicCategory: "INDIE_HACKER",
    structuredPostData: {
      projectName: "Metric Garden",
      currentStage: "MVP",
      shippedThisWeek: "New visual system and homepage redesign",
      keyLearning: "Premium feeling comes from restraint, not just gradients",
      nextMilestone: "Ship the shareable insight cards",
    },
    aiSummary: {
      summary: "This showcase thread is mostly about what makes dark interfaces feel premium instead of cluttered.",
      keyInsights: ["Contrast discipline beats decorative overload.", "Typography and card spacing carry most of the premium feeling."],
      topPoints: ["Bright accents should be rare.", "Commenters want more examples of production UIs."],
    },
    aiSummaryUpdatedAt: now,
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80",
    linkUrl: null,
    authorId: "mock-atlas",
    communityId: "community-frame-by-frame",
    projectId: "project-2",
    flair: { id: "flair-4", label: "Moodboard" },
    score: 49,
    hotScore: 57,
    commentCount: 1,
    isNsfw: false,
    isSpoiler: false,
    isLocked: false,
    isStickied: false,
    isRemoved: false,
    isDeleted: false,
    isPromoted: false,
    promotedLabel: "",
    moderationState: "VISIBLE",
    createdAt: now,
    updatedAt: now,
  },
]

const comments = [
  {
    id: "comment-1",
    body: "Recognizable communities have a rhythm. You need at least one post with active debate, one with social proof, and one newcomer-friendly thread above the fold.",
    authorId: "mock-ege",
    postId: "post-1",
    parentId: null,
    score: 12,
    isRemoved: false,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "comment-2",
    body: "I would add local context. If I can tell why this space exists and who it is for, I stay longer.",
    authorId: "mock-sena",
    postId: "post-1",
    parentId: null,
    score: 8,
    isRemoved: false,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "comment-3",
    body: "This is exactly why sidebars matter. They explain the vibe faster than a long description.",
    authorId: "mock-maya",
    postId: "post-1",
    parentId: "comment-1",
    score: 4,
    isRemoved: false,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  },
]

function userById(id: string) {
  return users.find((user) => user.id === id)!
}

function communityById(id: string) {
  return communities.find((community) => community.id === id)!
}

function votesForUser() {
  return []
}

function commentTree(postId: string, parentId: string | null = null): any[] {
  return comments
    .filter((comment) => comment.postId === postId && comment.parentId === parentId)
    .map((comment) => ({
      ...comment,
      author: userById(comment.authorId),
      votes: [],
      replies: commentTree(postId, comment.id),
    }))
}

function hydratePost(post: (typeof posts)[number]) {
  return {
    ...post,
    author: userById(post.authorId),
    community: communityById(post.communityId),
    project: post.projectId ? projects.find((project) => project.id === post.projectId) ?? null : null,
    votes: votesForUser(),
  }
}

export function getMockShellData() {
  return {
    trendingCommunities: communities.slice(0, 3),
    recommendedCommunities: communities.slice(0, 2),
    trendingPosts: posts.map((post) => ({ ...post, community: communityById(post.communityId) })),
  }
}

export function getMockHomeFeed(sort: string) {
  const list = [...posts]
  if (sort === "latest") {
    return list.reverse().map(hydratePost)
  }
  return list.map(hydratePost)
}

export function getMockExploreData() {
  return {
    communities: communities.map((community) => ({
      ...community,
      _count: {
        posts: posts.filter((post) => post.communityId === community.id).length,
      },
      members: [],
    })),
    posts: posts.map(hydratePost),
  }
}

export function getMockCommunityPageData(slug: string) {
  const community = communities.find((item) => item.slug === slug)
  if (!community) return null
  return {
    community: {
      ...community,
      createdBy: userById(community.createdById),
      members: memberships.filter((membership) => membership.communityId === community.id),
      rules: community.rules,
      flairs: [],
      _count: {
        posts: posts.filter((post) => post.communityId === community.id).length,
      },
    },
    posts: posts.filter((post) => post.communityId === community.id).map(hydratePost),
  }
}

export function getMockCommunityBySlug(slug: string) {
  const community = communities.find((item) => item.slug === slug)
  if (!community) return null
  return {
    ...community,
    members: [],
    flairs: [],
  }
}

export function getMockPostPageData(postId: string) {
  const post = posts.find((item) => item.id === postId)
  if (!post) return null
  return {
    post: {
      ...hydratePost(post),
      comments: commentTree(postId),
    },
    membership: null,
  }
}

export function getMockProfilePageData(username: string) {
  const user = users.find((item) => item.username === username)
  if (!user) return null

  const userPosts = posts.filter((post) => post.authorId === user.id).map(hydratePost)
  const userComments = comments
    .filter((comment) => comment.authorId === user.id)
    .map((comment) => ({
      ...comment,
      post: {
        ...posts.find((post) => post.id === comment.postId)!,
        community: communityById(posts.find((post) => post.id === comment.postId)!.communityId),
      },
    }))

  return {
    user: {
      ...user,
      posts: userPosts,
      comments: userComments,
      memberships: memberships
        .filter((membership) => membership.userId === user.id)
        .map((membership) => ({
          ...membership,
          community: communityById(membership.communityId),
        })),
      projects: projects
        .filter((project) => project.userId === user.id)
        .map((project) => ({
          ...project,
          updates: projectUpdates.filter((update) => update.projectId === project.id),
        })),
      reputationEntries: reputationEntries.filter((entry) => entry.userId === user.id),
    },
    karma: userPosts.reduce((sum, post) => sum + post.score, 0) + userComments.reduce((sum, comment) => sum + comment.score, 0),
    viewerMemberships: [],
    totalReputation: reputationEntries.filter((entry) => entry.userId === user.id).reduce((sum, entry) => sum + entry.score, 0),
  }
}

export function getMockSearchResults(query: string, scope?: string) {
  const q = query.toLowerCase()
  const community = scope ? communities.find((item) => item.slug === scope) : null
  const filteredPosts = posts.filter((post) => {
    const inScope = community ? post.communityId === community.id : true
    return inScope && (post.title.toLowerCase().includes(q) || (post.body || "").toLowerCase().includes(q))
  })
  return {
    communities: communities.filter((item) => item.name.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q)),
    users: users.filter((item) => item.username.toLowerCase().includes(q) || item.bio.toLowerCase().includes(q)),
    posts: filteredPosts.map(hydratePost),
  }
}

export function getMockNotificationsData(username?: string) {
  const user = username ? users.find((item) => item.username === username) : users[1]
  const items = notifications
    .filter((item) => item.userId === user?.id)
    .map((item) => ({
      ...item,
      actor: item.actorId ? userById(item.actorId) : null,
      post: item.postId ? hydratePost(posts.find((post) => post.id === item.postId)!) : null,
      comment: item.commentId ? comments.find((comment) => comment.id === item.commentId) : null,
    }))
  return { notifications: items, unreadCount: items.filter((item) => !item.isRead).length }
}

export function getMockSavedPosts(username?: string) {
  const user = username ? users.find((item) => item.username === username) : users[0]
  return savedItems
    .filter((item) => item.userId === user?.id && item.postId)
    .map((item) => hydratePost(posts.find((post) => post.id === item.postId)!))
}

export function getMockCommunityModerationData(slug: string) {
  const base = getMockCommunityPageData(slug)
  if (!base) return null
  const queuePosts = base.posts.filter((post) => post.id === "post-3" || post.isStickied)
  return {
    ...base,
    reports: reports.map((report) => ({
      ...report,
      user: users.find((user) => user.id === report.userId),
      post: report.postId ? hydratePost(posts.find((post) => post.id === report.postId)!) : null,
    })),
    queuePosts,
    actions: moderationActions.map((action) => ({
      ...action,
      actor: userById(action.actorId),
      post: action.postId ? hydratePost(posts.find((post) => post.id === action.postId)!) : null,
    })),
    insights: {
      memberGrowth: [12, 18, 26, 35, 48, 62],
      postsOverTime: [1, 3, 2, 5, 4, 6],
      commentsOverTime: [2, 5, 7, 8, 9, 12],
      reportsCount: reports.length,
      removalsCount: 1,
      activeContributors: [
        { user: userById("mock-maya"), score: 34 },
        { user: userById("mock-ege"), score: 28 },
      ],
    },
  }
}
