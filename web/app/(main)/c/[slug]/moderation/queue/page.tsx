import { notFound } from "next/navigation"
import { PostCard } from "@/components/bluecrab/PostCard"
import { getCommunityModerationData } from "@/lib/bluecrab-data"
import { getSessionUser } from "@/lib/session"

export default async function ModerationQueuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const user = await getSessionUser()
  const data = await getCommunityModerationData(slug, user?.id)
  if (!data) notFound()

  return (
    <div className="space-y-5">
      <section className="rounded-[34px] border border-white/10 bg-white/5 p-6">
        <div className="text-sm text-cyan-200">Queue for c/{data.community.slug}</div>
        <h1 className="mt-2 font-heading text-4xl font-semibold text-white">Moderation queue</h1>
      </section>
      {data.queuePosts.length === 0 ? (
        <div className="rounded-[30px] border border-dashed border-white/10 px-6 py-14 text-center text-slate-400">Queue is clear.</div>
      ) : (
        data.queuePosts.map((post: any) => <PostCard key={post.id} post={post} viewerId={user?.id} isModerator />)
      )}
    </div>
  )
}
