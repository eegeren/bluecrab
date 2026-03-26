"use client"

import { useActionState, useMemo, useState } from "react"
import { createPostAction, saveDraftAction } from "@/app/actions"
import { FormMessage } from "@/components/bluecrab/FormMessage"
import { SubmitButton } from "@/components/bluecrab/SubmitButton"
import { getTemplateConfig, postModes, postTemplates, reputationCategories } from "@/lib/builder"

type ActionState = { error?: string; success?: string } | undefined

export function CreatePostForm({
  communitySlug,
  flairs = [],
  projects = [],
}: {
  communitySlug: string
  flairs?: Array<{ id: string; label: string }>
  projects?: Array<{ id: string; name: string }>
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(createPostAction, undefined)
  const [draftState, draftAction] = useActionState<ActionState, FormData>(saveDraftAction, undefined)
  const [templateType, setTemplateType] = useState<string>("GENERAL_DISCUSSION")
  const [postMode, setPostMode] = useState<string>("DISCUSSION")
  const [structuredValues, setStructuredValues] = useState<Record<string, string>>({})
  const template = useMemo(() => getTemplateConfig(templateType), [templateType])

  return (
    <div className="space-y-4">
      <FormMessage message={state?.error} />
      <FormMessage message={draftState?.success} tone="success" />
      <FormMessage message={draftState?.error} />

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="communitySlug" value={communitySlug} />
        <input type="hidden" name="templateType" value={templateType} />
        <input type="hidden" name="postMode" value={postMode} />
        <input type="hidden" name="structuredPostData" value={JSON.stringify(structuredValues)} />

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block space-y-2 text-sm text-slate-300">
            <span>Post type</span>
            <select name="type" defaultValue="TEXT" className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-400/30">
              <option value="TEXT">Text</option>
              <option value="IMAGE">Image</option>
              <option value="LINK">Link</option>
              <option value="POLL">Poll</option>
            </select>
          </label>

          <label className="block space-y-2 text-sm text-slate-300">
            <span>Intent</span>
            <select value={postMode} onChange={(event) => setPostMode(event.target.value)} className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-400/30">
              {postModes.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block space-y-2 text-sm text-slate-300">
          <span>Template</span>
          <select
            value={templateType}
            onChange={(event) => {
              setTemplateType(event.target.value)
              setStructuredValues({})
            }}
            className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-400/30"
          >
            {postTemplates.map((templateOption) => (
              <option key={templateOption.value} value={templateOption.value}>
                {templateOption.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500">{template.description}</p>
        </label>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block space-y-2 text-sm text-slate-300">
            <span>Builder category</span>
            <select name="topicCategory" defaultValue="INDIE_HACKER" className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-400/30">
              {reputationCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>

          {projects.length > 0 ? (
            <label className="block space-y-2 text-sm text-slate-300">
              <span>Link to project</span>
              <select name="projectId" defaultValue="" className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-400/30">
                <option value="">No linked project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        {template.fields.length > 0 ? (
          <section className="rounded-[30px] border border-cyan-400/10 bg-[linear-gradient(180deg,rgba(34,211,238,0.08),rgba(255,255,255,0.03))] p-5">
            <div className="mb-4">
              <div className="text-sm font-medium text-white">Structured fields</div>
              <div className="mt-1 text-xs text-slate-400">These fields make builder posts easier to scan and easier to respond to.</div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {template.fields.map((field) => (
                <label key={field.key} className="block space-y-2 text-sm text-slate-300">
                  <span>{field.label}</span>
                  <textarea
                    rows={3}
                    value={structuredValues[field.key] ?? ""}
                    onChange={(event) =>
                      setStructuredValues((current) => ({
                        ...current,
                        [field.key]: event.target.value,
                      }))
                    }
                    className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-400/30"
                    placeholder={`Add ${field.label.toLowerCase()}`}
                  />
                </label>
              ))}
            </div>
          </section>
        ) : null}

        {flairs.length > 0 ? (
          <label className="block space-y-2 text-sm text-slate-300">
            <span>Flair</span>
            <select name="flairId" className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-400/30" defaultValue="">
              <option value="">No flair</option>
              {flairs.map((flair) => (
                <option key={flair.id} value={flair.id}>
                  {flair.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="block space-y-2 text-sm text-slate-300">
          <span>Title</span>
          <input
            name="title"
            required
            minLength={8}
            maxLength={180}
            className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-400/30"
            placeholder="What are you building, validating, or trying to learn?"
          />
        </label>

        <label className="block space-y-2 text-sm text-slate-300">
          <span>Body</span>
          <textarea
            name="body"
            rows={8}
            className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-400/30"
            placeholder="Add the nuance, constraints, context, and what kind of response would be most useful."
          />
        </label>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block space-y-2 text-sm text-slate-300">
            <span>Image URL</span>
            <input name="imageUrl" className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-400/30" placeholder="Only used for image posts" />
          </label>

          <label className="block space-y-2 text-sm text-slate-300">
            <span>Link URL</span>
            <input name="linkUrl" className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-400/30" placeholder="Only used for link posts" />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-3 rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
            <input type="checkbox" name="isNsfw" className="h-4 w-4" />
            Mark as NSFW
          </label>
          <label className="flex items-center gap-3 rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
            <input type="checkbox" name="isSpoiler" className="h-4 w-4" />
            Mark as spoiler
          </label>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
          <div className="font-medium text-white">Response framing</div>
          <div className="mt-2">
            {postModes.find((mode) => mode.value === postMode)?.description}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <SubmitButton className="bg-[linear-gradient(135deg,#7dd3fc,#38bdf8,#0ea5e9)] text-slate-950" pendingLabel="Publishing...">
            Publish post
          </SubmitButton>
          <button formAction={draftAction} className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm font-semibold text-slate-200">
            Save draft
          </button>
        </div>
      </form>
    </div>
  )
}
