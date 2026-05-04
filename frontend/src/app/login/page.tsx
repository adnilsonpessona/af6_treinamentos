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
    <div className="min-h-screen bg-brand-canvas px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl grid-cols-1 overflow-hidden rounded-lg border border-brand-border bg-brand-surface shadow-card lg:grid-cols-[1.04fr_0.96fr]">
        <section className="navbar relative hidden overflow-hidden lg:flex lg:items-center lg:justify-center lg:p-12">
          <div className="relative flex max-w-md flex-col items-center text-center">
            <div className="rounded-lg border border-white/15 bg-white/10 px-8 py-8">
              <Image src="/af6-logo.svg" alt="AF6" width={220} height={74} className="h-auto w-[220px]" />
              <h1 className="mt-7 text-white">AF6 Treinamentos</h1>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="ui-card w-full max-w-lg p-8 sm:p-10">
            <div className="mb-8">
              <div className="flex flex-col items-start gap-5">
                <Image src="/af6-logo.svg" alt="AF6 Treinamentos" width={170} height={57} className="h-auto w-[170px] lg:hidden" />
                <h1>AF6 Treinamentos</h1>
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
