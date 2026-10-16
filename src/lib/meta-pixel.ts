// Meta Pixel helpers. Content ids must match the backend catalog feed and
// Conversions API: "<sku or product id>" or "<sku or product id>-<size>".

declare global {
  interface Window {
    fbq?: (...args: any[]) => void
  }
}

export const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || ''

type Item = { product_id: string; sku?: string | null; size?: string | null; quantity: number; price: number }

export function contentId(productId: string, sku?: string | null, size?: string | null) {
  const group = sku || productId
  return size ? `${group}-${size}` : group
}

function contentData(items: Item[]) {
  const contents = items.map((item) => ({
    id: contentId(item.product_id, item.sku, item.size),
    quantity: item.quantity,
    item_price: item.price,
  }))
  return {
    content_type: 'product',
    content_ids: contents.map((c) => c.id),
    contents,
    num_items: items.reduce((sum, item) => sum + item.quantity, 0),
    value: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    currency: 'INR',
  }
}

export function track(event: string, params: Record<string, any> = {}, eventId?: string) {
  if (!metaPixelId || typeof window === 'undefined' || !window.fbq) return
  window.fbq('track', event, params, eventId ? { eventID: eventId } : undefined)
}

export const trackViewContent = (product: { id: string; sku?: string; name: string; price: number }) =>
  track('ViewContent', {
    content_type: 'product_group',
    content_ids: [contentId(product.id, product.sku)],
    content_name: product.name,
    value: Number(product.price),
    currency: 'INR',
  })

export const trackAddToCart = (item: Item) => track('AddToCart', contentData([item]))

export const trackInitiateCheckout = (items: Item[]) => track('InitiateCheckout', contentData(items))

// eventId is the order number, which the backend also sends, so Meta counts the purchase once.
export const trackPurchase = (orderNumber: string, items: Item[], total: number) =>
  track('Purchase', { ...contentData(items), value: total, order_id: orderNumber }, orderNumber)

function cookie(name: string) {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : undefined
}

// Browser ids for the Conversions API, which runs on a different domain and can't read these cookies.
export function metaBrowserIds() {
  if (!metaPixelId) return {}
  return { fbp: cookie('_fbp'), fbc: cookie('_fbc'), event_source_url: window.location.href }
}
