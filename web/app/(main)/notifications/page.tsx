import Link from "next/link"
import { markNotificationsReadAction } from "@/app/actions"
import { getNotificationsPageData } from "@/lib/bluecrab-data"
import { getSessionUser } from "@/lib/session"
import { formatRelativeDate } from "@/lib/utils"

export default async function NotificationsPage() {
  const user = await getSessionUser()
  const data = await getNotificationsPageData(user?.id, user?.username)

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="rounded-[24px] border border-white/10 bg-white/5 p-4 sm:rounded-[34px] sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-heading text-3xl font-semibold text-white sm:text-4xl">Notifications</h1>
            <p className="mt-2 text-sm text-slate-400">{data.unreadCount} unread updates</p>
          </div>
          {user ? (
            <form action={markNotificationsReadAction}>
              <button className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-slate-200 sm:w-auto">
                Mark all read
              </button>
            </form>
          ) : null}
        </div>
      </section>

      {data.notifications.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-white/10 px-4 py-12 text-center text-slate-400 sm:rounded-[30px] sm:px-6 sm:py-14">
          Nothing new yet.
        </div>
      ) : (
        <div className="space-y-3">
          {data.notifications.map((notification: any) => (
            <div key={notification.id} className="rounded-[22px] border border-white/10 bg-white/5 p-4 sm:rounded-[28px] sm:p-5">
              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white">{notification.body}</div>
                  <div className="mt-2 text-xs text-slate-400">
                    {notification.actor ? `u/${notification.actor.username} · ` : ""}
                    {formatRelativeDate(notification.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2 self-stretch sm:self-auto">
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
