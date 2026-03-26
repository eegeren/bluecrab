import { notFound } from "next/navigation"
import { PostCard } from "@/components/bluecrab/PostCard"
import { getProfilePageData } from "@/lib/bluecrab-data"
import { getSessionUser } from "@/lib/session"

export default async function UserPostsPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const viewer = await getSessionUser()
  const data = await getProfilePageData(username, viewer?.id)
  if (!data) notFound()

  return (
    <div className="space-y-5">
      <section className="rounded-[34px] border border-white/10 bg-white/5 p-6">
        <h1 className="font-heading text-4xl font-semibold text-white">u/{data.user.username} posts</h1>
      </section>
      {data.user.posts.map((post: any) => <PostCard key={post.id} post={post} viewerId={viewer?.id} compact />)}
    </div>
  )
}
