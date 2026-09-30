'use client'

import Image from 'next/image'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, Check, Instagram, Loader2 } from 'lucide-react'

import { earlyAccessApi } from '@/lib/api'
import { cloudinaryImage } from '@/lib/media'

type Attribution = {
  session_id: string
  source: string
  medium: string
  campaign: string
  content: string
}

const INSTAGRAM_HANDLE = 'notjustdark'

function getSessionId() {
  const storageKey = 'njd_early_access_session'
  const existing = window.localStorage.getItem(storageKey)
  if (existing) return existing

  const sessionId = window.crypto.randomUUID()
  window.localStorage.setItem(storageKey, sessionId)
  return sessionId
}

export function EarlyAccessClient() {
  const searchParams = useSearchParams()
  const [sessionId, setSessionId] = useState('')
  const [email, setEmail] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [isEntering, setIsEntering] = useState(false)
  const [joined, setJoined] = useState(false)
  const [message, setMessage] = useState('')
  const isPreview = searchParams.get('preview') === '1'

  const attribution = useMemo<Attribution>(() => ({
    session_id: sessionId,
    source: searchParams.get('utm_source') || 'direct',
    medium: searchParams.get('utm_medium') || 'none',
    campaign: searchParams.get('utm_campaign') || 'early_access',
    content: searchParams.get('utm_content') || 'early_access_page',
  }), [searchParams, sessionId])

  useEffect(() => {
    setSessionId(getSessionId())
  }, [])

  useEffect(() => {
    if (!sessionId || isPreview) return

    earlyAccessApi.track({
      ...attribution,
      event_type: 'page_view',
      landing_path: `${window.location.pathname}${window.location.search}`,
    }).catch(() => {
      // Tracking must never block the invitation experience.
    })
  }, [attribution, isPreview, sessionId])

  const handleJoin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email.trim() || !sessionId) return

    setIsJoining(true)
    setMessage('')
    try {
      const response = await earlyAccessApi.join({ ...attribution, email: email.trim() })
      setJoined(true)
      setMessage(response.data.message)
      setEmail('')
    } catch {
      setMessage('We could not save your invitation. Please try again.')
    } finally {
      setIsJoining(false)
    }
  }

  const handleEnter = async () => {
    if (isEntering) return
    setIsEntering(true)

    try {
      if (sessionId && !isPreview) {
        await earlyAccessApi.track({
          ...attribution,
          event_type: 'store_entered',
          landing_path: `${window.location.pathname}${window.location.search}`,
        })
      }
    } catch {
      // Entry remains available if analytics is temporarily unavailable.
    }

    await fetch('/api/early-access/unlock', { method: 'POST' })

    const requestedPath = searchParams.get('return_to')
    const safePath = requestedPath?.startsWith('/') && !requestedPath.startsWith('//')
      ? requestedPath
      : '/'
    window.location.assign(safePath)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-noir-950 text-white">
      <div className="absolute inset-0 lg:left-[46%]">
        <Image
          src={cloudinaryImage('not-just-dark/products/roma-crop-tee-black/01')}
          alt="NOT JUST DARK Roma collection"
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 54vw"
          className="object-cover object-[58%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/10 lg:bg-gradient-to-r lg:from-noir-950 lg:via-noir-950/15 lg:to-transparent" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 py-6 lg:px-12 lg:py-8">
          <Image
            src="/logo-white.png"
            alt="NOT JUST DARK"
            width={84}
            height={52}
            className="h-auto w-[72px]"
            priority
          />
          <a
            href="https://www.instagram.com/notjustdark/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/70 transition-colors hover:text-white"
          >
            <Instagram size={14} strokeWidth={1.4} />
            @{INSTAGRAM_HANDLE}
          </a>
        </header>

        <section className="flex flex-1 items-end px-6 pb-9 pt-24 lg:items-center lg:px-12 lg:pb-12 lg:pt-0">
          <div className="w-full max-w-xl">
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-10 bg-white/45" />
              <p className="text-[9px] font-light uppercase tracking-[0.45em] text-white/70">
                Instagram private preview
              </p>
            </div>

            <h1 className="font-display text-[3.4rem] leading-[0.92] tracking-[-0.035em] sm:text-7xl lg:text-[6.6rem]">
              Before the
              <span className="block italic font-normal">world sees it.</span>
            </h1>

            <p className="mt-6 max-w-md text-sm font-light leading-7 text-white/70 lg:text-base">
              A private invitation from @{INSTAGRAM_HANDLE}. Explore the first NOT JUST DARK
              collection before the public release.
            </p>

            <button
              type="button"
              onClick={handleEnter}
              disabled={isEntering}
              className="group mt-8 inline-flex min-h-12 w-full items-center justify-between border border-white bg-white px-5 text-[10px] uppercase tracking-[0.3em] text-noir-950 transition-colors hover:bg-transparent hover:text-white disabled:cursor-wait sm:w-auto sm:min-w-[290px]"
            >
              <span>{isEntering ? 'Opening the collection' : 'Enter early access'}</span>
              {isEntering ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              )}
            </button>

            <div className="mt-8 border-t border-white/20 pt-6">
              <p className="mb-3 text-[9px] uppercase tracking-[0.34em] text-white/50">
                Prefer an invitation by email?
              </p>
              <form onSubmit={handleJoin} className="flex max-w-md border-b border-white/35">
                <label htmlFor="early-access-email" className="sr-only">Email address</label>
                <input
                  id="early-access-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="EMAIL ADDRESS"
                  autoComplete="email"
                  required
                  className="h-12 min-w-0 flex-1 bg-transparent pr-4 text-xs tracking-[0.12em] text-white outline-none placeholder:text-white/45 placeholder:tracking-[0.25em]"
                />
                <button
                  type="submit"
                  disabled={isJoining}
                  className="flex h-12 w-12 items-center justify-end text-white disabled:cursor-wait"
                  aria-label="Join the early-access list"
                >
                  {isJoining ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                </button>
              </form>

              {message && (
                <p className={`mt-3 flex items-center gap-2 text-xs ${joined ? 'text-white/80' : 'text-red-200'}`}>
                  {joined && <Check size={13} />}
                  {message}
                </p>
              )}
            </div>
          </div>
        </section>

        <footer className="flex items-center justify-between border-t border-white/15 px-6 py-4 text-[8px] uppercase tracking-[0.3em] text-white/45 lg:px-12">
          <span>Private release · 2026</span>
          <span>Designed in Italy · Crafted in India</span>
        </footer>
      </div>
    </main>
  )
}
