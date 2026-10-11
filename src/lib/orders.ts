// Mirrors the backend: public tracking links only resolve for paid orders.
export const PAID_ORDER_STATUSES = ['confirmed', 'processing', 'shipped', 'delivered']

export const isPaidOrder = (status: string) => PAID_ORDER_STATUSES.includes(status)
