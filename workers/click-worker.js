addEventListener('fetch', event => {
  event.respondWith(handle(event.request));
});
async function handle(req){
  const url = new URL(req.url);
  const id = url.searchParams.get('id') || null;
  const to = url.searchParams.get('to') || '/';
  const payload = {
    event_id: id || crypto.randomUUID(),
    event_type: 'email_click',
    timestamp: Math.floor(Date.now()/1000),
    properties: {
      dest: to,
      ua: req.headers.get('user-agent'),
      ip: req.headers.get('cf-connecting-ip')
    }
  };
  // async fire-and-forget to n8n
  fetch('https://YOUR_N8N_WEBHOOK_URL/webhook/email_click', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)});
  // redirect user immediately
  return Response.redirect(decodeURIComponent(to), 302);
}
