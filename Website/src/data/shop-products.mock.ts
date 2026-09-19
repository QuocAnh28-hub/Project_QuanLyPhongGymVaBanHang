export type Product = {
  id: number
  sku: string
  upc: string
  name: string
  image: string
  category: string
  brand: string
  price: number
  cost: number
  margin: number
  stocks: { q1: number; q7: number; thaoDien: number; hanoi: number }
  enabled: boolean
  soldThisMonth: number
  stockStatus: 'ok' | 'low' | 'out'
  exclusive: boolean
}
const names = [
  'Rule 1 Whey Protein Isolate 5lbs',
  'ON Gold Standard Whey 5lbs',
  'Xtend Original BCAA 90 Servings',
  'MyProtein Creatine 500g',
  'C4 Original Pre-Workout',
  'QA Active Dry-Tech Tee',
  'SBD Lever Belt 13mm',
  'Protein Bar Chocolate Box',
]
const cats = [
    'supplements',
    'supplements',
    'recovery',
    'energy',
    'energy',
    'apparel',
    'accessories',
    'drinks',
  ],
  brands = [
    'Rule 1',
    'Optimum Nutrition',
    'Scivation',
    'MyProtein',
    'Cellucor',
    'QA Active',
    'SBD',
    'QA Nutrition',
  ]
export const shopProducts: Product[] = Array.from({ length: 24 }, (_, i) => {
  const n = i % 8,
    total = (i * 7) % 43,
    status = total === 0 ? 'out' : total < 8 ? 'low' : 'ok'
  return {
    id: i + 1,
    sku: `QA-${String(i + 1).padStart(4, '0')}`,
    upc: `893520${String(199000 + i).padStart(6, '0')}`,
    name: `${names[n]}${i > 7 ? ` · ${Math.floor(i / 8) + 1}` : ''}`,
    image: '▣',
    category: cats[n],
    brand: brands[n],
    price: 450000 + n * 175000,
    cost: 280000 + n * 110000,
    margin: 32 + n * 2,
    stocks: {
      q1: Math.floor(total * 0.4),
      q7: Math.floor(total * 0.25),
      thaoDien: Math.floor(total * 0.2),
      hanoi: Math.ceil(total * 0.15),
    },
    enabled: i % 9 !== 0,
    soldThisMonth: 18 + ((i * 13) % 230),
    stockStatus: status,
    exclusive: cats[n] === 'apparel',
  }
})
