export default {
  async fetch(request, env, ctx) {
    // CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // API Key Strategy: Use env var if available, otherwise fallback to the key provided in instructions
    // Note: The key provided starts with sk_test_, which is a Secret Key. It works for Backend calls.
    const STRIPE_KEY = env.STRIPE_SECRET_KEY || 'sk_test_51SWlJVPpmaMxWLdbbV11gU22FGcs31wR0c7CtNV3NgKSdTW2ofdTMJgWexCC0Pff2jPaFgpOsdROcai6qrq3K95s00GMdBfZJd';

    // ---------------------------------------------------------
    // ROUTE: Create Checkout Session
    // ---------------------------------------------------------
    if (request.method === 'POST' && (url.pathname === '/' || url.pathname === '/create-session')) {
      try {
        const body = await request.json();

        // Construct form-urlencoded body for Stripe API
        const formData = new URLSearchParams();
        formData.append('payment_method_types[]', 'card');
        formData.append('line_items[0][price_data][currency]', 'eur');
        formData.append('line_items[0][price_data][product_data][name]', body.service || 'Dental Service');
        formData.append('line_items[0][price_data][unit_amount]', body.amount.toString());
        formData.append('line_items[0][quantity]', '1');
        formData.append('mode', 'payment');
        formData.append('success_url', body.success_url);
        formData.append('cancel_url', body.cancel_url);

        // Call Stripe API directly via fetch
        const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${STRIPE_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData
        });

        const stripeData = await stripeResponse.json();

        if (!stripeResponse.ok) {
          throw new Error(stripeData.error?.message || 'Failed to create Stripe session');
        }

        // Return both ID (for JS SDK) and URL (for fallback/direct redirect)
        return new Response(JSON.stringify({ id: stripeData.id, url: stripeData.url }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // ---------------------------------------------------------
    // ROUTE: Webhook Placeholder
    // ---------------------------------------------------------
    // ---------------------------------------------------------
    // ROUTE: Webhook Endpoint (Stripe -> Worker -> n8n)
    // ---------------------------------------------------------
    if (request.method === 'POST' && url.pathname.endsWith('/webhook')) {
      try {
        const payload = await request.text();
        const sig = request.headers.get('stripe-signature');

        // In a real app, verify signature here using stripe-node or crypto
        // const event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);

        // For now, parse JSON directly (MVP)
        const event = JSON.parse(payload);

        // -------------------------------------------------------
        // FORWARD TO N8N
        // -------------------------------------------------------
        // Replace this URL with your actual n8n Production Webhook URL
        const N8N_WEBHOOK_URL = env.N8N_WEBHOOK_URL || 'https://n8n.srv1152467.hstgr.cloud/webhook/webhook/stripe';

        // Only forward relevant events to reduce noise
        if (event.type === 'checkout.session.completed') {
          console.log(`Forwarding event ${event.id} to n8n...`);

          // Fire and forget (don't wait for n8n response to reply to Stripe)
          ctx.waitUntil(
            fetch(N8N_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(event)
            }).catch(err => console.error("Failed to forward to n8n:", err))
          );
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
      }
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};