type SummaryInput = {
  title: string
  body?: string | null
  comments?: Array<{ body: string; score?: number }>
}

export function generateDiscussionSummary(input: SummaryInput) {
  const comments = (input.comments ?? []).filter((comment) => comment.body.trim().length > 0)
  const topComments = comments
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 3)
    .map((comment) => comment.body.trim().slice(0, 140))

  const summary = input.body?.trim()
    ? input.body.trim().slice(0, 220)
    : "Builder discussion with early feedback and actionable context."

  return {
    summary,
    keyInsights: topComments.length
      ? topComments
      : [
          "The thread is still young, so the strongest signal is the original post.",
          "Ask sharper questions to attract more specific builder feedback.",
        ],
    topPoints: [
      `Thread focus: ${input.title}`,
      `${comments.length} comments analyzed for signal and repetition.`,
    ],
  }
}
