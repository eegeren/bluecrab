import { redirect } from "next/navigation"
import { getAdminDashboardData } from "@/lib/bluecrab-data"
import { getSessionUser } from "@/lib/session"
import { formatRelativeDate } from "@/lib/utils"

export default async function AdminReportsPage() {
  const user = await getSessionUser()
  if (!user || user.username !== "ege") {
    redirect("/")
  }

  const data = await getAdminDashboardData(user.id)
  if (!data) {
    redirect("/")
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[34px] border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <h1 className="font-heading text-4xl font-semibold text-white">Admin review</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Lightweight internal oversight for reports, featured inventory, and trust signals. This stays intentionally compact so moderation remains operational, not bureaucratic.
            </p>
          </div>
          <div className="grid min-w-[260px] gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Open reports</div>
              <div className="mt-2 text-3xl font-semibold text-white">{data.counts.openReports}</div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Flagged users</div>
              <div className="mt-2 text-3xl font-semibold text-white">{data.counts.flaggedUsers}</div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Featured slots</div>
              <div className="mt-2 text-3xl font-semibold text-white">{data.counts.featuredCommunities}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-3 rounded-[34px] border border-white/10 bg-white/5 p-6">
          <div className="font-heading text-2xl font-semibold text-white">Flagged content</div>
          {data.reports.map((report: any) => (
            <div key={report.id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-medium text-white">{report.reason.replaceAll("_", " ")}</div>
                <div className="text-xs text-slate-400">{formatRelativeDate(report.createdAt)}</div>
              </div>
              <div className="mt-2 text-sm text-slate-300">
                Reporter: u/{report.user?.username ?? "unknown"} · Status: {report.status}
              </div>
              <div className="mt-2 text-sm text-slate-400">
                {report.post ? `Post: ${report.post.title} in c/${report.post.community.slug}` : null}
                {report.comment ? `Comment by u/${report.comment.author.username} in c/${report.comment.post.community.slug}` : null}
              </div>
            </div>
          ))}
        </section>

        <aside className="space-y-5">
          <section className="rounded-[34px] border border-white/10 bg-white/5 p-6">
            <div className="font-heading text-2xl font-semibold text-white">Audit log</div>
            <div className="mt-4 space-y-3">
              {data.audits.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 px-4 py-6 text-sm text-slate-500">
                  No admin audit entries yet.
                </div>
              ) : (
                data.audits.map((audit: any) => (
                  <div key={audit.id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                    <div className="text-sm font-medium text-white">{audit.summary}</div>
                    <div className="mt-2 text-xs text-slate-400">
                      {audit.actor ? `u/${audit.actor.username} · ` : ""}
                      {formatRelativeDate(audit.createdAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[34px] border border-white/10 bg-white/5 p-6">
            <div className="font-heading text-2xl font-semibold text-white">Featured inventory</div>
            <div className="mt-4 space-y-3">
              {data.communities.map((community: any) => (
                <div key={community.id} className="rounded-3xl border border-cyan-400/15 bg-cyan-400/5 p-4">
                  <div className="text-sm font-medium text-white">{community.name}</div>
                  <div className="mt-1 text-xs text-cyan-200">{community.featuredLabel || "Featured placement"}</div>
                  <div className="mt-2 text-xs text-slate-400">c/{community.slug}</div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
