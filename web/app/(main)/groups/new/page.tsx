'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { groups } from '@/lib/api'

export default function NewGroupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [avatarURL, setAvatarURL] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const created = await groups.create({
        name,
        description,
        avatar_url: avatarURL,
        is_private: isPrivate,
      })
      router.push(`/groups/${created.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
      <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">New Group</h1>
      <form onSubmit={submit} className="space-y-3">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Group name"
          className="w-full px-3 sm:px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all outline-none"
          required
        />
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Description"
          rows={4}
          className="w-full px-3 sm:px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all outline-none resize-none"
        />
        <input
          value={avatarURL}
          onChange={e => setAvatarURL(e.target.value)}
          placeholder="Avatar URL"
          className="w-full px-3 sm:px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all outline-none"
        />
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
          <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="w-4 h-4 rounded accent-blue-600" />
          Private group
        </label>
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <button disabled={saving} className="w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold disabled:opacity-60 transition-all">
          {saving ? 'Creating...' : 'Create'}
        </button>
      </form>
    </div>
  )
}

