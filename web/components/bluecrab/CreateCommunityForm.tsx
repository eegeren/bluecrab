"use client"

import { useActionState } from "react"
import { createCommunityAction } from "@/app/actions"
import { FormMessage } from "@/components/bluecrab/FormMessage"
import { SubmitButton } from "@/components/bluecrab/SubmitButton"

type ActionState = { error?: string } | undefined

export function CreateCommunityForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(createCommunityAction, undefined)

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage message={state?.error} />

      <label className="block space-y-2 text-sm text-slate-300">
        <span>Name</span>
        <input
          name="name"
          required
          minLength={3}
          className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-400/30"
          placeholder="Product Pulse"
        />
      </label>

      <label className="block space-y-2 text-sm text-slate-300">
        <span>Slug</span>
        <input
          name="slug"
          required
          minLength={3}
          className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-400/30"
          placeholder="product-pulse"
        />
      </label>

      <label className="block space-y-2 text-sm text-slate-300">
        <span>Description</span>
        <textarea
          name="description"
          required
          rows={4}
          minLength={20}
          className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-400/30"
          placeholder="What kind of discussions belong here?"
        />
      </label>

      <label className="block space-y-2 text-sm text-slate-300">
        <span>Avatar URL</span>
        <input
          name="avatar"
          className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-400/30"
          placeholder="https://..."
        />
      </label>

      <label className="block space-y-2 text-sm text-slate-300">
        <span>Banner URL</span>
        <input
          name="banner"
          className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-400/30"
          placeholder="https://..."
        />
      </label>

      <label className="block space-y-2 text-sm text-slate-300">
        <span>Rules</span>
        <textarea
          name="rules"
          required
          rows={5}
          className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-400/30"
          placeholder={"Bring specifics, not vague takes.\nShare sources when needed.\nNo spam."}
        />
      </label>

      <SubmitButton className="bg-[linear-gradient(135deg,#7dd3fc,#38bdf8,#0ea5e9)] text-slate-950" pendingLabel="Creating...">
        Create community
      </SubmitButton>
    </form>
  )
}
