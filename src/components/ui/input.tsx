import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'filled' | 'underline'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'border border-noir-200 bg-white rounded-lg focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20',
      filled: 'border-0 bg-cream-100 rounded-lg focus:bg-cream-50 focus:ring-2 focus:ring-gold-500/20',
      underline: 'border-0 border-b-2 border-noir-200 rounded-none bg-transparent focus:border-gold-500 focus:ring-0',
    }

    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full px-4 py-2.5 text-sm text-noir-900 transition-all duration-300 ease-luxury',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-noir-400',
          'focus:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-noir-50',
          variants[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
