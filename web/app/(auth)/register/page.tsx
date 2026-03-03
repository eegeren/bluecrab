'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/api'
import { setToken } from '@/lib/auth'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await auth.register(form.username, form.email, form.password)
      setToken(res.token)
      router.push('/')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  const passStrength = (() => {
    const p = form.password
    if (!p) return 0
    let score = 0
    if (p.length >= 8) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    return score
  })()

  const strengthLabel = ['', 'Weak', 'Medium', 'Good', 'Strong'][passStrength]
  const strengthColor = ['', 'bg-rose-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-400'][passStrength]

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-col justify-between w-[48%] relative bg-gradient-to-br from-blue-600 via-blue-500 to-sky-400 p-12 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-sky-300/20 rounded-full blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <Image src="/bluecrablogo.png" alt="BlueCrab" width={44} height={44} className="drop-shadow-lg" />
            <span className="text-2xl font-extrabold text-white tracking-tight">BlueCrab</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-extrabold text-white leading-tight">
              Join the community,<br />
              <span className="text-sky-200">start posting today.</span>
            </h2>
            <p className="mt-3 text-blue-100 text-lg leading-relaxed">
              Create a free account and jump straight into the conversation.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '10K+', label: 'Active Users' },
              { value: '50K+', label: 'Daily Posts' },
              { value: '100K+', label: 'Total Comments' },
              { value: '99.9%', label: 'Uptime' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur rounded-2xl p-4">
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-blue-200 text-sm mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
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
                Create account ✨
              </h1>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                It only takes a minute to get started.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl px-4 py-3 text-rose-600 dark:text-rose-400 text-sm">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={set('username')}
                  placeholder="username"
                  required
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-[#0e1f35] border border-slate-200 dark:border-[#162033] rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
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
                    value={form.password}
                    onChange={set('password')}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    className="w-full pl-4 pr-14 py-3.5 bg-slate-50 dark:bg-[#0e1f35] border border-slate-200 dark:border-[#162033] rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-700"
                  >
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>
                {form.password && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i <= passStrength ? strengthColor : 'bg-slate-200 dark:bg-[#162033]'
                          }`}
                        />
                      ))}
                    </div>
                    {strengthLabel && (
                      <p className={`text-xs font-medium ${
                        passStrength === 1 ? 'text-rose-500' :
                        passStrength === 2 ? 'text-amber-500' :
                        passStrength === 3 ? 'text-blue-500' : 'text-emerald-500'
                      }`}>
                        Password strength: {strengthLabel}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-bold rounded-2xl transition-all text-sm shadow-lg shadow-blue-500/30"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-500 font-bold hover:underline">
                  Sign in →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
