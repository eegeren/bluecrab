import "server-only"

import { randomBytes } from "crypto"
import { cookies } from "next/headers"
import { cache } from "react"
import { compare, hash } from "bcryptjs"
import { redirect } from "next/navigation"
import { hasDatabaseUrl, prisma } from "@/lib/prisma"

const SESSION_COOKIE = "bluecrab_session"
const SESSION_DAYS = 30

export async function hashPassword(password: string) {
  return hash(password, 10)
}

export async function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash)
}

export async function createSession(userId: string) {
  if (!hasDatabaseUrl) {
    redirect("/login?error=db-not-configured")
  }

  const token = randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  })
}

export async function destroySession() {
  if (!hasDatabaseUrl) {
    return
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (token) {
    await prisma.session.deleteMany({ where: { token } })
  }

  cookieStore.delete(SESSION_COOKIE)
}

export const getSessionUser = cache(async () => {
  if (!hasDatabaseUrl) {
    return null
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (!token) {
    return null
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: { include: { preferences: true } } },
  })

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { token } }).catch(() => null)
    }
    return null
  }

  return session.user
})

export async function requireUser() {
  const user = await getSessionUser()

  if (!user) {
    redirect("/login")
  }

  return user
}
