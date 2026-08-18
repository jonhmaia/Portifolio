import { NextRequest, NextResponse } from 'next/server'

const CONTACT_WEBHOOK_URL =
  process.env.WEBHOOK_CONTACT_URL ||
  'https://n8n.maiainteligencia.cloud/webhook/95af1c1e-61a7-486f-a6d7-2d9054beb11e'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { name, email, whatsapp, subject, message, locale } = body

    // Basic validation
    if (!name || !email || !whatsapp || !subject || !message) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios.' },
        { status: 400 }
      )
    }

    const webhookResponse = await fetch(CONTACT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        whatsapp,
        subject,
        message,
        locale: locale || 'pt-BR',
        source: 'portfolio-contact',
        submittedAt: new Date().toISOString(),
      }),
    })

    const responseText = await webhookResponse.text()
    console.log('[Contact API] Webhook status:', webhookResponse.status)
    console.log('[Contact API] Webhook response:', responseText)

    // n8n webhooks may return various status codes, accept any 2xx or even
    // responses that contain valid data regardless of status
    if (webhookResponse.ok) {
      return NextResponse.json({ success: true }, { status: 200 })
    }

    // Some n8n webhook nodes return non-standard codes but still process
    console.error('[Contact API] Webhook responded with status:', webhookResponse.status, responseText)
    return NextResponse.json(
      { error: 'Erro ao processar a solicitação.' },
      { status: 502 }
    )
  } catch (error) {
    console.error('[Contact API] Error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
