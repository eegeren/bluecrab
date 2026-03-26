import { notFound } from "next/navigation"
import { getCommunityPageData } from "@/lib/bluecrab-data"
import { getSessionUser } from "@/lib/session"

export default async function CommunityAboutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const user = await getSessionUser()
  const data = await getCommunityPageData(slug, "trending", user?.id)
  if (!data) notFound()

  return (
    <div className="space-y-5">
      <section className="rounded-[34px] border border-white/10 bg-white/5 p-6">
        <div className="text-sm text-cyan-200">About c/{data.community.slug}</div>
        <h1 className="mt-2 font-heading text-4xl font-semibold text-white">{data.community.name}</h1>
        <p className="mt-4 text-sm leading-7 text-slate-300">{data.community.description}</p>
      </section>
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[30px] border border-white/10 bg-white/5 p-5">
          <div className="font-heading text-2xl font-semibold text-white">Community settings</div>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div>Type: {data.community.type}</div>
            <div>Posting: {data.community.postPermission}</div>
            <div>Comments: {data.community.commentPermission}</div>
            <div>Discoverable: {data.community.isDiscoverable ? "Yes" : "No"}</div>
            <div>Archive old posts: {data.community.archiveOldPosts ? "On" : "Off"}</div>
            <div>Approval required: {data.community.requirePostApproval ? "Yes" : "No"}</div>
          </div>
        </div>
        <div className="rounded-[30px] border border-white/10 bg-white/5 p-5">
          <div className="font-heading text-2xl font-semibold text-white">Flair catalog</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(data.community.flairs || []).map((flair: any) => (
              <span key={flair.id} className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-sm text-slate-200">
                {flair.label}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
