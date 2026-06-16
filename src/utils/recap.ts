import type { DailyRecapSummary, PaymentMethod, Sale } from '../types'
import { PAYMENT_LABELS } from '../types'

export function getSalesForDate(sales: Sale[], date: string): Sale[] {
  return sales.filter((s) => s.createdAt.startsWith(date))
}

export function buildDailyRecap(
  sales: Sale[],
  date: string,
  storeName: string,
): DailyRecapSummary {
  const daySales = getSalesForDate(sales, date)

  const cashierMap = new Map<
    string,
    { cashierName: string; transactions: number; revenue: number; itemsSold: number }
  >()
  const productMap = new Map<string, { quantity: number; revenue: number }>()
  const paymentMap = new Map<PaymentMethod, { total: number; count: number }>()

  let totalDiscount = 0
  let totalTax = 0
  let totalItemsSold = 0

  daySales.forEach((sale) => {
    totalDiscount += sale.discount
    totalTax += sale.tax

    const c = cashierMap.get(sale.cashierId) ?? {
      cashierName: sale.cashierName,
      transactions: 0,
      revenue: 0,
      itemsSold: 0,
    }
    c.transactions += 1
    c.revenue += sale.total
    sale.items.forEach((item) => {
      c.itemsSold += item.quantity
      totalItemsSold += item.quantity

      const p = productMap.get(item.productName) ?? { quantity: 0, revenue: 0 }
      p.quantity += item.quantity
      p.revenue += item.subtotal
      productMap.set(item.productName, p)
    })
    cashierMap.set(sale.cashierId, c)

    const pay = paymentMap.get(sale.paymentMethod) ?? { total: 0, count: 0 }
    pay.total += sale.total
    pay.count += 1
    paymentMap.set(sale.paymentMethod, pay)
  })

  return {
    date,
    storeName,
    totalRevenue: daySales.reduce((s, sale) => s + sale.total, 0),
    totalTransactions: daySales.length,
    totalItemsSold,
    totalDiscount,
    totalTax,
    cashiers: Array.from(cashierMap.entries()).map(([cashierId, stats]) => ({
      cashierId,
      ...stats,
    })),
    topProducts: Array.from(productMap.entries())
      .map(([productName, stats]) => ({ productName, ...stats }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10),
    payments: Array.from(paymentMap.entries()).map(([method, stats]) => ({
      method,
      label: PAYMENT_LABELS[method],
      ...stats,
    })),
  }
}

export function formatRecapDate(date: string): string {
  const d = new Date(date + 'T12:00:00')
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function buildRecapEmailHtml(recap: DailyRecapSummary): string {
  const dateLabel = formatRecapDate(recap.date)
  const fmt = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

  const cashierRows = recap.cashiers
    .map(
      (c) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee">${c.cashierName}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${c.transactions}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${c.itemsSold}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;font-weight:600">${fmt(c.revenue)}</td></tr>`,
    )
    .join('')

  const productRows = recap.topProducts
    .map(
      (p, i) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i + 1}. ${p.productName}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${p.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${fmt(p.revenue)}</td></tr>`,
    )
    .join('')

  const paymentRows = recap.payments
    .map(
      (p) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee">${p.label}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${p.count}x</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${fmt(p.total)}</td></tr>`,
    )
    .join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Inter,Arial,sans-serif;background:#f8f7fc;margin:0;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(124,58,237,0.1)">
    <div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:28px 24px;color:#fff">
      <p style="margin:0;font-size:12px;opacity:0.8;text-transform:uppercase;letter-spacing:1px">Rekap Harian</p>
      <h1 style="margin:8px 0 4px;font-size:22px">${recap.storeName}</h1>
      <p style="margin:0;font-size:14px;opacity:0.9">${dateLabel}</p>
    </div>
    <div style="padding:24px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">
        <div style="background:#f5f3ff;border-radius:12px;padding:16px;text-align:center">
          <p style="margin:0;font-size:12px;color:#6b7280">Total Pendapatan</p>
          <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#7c3aed">${fmt(recap.totalRevenue)}</p>
        </div>
        <div style="background:#f5f3ff;border-radius:12px;padding:16px;text-align:center">
          <p style="margin:0;font-size:12px;color:#6b7280">Transaksi</p>
          <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#7c3aed">${recap.totalTransactions}</p>
        </div>
      </div>
      <h3 style="font-size:14px;color:#374151;margin:0 0 8px">Performa Kasir</h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px">
        <thead><tr style="background:#f9fafb"><th style="padding:8px;text-align:left">Kasir</th><th style="padding:8px">Trx</th><th style="padding:8px">Item</th><th style="padding:8px;text-align:right">Pendapatan</th></tr></thead>
        <tbody>${cashierRows || '<tr><td colspan="4" style="padding:16px;text-align:center;color:#9ca3af">Tidak ada transaksi</td></tr>'}</tbody>
      </table>
      <h3 style="font-size:14px;color:#374151;margin:0 0 8px">Menu Terlaris</h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px">
        <thead><tr style="background:#f9fafb"><th style="padding:8px;text-align:left">Menu</th><th style="padding:8px">Qty</th><th style="padding:8px;text-align:right">Pendapatan</th></tr></thead>
        <tbody>${productRows || '<tr><td colspan="3" style="padding:16px;text-align:center;color:#9ca3af">-</td></tr>'}</tbody>
      </table>
      <h3 style="font-size:14px;color:#374151;margin:0 0 8px">Metode Pembayaran</h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr style="background:#f9fafb"><th style="padding:8px;text-align:left">Metode</th><th style="padding:8px">Jumlah</th><th style="padding:8px;text-align:right">Total</th></tr></thead>
        <tbody>${paymentRows || '<tr><td colspan="3" style="padding:16px;text-align:center;color:#9ca3af">-</td></tr>'}</tbody>
      </table>
    </div>
    <div style="padding:16px 24px;background:#f9fafb;text-align:center;font-size:11px;color:#9ca3af">
      Dikirim otomatis oleh Kabukiro POS · ありがとうございました
    </div>
  </div>
</body>
</html>`
}

export function buildRecapEmailText(recap: DailyRecapSummary): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

  let text = `REKAP HARIAN - ${recap.storeName}\n${formatRecapDate(recap.date)}\n\n`
  text += `Total Pendapatan: ${fmt(recap.totalRevenue)}\n`
  text += `Total Transaksi: ${recap.totalTransactions}\n`
  text += `Total Item Terjual: ${recap.totalItemsSold}\n\n`
  text += `--- PER KASIR ---\n`
  recap.cashiers.forEach((c) => {
    text += `${c.cashierName}: ${c.transactions} trx, ${fmt(c.revenue)}\n`
  })
  text += `\n--- MENU TERLARIS ---\n`
  recap.topProducts.forEach((p, i) => {
    text += `${i + 1}. ${p.productName} (${p.quantity}x) - ${fmt(p.revenue)}\n`
  })
  return text
}
