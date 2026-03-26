import Link from "next/link"
import { notFound } from "next/navigation"
import { CommunitySettingsForm } from "@/components/bluecrab/CommunitySettingsForm"
import { getCommunityModerationData } from "@/lib/bluecrab-data"
import { getSessionUser } from "@/lib/session"

export default async function CommunityModerationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const user = await getSessionUser()
  const data = await getCommunityModerationData(slug, user?.id)
  if (!data) notFound()

  return (
    <div className="space-y-5">
      <section className="rounded-[34px] border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm text-cyan-200">Mod tools for c/{data.community.slug}</div>
            <h1 className="mt-2 font-heading text-4xl font-semibold text-white">Moderation dashboard</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/c/${slug}/moderation/queue`} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">Queue</Link>
            <Link href={`/c/${slug}/moderation/reports`} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">Reports</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5"><div className="text-sm text-slate-400">Reports</div><div className="mt-2 text-3xl font-semibold text-white">{data.insights.reportsCount}</div></div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5"><div className="text-sm text-slate-400">Queue</div><div className="mt-2 text-3xl font-semibold text-white">{data.queuePosts.length}</div></div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5"><div className="text-sm text-slate-400">Removals</div><div className="mt-2 text-3xl font-semibold text-white">{data.insights.removalsCount}</div></div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5"><div className="text-sm text-slate-400">Members</div><div className="mt-2 text-3xl font-semibold text-white">{data.community.memberCount}</div></div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/5 p-5">
            <div className="font-heading text-2xl font-semibold text-white">Community insights</div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">Member growth: {data.insights.memberGrowth.join(" / ")}</div>
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">Posts over time: {data.insights.postsOverTime.join(" / ")}</div>
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">Comments over time: {data.insights.commentsOverTime.join(" / ")}</div>
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                Top contributors: {data.insights.activeContributors.map((item: any) => item.user.username).join(", ")}
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/5 p-5">
            <div className="font-heading text-2xl font-semibold text-white">Community settings</div>
            <div className="mt-4">
              <CommunitySettingsForm community={data.community} />
            </div>
          </div>
        </div>

        <aside className="rounded-[30px] border border-white/10 bg-white/5 p-5">
          <div className="font-heading text-2xl font-semibold text-white">Recent mod actions</div>
          <div className="mt-4 space-y-3">
            {data.actions.map((action: any) => (
              <div key={action.id} className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                <div className="font-medium text-white">{action.actionType}</div>
                <div className="mt-1">{action.note}</div>
                <div className="mt-2 text-xs text-slate-500">by u/{action.actor.username}</div>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  )
}
