import "server-only";

import {
  getMockCommunityBySlug,
  getMockCommunityModerationData,
  getMockCommunityPageData,
  getMockExploreData,
  getMockHomeFeed,
  getMockNotificationsData,
  getMockPostPageData,
  getMockProfilePageData,
  getMockSavedPosts,
  getMockSearchResults,
  getMockShellData,
} from "@/lib/mock-data";
import { serverApiFetch } from "@/lib/api";

export const reportReasons = [
  { value: "SPAM", label: "Spam" },
  { value: "HARASSMENT", label: "Harassment" },
  { value: "RULE_BREAK", label: "Rule break" },
  { value: "MISINFORMATION", label: "Misinformation" },
  { value: "NSFW", label: "NSFW" },
  { value: "OTHER", label: "Other" },
];

const DEFAULT_COMMUNITY = {
  id: "general",
  slug: "general",
  name: "General",
  description: "General discussion",
};

function normalizeUser(user: any) {
  return {
    id: user?.id ?? "unknown-user",
    username: user?.username ?? "unknown",
    email: user?.email,
    bio: user?.bio ?? "",
    avatar: user?.avatar ?? user?.avatar_url ?? "",
    avatar_url: user?.avatar_url ?? user?.avatar ?? "",
    createdAt: user?.createdAt ?? user?.created_at ?? new Date().toISOString(),
    updatedAt: user?.updatedAt ?? user?.updated_at ?? new Date().toISOString(),
    posts: user?.posts ?? [],
    comments: user?.comments ?? [],
    memberships: user?.memberships ?? [],
    projects: user?.projects ?? [],
    reputationEntries: user?.reputationEntries ?? [],
    preferences: user?.preferences ?? null,
  };
}

function normalizePost(post: any) {
  const content = String(post?.content ?? post?.body ?? "");
  const lines = content.split("\n").map((line) => line.trim()).filter(Boolean);
  const title = post?.title ?? lines[0] ?? "Untitled post";
  const body = post?.body ?? (lines.length > 1 ? lines.slice(1).join("\n") : content);

  return {
    id: post?.id ?? crypto.randomUUID(),
    title,
    body,
    content,
    type: post?.type ?? "TEXT",
    postMode: post?.postMode ?? "DISCUSSION",
    templateType: post?.templateType ?? "GENERAL_DISCUSSION",
    topicCategory: post?.topicCategory ?? "INDIE_HACKER",
    structuredPostData: post?.structuredPostData ?? null,
    imageUrl: post?.imageUrl ?? post?.image_url ?? null,
    linkUrl: post?.linkUrl ?? post?.link_url ?? null,
    authorId: post?.authorId ?? post?.author?.id ?? "unknown-user",
    score: post?.score ?? post?.like_count ?? 0,
    commentCount: post?.commentCount ?? post?.comment_count ?? 0,
    isNsfw: Boolean(post?.isNsfw),
    isSpoiler: Boolean(post?.isSpoiler),
    isLocked: Boolean(post?.isLocked),
    isStickied: Boolean(post?.isStickied),
    isRemoved: Boolean(post?.isRemoved),
    isDeleted: Boolean(post?.isDeleted),
    isPromoted: Boolean(post?.isPromoted),
    promotedLabel: post?.promotedLabel ?? "",
    moderationState: post?.moderationState ?? "VISIBLE",
    createdAt: post?.createdAt ?? post?.created_at ?? new Date().toISOString(),
    updatedAt: post?.updatedAt ?? post?.updated_at ?? new Date().toISOString(),
    author: normalizeUser(post?.author),
    community: post?.community ?? DEFAULT_COMMUNITY,
    flair: post?.flair ?? null,
    votes: post?.votes ?? [],
  };
}

async function getBackendPosts(page = 1, limit = 20, authorId?: string): Promise<any> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (authorId) {
      params.set("authorId", authorId);
    }

    const data = await serverApiFetch<any>(`/posts?${params.toString()}`);

    return {
      posts: (data?.items ?? []).map(normalizePost),
      pagination: data?.pagination ?? { page, limit, total: 0, totalPages: 1 },
    };
  } catch {
    const posts = getMockHomeFeed("latest").slice(0, limit);
    return {
      posts,
      pagination: { page, limit, total: posts.length, totalPages: 1 },
    };
  }
}

export async function getShellData(userId?: string): Promise<any> {
  const mock = getMockShellData();
  const backend = await getBackendPosts(1, 5);

  return {
    trendingCommunities: mock.trendingCommunities,
    recommendedCommunities: mock.recommendedCommunities,
    featuredCommunities: mock.trendingCommunities.slice(0, 2),
    trendingPosts: backend.posts.length > 0 ? backend.posts : mock.trendingPosts,
    unreadCount: userId ? 0 : 0,
  };
}

export async function getHomeFeed(sort: string, userId?: string, page = 1): Promise<any> {
  const backend = await getBackendPosts(page, 12);
  const fallbackPosts = getMockHomeFeed(sort);
  const posts = backend.posts.length > 0 ? backend.posts : fallbackPosts.slice((page - 1) * 12, page * 12);

  return {
    posts,
    page,
    hasMore: (backend.pagination?.totalPages ?? 1) > page,
    onboarding: userId
      ? {
          needsOnboarding: false,
          interests: [],
          suggestedCommunities: getMockShellData().recommendedCommunities.slice(0, 3),
        }
      : null,
  };
}

export async function getExploreData(_userId?: string): Promise<any> {
  const mock = getMockExploreData();
  const backend = await getBackendPosts(1, 8);

  return {
    ...mock,
    featuredCommunities: mock.communities.slice(0, 2),
    posts: backend.posts.length > 0 ? backend.posts : mock.posts,
  };
}

export async function getCommunityPageData(slug: string, _sort = "trending", _userId?: string, page = 1): Promise<any> {
  const data = getMockCommunityPageData(slug);
  if (!data) {
    return null;
  }

  return {
    ...data,
    page,
    hasMore: false,
  };
}

export async function getCommunityBySlug(slug: string, _userId?: string): Promise<any> {
  return getMockCommunityBySlug(slug);
}

export async function getPostPageData(postId: string, _viewerId?: string, page = 1): Promise<any> {
  const data = getMockPostPageData(postId);

  if (!data) {
    return null;
  }

  return {
    post: data.post,
    comments: data.post.comments ?? [],
    membership: data.membership,
    commentPage: page,
    hasMoreComments: false,
  };
}

export async function getProfilePageData(username: string, _viewerId?: string): Promise<any> {
  const mock = getMockProfilePageData(username);

  try {
    const me = await serverApiFetch<any>("/users/me");
    const normalizedUser = normalizeUser(me?.user);

    if (normalizedUser.username !== username) {
      return mock;
    }

    const userPosts = await getBackendPosts(1, 20, normalizedUser.id);

    return {
      user: {
        ...normalizedUser,
        posts: userPosts.posts,
        comments: mock?.user.comments ?? [],
        memberships: mock?.user.memberships ?? [],
        projects: mock?.user.projects ?? [],
        reputationEntries: mock?.user.reputationEntries ?? [],
      },
      karma: userPosts.posts.reduce((sum: number, post: any) => sum + (post.score ?? 0), 0),
      viewerMemberships: [],
      totalReputation: mock?.totalReputation ?? 0,
    };
  } catch {
    return mock;
  }
}

export async function getSearchResults(query: string, scope?: string): Promise<any> {
  return getMockSearchResults(query, scope);
}

export async function getNotificationsPageData(_userId?: string, username?: string): Promise<any> {
  return getMockNotificationsData(username);
}

export async function getSavedPostsData(_userId?: string, username?: string): Promise<any> {
  return getMockSavedPosts(username);
}

export async function getCommunityModerationData(slug: string, _userId?: string): Promise<any> {
  return getMockCommunityModerationData(slug);
}

export async function getProjectPageData(slug: string): Promise<any> {
  const profile = getMockProfilePageData("ege");
  return profile?.user.projects.find((project: any) => project.slug === slug) ?? null;
}

export async function getAdminDashboardData(_userId?: string): Promise<any> {
  const moderation = getMockCommunityModerationData("product-pulse");
  if (!moderation) {
    return null;
  }

  return {
    reports: moderation.reports,
    audits: [],
    communities: moderation.community ? [moderation.community] : [],
    counts: {
      openReports: moderation.reports.length,
      flaggedUsers: moderation.reports.length,
      featuredCommunities: 1,
    },
  };
}
