import { redirect } from "next/navigation"
import { SettingsForm } from "@/components/bluecrab/SettingsForm"
import { getSessionUser } from "@/lib/session"

export default async function SettingsPage() {
  const user = await getSessionUser()
  if (!user) {
    redirect("/login")
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <section className="rounded-[34px] border border-white/10 bg-white/5 p-6">
        <h1 className="font-heading text-4xl font-semibold text-white">Settings</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Keep your public identity clean and recognizable. Username, avatar, and bio are the main signals users will associate with your posts and comments.
        </p>
      </section>

      <section className="rounded-[34px] border border-white/10 bg-white/5 p-6">
        <SettingsForm user={user} />
      </section>
    </div>
  )
}
