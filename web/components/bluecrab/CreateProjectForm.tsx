"use client"

import { useActionState } from "react"
import { createProjectAction } from "@/app/actions"
import { FormMessage } from "@/components/bluecrab/FormMessage"
import { SubmitButton } from "@/components/bluecrab/SubmitButton"

type ActionState = { error?: string; success?: string } | undefined

export function CreateProjectForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(createProjectAction, undefined)

  return (
    <form action={formAction} className="space-y-4 rounded-[30px] border border-white/10 bg-black/20 p-5">
      <div>
        <div className="font-heading text-xl font-semibold text-white">Start a build in public project</div>
        <div className="mt-1 text-sm text-slate-400">Projects create recurring loops. Updates can feed your profile and future posts.</div>
      </div>
      <FormMessage message={state?.error} />
      <FormMessage message={state?.success} tone="success" />
      <input name="name" placeholder="Project name" className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
      <textarea name="description" rows={4} placeholder="What are you building and why now?" className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
      <select name="stage" defaultValue="IDEA" className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none">
        <option value="IDEA">Idea</option>
        <option value="MVP">MVP</option>
        <option value="LAUNCHING">Launching</option>
        <option value="GROWING">Growing</option>
        <option value="PROFITABLE">Profitable</option>
      </select>
      <SubmitButton className="bg-[linear-gradient(135deg,#7dd3fc,#38bdf8,#0ea5e9)] text-slate-950">Create project</SubmitButton>
    </form>
  )
}
