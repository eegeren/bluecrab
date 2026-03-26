import Link from "next/link"
import { getHomeFeed } from "@/lib/bluecrab-data"
import { getSessionUser } from "@/lib/session"
import { OnboardingCard } from "@/components/bluecrab/OnboardingCard"
import { PostCard } from "@/components/bluecrab/PostCard"

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; page?: string }>
}) {
  const { sort = "for-you", page = "1" } = await searchParams
  const user = await getSessionUser()
  const feed = await getHomeFeed(sort, user?.id, Number(page) || 1)

  const tabs = [
    { label: "For You", value: "for-you" },
    ...(user ? [{ label: "Following", value: "following" }] : []),
    { label: "Trending", value: "trending" },
    { label: "Latest", value: "latest" },
  ]

  return (
    <div className="space-y-4 sm:space-y-5">
      {user && feed.onboarding?.needsOnboarding ? (
        <OnboardingCard suggestedCommunities={feed.onboarding.suggestedCommunities} defaultInterests={feed.onboarding.interests} />
      ) : null}

      <section className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4 shadow-[0_24px_80px_rgba(4,10,20,0.35)] sm:rounded-[34px] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
              Structured builder community
            </div>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl">Ideas, feedback, and build-in-public loops for serious builders.</h1>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              BlueCrab turns loose discussion into structured builder signal with templates, AI summaries, and reputation that means something.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/explore" className="rounded-2xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10">
              Explore communities
            </Link>
            <Link href="/create-community" className="rounded-2xl bg-[linear-gradient(135deg,#7dd3fc,#38bdf8,#0ea5e9)] px-4 py-2.5 text-sm font-semibold text-slate-950">
              Create community
            </Link>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/?sort=${tab.value}`}
            className={
              sort === tab.value
                ? "rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200"
                : "rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
            }
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {feed.posts.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-white/10 px-4 py-12 text-center text-slate-400 sm:rounded-[30px] sm:px-6 sm:py-14">
          <div className="text-lg font-medium text-white">Your feed needs a few anchors.</div>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400">
            Join active communities, save a few threads, or finish onboarding so BlueCrab can recover from the cold-start problem and show stronger discussions.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/explore" className="rounded-2xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-slate-200">
              Find communities
            </Link>
            <Link href="/settings" className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2.5 text-sm text-cyan-100">
              Complete profile
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {feed.posts.map((post) => (
            <PostCard key={post.id} post={post} viewerId={user?.id} compact />
          ))}
          {feed.hasMore ? (
            <div className="flex justify-center pt-2">
              <Link
                href={`/?sort=${sort}&page=${feed.page + 1}`}
                className="rounded-2xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/10"
              >
                Load more
              </Link>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
