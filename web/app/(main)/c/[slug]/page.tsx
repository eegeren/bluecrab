import Link from "next/link"
import { notFound } from "next/navigation"
import { toggleMembershipAction } from "@/app/actions"
import { getCommunityPageData } from "@/lib/bluecrab-data"
import { getSessionUser } from "@/lib/session"
import { formatCount } from "@/lib/utils"
import { PostCard } from "@/components/bluecrab/PostCard"

export default async function CommunityPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sort?: string; flair?: string; page?: string }>
}) {
  const { slug } = await params
  const { sort = "trending", flair, page = "1" } = await searchParams
  const user = await getSessionUser()
  const data = await getCommunityPageData(slug, sort, user?.id, Number(page) || 1)

  if (!data) {
    notFound()
  }

  const isJoined = data.community.members.length > 0
  const isModerator = ["MODERATOR", "OWNER"].includes(data.community.members[0]?.role)
  const visiblePosts = flair ? data.posts.filter((post) => post.flair?.id === flair) : data.posts

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[34px] border border-white/10 bg-white/5">
        <div
          className="h-44 w-full bg-cover bg-center"
          style={{
            backgroundImage: data.community.banner
              ? `linear-gradient(180deg,rgba(2,6,23,0.15),rgba(2,6,23,0.75)),url(${data.community.banner})`
              : "linear-gradient(135deg, rgba(125,211,252,0.25), rgba(14,165,233,0.15))",
          }}
        />
        <div className="p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="font-heading text-4xl font-semibold text-white">{data.community.name}</div>
              <div className="mt-2 text-sm text-cyan-200">c/{data.community.slug}</div>
              <p className="mt-4 text-sm leading-7 text-slate-300">{data.community.description}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
                <span>{formatCount(data.community.memberCount)} members</span>
                <span>{data.community._count.posts} posts</span>
                <span>Created by u/{data.community.createdBy.username}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {user ? (
                <form action={toggleMembershipAction}>
                  <input type="hidden" name="communityId" value={data.community.id} />
                  <input type="hidden" name="slug" value={data.community.slug} />
                  <button className="rounded-2xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm font-medium text-slate-200">
                    {isJoined ? "Leave community" : "Join community"}
                  </button>
                </form>
              ) : null}
              <Link href={`/c/${data.community.slug}/submit`} className="rounded-2xl bg-[linear-gradient(135deg,#7dd3fc,#38bdf8,#0ea5e9)] px-4 py-2.5 text-sm font-semibold text-slate-950">
                Create post
              </Link>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href={`/c/${slug}/about`} className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-slate-300">About</Link>
            <Link href={`/c/${slug}/rules`} className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-slate-300">Rules</Link>
            {isModerator ? <Link href={`/c/${slug}/moderation`} className="rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm text-amber-100">Moderation</Link> : null}
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {["trending", "latest", "top"].map((value) => (
              <Link
                key={value}
                href={`/c/${slug}?sort=${value}`}
                className={
                  sort === value
                    ? "rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200"
                    : "rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-slate-300"
                }
              >
                {value[0].toUpperCase() + value.slice(1)}
              </Link>
            ))}
            {(data.community.flairs || []).map((item: any) => (
              <Link
                key={item.id}
                href={`/c/${slug}?sort=${sort}&flair=${item.id}`}
                className={
                  flair === item.id
                    ? "rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200"
                    : "rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-slate-300"
                }
              >
                {item.label}
              </Link>
            ))}
            {flair ? <Link href={`/c/${slug}?sort=${sort}`} className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-slate-300">Clear flair</Link> : null}
          </div>

          {visiblePosts.length === 0 ? (
            <div className="rounded-[30px] border border-dashed border-white/10 px-6 py-14 text-center text-slate-400">
              This community is new. Publish the first post and set the tone.
            </div>
          ) : (
            <>
              {visiblePosts.map((post) => (
                <PostCard key={post.id} post={post} viewerId={user?.id} isModerator={isModerator} compact />
              ))}
              {data.hasMore && !flair ? (
                <div className="flex justify-center pt-2">
                  <Link
                    href={`/c/${slug}?sort=${sort}&page=${data.page + 1}`}
                    className="rounded-2xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/10"
                  >
                    Load more posts
                  </Link>
                </div>
              ) : null}
            </>
          )}
        </div>

        <aside className="space-y-5">
          <section className="rounded-[30px] border border-white/10 bg-white/5 p-5">
            <div className="mb-3 font-heading text-xl font-semibold text-white">Rules</div>
            <div className="space-y-3">
              {data.community.rules.map((rule, index) => (
                <div key={typeof rule === "string" ? rule : rule.id} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-slate-300">
                  <span className="mr-2 text-cyan-300">{index + 1}.</span>
                  {typeof rule === "string" ? rule : rule.description}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[30px] border border-white/10 bg-white/5 p-5">
            <div className="font-heading text-xl font-semibold text-white">Community widgets</div>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">Moderator: u/{data.community.createdBy.username}</div>
              <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">Type: {data.community.type}</div>
              <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">Active now: {formatCount(data.community.activeCount || 0)}</div>
              <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                {isJoined ? "You are part of this community." : "Join to vote, post, and shape this feed."}
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
