'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/api'
import { setToken } from '@/lib/auth'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await auth.login(email, password)
      setToken(res.token)
      router.push('/')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-col justify-between w-[52%] relative bg-gradient-to-br from-blue-600 via-blue-500 to-sky-400 p-12 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-sky-300/20 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400/10 rounded-full" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <Image src="/bluecrablogo.png" alt="BlueCrab" width={44} height={44} className="drop-shadow-lg" />
            <span className="text-2xl font-extrabold text-white tracking-tight">BlueCrab</span>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-extrabold text-white leading-tight">
              Share your thoughts,<br />
              <span className="text-sky-200">connect with the world.</span>
            </h2>
            <p className="mt-3 text-blue-100 text-lg leading-relaxed">
              Welcome to a place where you can post and connect in real time.
            </p>
          </div>

          <ul className="space-y-4">
            {[
              { icon: '💬', text: 'Real-time posts and comments' },
              { icon: '🔔', text: 'Live notifications' },
              { icon: '👥', text: 'Friend and follow system' },
              { icon: '🔒', text: 'Secure private messaging' },
            ].map(item => (
              <li key={item.text} className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg shrink-0">
                  {item.icon}
                </span>
                <span className="text-white/90 font-medium">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10">
          <p className="text-blue-200 text-sm">© 2025 BlueCrab · All rights reserved</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-screen bg-white dark:bg-[#030d1a]">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="lg:hidden flex items-center gap-2">
            <Image src="/bluecrablogo.png" alt="BlueCrab" width={32} height={32} />
            <span className="font-extrabold text-slate-900 dark:text-white">
              Blue<span className="text-blue-500">Crab</span>
            </span>
          </div>
          <div className="hidden lg:block" />
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Welcome back 👋
              </h1>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                Sign in and continue where you left off.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl px-4 py-3 text-rose-600 dark:text-rose-400 text-sm">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-[#0e1f35] border border-slate-200 dark:border-[#162033] rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-4 pr-12 py-3.5 bg-slate-50 dark:bg-[#0e1f35] border border-slate-200 dark:border-[#162033] rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-bold rounded-2xl transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-blue-500 font-bold hover:underline">
                  Sign up →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
