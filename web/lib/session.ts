import "server-only"

import { cache } from "react"
import { getUser, requireUser as requireAuthedUser } from "@/lib/auth"

export const getSessionUser = cache(async () => {
  return getUser()
})

export async function requireUser() {
  return requireAuthedUser()
}
