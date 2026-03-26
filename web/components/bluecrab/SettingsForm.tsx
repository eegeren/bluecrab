"use client"

import { useActionState } from "react"
import { updateSettingsAction } from "@/app/actions"
import { FormMessage } from "@/components/bluecrab/FormMessage"
import { SubmitButton } from "@/components/bluecrab/SubmitButton"

type ActionState = { error?: string; success?: string } | undefined

export function SettingsForm({
  user,
}: {
  user: {
    username: string
    bio: string
    avatar: string
    preferences?: {
      showNsfw?: boolean
      showSpoilers?: boolean
      publicActivity?: boolean
      compactMode?: boolean
    } | null
  }
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(updateSettingsAction, undefined)

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage message={state?.error} />
      <FormMessage message={state?.success} tone="success" />

      <label className="block space-y-2 text-sm text-slate-300">
        <span>Username</span>
        <input
          name="username"
          defaultValue={user.username}
          minLength={3}
          maxLength={24}
          className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-400/30"
        />
      </label>

      <label className="block space-y-2 text-sm text-slate-300">
        <span>Avatar URL</span>
        <input
          name="avatar"
          defaultValue={user.avatar}
          className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-400/30"
          placeholder="https://..."
        />
      </label>

      <label className="block space-y-2 text-sm text-slate-300">
        <span>Bio</span>
        <textarea
          name="bio"
          defaultValue={user.bio}
          rows={5}
          className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-400/30"
        />
      </label>

      <div className="grid gap-3 rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300 md:grid-cols-2">
        <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/6 bg-white/5 px-4 py-3">
          <span>Show NSFW content</span>
          <input type="checkbox" name="showNsfw" defaultChecked={user.preferences?.showNsfw} className="h-4 w-4 accent-cyan-400" />
        </label>
        <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/6 bg-white/5 px-4 py-3">
          <span>Show spoiler previews</span>
          <input type="checkbox" name="showSpoilers" defaultChecked={user.preferences?.showSpoilers ?? true} className="h-4 w-4 accent-cyan-400" />
        </label>
        <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/6 bg-white/5 px-4 py-3">
          <span>Public activity visible</span>
          <input type="checkbox" name="publicActivity" defaultChecked={user.preferences?.publicActivity ?? true} className="h-4 w-4 accent-cyan-400" />
        </label>
        <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/6 bg-white/5 px-4 py-3">
          <span>Compact feed density</span>
          <input type="checkbox" name="compactMode" defaultChecked={user.preferences?.compactMode} className="h-4 w-4 accent-cyan-400" />
        </label>
      </div>

      <SubmitButton className="bg-[linear-gradient(135deg,#7dd3fc,#38bdf8,#0ea5e9)] text-slate-950" pendingLabel="Saving...">
        Save settings
      </SubmitButton>
    </form>
  )
}
