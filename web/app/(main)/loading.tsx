export default function MainLoading() {
  return (
    <div className="space-y-5">
      <div className="h-40 animate-pulse rounded-[34px] border border-white/10 bg-white/5" />
      <div className="flex gap-2">
        <div className="h-10 w-24 animate-pulse rounded-full border border-white/10 bg-white/5" />
        <div className="h-10 w-24 animate-pulse rounded-full border border-white/10 bg-white/5" />
        <div className="h-10 w-24 animate-pulse rounded-full border border-white/10 bg-white/5" />
      </div>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="h-56 animate-pulse rounded-[30px] border border-white/10 bg-white/5" />
      ))}
    </div>
  )
}
