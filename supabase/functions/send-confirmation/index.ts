import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
    const { record } = await req.json()
    const { email } = record

    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
            from: 'Hills Shop <onboarding@resend.dev>',
            to: email,
            subject: 'Welcome to the Loop!',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ec4899;">Welcome to the Loop!</h1>
          <p>Thank you for subscribing to our newsletter. You're now on the list to receive updates on new arrivals, exclusive offers, and more.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 14px;">© 2026 Hills Shop. Defined by quality. </p>
        </div>
      `,
        }),
    })

    const data = await res.json()

    return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
    })
})
