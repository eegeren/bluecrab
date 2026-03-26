import { notFound } from "next/navigation"
import { getCommunityModerationData } from "@/lib/bluecrab-data"
import { getSessionUser } from "@/lib/session"
import { formatRelativeDate } from "@/lib/utils"

export default async function ModerationReportsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const user = await getSessionUser()
  const data = await getCommunityModerationData(slug, user?.id)
  if (!data) notFound()

  return (
    <div className="space-y-5">
      <section className="rounded-[34px] border border-white/10 bg-white/5 p-6">
        <div className="text-sm text-cyan-200">Reports for c/{data.community.slug}</div>
        <h1 className="mt-2 font-heading text-4xl font-semibold text-white">Reported content</h1>
      </section>
      <div className="space-y-3">
        {data.reports.map((report: any) => (
          <div key={report.id} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-medium text-white">{report.reason}</div>
              <div className="text-xs text-slate-500">{formatRelativeDate(report.createdAt)}</div>
            </div>
            <div className="mt-2 text-sm text-slate-300">{report.details || "No extra details provided."}</div>
            {report.post ? <div className="mt-3 text-xs text-cyan-200">Post: {report.post.title}</div> : null}
          </div>
        ))}
      </div>
    </div>
  )
}
