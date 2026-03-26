import Link from "next/link"
import { ArrowDown, ArrowUp, Flag, Shield, Trash2 } from "lucide-react"
import {
  createCommentAction,
  deleteOwnCommentAction,
  moderateRemoveCommentAction,
  reportContentAction,
  voteCommentAction,
} from "@/app/actions"
import { reportReasons } from "@/lib/bluecrab-data"
import { formatRelativeDate } from "@/lib/utils"
import { SubmitButton } from "@/components/bluecrab/SubmitButton"

export function CommentThread({
  comment,
  postId,
  communitySlug,
  viewerId,
  isModerator,
  depth = 0,
}: {
  comment: any
  postId: string
  communitySlug: string
  viewerId?: string
  isModerator?: boolean
  depth?: number
}) {
  const viewerVote = comment.votes.find((vote: any) => vote.userId === viewerId)?.value ?? 0
  const canReply = depth < 2

  return (
    <div className="relative">
      <div className="rounded-[28px] border border-white/8 bg-white/4 p-4">
        <div className="flex items-start gap-4">
          <div className="flex shrink-0 flex-col items-center rounded-3xl border border-white/10 bg-black/20 px-2 py-3">
            <form action={voteCommentAction}>
              <input type="hidden" name="commentId" value={comment.id} />
              <input type="hidden" name="postId" value={postId} />
              <input type="hidden" name="communitySlug" value={communitySlug} />
              <button name="intent" value="up" className={viewerVote === 1 ? "rounded-2xl bg-cyan-400/15 p-2 text-cyan-300" : "rounded-2xl p-2 text-slate-500 transition hover:bg-white/8 hover:text-white"}>
                <ArrowUp className="h-4 w-4" />
              </button>
            </form>
            <div className="py-1 text-sm font-semibold text-white">{comment.score}</div>
            <form action={voteCommentAction}>
              <input type="hidden" name="commentId" value={comment.id} />
              <input type="hidden" name="postId" value={postId} />
              <input type="hidden" name="communitySlug" value={communitySlug} />
              <button name="intent" value="down" className={viewerVote === -1 ? "rounded-2xl bg-rose-500/15 p-2 text-rose-300" : "rounded-2xl p-2 text-slate-500 transition hover:bg-white/8 hover:text-white"}>
                <ArrowDown className="h-4 w-4" />
              </button>
            </form>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <Link href={`/u/${comment.author.username}`} className="font-medium text-slate-200 transition hover:text-white">
                u/{comment.author.username}
              </Link>
              <span>{formatRelativeDate(comment.createdAt)}</span>
              {comment.isRemoved ? <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-amber-200">Removed</span> : null}
              {comment.isDeleted ? <span className="rounded-full border border-white/10 bg-white/8 px-2 py-0.5 text-slate-300">Deleted</span> : null}
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">
              {comment.isDeleted ? "[deleted]" : comment.body}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              {canReply && viewerId ? (
                <details className="group">
                  <summary className="cursor-pointer list-none rounded-full border border-white/10 bg-white/6 px-3 py-2 transition hover:bg-white/10">
                    Reply
                  </summary>
                  <form action={createCommentAction} className="mt-3 space-y-3">
                    <input type="hidden" name="postId" value={postId} />
                    <input type="hidden" name="parentId" value={comment.id} />
                    <input type="hidden" name="communitySlug" value={communitySlug} />
                    <textarea
                      name="body"
                      required
                      minLength={2}
                      rows={3}
                      className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/30"
                      placeholder="Write a thoughtful reply"
                    />
                    <SubmitButton className="bg-white text-slate-950">Post reply</SubmitButton>
                  </form>
                </details>
              ) : null}

              {viewerId === comment.authorId ? (
                <form action={deleteOwnCommentAction}>
                  <input type="hidden" name="commentId" value={comment.id} />
                  <input type="hidden" name="postId" value={postId} />
                  <input type="hidden" name="communitySlug" value={communitySlug} />
                  <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 transition hover:bg-rose-500/12 hover:text-rose-200">
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </form>
              ) : null}

              {isModerator && viewerId !== comment.authorId ? (
                <form action={moderateRemoveCommentAction}>
                  <input type="hidden" name="commentId" value={comment.id} />
                  <input type="hidden" name="postId" value={postId} />
                  <input type="hidden" name="communitySlug" value={communitySlug} />
                  <button className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-amber-100 transition hover:bg-amber-400/20">
                    <Shield className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </form>
              ) : null}

              {viewerId && viewerId !== comment.authorId ? (
                <form action={reportContentAction} className="inline-flex items-center gap-2">
                  <input type="hidden" name="commentId" value={comment.id} />
                  <input type="hidden" name="postPageId" value={postId} />
                  <input type="hidden" name="communitySlug" value={communitySlug} />
                  <select
                    name="reason"
                    defaultValue="OTHER"
                    className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs text-slate-300 outline-none"
                  >
                    {reportReasons.map((reason) => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </select>
                  <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 transition hover:bg-white/10">
                    <Flag className="h-3.5 w-3.5" />
                    Report
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {comment.replies?.length ? (
        <div className="ml-4 mt-4 border-l border-white/8 pl-4 sm:ml-8 sm:pl-6">
          <div className="space-y-4">
            {comment.replies.map((reply: any) => (
              <CommentThread
                key={reply.id}
                comment={reply}
                postId={postId}
                communitySlug={communitySlug}
                viewerId={viewerId}
                isModerator={isModerator}
                depth={depth + 1}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
