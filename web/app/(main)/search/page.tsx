import Link from "next/link"
import { getSearchResults } from "@/lib/bluecrab-data"
import { getSessionUser } from "@/lib/session"
import { PostCard } from "@/components/bluecrab/PostCard"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; scope?: string }>
}) {
  const { q = "", scope } = await searchParams
  const user = await getSessionUser()
  const results = q.trim() ? await getSearchResults(q.trim(), scope) : { communities: [], users: [], posts: [] }

  return (
    <div className="space-y-5">
      <section className="rounded-[34px] border border-white/10 bg-white/5 p-6">
        <form className="space-y-4" action="/search">
          <div className="font-heading text-4xl font-semibold text-white">Search</div>
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search communities, people, or discussions"
              className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            />
            <input
              name="scope"
              defaultValue={scope}
              placeholder="Optional community slug"
              className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            />
          </div>
        </form>
      </section>

      {!q.trim() ? (
        <div className="rounded-[30px] border border-dashed border-white/10 px-6 py-14 text-center text-slate-400">
          Start with a keyword, community slug, or username.
        </div>
      ) : (
        <>
          <section className="rounded-[30px] border border-white/10 bg-white/5 p-5">
            <div className="mb-4 font-heading text-2xl font-semibold text-white">Communities</div>
            <div className="grid gap-3 md:grid-cols-2">
              {results.communities.map((community: any) => (
                <Link key={community.id} href={`/c/${community.slug}`} className="rounded-3xl border border-white/10 bg-black/20 p-4 transition hover:border-cyan-400/20">
                  <div className="text-lg font-semibold text-white">{community.name}</div>
                  <div className="mt-1 text-sm text-cyan-200">c/{community.slug}</div>
                  <div className="mt-2 line-clamp-2 text-sm text-slate-400">{community.description}</div>
                </Link>
              ))}
              {results.communities.length === 0 ? <div className="text-sm text-slate-500">No communities matched.</div> : null}
            </div>
          </section>

          <section className="rounded-[30px] border border-white/10 bg-white/5 p-5">
            <div className="mb-4 font-heading text-2xl font-semibold text-white">People</div>
            <div className="grid gap-3 md:grid-cols-2">
              {results.users.map((person: any) => (
                <Link key={person.id} href={`/u/${person.username}`} className="rounded-3xl border border-white/10 bg-black/20 p-4 transition hover:border-cyan-400/20">
                  <div className="text-lg font-semibold text-white">u/{person.username}</div>
                  <div className="mt-2 line-clamp-2 text-sm text-slate-400">{person.bio}</div>
                </Link>
              ))}
              {results.users.length === 0 ? <div className="text-sm text-slate-500">No users matched.</div> : null}
            </div>
          </section>

          <section className="space-y-4">
            <div className="font-heading text-2xl font-semibold text-white">Posts</div>
            {results.posts.length === 0 ? (
              <div className="rounded-[30px] border border-dashed border-white/10 px-6 py-14 text-center text-slate-400">
                No posts matched this search.
              </div>
            ) : (
              results.posts.map((post: any) => <PostCard key={post.id} post={post} viewerId={user?.id} compact />)
            )}
          </section>
        </>
      )}
    </div>
  )
}
