import type { VercelRequest, VercelResponse } from '@vercel/node'

interface RecapPayload {
  to: string
  subject: string
  html: string
  text: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' })
  }

  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Kabukiro POS <onboarding@resend.dev>'

  const body = req.body as RecapPayload
  const { to, subject, html, text } = body

  if (!to || !subject || !html) {
    return res.status(400).json({ ok: false, message: 'Data email tidak lengkap.' })
  }

  if (!apiKey) {
    return res.status(503).json({
      ok: false,
      message:
        'RESEND_API_KEY belum dikonfigurasi. Tambahkan di Environment Variables Vercel.',
    })
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject,
        html,
        text,
      }),
    })

    const data = (await response.json()) as { id?: string; message?: string }

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        message: data.message || 'Gagal mengirim email via Resend.',
      })
    }

    return res.status(200).json({
      ok: true,
      message: `Rekap berhasil dikirim ke ${to}`,
      id: data.id,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ ok: false, message: `Error server: ${message}` })
  }
}
