import Link from "next/link"
import { toggleMembershipAction } from "@/app/actions"
import { getExploreData } from "@/lib/bluecrab-data"
import { getSessionUser } from "@/lib/session"
import { formatCount } from "@/lib/utils"
import { PostCard } from "@/components/bluecrab/PostCard"

export default async function ExplorePage() {
  const user = await getSessionUser()
  const data = await getExploreData(user?.id)

  return (
    <div className="space-y-6">
      <section className="rounded-[34px] border border-white/10 bg-white/5 p-6">
        <h1 className="font-heading text-4xl font-semibold text-white">Explore</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          Find communities with real momentum, browse trending discussions, and join the spaces that shape your feed.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {data.featuredCommunities?.map((community: any) => (
          <div key={`featured-${community.id}`} className="rounded-[30px] border border-cyan-400/15 bg-[linear-gradient(180deg,rgba(34,211,238,0.08),rgba(255,255,255,0.03))] p-5">
            <div className="mb-2 text-xs uppercase tracking-[0.22em] text-cyan-200">Featured</div>
            <div className="font-heading text-2xl font-semibold text-white">{community.name}</div>
            <div className="mt-2 text-sm text-slate-400">c/{community.slug}</div>
            <p className="mt-4 text-sm leading-7 text-slate-300">{community.description}</p>
            <div className="mt-4 text-xs text-cyan-100">{community.featuredLabel || "High-signal staff pick"}</div>
          </div>
        ))}
        {data.communities.map((community: any) => {
          const isJoined = Array.isArray(community.members) && community.members.length > 0
          return (
            <div key={community.id} className="rounded-[30px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link href={`/c/${community.slug}`} className="font-heading text-2xl font-semibold text-white">
                    {community.name}
                  </Link>
                  <div className="mt-2 text-sm text-slate-400">c/{community.slug}</div>
                </div>
                {user ? (
                  <form action={toggleMembershipAction}>
                    <input type="hidden" name="communityId" value={community.id} />
                    <input type="hidden" name="slug" value={community.slug} />
                    <button className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-slate-200">
                      {isJoined ? "Joined" : "Join"}
                    </button>
                  </form>
                ) : null}
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-300">{community.description}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
                <span>{formatCount(community.memberCount)} members</span>
                <span>{community._count.posts} posts</span>
              </div>
            </div>
          )
        })}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl font-semibold text-white">Trending discussions</h2>
          <Link href="/" className="text-sm text-cyan-300">
            Back to feed
          </Link>
        </div>
        {data.posts.map((post: any) => (
          <PostCard key={post.id} post={post} viewerId={user?.id} compact />
        ))}
      </section>
    </div>
  )
}
