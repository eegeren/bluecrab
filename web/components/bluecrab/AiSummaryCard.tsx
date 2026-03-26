import { generateDiscussionSummary } from "@/lib/ai-summary"

export function AiSummaryCard({
  post,
  comments,
}: {
  post: { title: string; body?: string | null; aiSummary?: any; aiSummaryUpdatedAt?: Date | null }
  comments: Array<{ body: string; score?: number }>
}) {
  const summary = post.aiSummary ?? generateDiscussionSummary({ title: post.title, body: post.body, comments })

  return (
    <details open className="rounded-[30px] border border-cyan-400/15 bg-[linear-gradient(180deg,rgba(34,211,238,0.08),rgba(255,255,255,0.03))] p-5">
      <summary className="cursor-pointer list-none">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-cyan-200">AI Summary</div>
            <div className="mt-1 font-heading text-2xl font-semibold text-white">Fast read for a long builder thread</div>
          </div>
          <div className="text-xs text-slate-500">{post.aiSummaryUpdatedAt ? "Updated recently" : "Mock intelligence layer"}</div>
        </div>
      </summary>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Summary</div>
          <p className="mt-2 text-sm leading-7 text-slate-200">{summary.summary}</p>
        </div>
        <div className="grid gap-4">
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Key insights</div>
            <div className="mt-2 space-y-2">
              {(summary.keyInsights ?? []).map((insight: string) => (
                <div key={insight} className="text-sm text-slate-200">
                  {insight}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Top points</div>
            <div className="mt-2 space-y-2">
              {(summary.topPoints ?? []).map((point: string) => (
                <div key={point} className="text-sm text-slate-200">
                  {point}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </details>
  )
}
