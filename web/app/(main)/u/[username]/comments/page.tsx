import Link from "next/link"
import { notFound } from "next/navigation"
import { getProfilePageData } from "@/lib/bluecrab-data"
import { getSessionUser } from "@/lib/session"
import { formatRelativeDate } from "@/lib/utils"

export default async function UserCommentsPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const viewer = await getSessionUser()
  const data = await getProfilePageData(username, viewer?.id)
  if (!data) notFound()

  return (
    <div className="space-y-5">
      <section className="rounded-[34px] border border-white/10 bg-white/5 p-6">
        <h1 className="font-heading text-4xl font-semibold text-white">u/{data.user.username} comments</h1>
      </section>
      <div className="space-y-3">
        {data.user.comments.map((comment: any) => (
          <Link key={comment.id} href={`/post/${comment.postId}`} className="block rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="text-xs text-cyan-200">c/{comment.post.community.slug} · {formatRelativeDate(comment.createdAt)}</div>
            <div className="mt-2 text-sm leading-7 text-slate-300">{comment.body}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
