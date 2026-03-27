import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { serverApiFetch } from "@/lib/api";

function normalizeSessionUser(payload: any) {
  if (!payload?.user) {
    return null;
  }

  return {
    id: payload.user.id,
    username: payload.user.username,
    email: payload.user.email,
    bio: payload.user.bio ?? "",
    avatar: payload.user.avatar_url ?? payload.user.avatar ?? "",
    createdAt: payload.user.createdAt ?? payload.user.created_at ?? new Date().toISOString(),
    updatedAt: payload.user.updatedAt ?? payload.user.updated_at ?? new Date().toISOString(),
    preferences: payload.user.preferences ?? null,
  };
}

export const getSessionUser = cache(async () => {
  try {
    const payload = await serverApiFetch<any>("/auth/me");
    return normalizeSessionUser(payload);
  } catch {
    return null;
  }
});

export async function requireUser() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
