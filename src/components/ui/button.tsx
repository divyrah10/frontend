'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-300 ease-luxury focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50 disabled:pointer-events-none disabled:opacity-50 btn-press',
  {
    variants: {
      variant: {
        // Primary dark button
        default:
          'bg-noir-900 text-cream-50 hover:bg-noir-800 shadow-md hover:shadow-lg active:shadow-sm',

        // Gold accent button
        primary:
          'bg-gold-500 text-noir-950 hover:bg-gold-400 shadow-md hover:shadow-glow active:shadow-sm',

        // Outline with subtle fill on hover
        outline:
          'border border-noir-200 bg-transparent text-noir-700 hover:bg-noir-50 hover:border-noir-300 hover:text-noir-900',

        // Ghost - minimal
        ghost:
          'bg-transparent text-noir-600 hover:bg-noir-100/50 hover:text-noir-900',

        // Link style
        link:
          'bg-transparent text-gold-600 underline-offset-4 hover:underline hover:text-gold-700 p-0 h-auto',

        // Luxury gold gradient
        luxury:
          'bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 text-noir-950 font-medium shadow-lg hover:shadow-glow-lg hover:from-gold-500 hover:via-gold-400 hover:to-gold-300 active:shadow-md',

        // Dark luxury
        noir:
          'bg-gradient-to-r from-noir-900 via-noir-800 to-noir-900 text-cream-50 shadow-lg hover:shadow-xl border border-noir-700/50',

        // Soft cream
        soft:
          'bg-cream-100 text-noir-700 hover:bg-cream-200 hover:text-noir-900 border border-cream-200',

        // Destructive
        destructive:
          'bg-rose-600 text-white hover:bg-rose-700 shadow-md hover:shadow-lg',

        // Subtle outline with gold accent
        'outline-gold':
          'border border-gold-400/50 bg-transparent text-gold-600 hover:bg-gold-50 hover:border-gold-500 hover:text-gold-700',
      },
      size: {
        default: 'h-11 px-5 py-2.5 text-sm tracking-wide',
        sm: 'h-9 px-4 text-xs tracking-wide',
        lg: 'h-12 px-8 text-sm tracking-wider',
        xl: 'h-14 px-10 text-base tracking-wider',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
      rounded: {
        default: 'rounded-lg',
        full: 'rounded-full',
        none: 'rounded-none',
        sm: 'rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rounded: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, rounded, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, rounded, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
