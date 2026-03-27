import { notFound } from "next/navigation"
import { PostCard } from "@/components/bluecrab/PostCard"
import { getProjectPageData } from "@/lib/bluecrab-data"
import { getSessionUser } from "@/lib/session"
import { formatRelativeDate } from "@/lib/utils"

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const viewer = await getSessionUser()
  const project = await getProjectPageData(slug)

  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[34px] border border-white/10 bg-white/5 p-6">
        <div className="text-xs uppercase tracking-[0.22em] text-cyan-200">Build in public</div>
        <h1 className="mt-2 font-heading text-4xl font-semibold text-white">{project.name}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{project.description}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
          <span>Stage: {project.stage}</span>
          <span>Builder: u/{project.user?.username ?? "unknown"}</span>
          <span>{project.updates.length} updates</span>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          <div className="font-heading text-2xl font-semibold text-white">Project timeline</div>
          {project.updates.map((update: any) => (
            <div key={update.id} className="rounded-[30px] border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-medium text-white">{update.title}</div>
              <div className="mt-2 text-sm leading-7 text-slate-300">{update.content}</div>
              <div className="mt-2 text-xs text-slate-500">{formatRelativeDate(update.createdAt)}</div>
            </div>
          ))}
        </section>

        <aside className="space-y-4">
          <div className="font-heading text-2xl font-semibold text-white">Related posts</div>
          {project.posts.map((post: any) => (
            <PostCard key={post.id} post={post} viewerId={viewer?.id} compact />
          ))}
        </aside>
      </div>
    </div>
  )
}
