// supabase/functions/send-contact-email/index.ts
// Deploy: supabase functions deploy send-contact-email
// Secrets: supabase secrets set RESEND_API_KEY=re_xxx ADMIN_EMAIL=you@example.com

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message } = await req.json();

    if (!RESEND_API_KEY || !ADMIN_EMAIL) {
      throw new Error('Missing RESEND_API_KEY or ADMIN_EMAIL environment variables');
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Portfolio <onboarding@resend.dev>',
        to: [ADMIN_EMAIL],
        subject: `[Portfolio Contact] ${subject || 'New message'} from ${name}`,
        html: `
          <h2>New Contact Message</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject || '(none)'}</p>
          <hr />
          <p>${message.replace(/\n/g, '<br/>')}</p>
          <hr />
          <p style="color: #999; font-size: 12px;">Reply directly to ${email}</p>
        `,
        reply_to: email,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to send email');
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
