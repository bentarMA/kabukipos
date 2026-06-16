import type { Cashier } from '../types'

export const CASHIERS: Cashier[] = [
  {
    id: 'cashier-aiko',
    name: 'Aiko Tanaka',
    password: '123456',
    avatar: 'A',
  },
  {
    id: 'cashier-ren',
    name: 'Ren Okada',
    password: '987654',
    avatar: 'R',
  },
]

export function findCashier(name: string, password: string): Cashier | null {
  return (
    CASHIERS.find((c) => c.name === name && c.password === password) ?? null
  )
}
