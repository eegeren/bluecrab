import { notFound, redirect } from "next/navigation"
import { CreatePostForm } from "@/components/bluecrab/CreatePostForm"
import { getCommunityBySlug } from "@/lib/bluecrab-data"
import { getSessionUser } from "@/lib/session"

export default async function SubmitPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const user = await getSessionUser()
  if (!user) {
    redirect("/login")
  }

  const community = await getCommunityBySlug(slug, user.id)
  if (!community) {
    notFound()
  }

  if (!Array.isArray(community.members) || community.members.length === 0) {
    redirect(`/c/${slug}`)
  }

  const projects: Array<{ id: string; name: string }> = []

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <section className="rounded-[34px] border border-white/10 bg-white/5 p-6">
        <div className="text-sm text-cyan-200">Posting in c/{community.slug}</div>
        <h1 className="mt-2 font-heading text-4xl font-semibold text-white">Create a post</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Pick a builder template, frame the intent clearly, and give enough structure for people to respond with useful signal.
        </p>
      </section>

      <section className="rounded-[34px] border border-white/10 bg-white/5 p-6">
        <CreatePostForm communitySlug={community.slug} flairs={community.flairs || []} projects={projects} />
      </section>
    </div>
  )
}
