import type { Cashier } from '../types'

export const CASHIERS: Cashier[] = [
  {
    id: 'cashier-Bentar',
    name: 'Bentar',
    password: '011223',
    avatar: 'B',
  },
  {
    id: 'cashier-Aufa',
    name: 'Aufa',
    password: '081004',
    avatar: 'A',
  },
]

export function findCashier(name: string, password: string): Cashier | null {
  return (
    CASHIERS.find((c) => c.name === name && c.password === password) ?? null
  )
}
