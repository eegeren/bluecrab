import { notFound } from "next/navigation"
import { PostCard } from "@/components/bluecrab/PostCard"
import { getProfilePageData, getSavedPostsData } from "@/lib/bluecrab-data"
import { getSessionUser } from "@/lib/session"

export default async function UserSavedPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const viewer = await getSessionUser()
  const profile = await getProfilePageData(username, viewer?.id)
  if (!profile) notFound()

  if (!viewer || viewer.username !== username) {
    notFound()
  }

  const posts = await getSavedPostsData(viewer.id, viewer.username)

  return (
    <div className="space-y-5">
      <section className="rounded-[34px] border border-white/10 bg-white/5 p-6">
        <h1 className="font-heading text-4xl font-semibold text-white">Saved items</h1>
      </section>
      {posts.length === 0 ? (
        <div className="rounded-[30px] border border-dashed border-white/10 px-6 py-14 text-center text-slate-400">No saved posts yet.</div>
      ) : (
        posts.map((post: any) => <PostCard key={post.id} post={post} viewerId={viewer?.id} compact />)
      )}
    </div>
  )
}
