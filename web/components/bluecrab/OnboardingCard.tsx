"use client"

import Link from "next/link"
import { useActionState } from "react"
import { completeOnboardingAction } from "@/app/actions"
import { FormMessage } from "@/components/bluecrab/FormMessage"
import { SubmitButton } from "@/components/bluecrab/SubmitButton"

type ActionState = { error?: string; success?: string } | undefined

export function OnboardingCard({
  suggestedCommunities,
  defaultInterests,
}: {
  suggestedCommunities: Array<{ id: string; name: string; slug: string; memberCount: number }>
  defaultInterests: string[]
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(completeOnboardingAction, undefined)

  return (
    <section className="rounded-[24px] border border-cyan-400/15 bg-[linear-gradient(180deg,rgba(34,211,238,0.1),rgba(255,255,255,0.04))] p-4 shadow-[0_24px_80px_rgba(4,10,20,0.3)] sm:rounded-[34px] sm:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-2 text-xs uppercase tracking-[0.24em] text-cyan-200">Activation</div>
          <h2 className="font-heading text-xl font-semibold text-white sm:text-2xl">Shape your feed before it goes flat.</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Pick a few interests, join active communities, and BlueCrab will bias your home feed toward high-signal threads instead of generic volume.
          </p>
        </div>

        <form action={formAction} className="w-full max-w-xl space-y-4">
          <FormMessage message={state?.error} />
          <FormMessage message={state?.success} tone="success" />
          <label className="block space-y-2 text-sm text-slate-300">
            <span>Interests</span>
            <input
              name="interests"
              defaultValue={defaultInterests.join(", ")}
              placeholder="Product, Startups, AI, Media"
              className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-400/30"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {suggestedCommunities.map((community) => (
              <Link key={community.id} href={`/c/${community.slug}`} className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs text-slate-200 transition hover:bg-white/10">
                {community.name} · {community.memberCount}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <SubmitButton className="bg-[linear-gradient(135deg,#7dd3fc,#38bdf8,#0ea5e9)] text-slate-950">Finish onboarding</SubmitButton>
            <Link href="/settings" className="rounded-2xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-slate-200">
              Complete profile
            </Link>
          </div>
        </form>
      </div>
    </section>
  )
}
