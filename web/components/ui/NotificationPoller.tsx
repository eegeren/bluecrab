'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { auth, notifications as notifApi, messages as msgApi } from '@/lib/api'
import { useToast } from '@/context/ToastContext'

export default function NotificationPoller() {
  const { show } = useToast()
  const pathname = usePathname()
  const lastNotifId = useRef<string | null>(null)
  const lastMsgAt = useRef<string | null>(null)
  const initialized = useRef(false)

  useEffect(() => {
    const init = async () => {
      try {
        await auth.me()
        const [notifs, convs] = await Promise.all([
          notifApi.list(1),
          msgApi.conversations(),
        ])
        lastNotifId.current = notifs[0]?.id ?? null
        lastMsgAt.current = convs[0]?.updated_at ?? null
        initialized.current = true
      } catch { /* ignore */ }
    }
    init()

    const poll = async () => {
      if (!initialized.current) return

      // Notifications
      try {
        const notifs = await notifApi.list(1)
        if (notifs.length > 0 && notifs[0].id !== lastNotifId.current) {
          const newOnes: typeof notifs = []
          for (const n of notifs) {
            if (n.id === lastNotifId.current) break
            newOnes.push(n)
          }
          lastNotifId.current = notifs[0].id
          for (const n of newOnes.reverse()) {
            const text =
              n.type === 'like'
                ? `${n.actor.username} liked your post`
                : n.type === 'comment'
                ? `${n.actor.username} commented on your post`
                : `${n.actor.username} started following you`
            show(text, 'info')
          }
        }
      } catch { /* ignore */ }

      // Messages — skip if user is already in that conversation
      try {
        const convs = await msgApi.conversations()
        if (convs.length > 0 && convs[0].updated_at !== lastMsgAt.current) {
          if (lastMsgAt.current) {
            const newConvs = convs.filter(
              c => c.unread_count > 0 && c.updated_at > lastMsgAt.current!
            )
            for (const c of newConvs) {
              // Don't show toast if the user is already in that chat
              if (pathname === `/messages/${c.user.id}`) continue
              show(`New message from ${c.user.username}`, 'info')
            }
          }
          lastMsgAt.current = convs[0].updated_at
        }
      } catch { /* ignore */ }
    }

    const id = setInterval(poll, 8000)
    return () => clearInterval(id)
  }, [show, pathname])

  return null
}
