'use client'

import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, Minus, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { inventoryApi } from '@/lib/api'
import { Button } from '@/components/ui/button'

type Item = {
  id: string
  name: string
  sku?: string
  stock_quantity: number
  low_stock_threshold: number
  is_low_stock: boolean
  sizes: string[]
  size_stock: Record<string, number>
}

function SizeStockEditor({ item, onSaved }: { item: Item; onSaved: (item: Item) => void }) {
  const tracked = Object.keys(item.size_stock).length > 0
  const saved = (size: string) => (tracked ? String(item.size_stock[size] ?? 0) : '')
  const [counts, setCounts] = useState<Record<string, string>>(() =>
    Object.fromEntries(item.sizes.map((size) => [size, saved(size)]))
  )
  const [saving, setSaving] = useState(false)
  const dirty = item.sizes.some((size) => counts[size] !== saved(size))
  const total = item.sizes.reduce((sum, size) => sum + (parseInt(counts[size], 10) || 0), 0)

  const save = async () => {
    const sizeStock = Object.fromEntries(item.sizes.map((size) => [size, Math.max(0, parseInt(counts[size], 10) || 0)]))
    setSaving(true)
    try {
      const { data } = await inventoryApi.updateSizeStock(item.id, sizeStock)
      onSaved({ ...item, size_stock: data.size_stock, stock_quantity: data.stock_quantity, is_low_stock: data.stock_quantity <= item.low_stock_threshold })
      toast.success(`${item.name}: stock saved`)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Could not save stock')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      {item.sizes.map((size) => (
        <label key={size} className="flex flex-col items-center gap-1 text-[11px] font-medium tracking-wider text-accent-500">
          {size}
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={counts[size]}
            placeholder="0"
            onChange={(e) => setCounts({ ...counts, [size]: e.target.value })}
            className={`w-14 border px-2 py-1.5 text-center text-sm tabular-nums ${
              tracked && counts[size] === '0' ? 'border-red-200 bg-red-50 text-red-700' : 'border-accent-200'
            }`}
            aria-label={`${item.name} stock for size ${size}`}
          />
        </label>
      ))}
      <div className="flex flex-col items-start gap-1">
        <span className="text-[11px] text-accent-400">Total {total}</span>
        <Button size="sm" onClick={save} disabled={saving || !dirty}>{saving ? 'Saving…' : 'Save sizes'}</Button>
      </div>
      {!tracked && (
        <p className="basis-full text-xs text-amber-700">
          Not tracked per size yet. The site sells from the total ({item.stock_quantity}) until you save these.
        </p>
      )}
    </div>
  )
}

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([])
  const [lowOnly, setLowOnly] = useState(false)
  const load = useCallback(async () => setItems((await inventoryApi.list({ low_stock_only: lowOnly })).data), [lowOnly])
  useEffect(() => { load() }, [load])

  const replace = (next: Item) => setItems((list) => list.map((i) => (i.id === next.id ? next : i)))

  const change = async (item: Item, delta: number) => {
    const value = Math.max(0, item.stock_quantity + delta)
    try {
      await inventoryApi.updateStock(item.id, value)
      replace({ ...item, stock_quantity: value, is_low_stock: value <= item.low_stock_threshold })
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Could not update stock')
    }
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[.2em] text-accent-400 mb-2">Live units</p>
          <h1 className="text-4xl">Inventory</h1>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} /> Low stock only
        </label>
      </div>
      <div className="bg-white border border-accent-100 divide-y divide-accent-100">
        {items.map((item) => (
          <div key={item.id} className="p-4 flex flex-wrap items-center gap-4">
            <div className={`w-10 h-10 shrink-0 flex items-center justify-center ${item.is_low_stock ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-700'}`}>
              {item.is_low_stock ? <AlertTriangle size={17} /> : item.stock_quantity}
            </div>
            <div className="flex-1 min-w-[10rem]">
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-accent-400">{item.sku || 'No SKU'} · alert at {item.low_stock_threshold}</p>
            </div>
            {item.sizes.length > 0 ? (
              <SizeStockEditor key={JSON.stringify(item.size_stock)} item={item} onSaved={replace} />
            ) : (
              <div className="flex items-center border border-accent-200">
                <Button variant="ghost" size="sm" onClick={() => change(item, -1)}><Minus size={14} /></Button>
                <span className="w-12 text-center tabular-nums">{item.stock_quantity}</span>
                <Button variant="ghost" size="sm" onClick={() => change(item, 1)}><Plus size={14} /></Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
