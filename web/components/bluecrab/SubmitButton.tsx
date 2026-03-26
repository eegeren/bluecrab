"use client"

import { useFormStatus } from "react-dom"
import { cn } from "@/lib/utils"

type Props = {
  children: React.ReactNode
  className?: string
  pendingLabel?: string
}

export function SubmitButton({ children, className, pendingLabel }: Props) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {pending ? pendingLabel || "Working..." : children}
    </button>
  )
}
