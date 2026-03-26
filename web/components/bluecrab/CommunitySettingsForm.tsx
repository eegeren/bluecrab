"use client"

import { useActionState } from "react"
import { updateCommunitySettingsAction } from "@/app/actions"
import { FormMessage } from "@/components/bluecrab/FormMessage"
import { SubmitButton } from "@/components/bluecrab/SubmitButton"

type ActionState = { error?: string; success?: string } | undefined

export function CommunitySettingsForm({ community }: { community: any }) {
  const [state, formAction] = useActionState<ActionState, FormData>(updateCommunitySettingsAction, undefined)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="communityId" value={community.id} />
      <FormMessage message={state?.error} />
      <FormMessage message={state?.success} tone="success" />

      <label className="block space-y-2 text-sm text-slate-300">
        <span>Name</span>
        <input name="name" defaultValue={community.name} className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
      </label>
      <label className="block space-y-2 text-sm text-slate-300">
        <span>Description</span>
        <textarea name="description" defaultValue={community.description} rows={4} className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
      </label>
      <label className="block space-y-2 text-sm text-slate-300">
        <span>Welcome message</span>
        <textarea name="welcomeMessage" defaultValue={community.welcomeMessage} rows={3} className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2 text-sm text-slate-300">
          <span>Category</span>
          <input name="category" defaultValue={community.category} className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
        </label>
        <label className="block space-y-2 text-sm text-slate-300">
          <span>Community type</span>
          <select name="type" defaultValue={community.type} className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none">
            <option value="PUBLIC">Public</option>
            <option value="RESTRICTED">Restricted</option>
            <option value="PRIVATE">Private</option>
          </select>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2 text-sm text-slate-300">
          <span>Post permission</span>
          <select name="postPermission" defaultValue={community.postPermission} className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none">
            <option value="members">Members</option>
            <option value="approved">Approved users</option>
            <option value="mods">Moderators only</option>
          </select>
        </label>
        <label className="block space-y-2 text-sm text-slate-300">
          <span>Comment permission</span>
          <select name="commentPermission" defaultValue={community.commentPermission} className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none">
            <option value="members">Members</option>
            <option value="approved">Approved users</option>
            <option value="mods">Moderators only</option>
          </select>
        </label>
      </div>
      <label className="block space-y-2 text-sm text-slate-300">
        <span>Rules</span>
        <textarea
          name="rules"
          rows={6}
          defaultValue={(community.rules || []).map((rule: any) => rule.description || rule).join("\n")}
          className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
        />
      </label>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="flex items-center gap-3 rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
          <input type="checkbox" name="archiveOldPosts" defaultChecked={community.archiveOldPosts} />
          Archive old posts
        </label>
        <label className="flex items-center gap-3 rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
          <input type="checkbox" name="requirePostApproval" defaultChecked={community.requirePostApproval} />
          Require approval
        </label>
        <label className="flex items-center gap-3 rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
          <input type="checkbox" name="isDiscoverable" defaultChecked={community.isDiscoverable} />
          Discoverable
        </label>
      </div>
      <SubmitButton className="bg-[linear-gradient(135deg,#7dd3fc,#38bdf8,#0ea5e9)] text-slate-950">Save community settings</SubmitButton>
    </form>
  )
}
