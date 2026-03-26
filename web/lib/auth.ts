import "server-only"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import jwt from "jsonwebtoken"
import { hasDatabaseUrl, prisma } from "@/lib/prisma"

export const AUTH_COOKIE = "token"
const AUTH_EXPIRES_IN = "7d"

type AuthTokenPayload = {
  sub: string
  email: string
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET is required")
  }
  return secret
}

export function signAuthToken(user: { id: string; email: string }) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
    },
    getJwtSecret(),
    { expiresIn: AUTH_EXPIRES_IN },
  )
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as AuthTokenPayload
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  })
}

export function serializeAuthUser(user: any) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    bio: user.bio ?? "",
    avatar_url: user.avatar ?? "",
    cover_url: "",
    phone_number: "",
    website_url: "",
    instagram_url: "",
    twitter_url: "",
    linkedin_url: "",
    github_url: "",
    follower_count: 0,
    following_count: 0,
    is_following: false,
    created_at: user.createdAt instanceof Date ? user.createdAt.toISOString() : String(user.createdAt ?? ""),
  }
}

export async function getUser() {
  if (!hasDatabaseUrl) {
    return null
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE)?.value
  if (!token) {
    return null
  }

  try {
    const payload = verifyAuthToken(token)
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { preferences: true },
    })

    return user ?? null
  } catch {
    await clearAuthCookie()
    return null
  }
}

export async function requireUser() {
  const user = await getUser()
  if (!user) {
    redirect("/login")
  }
  return user
}
