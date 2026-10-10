import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
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

/** Password field with a show/hide toggle. */
const PasswordInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false)
    return (
      <div className="relative">
        <Input ref={ref} type={visible ? 'text' : 'password'} className={cn('pr-11', className)} {...props} />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-noir-400 hover:text-noir-700"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
        </button>
      </div>
    )
  }
)
PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }
