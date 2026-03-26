import { redirect } from "next/navigation"
import { AuthForm } from "@/components/bluecrab/AuthForm"
import { getSessionUser } from "@/lib/session"

export default async function LoginPage() {
  if (await getSessionUser()) {
    redirect("/")
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <div className="hidden bg-[radial-gradient(circle_at_20%_20%,rgba(125,211,252,0.18),transparent_28%),linear-gradient(180deg,#08101b,#0a1625)] p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-white">BlueCrab</div>
        <div>
          <div className="font-heading max-w-xl text-6xl font-semibold leading-[1.02] text-white">
            The modern community layer for the social web.
          </div>
          <p className="mt-5 max-w-lg text-lg leading-8 text-slate-300">
            Join communities, shape discussions, and discover trending conversations in a cleaner, more premium Reddit-style product.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm text-slate-300">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">Communities</div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">Threaded comments</div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">Discovery</div>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full max-w-md rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-[0_24px_80px_rgba(4,10,20,0.45)] backdrop-blur sm:rounded-[32px] sm:p-8">
          <AuthForm
            title="Sign in"
            description="Access your communities, picks, and conversation history."
            mode="login"
          />
        </div>
      </div>
    </div>
  )
}
