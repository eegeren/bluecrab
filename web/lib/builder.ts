export const postModes = [
  { value: "DISCUSSION", label: "Discussion", description: "Open-ended conversation and tradeoffs." },
  { value: "FEEDBACK", label: "Feedback", description: "Specific critique and actionable advice." },
  { value: "ROAST", label: "Roast", description: "Informal, sharper reactions welcome." },
  { value: "SHOWCASE", label: "Showcase", description: "Highlight a launch, win, or milestone." },
] as const

export const reputationCategories = [
  { value: "SAAS_BUILDER", label: "SaaS Builder" },
  { value: "AI_DEVELOPER", label: "AI Developer" },
  { value: "GROWTH_EXPERT", label: "Growth Expert" },
  { value: "INDIE_HACKER", label: "Indie Hacker" },
] as const

export const postTemplates = [
  {
    value: "GENERAL_DISCUSSION",
    label: "General Discussion",
    description: "Open context and broader discussion.",
    fields: [],
  },
  {
    value: "STARTUP_IDEA",
    label: "Startup Idea",
    description: "Clarify the problem, audience, and monetization.",
    fields: [
      { key: "idea", label: "Idea" },
      { key: "targetAudience", label: "Target audience" },
      { key: "problem", label: "Problem" },
      { key: "solution", label: "Solution" },
      { key: "monetization", label: "Monetization" },
    ],
  },
  {
    value: "SAAS_FEEDBACK",
    label: "SaaS Feedback",
    description: "Ask for targeted product feedback.",
    fields: [
      { key: "whatIBuilt", label: "What I built" },
      { key: "targetUsers", label: "Target users" },
      { key: "currentTraction", label: "Current traction" },
      { key: "feedbackWanted", label: "What feedback I want" },
    ],
  },
  {
    value: "BUILD_IN_PUBLIC",
    label: "Build in Public Update",
    description: "Share progress, blockers, and next milestones.",
    fields: [
      { key: "projectName", label: "Project name" },
      { key: "currentStage", label: "Current stage" },
      { key: "shippedThisWeek", label: "What shipped" },
      { key: "keyLearning", label: "Key learning" },
      { key: "nextMilestone", label: "Next milestone" },
    ],
  },
  {
    value: "GROWTH_QUESTION",
    label: "Growth Question",
    description: "Ask about acquisition, activation, or retention.",
    fields: [
      { key: "channel", label: "Channel" },
      { key: "currentExperiment", label: "Current experiment" },
      { key: "metric", label: "Metric" },
      { key: "blocker", label: "Blocker" },
    ],
  },
] as const

export function getTemplateConfig(templateType?: string) {
  return postTemplates.find((template) => template.value === templateType) ?? postTemplates[0]
}

export function getModeActionLabel(mode?: string) {
  if (mode === "FEEDBACK") return "Give feedback"
  if (mode === "ROAST") return "Roast this"
  if (mode === "SHOWCASE") return "Celebrate this"
  return "Comment your thoughts"
}
