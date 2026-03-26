import Image from "next/image"
import Link from "next/link"
import { ArrowDown, ArrowUp, Bookmark, EyeOff, Flag, MessageSquare, Shield, Trash2 } from "lucide-react"
import {
  deleteOwnPostAction,
  moderatePostAction,
  moderateRemovePostAction,
  reportContentAction,
  toggleHidePostAction,
  toggleSavePostAction,
  votePostAction,
} from "@/app/actions"
import { getModeActionLabel } from "@/lib/builder"
import { reportReasons } from "@/lib/bluecrab-data"
import { cn, formatRelativeDate } from "@/lib/utils"

export function PostCard({
  post,
  viewerId,
  isModerator,
  compact = false,
}: {
  post: any
  viewerId?: string
  isModerator?: boolean
  compact?: boolean
}) {
  const viewerVote = post.votes.find((vote: any) => vote.userId === viewerId)?.value ?? 0

  return (
    <article className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] shadow-[0_24px_80px_rgba(4,10,20,0.35)]">
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex shrink-0 flex-col items-center rounded-3xl border border-white/10 bg-black/20 px-2 py-3">
            <form action={votePostAction}>
              <input type="hidden" name="postId" value={post.id} />
              <input type="hidden" name="communitySlug" value={post.community.slug} />
              <button
                name="intent"
                value="up"
                className={cn("rounded-2xl p-2 text-slate-500 transition hover:bg-white/8 hover:text-white", viewerVote === 1 && "bg-cyan-400/15 text-cyan-300")}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </form>
            <div className="py-1 text-sm font-semibold text-white">{post.score}</div>
            <form action={votePostAction}>
              <input type="hidden" name="postId" value={post.id} />
              <input type="hidden" name="communitySlug" value={post.community.slug} />
              <button
                name="intent"
                value="down"
                className={cn("rounded-2xl p-2 text-slate-500 transition hover:bg-white/8 hover:text-white", viewerVote === -1 && "bg-rose-500/15 text-rose-300")}
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </form>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <Link href={`/c/${post.community.slug}`} className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-cyan-200">
                c/{post.community.slug}
              </Link>
              {post.flair ? (
                <span className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-slate-200">
                  {post.flair.label}
                </span>
              ) : null}
              <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-2.5 py-1 text-sky-200">
                {post.postMode?.toLowerCase?.().replace("_", " ") || "discussion"}
              </span>
              <span className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-slate-300">
                {post.templateType?.toLowerCase?.().replaceAll("_", " ") || "general discussion"}
              </span>
              {post.isPromoted ? (
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-emerald-200">
                  {post.promotedLabel || "Promoted"}
                </span>
              ) : null}
              {post.isStickied ? <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-amber-200">Stickied</span> : null}
              {post.isNsfw ? <span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-2.5 py-1 text-rose-200">NSFW</span> : null}
              {post.isSpoiler ? <span className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-slate-200">Spoiler</span> : null}
              {post.moderationState === "PENDING" ? <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-amber-200">Pending</span> : null}
              {post.isRemoved ? <span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-2.5 py-1 text-rose-200">Removed</span> : null}
              {post.isDeleted ? <span className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-slate-200">Deleted</span> : null}
              <span>posted by</span>
              <Link href={`/u/${post.author.username}`} className="text-slate-200 transition hover:text-white">
                u/{post.author.username}
              </Link>
              <span>{formatRelativeDate(post.createdAt)}</span>
            </div>

            <Link href={`/post/${post.id}`} className="block">
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-white">{post.isDeleted ? "[deleted]" : post.title}</h2>
              {post.body ? (
                <p className={cn("mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300", compact && "line-clamp-3")}>
                  {post.isDeleted ? "This post was deleted by its author." : post.body}
                </p>
              ) : null}
              {post.structuredPostData && typeof post.structuredPostData === "object" ? (
                <div className="mt-4 grid gap-3 rounded-[24px] border border-white/8 bg-black/20 p-4 sm:grid-cols-2">
                  {Object.entries(post.structuredPostData).slice(0, compact ? 2 : 4).map(([key, value]) => (
                    <div key={key}>
                      <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{key}</div>
                      <div className="mt-1 text-sm text-slate-200">{String(value)}</div>
                    </div>
                  ))}
                </div>
              ) : null}
            </Link>

            {post.type === "IMAGE" && post.imageUrl ? (
              <div className="relative mt-4 h-[280px] overflow-hidden rounded-[26px] sm:h-[380px]">
                <Image src={post.imageUrl} alt={post.title} fill sizes="(max-width: 768px) 100vw, 900px" className="object-cover" />
              </div>
            ) : null}

            {post.type === "LINK" && post.linkUrl ? (
              <a
                href={post.linkUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 block rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-cyan-200 transition hover:border-cyan-400/30"
              >
                {post.linkUrl}
              </a>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-emerald-100">
                {getModeActionLabel(post.postMode)}
              </span>
              {post.postMode === "FEEDBACK" ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2">Would you use this?</span>
              ) : null}
              <Link href={`/post/${post.id}`} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 transition hover:bg-white/10">
                <MessageSquare className="h-3.5 w-3.5" />
                {post.commentCount} comments
              </Link>

              {viewerId ? (
                <>
                  <form action={toggleSavePostAction}>
                    <input type="hidden" name="postId" value={post.id} />
                    <input type="hidden" name="communitySlug" value={post.community.slug} />
                    <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 transition hover:bg-white/10">
                      <Bookmark className="h-3.5 w-3.5" />
                      Save
                    </button>
                  </form>
                  <form action={toggleHidePostAction}>
                    <input type="hidden" name="postId" value={post.id} />
                    <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 transition hover:bg-white/10">
                      <EyeOff className="h-3.5 w-3.5" />
                      Hide
                    </button>
                  </form>
                </>
              ) : null}

              {viewerId === post.authorId ? (
                <form action={deleteOwnPostAction}>
                  <input type="hidden" name="postId" value={post.id} />
                  <input type="hidden" name="communitySlug" value={post.community.slug} />
                  <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 transition hover:bg-rose-500/12 hover:text-rose-200">
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </form>
              ) : null}

              {isModerator && viewerId !== post.authorId ? (
                <>
                  <form action={moderateRemovePostAction}>
                    <input type="hidden" name="postId" value={post.id} />
                    <input type="hidden" name="communitySlug" value={post.community.slug} />
                    <button className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-amber-100 transition hover:bg-amber-400/20">
                      <Shield className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </form>
                  <form action={moderatePostAction}>
                    <input type="hidden" name="postId" value={post.id} />
                    <input type="hidden" name="communitySlug" value={post.community.slug} />
                    <button name="action" value="lock" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 transition hover:bg-white/10">
                      Lock
                    </button>
                  </form>
                  <form action={moderatePostAction}>
                    <input type="hidden" name="postId" value={post.id} />
                    <input type="hidden" name="communitySlug" value={post.community.slug} />
                    <button name="action" value="sticky" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 transition hover:bg-white/10">
                      Sticky
                    </button>
                  </form>
                  {post.moderationState === "PENDING" ? (
                    <form action={moderatePostAction}>
                      <input type="hidden" name="postId" value={post.id} />
                      <input type="hidden" name="communitySlug" value={post.community.slug} />
                      <button name="action" value="approve" className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-emerald-100 transition hover:bg-emerald-400/20">
                        Approve
                      </button>
                    </form>
                  ) : null}
                </>
              ) : null}

              {viewerId && viewerId !== post.authorId ? (
                <form action={reportContentAction} className="inline-flex items-center gap-2">
                  <input type="hidden" name="postId" value={post.id} />
                  <input type="hidden" name="postPageId" value={post.id} />
                  <input type="hidden" name="communitySlug" value={post.community.slug} />
                  <select
                    name="reason"
                    className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs text-slate-300 outline-none"
                    defaultValue="OTHER"
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
    </article>
  )
}
