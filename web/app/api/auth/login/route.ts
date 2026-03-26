import { NextResponse } from "next/server"
import { compare } from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { serializeAuthUser, setAuthCookie, signAuthToken } from "@/lib/auth"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 })
    }

    const email = parsed.data.email.toLowerCase()
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !(await compare(parsed.data.password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 })
    }

    const token = signAuthToken({ id: user.id, email: user.email })
    await setAuthCookie(token)

    return NextResponse.json({
      success: true,
      user: serializeAuthUser(user),
    })
  } catch (err) {
    console.error("DB ERROR:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
