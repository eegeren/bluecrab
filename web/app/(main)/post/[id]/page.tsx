import { notFound } from "next/navigation"
import Link from "next/link"
import { createCommentAction, generatePostSummaryAction } from "@/app/actions"
import { AiSummaryCard } from "@/components/bluecrab/AiSummaryCard"
import { CommentThread } from "@/components/bluecrab/CommentThread"
import { PostCard } from "@/components/bluecrab/PostCard"
import { SubmitButton } from "@/components/bluecrab/SubmitButton"
import { getPostPageData } from "@/lib/bluecrab-data"
import { getSessionUser } from "@/lib/session"

export default async function PostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { id } = await params
  const { page = "1" } = await searchParams
  const user = await getSessionUser()
  const data = await getPostPageData(id, user?.id, Number(page) || 1)

  if (!data) {
    notFound()
  }

  const isModerator = data.membership?.role === "MODERATOR"

  return (
    <div className="space-y-5">
      <PostCard post={data.post} viewerId={user?.id} isModerator={isModerator} />

      <AiSummaryCard post={data.post} comments={data.comments} />

      {data.post.structuredPostData && typeof data.post.structuredPostData === "object" ? (
        <section className="rounded-[34px] border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Structured context</div>
              <h2 className="mt-1 font-heading text-2xl font-semibold text-white">Builder context</h2>
            </div>
            {user?.id === data.post.authorId ? (
              <form action={generatePostSummaryAction}>
                <input type="hidden" name="postId" value={data.post.id} />
                <button className="rounded-2xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-slate-200">Refresh AI summary</button>
              </form>
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(data.post.structuredPostData).map(([key, value]) => (
              <div key={key} className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{key}</div>
                <div className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-200">{String(value)}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-[34px] border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-2xl font-semibold text-white">Comments</h2>
          <div className="text-sm text-slate-400">{data.post.commentCount} in discussion</div>
        </div>

        {user ? (
          <form action={createCommentAction} className="space-y-3">
            <input type="hidden" name="postId" value={data.post.id} />
            <input type="hidden" name="communitySlug" value={data.post.community.slug} />
            <textarea
              name="body"
              rows={4}
              required
              minLength={2}
              className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/30"
              placeholder="Add something useful to the discussion"
            />
            <SubmitButton className="bg-[linear-gradient(135deg,#7dd3fc,#38bdf8,#0ea5e9)] text-slate-950">Comment</SubmitButton>
          </form>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 px-4 py-6 text-sm text-slate-400">
            Sign in to comment, vote, and join the discussion.
          </div>
        )}

        <div className="mt-6 space-y-4">
          {data.comments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 px-4 py-8 text-center text-slate-400">
              No comments yet. Start the thread.
            </div>
          ) : (
            data.comments.map((comment: any) => (
              <CommentThread
                key={comment.id}
                comment={comment}
                postId={data.post.id}
                communitySlug={data.post.community.slug}
                viewerId={user?.id}
                isModerator={isModerator}
              />
            ))
          )}
          {data.hasMoreComments ? (
            <div className="pt-2 text-center">
              <Link
                href={`/post/${data.post.id}?page=${data.commentPage + 1}`}
                className="inline-flex rounded-2xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/10"
              >
                Load more comments
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
