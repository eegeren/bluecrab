import { notFound } from "next/navigation"
import { getCommunityPageData } from "@/lib/bluecrab-data"
import { getSessionUser } from "@/lib/session"

export default async function CommunityRulesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const user = await getSessionUser()
  const data = await getCommunityPageData(slug, "trending", user?.id)
  if (!data) notFound()

  return (
    <div className="space-y-5">
      <section className="rounded-[34px] border border-white/10 bg-white/5 p-6">
        <div className="text-sm text-cyan-200">Rules for c/{data.community.slug}</div>
        <h1 className="mt-2 font-heading text-4xl font-semibold text-white">Community rules</h1>
      </section>
      <div className="space-y-3">
        {(data.community.rules || []).map((rule: any, index: number) => (
          <div key={rule.id || rule} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-cyan-200">Rule {index + 1}</div>
            <div className="mt-2 text-lg font-semibold text-white">{rule.title || `Rule ${index + 1}`}</div>
            <div className="mt-2 text-sm leading-7 text-slate-300">{rule.description || rule}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
