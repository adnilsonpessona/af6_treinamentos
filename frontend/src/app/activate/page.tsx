'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import PageHeader from '@/components/PageHeader'

function ActivateForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError('As senhas não coincidem.'); return }
    if (password.length < 8) { setError('A senha deve ter no mínimo 8 caracteres.'); return }
    setLoading(true)
    try {
      await api.auth.activate({ token, password, confirmPassword })
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="ui-card text-center">
      <div className="ui-badge ui-badge-success mx-auto w-fit">Acesso liberado</div>
      <p className="mt-4 text-xl font-semibold text-brand-success">Conta ativada com sucesso!</p>
      <p className="mt-2 text-sm text-brand-text-muted">Redirecionando para o login...</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PageHeader
        eyebrow="Primeiro acesso"
        title="Ativar conta"
        description="Defina sua senha para concluir o acesso à plataforma e entrar no ambiente de treinamentos."
        className="mb-0 max-w-none"
      />
      {error && <div className="ui-alert ui-alert-error">{error}</div>}
      <div>
        <label htmlFor="new-password" className="ui-label">Nova senha</label>
        <input id="new-password" name="new-password" type="password" value={password} onChange={e => setPassword(e.target.value)}
          className="ui-input w-full"
          required minLength={8} autoComplete="new-password" />
      </div>
      <div>
        <label htmlFor="confirm-password" className="ui-label">Confirmar senha</label>
        <input id="confirm-password" name="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
          className="ui-input w-full"
          required minLength={8} autoComplete="new-password" />
      </div>
      <button type="submit" disabled={loading || !token}
        className="ui-button-primary w-full justify-center disabled:opacity-60">
        {loading ? 'Ativando...' : 'Ativar conta'}
      </button>
    </form>
  )
}

export default function ActivatePage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(140deg,rgba(20,90,114,0.1),rgba(245,242,235,0.96)_45%,rgba(164,104,22,0.12))] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full gap-6 rounded-4xl border border-white/60 bg-white/90 p-4 shadow-[0_32px_80px_rgba(23,33,38,0.16)] backdrop-blur md:grid-cols-[1.15fr_0.85fr] md:p-6">
          <section className="hidden rounded-[28px] bg-[linear-gradient(155deg,rgba(20,90,114,0.98),rgba(12,47,60,0.94)_58%,rgba(164,104,22,0.7))] p-8 text-white md:flex md:flex-col md:justify-between">
            <div>
              <div className="ui-badge ui-badge-neutral w-fit border-white/15 bg-white/10 text-white">Treinamentos corporativos</div>
              <h1 className="mt-6 font-reading text-4xl leading-tight">Seu acesso começa com uma senha segura e um ambiente pronto para aprender.</h1>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/78">
                Ative sua conta para acessar cursos, acompanhar progresso e interagir com a jornada de desenvolvimento da empresa.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/12 bg-white/10 p-4">
                <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-white/64">Acesso rápido</p>
                <p className="mt-3 text-2xl font-semibold">1 etapa</p>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/10 p-4">
                <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-white/64">Segurança</p>
                <p className="mt-3 text-2xl font-semibold">Senha pessoal</p>
              </div>
            </div>
          </section>
          <section className="ui-card flex items-center p-6 sm:p-8">
            <div className="w-full">
              <Suspense fallback={<p className="text-sm text-brand-text-muted">Carregando...</p>}>
          <ActivateForm />
        </Suspense>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
