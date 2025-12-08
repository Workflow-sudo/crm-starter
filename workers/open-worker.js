addEventListener('fetch', event => {
  event.respondWith(handle(event.request));
});

async function handle(req){
  const url = new URL(req.url);
  const id = url.searchParams.get('id') || null; // email event id or email_id
  const body = {
    event_id: id || crypto.randomUUID(),
    event_type: 'email_open',
    timestamp: Math.floor(Date.now()/1000),
    properties: {
      ip: req.headers.get('cf-connecting-ip') || null,
      ua: req.headers.get('user-agent') || null,
      referer: req.headers.get('referer') || null
    }
  };

  // send to n8n webhook (fast, no waiting)
  const N8N = 'https://YOUR_N8N_WEBHOOK_URL/webhook/email_open';
  fetch(N8N, {method:'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body)});
  // 1x1 transparent PNG (base64)
  const png = atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=');
  return new Response(png, {
    status: 200,
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-cache, no-store, must-revalidate' }
  });
}
