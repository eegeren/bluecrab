export function SkeletonBox({ className = '' }: { className?: string }) {
  return (
    <div className={`skeleton bg-blue-100 dark:bg-[#162033] rounded-xl ${className}`} />
  )
}

export function PostSkeleton() {
  return (
    <div className="bg-white dark:bg-[#0a1628] rounded-2xl border border-blue-100 dark:border-[#162033] p-5">
      <div className="flex items-center gap-3 mb-4">
        <SkeletonBox className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonBox className="h-3.5 w-32" />
          <SkeletonBox className="h-3 w-20" />
        </div>
      </div>
      <SkeletonBox className="h-4 w-full mb-2" />
      <SkeletonBox className="h-4 w-4/5 mb-2" />
      <SkeletonBox className="h-4 w-3/5 mb-4" />
      <SkeletonBox className="h-48 w-full mb-4" />
      <div className="flex gap-3">
        <SkeletonBox className="h-8 w-20" />
        <SkeletonBox className="h-8 w-20" />
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="bg-white dark:bg-[#0a1628] rounded-2xl border border-blue-100 dark:border-[#162033] overflow-hidden mb-4">
      <SkeletonBox className="h-32 rounded-none" />
      <div className="px-6 pb-5">
        <div className="flex items-end justify-between -mt-10 mb-4">
          <SkeletonBox className="w-20 h-20 rounded-full" />
          <SkeletonBox className="h-9 w-28 mt-12" />
        </div>
        <SkeletonBox className="h-5 w-40 mb-2" />
        <SkeletonBox className="h-4 w-64 mb-4" />
        <div className="flex gap-6">
          <SkeletonBox className="h-4 w-20" />
          <SkeletonBox className="h-4 w-20" />
          <SkeletonBox className="h-4 w-20" />
        </div>
      </div>
    </div>
  )
}

export function StorySkeleton() {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <SkeletonBox className="w-14 h-14 rounded-full" />
      <SkeletonBox className="h-2.5 w-12" />
    </div>
  )
}

export function MessageSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <SkeletonBox className="w-12 h-12 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBox className="h-4 w-32" />
        <SkeletonBox className="h-3 w-48" />
      </div>
    </div>
  )
}

export function NotificationSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <SkeletonBox className="w-12 h-12 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBox className="h-4 w-56" />
        <SkeletonBox className="h-3 w-20" />
      </div>
    </div>
  )
}

