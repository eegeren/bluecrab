import Link from "next/link"
import Image from "next/image"
import { Bell, Compass, Home, PlusSquare, Search, Settings, Shield, Sparkles, UserRound } from "lucide-react"
import { logoutAction } from "@/app/actions"
import { formatCount, formatRelativeDate } from "@/lib/utils"

export function AppShell({
  user,
  shell,
  children,
}: {
  user: { username: string; avatar: string; bio: string } | null
  shell: Awaited<ReturnType<typeof import("@/lib/bluecrab-data").getShellData>>
  children: React.ReactNode
}) {
  const nav = [
    { href: "/", label: "Home", icon: Home },
    { href: "/explore", label: "Explore", icon: Compass },
    { href: "/search", label: "Search", icon: Search },
    { href: "/create-community", label: "Create Community", icon: PlusSquare },
    user ? { href: `/u/${user.username}`, label: "Profile", icon: UserRound } : null,
    user ? { href: "/notifications", label: "Notifications", icon: Bell } : null,
    user ? { href: "/settings", label: "Settings", icon: Settings } : null,
    user?.username === "ege" ? { href: "/admin/reports", label: "Admin", icon: Shield } : null,
  ].filter(Boolean) as Array<{ href: string; label: string; icon: typeof Home }>

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.14),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_25%),linear-gradient(180deg,#06101c_0%,#071423_45%,#091728_100%)] text-white">
      <div className="sticky top-0 z-40 border-b border-white/10 bg-[#07111d]/90 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/bluecrablogo.png"
              alt="BlueCrab"
              width={40}
              height={40}
              className="rounded-xl object-cover"
              unoptimized
            />
            <span className="font-heading text-xl font-semibold">BlueCrab</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Link href="/explore" className="rounded-full border border-white/10 px-3 py-1.5">
              Explore
            </Link>
            {user ? (
              <Link href={`/u/${user.username}`} className="rounded-full border border-white/10 px-3 py-1.5">
                Profile
              </Link>
            ) : (
              <Link href="/login" className="rounded-full border border-white/10 px-3 py-1.5">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 gap-6 px-4 py-4 lg:grid-cols-[270px_minmax(0,1fr)_320px] lg:px-6">
        <aside className="hidden lg:flex lg:flex-col lg:gap-5">
          <Link href="/" className="rounded-[28px] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <Image
                src="/bluecrablogo.png"
                alt="BlueCrab"
                width={44}
                height={44}
                className="rounded-2xl object-cover shadow-lg shadow-cyan-500/20"
                unoptimized
              />
              <div>
                <div className="font-heading text-xl font-semibold">BlueCrab</div>
                <div className="text-xs text-slate-400">Premium community discussion</div>
              </div>
            </div>
          </Link>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-3 backdrop-blur">
            <nav className="space-y-1.5">
              {nav.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/8 hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1">{item.label}</span>
                    {item.href === "/notifications" && shell.unreadCount ? (
                      <span className="rounded-full bg-cyan-400/15 px-2 py-0.5 text-[11px] text-cyan-200">{shell.unreadCount}</span>
                    ) : null}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="rounded-[28px] border border-cyan-400/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-slate-200">Your identity</div>
                <div className="mt-1 text-xs text-slate-400">
                  Build a recognizable profile through communities and thoughtful posting.
                </div>
              </div>
              <Sparkles className="h-4 w-4 text-cyan-300" />
            </div>
            {user ? (
              <>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-sm font-medium">{user.username}</div>
                  <div className="mt-1 line-clamp-3 text-sm text-slate-400">{user.bio || "No bio yet."}</div>
                </div>
                <form action={logoutAction} className="mt-4">
                  <button className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white">
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  className="block rounded-2xl bg-[linear-gradient(135deg,#7dd3fc,#38bdf8,#0ea5e9)] px-4 py-2.5 text-center text-sm font-semibold text-slate-950"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="block rounded-2xl border border-white/10 bg-white/6 px-4 py-2.5 text-center text-sm font-medium text-slate-300"
                >
                  Create account
                </Link>
              </div>
            )}
          </div>
        </aside>

        <main className="pb-10">
          <div className="mb-5 hidden rounded-[28px] border border-white/10 bg-white/5 p-3 backdrop-blur lg:block">
            <form action="/search" className="flex items-center gap-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                name="q"
                placeholder="Search communities, users, and discussions"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </form>
          </div>
          {children}
        </main>

        <aside className="hidden lg:flex lg:flex-col lg:gap-5">
          {shell.featuredCommunities?.length ? (
            <section className="rounded-[28px] border border-cyan-400/10 bg-[linear-gradient(180deg,rgba(34,211,238,0.1),rgba(255,255,255,0.04))] p-5 backdrop-blur">
              <div className="mb-3 text-sm font-semibold text-white">Featured communities</div>
              <div className="space-y-3">
                {shell.featuredCommunities.map((community) => (
                  <Link key={community.id} href={`/c/${community.slug}`} className="block rounded-2xl border border-cyan-400/15 bg-black/20 p-3 transition hover:border-cyan-400/30">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-white">{community.name}</div>
                        <div className="mt-1 text-xs text-cyan-200">{community.featuredLabel || "Featured"}</div>
                      </div>
                      <div className="text-xs text-slate-500">{formatCount(community.memberCount)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="mb-3 text-sm font-semibold text-white">Trending communities</div>
            <div className="space-y-3">
              {shell.trendingCommunities.map((community) => (
                <Link key={community.id} href={`/c/${community.slug}`} className="block rounded-2xl border border-white/6 bg-black/20 p-3 transition hover:border-cyan-400/30">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-white">c/{community.slug}</div>
                      <div className="mt-1 line-clamp-2 text-xs text-slate-400">{community.description}</div>
                    </div>
                    <div className="text-xs text-slate-500">{formatCount(community.memberCount)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="mb-3 text-sm font-semibold text-white">Top posts</div>
            <div className="space-y-3">
              {shell.trendingPosts.map((post, index) => (
                <Link key={post.id} href={`/post/${post.id}`} className="block rounded-2xl border border-white/6 bg-black/20 p-3 transition hover:border-cyan-400/30">
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                    <span>#{index + 1}</span>
                    <span>{formatRelativeDate(post.createdAt)}</span>
                  </div>
                  <div className="line-clamp-2 text-sm font-medium text-white">{post.title}</div>
                  <div className="mt-2 text-xs text-slate-400">
                    c/{post.community.slug} · {formatCount(post.score)} score
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="mb-3 text-sm font-semibold text-white">Recommended for you</div>
            <div className="space-y-3">
              {shell.recommendedCommunities.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm text-slate-500">
                  You already joined the current recommendations.
                </div>
              ) : null}
              {shell.recommendedCommunities.map((community) => (
                <Link key={community.id} href={`/c/${community.slug}`} className="block rounded-2xl border border-white/6 bg-black/20 p-3 transition hover:border-cyan-400/30">
                  <div className="text-sm font-medium text-white">{community.name}</div>
                  <div className="mt-1 text-xs text-slate-400">{community.memberCount} members</div>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
