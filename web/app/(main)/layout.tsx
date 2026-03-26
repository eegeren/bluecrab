import { AppShell } from "@/components/bluecrab/AppShell"
import { getShellData } from "@/lib/bluecrab-data"
import { getSessionUser } from "@/lib/session"

export const dynamic = "force-dynamic"

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  const shell = await getShellData(user?.id)

  return (
    <AppShell user={user} shell={shell}>
      {children}
    </AppShell>
  )
}
