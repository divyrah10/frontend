'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { metaAdsApi } from '@/lib/api'
import { apiErrorMessage, formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Metrics = {
  spend: number
  impressions: number
  reach: number
  clicks: number
  ctr: number
  cpc: number
  purchases: number
  purchase_value: number
  roas: number
  date_start?: string
  campaign_id?: string
  campaign_name?: string
}
type Report = { totals: Metrics; daily: Metrics[]; campaigns: Metrics[] }
type Status = {
  graph_version: string
  pixel_id: string | null
  conversions_api: boolean
  test_mode: boolean
  insights: boolean
  catalog_feed_path: string
}

const presets = [
  { value: 'last_7d', label: 'Last 7 days' },
  { value: 'last_14d', label: 'Last 14 days' },
  { value: 'last_30d', label: 'Last 30 days' },
  { value: 'this_month', label: 'This month' },
]

const number = (value: number) => value.toLocaleString('en-IN')

export default function MetaAdsPage() {
  const [status, setStatus] = useState<Status | null>(null)
  const [preset, setPreset] = useState('last_7d')
  const [report, setReport] = useState<Report | null>(null)
  const [error, setError] = useState('')
  const [testCode, setTestCode] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    metaAdsApi.status().then((res) => setStatus(res.data)).catch(() => setStatus(null))
  }, [])

  useEffect(() => {
    if (!status?.insights) return
    setError('')
    setReport(null)
    metaAdsApi
      .insights(preset)
      .then((res) => setReport(res.data))
      .catch((err) => setError(apiErrorMessage(err, 'Could not load ad performance')))
  }, [preset, status?.insights])

  const sendTestEvent = async () => {
    setSending(true)
    try {
      const res = await metaAdsApi.sendTestEvent(testCode.trim())
      toast.success(`Sent order ${res.data.order_number}; check Test events in Events Manager`)
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Test event failed'))
    } finally {
      setSending(false)
    }
  }

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api\/v1$/, '')
  const maxSpend = Math.max(...(report?.daily.map((d) => d.spend) || []), 1)
  const totals = report?.totals

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[.2em] text-accent-400 mb-2">Facebook &amp; Instagram</p>
          <h1 className="text-4xl">Meta Ads</h1>
        </div>
        <select
          value={preset}
          onChange={(e) => setPreset(e.target.value)}
          className="border border-accent-200 bg-white px-3 py-2 text-sm"
        >
          {presets.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {status && (
        <div className="bg-white border border-accent-100 p-5 mb-6 grid gap-3 sm:grid-cols-2 text-sm">
          <Setting label="Pixel" on={!!status.pixel_id && !!process.env.NEXT_PUBLIC_META_PIXEL_ID} detail={status.pixel_id || 'Set META_PIXEL_ID and NEXT_PUBLIC_META_PIXEL_ID'} />
          <Setting label="Conversions API" on={status.conversions_api} detail={status.test_mode ? 'Test mode: events go to Test events' : status.conversions_api ? 'Sending Purchase events' : 'Set META_CAPI_ACCESS_TOKEN'} />
          <Setting label="Ad performance" on={status.insights} detail={status.insights ? `Graph API ${status.graph_version}` : 'Set META_AD_ACCOUNT_ID and META_ADS_ACCESS_TOKEN'} />
          <div>
            <p className="text-accent-500">Catalog feed URL</p>
            <p className="font-mono text-xs break-all">{apiBase}{status.catalog_feed_path}</p>
          </div>
        </div>
      )}

      {error && <p className="mb-6 text-red-600 text-sm">{error}</p>}

      {totals && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Stat label="Spend" value={formatPrice(totals.spend)} />
          <Stat label="Purchases" value={number(totals.purchases)} sub={formatPrice(totals.purchase_value)} />
          <Stat label="ROAS" value={`${totals.roas.toFixed(2)}×`} />
          <Stat label="Clicks" value={number(totals.clicks)} sub={`${totals.ctr.toFixed(2)}% CTR · ${formatPrice(totals.cpc)} CPC`} />
        </div>
      )}

      {report && report.daily.length > 0 && (
        <div className="bg-noir-950 text-white p-7 mb-6">
          <p className="text-xs uppercase tracking-[.2em] text-white/40 mb-4">Daily spend</p>
          <div className="h-48 flex items-end gap-2">
            {report.daily.map((day) => (
              <div key={day.date_start} className="flex-1 group relative h-full flex items-end">
                <div className="w-full bg-gold-500/80 group-hover:bg-gold-400 transition-colors min-h-px" style={{ height: `${(day.spend / maxSpend) * 100}%` }} />
                <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white text-noir-950 p-2 text-xs whitespace-nowrap">
                  {day.date_start} · {formatPrice(day.spend)} · {day.purchases} purchases
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {report && (
        <div className="bg-white border border-accent-100 mb-6 overflow-x-auto">
          <div className="p-5 border-b border-accent-100"><h2 className="text-2xl">Campaigns</h2></div>
          {report.campaigns.length === 0 && <p className="p-5 text-sm text-accent-500">No campaign delivery in this period.</p>}
          {report.campaigns.map((c) => (
            <div key={c.campaign_id} className="p-5 flex items-center gap-4 border-b last:border-0 border-accent-100 text-sm min-w-[560px]">
              <span className="flex-1">{c.campaign_name}</span>
              <span className="w-28 text-right">{formatPrice(c.spend)}</span>
              <span className="w-24 text-right text-accent-500">{number(c.clicks)} clicks</span>
              <span className="w-24 text-right text-accent-500">{c.purchases} sales</span>
              <span className="w-16 text-right">{c.roas.toFixed(2)}×</span>
            </div>
          ))}
        </div>
      )}

      {status?.conversions_api && (
        <div className="bg-white border border-accent-100 p-5">
          <h2 className="text-xl mb-1">Send a test event</h2>
          <p className="text-sm text-accent-500 mb-4">Resends the latest paid order as a Purchase. Copy the code from Events Manager › Test events.</p>
          <div className="flex gap-3 max-w-md">
            <Input value={testCode} onChange={(e) => setTestCode(e.target.value)} placeholder="TEST12345" />
            <Button onClick={sendTestEvent} disabled={!testCode.trim() || sending}>Send</Button>
          </div>
        </div>
      )}
    </div>
  )
}

function Setting({ label, on, detail }: { label: string; on: boolean; detail: string }) {
  return (
    <div>
      <p className="text-accent-500">{label} <span className={on ? 'text-green-700' : 'text-accent-400'}>· {on ? 'On' : 'Off'}</span></p>
      <p className="text-xs">{detail}</p>
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white border border-accent-100 p-5">
      <p className="text-xs uppercase tracking-[.2em] text-accent-400 mb-2">{label}</p>
      <p className="text-2xl">{value}</p>
      {sub && <p className="text-xs text-accent-500 mt-1">{sub}</p>}
    </div>
  )
}
