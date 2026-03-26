import { redirect } from "next/navigation"
import { registerAction } from "@/app/actions"
import { AuthForm } from "@/components/bluecrab/AuthForm"
import { getSessionUser } from "@/lib/session"

export default async function RegisterPage() {
  if (await getSessionUser()) {
    redirect("/")
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <div className="hidden bg-[radial-gradient(circle_at_0%_20%,rgba(56,189,248,0.2),transparent_24%),linear-gradient(180deg,#08101b,#0a1625)] p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-white">BlueCrab</div>
        <div>
          <div className="font-heading max-w-xl text-6xl font-semibold leading-[1.02] text-white">
            Start with interests, stay for the quality of discussion.
          </div>
          <p className="mt-5 max-w-lg text-lg leading-8 text-slate-300">
            Pick communities, publish posts, build identity, and find trending discussions without the clutter of legacy forums.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm text-slate-300">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">Voting</div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">Profiles</div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">Moderation</div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_24px_80px_rgba(4,10,20,0.45)] backdrop-blur">
          <AuthForm
            title="Create account"
            description="Start building your profile and join the communities that matter to you."
            action={registerAction}
            mode="register"
          />
        </div>
      </div>
    </div>
  )
}
