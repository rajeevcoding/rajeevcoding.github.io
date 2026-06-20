// supabase/functions/send-newsletter/index.ts
// Deploy: supabase functions deploy send-newsletter --no-verify-jwt
// Secrets: supabase secrets set RESEND_API_KEY=re_xxx SB_SECRET_KEY=sb_secret_xxx
// Note: the new sb_secret_... key is not a JWT, so deploy with --no-verify-jwt.
// (The secret name can't start with SUPABASE_ — that prefix is reserved by Supabase.)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
// Secret key (sb_secret_...) — replaces the legacy service_role key. Bypasses RLS.
const SB_SECRET_KEY = Deno.env.get('SB_SECRET_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { subject, content } = await req.json();

    if (!RESEND_API_KEY || !SUPABASE_URL || !SB_SECRET_KEY) {
      throw new Error('Missing environment variables');
    }

    // Use the secret key to bypass RLS and read subscribers
    const supabase = createClient(SUPABASE_URL, SB_SECRET_KEY);

    // Get active subscribers
    const { data: subscribers, error: subError } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('is_active', true);

    if (subError) throw subError;
    if (!subscribers || subscribers.length === 0) {
      throw new Error('No active subscribers');
    }

    // Simple markdown to HTML (basic conversion)
    const htmlContent = content
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>')
      .replace(/^(.+)$/gm, '<p>$1</p>');

    // Create campaign record
    const { data: campaign, error: campError } = await supabase
      .from('newsletter_campaigns')
      .insert({
        subject,
        content,
        status: 'sending',
      })
      .select()
      .single();

    if (campError) throw campError;

    // Send to each subscriber (Resend free tier: send individually)
    let sentCount = 0;
    const errors = [];

    for (const sub of subscribers) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Newsletter <onboarding@resend.dev>',
            to: [sub.email],
            subject,
            html: `
              <div style="max-width: 600px; margin: 0 auto; font-family: sans-serif; color: #333;">
                ${htmlContent}
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                <p style="font-size: 12px; color: #999;">
                  You received this because you subscribed to our newsletter.
                  <a href="${SUPABASE_URL}/functions/v1/unsubscribe?email=${encodeURIComponent(sub.email)}">Unsubscribe</a>
                </p>
              </div>
            `,
          }),
        });

        if (res.ok) {
          sentCount++;
        } else {
          const err = await res.json();
          errors.push({ email: sub.email, error: err.message });
        }
      } catch (e) {
        errors.push({ email: sub.email, error: e.message });
      }

      // Rate limit: small delay between emails
      await new Promise((r) => setTimeout(r, 100));
    }

    // Update campaign status
    await supabase
      .from('newsletter_campaigns')
      .update({
        status: 'sent',
        sent_count: sentCount,
        sent_at: new Date().toISOString(),
      })
      .eq('id', campaign.id);

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, errors: errors.length, details: errors }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
