"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { serverApiFetch } from "@/lib/api";
import { requireUser } from "@/lib/session";

type ActionState = { error?: string; success?: string };

async function unsupported(feature: string): Promise<ActionState> {
  return { error: `${feature} is not connected to the Railway API yet.` };
}

async function unsupportedVoid(_formData: FormData | undefined, _feature: string): Promise<void> {
  return;
}

function buildPostContent(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();

  return [title, body].filter(Boolean).join("\n\n").trim();
}

export async function createPostAction(_: unknown, formData: FormData): Promise<ActionState | never> {
  try {
    await requireUser();

    const content = buildPostContent(formData);
    if (!content) {
      return { error: "Post content is required." };
    }

    await serverApiFetch("/posts", {
      method: "POST",
      body: JSON.stringify({ content }),
    });

    revalidatePath("/");
    redirect("/");
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to create post." };
  }
}

export async function deleteOwnPostAction(formData: FormData) {
  try {
    await requireUser();
    const postId = String(formData.get("postId") || "");
    if (!postId) {
      return;
    }

    await serverApiFetch(`/posts/${postId}`, {
      method: "DELETE",
    });

    revalidatePath("/");
  } catch {
    return;
  }
}

export async function createCommunityAction() {
  return unsupported("Community creation");
}

export async function saveDraftAction() {
  return unsupported("Drafts");
}

export async function createProjectAction() {
  return unsupported("Projects");
}

export async function updateSettingsAction() {
  return unsupported("Profile settings");
}

export async function updateCommunitySettingsAction() {
  return unsupported("Community settings");
}

export async function completeOnboardingAction() {
  return unsupported("Onboarding preferences");
}

export async function toggleMembershipAction(formData: FormData) {
  await unsupportedVoid(formData, "Community membership");
}

export async function createCommentAction(formData: FormData) {
  await unsupportedVoid(formData, "Comments");
}

export async function generatePostSummaryAction(formData: FormData) {
  await unsupportedVoid(formData, "AI summaries");
}

export async function markNotificationsReadAction(formData: FormData) {
  await unsupportedVoid(formData, "Notifications");
}

export async function votePostAction(formData: FormData) {
  await unsupportedVoid(formData, "Post voting");
}

export async function toggleSavePostAction(formData: FormData) {
  await unsupportedVoid(formData, "Bookmarks");
}

export async function toggleHidePostAction(formData: FormData) {
  await unsupportedVoid(formData, "Hidden posts");
}

export async function reportContentAction(formData: FormData) {
  await unsupportedVoid(formData, "Reporting");
}

export async function moderateRemovePostAction(formData: FormData) {
  await unsupportedVoid(formData, "Post moderation");
}

export async function moderatePostAction(formData: FormData) {
  await unsupportedVoid(formData, "Post moderation");
}

export async function voteCommentAction(formData: FormData) {
  await unsupportedVoid(formData, "Comment voting");
}

export async function deleteOwnCommentAction(formData: FormData) {
  await unsupportedVoid(formData, "Comments");
}

export async function moderateRemoveCommentAction(formData: FormData) {
  await unsupportedVoid(formData, "Comment moderation");
}
