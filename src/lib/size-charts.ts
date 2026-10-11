export type SizeChart = {
  id: string
  title: string
  styles: string
  rows: [size: string, chest: number, length: number, shoulder: number, sleeve: number, armhole: number][]
}

export const SIZE_CHART_COLUMNS = ['Size', 'Chest', 'Length', 'Shoulder', 'Sleeve', 'Armhole']

export const SIZE_CHARTS: SizeChart[] = [
  {
    id: 'women-crop-tee',
    title: 'Women’s crop tee',
    styles: 'Roma · Milano Crop · Berlin · New York Crop',
    rows: [
      ['XS', 36, 36, 8, 14, 12],
      ['S', 40, 40, 10, 16, 14],
      ['M', 44, 44, 12, 18, 16],
      ['L', 48, 48, 14, 20, 18],
      ['XL', 52, 52, 16, 22, 20],
    ],
  },
  {
    id: 'men-oversized-tee',
    title: 'Men’s oversized tee',
    styles: 'Texas · London · Barcelona · Milano',
    rows: [
      ['S', 52, 66, 15, 20, 18],
      ['M', 54, 68.5, 15, 23, 19.5],
      ['L', 56, 71, 15, 26, 21],
      ['XL', 58, 73.5, 15, 29, 22.5],
    ],
  },
  {
    id: 'men-polo',
    title: 'Men’s polo',
    styles: 'NYC Polo · Paris Polo',
    rows: [
      ['S', 47.6, 60, 13, 18, 15.5],
      ['M', 49.8, 63.5, 14, 20.5, 16],
      ['L', 52, 67, 15, 23, 16.5],
      ['XL', 54.2, 70.5, 16, 25.5, 17],
    ],
  },
]

const CHART_FOR_CATEGORY: Record<string, string> = {
  'women-crop-tees': 'women-crop-tee',
  'men-t-shirts': 'men-oversized-tee',
  'men-polos': 'men-polo',
}

export function sizeGuideHref(categorySlug?: string) {
  const chart = categorySlug && CHART_FOR_CATEGORY[categorySlug]
  return chart ? `/size-guide#${chart}` : '/size-guide'
}
