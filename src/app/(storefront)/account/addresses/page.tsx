'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapPin, Plus, Star, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { addressesApi } from '@/lib/api'
import { Address } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const emptyAddress = { type: 'shipping', full_name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: 'India', is_default: false }

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [form, setForm] = useState(emptyAddress)
  const [showForm, setShowForm] = useState(false)

  const load = async () => setAddresses((await addressesApi.list()).data)
  useEffect(() => { load().catch(() => toast.error('Could not load addresses')) }, [])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      await addressesApi.create(form)
      setForm(emptyAddress)
      setShowForm(false)
      await load()
      toast.success('Address saved')
    } catch (error: any) { toast.error(error.response?.data?.detail || 'Could not save address') }
  }

  const remove = async (id: string) => {
    if (!confirm('Remove this address?')) return
    await addressesApi.delete(id); await load(); toast.success('Address removed')
  }

  const makeDefault = async (id: string) => { await addressesApi.setDefault(id); await load() }

  return (
    <div className="min-h-screen bg-cream-50 pt-28 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <p className="text-luxury-caps text-noir-400 mb-4">Delivery book</p>
        <div className="flex items-end justify-between mb-10"><h1 className="font-display text-5xl lg:text-7xl">Addresses</h1><Link href="/account" className="link-editorial text-sm">Back to account</Link></div>
        <div className="grid md:grid-cols-2 gap-5">
          {addresses.map(address => (
            <article key={address.id} className="relative bg-white border border-noir-950/10 p-7 hover-lift">
              {address.is_default && <span className="absolute top-5 right-5 text-[10px] tracking-[.2em] uppercase text-gold-700">Default</span>}
              <MapPin size={20} className="mb-6" />
              <h2 className="text-2xl mb-3">{address.full_name}</h2>
              <p className="text-sm text-noir-500">{address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ''}<br />{address.city}, {address.state} {address.postal_code}<br />{address.country}</p>
              <div className="flex gap-4 mt-6">
                {!address.is_default && <button className="text-xs uppercase tracking-wider" onClick={() => makeDefault(address.id)}><Star size={13} className="inline mr-1" />Make default</button>}
                <button className="text-xs uppercase tracking-wider text-red-600" onClick={() => remove(address.id)}><Trash2 size={13} className="inline mr-1" />Remove</button>
              </div>
            </article>
          ))}
          <button onClick={() => setShowForm(!showForm)} className="min-h-56 border border-dashed border-noir-950/25 flex flex-col items-center justify-center gap-3 hover:bg-white transition-colors"><Plus /><span className="text-luxury-caps">Add an address</span></button>
        </div>
        {showForm && (
          <form onSubmit={submit} className="mt-8 bg-noir-950 text-white p-7 lg:p-10 animate-fade-in-up">
            <h2 className="text-3xl mb-7">New destination</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {(['full_name','phone','address_line1','address_line2','city','state','postal_code','country'] as const).map(key => <Input key={key} required={!['phone','address_line2'].includes(key)} placeholder={key.replaceAll('_',' ')} value={String(form[key])} onChange={e => setForm({...form,[key]:e.target.value})} className="bg-white text-noir-950" />)}
            </div>
            <div className="mt-6 flex gap-3"><Button type="submit">Save address</Button><Button type="button" variant="ghost" className="text-white" onClick={() => setShowForm(false)}>Cancel</Button></div>
          </form>
        )}
      </div>
    </div>
  )
}
