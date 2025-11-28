export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const payload = await request.text();
        const event = JSON.parse(payload);

        // Forward to n8n
        // Use env var from Pages Settings, fallback to hardcoded for demo
        const N8N_WEBHOOK_URL = env.N8N_WEBHOOK_URL || 'https://n8n.srv1152467.hstgr.cloud/webhook/stripe-confirmation-webhook';

        if (event.type === 'checkout.session.completed') {
            // Fire and forget forwarding
            context.waitUntil(
                fetch(N8N_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(event)
                }).catch(err => console.error("Failed to forward to n8n:", err))
            );
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }
}
