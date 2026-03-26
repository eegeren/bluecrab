import Link from "next/link"
import { notFound } from "next/navigation"
import { CreateProjectForm } from "@/components/bluecrab/CreateProjectForm"
import { PostCard } from "@/components/bluecrab/PostCard"
import { getProfilePageData } from "@/lib/bluecrab-data"
import { getSessionUser } from "@/lib/session"
import { formatCount, formatRelativeDate } from "@/lib/utils"

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const viewer = await getSessionUser()
  const data = await getProfilePageData(username, viewer?.id)

  if (!data) {
    notFound()
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[34px] border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="font-heading text-4xl font-semibold text-white">u/{data.user.username}</div>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">{data.user.bio || "This user has not added a bio yet."}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
              <span>{formatCount(data.karma)} karma</span>
              <span>{formatCount(data.totalReputation)} reputation</span>
              <span>{data.user.posts.length} recent posts</span>
              <span>{data.user.comments.length} recent comments</span>
              <span>Joined {data.user.memberships.length} communities</span>
            </div>
          </div>
          {viewer?.username === data.user.username ? (
            <Link href="/settings" className="rounded-2xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-slate-200">
              Edit profile
            </Link>
          ) : null}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={`/u/${data.user.username}/posts`} className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-slate-300">Posts</Link>
          <Link href={`/u/${data.user.username}/comments`} className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-slate-300">Comments</Link>
          {viewer?.username === data.user.username ? (
            <Link href={`/u/${data.user.username}/saved`} className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-slate-300">Saved</Link>
          ) : null}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <section className="rounded-[34px] border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="font-heading text-2xl font-semibold text-white">Builder reputation</div>
                <div className="mt-2 text-sm text-slate-400">Meaningful identity signals based on contribution categories, not generic karma alone.</div>
              </div>
              <div className="rounded-3xl border border-cyan-400/15 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
                Total reputation: {formatCount(data.totalReputation)}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {data.user.reputationEntries.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm text-slate-500">No reputation categories yet.</div>
              ) : (
                data.user.reputationEntries.map((entry) => (
                  <div key={entry.id} className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-slate-200">
                    {entry.category.toLowerCase().replaceAll("_", " ")} · {entry.score}
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[34px] border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="font-heading text-2xl font-semibold text-white">Build in public</div>
                <div className="mt-2 text-sm text-slate-400">Projects turn one-off posts into a visible builder timeline.</div>
              </div>
            </div>
            <div className="mt-4 space-y-4">
              {viewer?.username === data.user.username ? <CreateProjectForm /> : null}
              {data.user.projects.length === 0 ? (
                <div className="rounded-[30px] border border-dashed border-white/10 px-6 py-12 text-center text-slate-400">No active projects yet.</div>
              ) : (
                data.user.projects.map((project) => (
                  <div key={project.id} className="rounded-[30px] border border-white/10 bg-black/20 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <Link href={`/projects/${project.slug}`} className="font-heading text-2xl font-semibold text-white transition hover:text-cyan-200">
                          {project.name}
                        </Link>
                        <div className="mt-2 text-xs uppercase tracking-[0.2em] text-cyan-200">{project.stage}</div>
                      </div>
                      <div className="text-xs text-slate-400">{project.updates.length} recent updates</div>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{project.description}</p>
                    <div className="mt-4 space-y-3">
                      {project.updates.map((update) => (
                        <div key={update.id} className="rounded-3xl border border-white/8 bg-white/5 p-4">
                          <div className="text-sm font-medium text-white">{update.title}</div>
                          <div className="mt-2 text-sm leading-7 text-slate-300">{update.content}</div>
                          <div className="mt-2 text-xs text-slate-500">{formatRelativeDate(update.createdAt)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="font-heading text-2xl font-semibold text-white">Posts</div>
            {data.user.posts.length === 0 ? (
              <div className="rounded-[30px] border border-dashed border-white/10 px-6 py-14 text-center text-slate-400">
                No posts yet.
              </div>
            ) : (
              data.user.posts.map((post) => <PostCard key={post.id} post={post} viewerId={viewer?.id} compact />)
            )}
          </section>

          <section className="rounded-[34px] border border-white/10 bg-white/5 p-6">
            <div className="font-heading text-2xl font-semibold text-white">Recent comments</div>
            <div className="mt-4 space-y-3">
              {data.user.comments.map((comment) => (
                <Link key={comment.id} href={`/post/${comment.postId}`} className="block rounded-3xl border border-white/8 bg-black/20 p-4 transition hover:border-cyan-400/20">
                  <div className="text-xs text-slate-400">
                    c/{comment.post.community.slug} · {formatRelativeDate(comment.createdAt)}
                  </div>
                  <div className="mt-2 line-clamp-3 text-sm leading-7 text-slate-300">{comment.body}</div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-[30px] border border-white/10 bg-white/5 p-5">
            <div className="font-heading text-xl font-semibold text-white">Community footprint</div>
            <div className="mt-4 space-y-3">
              {data.user.memberships.map((membership) => (
                <Link key={membership.id} href={`/c/${membership.community.slug}`} className="block rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-slate-300">
                  {membership.community.name}
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
