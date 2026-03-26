import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { serializeAuthUser } from "@/lib/auth"

const registerSchema = z.object({
  username: z.string().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/).optional(),
  email: z.string().email(),
  password: z.string().min(8),
})

function slugFromEmail(email: string) {
  return email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").toLowerCase() || "user"
}

async function uniqueUsername(base: string) {
  let candidate = base
  let suffix = 1
  while (await prisma.user.findUnique({ where: { username: candidate } })) {
    suffix += 1
    candidate = `${base}${suffix}`
  }
  return candidate
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Enter a valid email and a password with at least 8 characters." }, { status: 400 })
    }

    const email = parsed.data.email.toLowerCase()
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "That email is already in use." }, { status: 409 })
    }

    const requestedUsername = (parsed.data.username || slugFromEmail(email)).toLowerCase()
    const username = await uniqueUsername(requestedUsername)
    const passwordHash = await bcrypt.hash(parsed.data.password, 10)

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
      },
    })

    return NextResponse.json({
      success: true,
      user: serializeAuthUser(user),
    })
  } catch (err) {
    console.error("DB ERROR:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
