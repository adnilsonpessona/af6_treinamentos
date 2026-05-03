'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { ArrowRight, LockKeyhole, Mail } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await api.auth.login(email, password)
      document.cookie = `auth_token=${result.token}; path=/; max-age=28800; SameSite=Lax`
      document.cookie = `auth_role=${result.role}; path=/; max-age=28800; SameSite=Lax`
      document.cookie = `auth_name=${encodeURIComponent(result.fullName)}; path=/; max-age=28800; SameSite=Lax`
      document.cookie = `auth_dept=${encodeURIComponent(result.department ?? '')}; path=/; max-age=28800; SameSite=Lax`
      document.cookie = `auth_company=${encodeURIComponent(result.companyId ?? '')}; path=/; max-age=28800; SameSite=Lax`
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(11,93,132,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(44,102,189,0.16),transparent_28%),linear-gradient(180deg,#edf4fb_0%,#f8fbff_100%)] px-4 py-8 md:px-8 md:py-10">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.46)_0%,transparent_45%)]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl grid-cols-1 overflow-hidden rounded-[34px] border border-white/55 bg-white/55 shadow-[0_28px_90px_rgba(16,31,51,0.16)] backdrop-blur-xl lg:grid-cols-[1.04fr_0.96fr]">
        <section className="relative hidden overflow-hidden bg-[linear-gradient(180deg,#0b1730_0%,#0e1c3f_52%,#13254f_100%)] lg:flex lg:items-center lg:justify-center lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(102,173,255,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(11,93,132,0.22),transparent_28%)]" />
          <div className="relative flex max-w-md flex-col items-center text-center">
            <div className="rounded-[28px] border border-white/10 bg-white/6 px-8 py-8 shadow-[0_22px_54px_rgba(3,9,18,0.28)] backdrop-blur-sm">
              <Image src="/af6-logo.svg" alt="AF6" width={220} height={74} style={{ width: '220px', height: 'auto' }} />
              <h1 className="mt-7 text-[2.3rem] tracking-tighter text-white">AF6 Treinamentos</h1>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="ui-card w-full max-w-lg p-8 sm:p-10">
            <div className="mb-8">
              <div className="flex flex-col items-start gap-5">
                <Image src="/af6-logo.svg" alt="AF6 Treinamentos" width={170} height={57} style={{ width: '170px', height: 'auto' }} className="lg:hidden" />
                <h1 className="text-[2rem] sm:text-[2.35rem]">AF6 Treinamentos</h1>
              </div>
            </div>

            {error && (
              <div role="alert" className="ui-alert ui-alert-error mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="ui-label">E-mail</label>
                <div className="relative">
                  <Mail size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="ui-input ui-input-with-icon"
                    placeholder="voce@empresa.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="ui-label">Senha</label>
                <div className="relative">
                  <LockKeyhole size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="ui-input ui-input-with-icon"
                    placeholder="Digite sua senha"
                    required
                    autoComplete="current-password"
                  />
                </div>
                <p className="ui-helper">Sessão com duração de até 8 horas.</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="ui-button-primary w-full"
              >
                {loading ? 'Entrando...' : 'Entrar agora'}
                {!loading && <ArrowRight size={17} />}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
