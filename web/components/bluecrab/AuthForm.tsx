"use client"

import { useActionState } from "react"
import Link from "next/link"
import { FormMessage } from "@/components/bluecrab/FormMessage"
import { SubmitButton } from "@/components/bluecrab/SubmitButton"

type ActionState = { error?: string } | undefined

export function AuthForm({
  title,
  description,
  action,
  mode,
}: {
  title: string
  description: string
  action: (state: ActionState, formData: FormData) => Promise<ActionState>
  mode: "login" | "register"
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, undefined)

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <h1 className="font-heading text-4xl font-semibold text-white">{title}</h1>
        <p className="text-sm text-slate-400">{description}</p>
      </div>

      <FormMessage message={state?.error} />

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

      <SubmitButton
        pendingLabel={mode === "login" ? "Signing in..." : "Creating account..."}
        className="w-full bg-[linear-gradient(135deg,#7dd3fc,#38bdf8,#0ea5e9)] text-slate-950"
      >
        {mode === "login" ? "Sign In" : "Create Account"}
      </SubmitButton>

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
