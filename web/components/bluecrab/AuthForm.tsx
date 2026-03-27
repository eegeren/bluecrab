"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormMessage } from "@/components/bluecrab/FormMessage"
import { auth } from "@/lib/api"

export function AuthForm({
  title,
  description,
  mode,
}: {
  title: string
  description: string
  mode: "login" | "register"
}) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const payload =
      mode === "register"
        ? {
            username: String(formData.get("username") || "").trim(),
            email: String(formData.get("email") || "").trim(),
            password: String(formData.get("password") || ""),
          }
        : {
            email: String(formData.get("email") || "").trim(),
            password: String(formData.get("password") || ""),
          }

    try {
      if (mode === "login") {
        await auth.login(payload.email, payload.password)
        router.push("/")
        router.refresh()
        return
      }

      await auth.register(payload.username ?? "", payload.email, payload.password)

      setSuccess("Account created. You can sign in now.")
      router.push("/login?registered=1")
      router.refresh()
    } catch (error) {
      console.error(error instanceof Error ? error.message : error)
      setError(error instanceof Error ? error.message : "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <h1 className="font-heading text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
        <p className="text-sm text-slate-400">{description}</p>
      </div>

      <FormMessage message={error} />
      <FormMessage message={success} tone="success" />

      {mode === "register" ? (
        <label className="block space-y-2 text-sm text-slate-300">
          <span>Username</span>
          <input
            name="username"
            required
            minLength={3}
            maxLength={24}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400/60 focus:bg-white/8"
            placeholder="bluecrabfan"
          />
        </label>
      ) : null}

      <label className="block space-y-2 text-sm text-slate-300">
        <span>Email</span>
        <input
          name="email"
          type="email"
          required
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400/60 focus:bg-white/8"
          placeholder="you@example.com"
        />
      </label>

      <label className="block space-y-2 text-sm text-slate-300">
        <span>Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400/60 focus:bg-white/8"
          placeholder="At least 8 characters"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#7dd3fc,#38bdf8,#0ea5e9)] px-4 py-2.5 text-sm font-semibold text-slate-950 transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (mode === "login" ? "Signing in..." : "Creating account...") : mode === "login" ? "Sign In" : "Create Account"}
      </button>

      <p className="text-sm text-slate-400">
        {mode === "login" ? "Need an account?" : "Already have an account?"}{" "}
        <Link
          href={mode === "login" ? "/register" : "/login"}
          className="font-medium text-cyan-300 transition hover:text-cyan-200"
        >
          {mode === "login" ? "Register" : "Sign in"}
        </Link>
      </p>
    </form>
  )
}
