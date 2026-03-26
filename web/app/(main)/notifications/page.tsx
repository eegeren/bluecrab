import Link from "next/link"
import { markNotificationsReadAction } from "@/app/actions"
import { getNotificationsPageData } from "@/lib/bluecrab-data"
import { getSessionUser } from "@/lib/session"
import { formatRelativeDate } from "@/lib/utils"

export default async function NotificationsPage() {
  const user = await getSessionUser()
  const data = await getNotificationsPageData(user?.id, user?.username)

  return (
    <div className="space-y-5">
      <section className="rounded-[34px] border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-4xl font-semibold text-white">Notifications</h1>
            <p className="mt-2 text-sm text-slate-400">{data.unreadCount} unread updates</p>
          </div>
          {user ? (
            <form action={markNotificationsReadAction}>
              <button className="rounded-2xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-slate-200">
                Mark all read
              </button>
            </form>
          ) : null}
        </div>
      </section>

      {data.notifications.length === 0 ? (
        <div className="rounded-[30px] border border-dashed border-white/10 px-6 py-14 text-center text-slate-400">
          Nothing new yet.
        </div>
      ) : (
        <div className="space-y-3">
          {data.notifications.map((notification: any) => (
            <div key={notification.id} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-white">{notification.body}</div>
                  <div className="mt-2 text-xs text-slate-400">
                    {notification.actor ? `u/${notification.actor.username} · ` : ""}
                    {formatRelativeDate(notification.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!notification.isRead ? <span className="h-2.5 w-2.5 rounded-full bg-cyan-300" /> : null}
                  {notification.postId ? (
                    <Link href={`/post/${notification.postId}`} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200">
                      Open
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
