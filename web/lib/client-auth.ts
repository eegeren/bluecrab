"use client";

import { auth } from "@/lib/api";

export async function logout() {
  await auth.logout();
}
