import type { DailyRecapSummary } from '../types'
import { buildRecapEmailHtml, buildRecapEmailText } from './recap'

export interface SendRecapResult {
  ok: boolean
  message: string
  demo?: boolean
}

export async function sendRecapEmail(
  recap: DailyRecapSummary,
  toEmail: string,
): Promise<SendRecapResult> {
  if (!toEmail || !toEmail.includes('@')) {
    return { ok: false, message: 'Email tujuan belum dikonfigurasi di Pengaturan.' }
  }

  try {
    const res = await fetch('/api/send-recap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: toEmail,
        subject: `Rekap Harian ${recap.storeName} — ${recap.date}`,
        html: buildRecapEmailHtml(recap),
        text: buildRecapEmailText(recap),
        recap,
      }),
    })

    const data = (await res.json()) as SendRecapResult & { error?: string }

    if (!res.ok) {
      return { ok: false, message: data.message || data.error || 'Gagal mengirim email.' }
    }

    return data
  } catch {
    return {
      ok: false,
      message:
        'Tidak dapat terhubung ke server email. Pastikan aplikasi sudah di-deploy di Vercel dengan RESEND_API_KEY.',
    }
  }
}
