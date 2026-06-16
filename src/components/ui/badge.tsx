import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-1 text-2xs font-medium tracking-wide transition-all duration-300',
  {
    variants: {
      variant: {
        // Primary dark
        default: 'bg-noir-900 text-cream-50 rounded',

        // Secondary muted
        secondary: 'bg-noir-100 text-noir-700 rounded',

        // Success - green
        success: 'bg-emerald-100 text-emerald-700 rounded',

        // Warning - amber
        warning: 'bg-amber-100 text-amber-700 rounded',

        // Danger - rose
        danger: 'bg-rose-100 text-rose-700 rounded',

        // Outline
        outline: 'border border-noir-300 text-noir-600 bg-transparent rounded',

        // Sale - vibrant rose with shine effect
        sale: 'bg-rose-600 text-white rounded badge-shine',

        // Gold luxury
        gold: 'bg-gold-500 text-noir-950 rounded shadow-sm',

        // New arrival
        new: 'bg-noir-900 text-cream-50 rounded tracking-wider',

        // Featured
        featured: 'bg-gradient-to-r from-gold-500 to-gold-400 text-noir-950 rounded shadow-sm',

        // Subtle
        subtle: 'bg-cream-200 text-noir-600 rounded',

        // Info - blue
        info: 'bg-blue-100 text-blue-700 rounded',
      },
      size: {
        default: 'px-2.5 py-1 text-2xs',
        sm: 'px-2 py-0.5 text-2xs',
        lg: 'px-3 py-1.5 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
}

export { Badge, badgeVariants }
