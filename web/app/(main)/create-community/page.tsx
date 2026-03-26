import { redirect } from "next/navigation"
import { CreateCommunityForm } from "@/components/bluecrab/CreateCommunityForm"
import { getSessionUser } from "@/lib/session"

export default async function CreateCommunityPage() {
  const user = await getSessionUser()
  if (!user) {
    redirect("/login")
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <section className="rounded-[34px] border border-white/10 bg-white/5 p-6">
        <h1 className="font-heading text-4xl font-semibold text-white">Create a community</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Set the tone clearly. Strong communities start with a focused premise, thoughtful rules, and enough visual identity to feel intentional on day one.
        </p>
      </section>

      <section className="rounded-[34px] border border-white/10 bg-white/5 p-6">
        <CreateCommunityForm />
      </section>
    </div>
  )
}
