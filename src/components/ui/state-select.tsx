import * as React from 'react'
import { cn } from '@/lib/utils'
import { INDIAN_STATES } from '@/lib/india-address'

export interface StateSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value'> {
  value: string
}

/** Indian states and union territories; keeps an older free-text value selectable. */
export function StateSelect({ value, className, ...props }: StateSelectProps) {
  const states = value && !INDIAN_STATES.includes(value) ? [value, ...INDIAN_STATES] : INDIAN_STATES
  return (
    <select
      value={value}
      className={cn(
        'flex h-11 w-full px-4 py-2.5 text-sm text-noir-900 bg-white rounded-lg border border-noir-200',
        'transition-all duration-300 ease-luxury focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20',
        !value && 'text-noir-400',
        className
      )}
      {...props}
    >
      <option value="" disabled>
        State
      </option>
      {states.map((state) => (
        <option key={state} value={state} className="text-noir-900">
          {state}
        </option>
      ))}
    </select>
  )
}
