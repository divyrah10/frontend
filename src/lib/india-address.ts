'use client'

import { useEffect, useRef, useState } from 'react'

// 28 states and 8 union territories, as Shiprocket and India Post name them.
export const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh',
  'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal',
]

const key = (name: string) => name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z]/g, '')

// Older names the PIN code directory still returns.
const ALIASES: Record<string, string> = {
  andamanandnicobar: 'Andaman and Nicobar Islands',
  pondicherry: 'Puducherry',
  damananddiu: 'Dadra and Nagar Haveli and Daman and Diu',
  dadraandnagarhaveli: 'Dadra and Nagar Haveli and Daman and Diu',
  orissa: 'Odisha',
  uttaranchal: 'Uttarakhand',
  chattisgarh: 'Chhattisgarh',
  newdelhi: 'Delhi',
}

const BY_KEY = Object.fromEntries(INDIAN_STATES.map((state) => [key(state), state]))

/** The official name for a state however it was typed, or the input unchanged if unknown. */
export function normalizeState(name: string) {
  return BY_KEY[key(name)] || ALIASES[key(name)] || name
}

type Place = { city: string; state: string }
const cache = new Map<string, Place | null>()

/** City (district) and state for a 6-digit PIN, from India Post's public directory. */
export async function lookupPincode(pin: string): Promise<Place | null> {
  if (cache.has(pin)) return cache.get(pin)!
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 6000)
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`, { signal: controller.signal })
    const [result] = await response.json()
    const office = result?.Status === 'Success' ? result.PostOffice?.[0] : null
    // The directory still files Leh and Kargil under Jammu and Kashmir.
    const state = office && /^(leh|kargil)/i.test(office.District) ? 'Ladakh' : normalizeState(office?.State || '')
    const place = office ? { city: office.District, state } : null
    cache.set(pin, place)
    return place
  } catch {
    return null // Offline or slow: the shopper types city and state instead.
  } finally {
    clearTimeout(timer)
  }
}

export type PincodeStatus = 'idle' | 'loading' | 'found' | 'not_found'

/** Fills city and state once a full PIN is entered. */
export function usePincodeAutofill(pin: string, onFound: (place: Place) => void): PincodeStatus {
  const [status, setStatus] = useState<PincodeStatus>('idle')
  const latest = useRef(onFound)
  latest.current = onFound

  useEffect(() => {
    if (!/^\d{6}$/.test(pin)) {
      setStatus('idle')
      return
    }
    let cancelled = false
    setStatus('loading')
    lookupPincode(pin).then((place) => {
      if (cancelled) return
      if (place) latest.current(place)
      setStatus(place ? 'found' : 'not_found')
    })
    return () => {
      cancelled = true
    }
  }, [pin])

  return status
}

export const PINCODE_HINTS: Record<PincodeStatus, string> = {
  idle: '',
  loading: 'Finding your city…',
  found: '',
  not_found: "We couldn't find this PIN. Enter your city and state.",
}
