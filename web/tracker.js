// tracker.js — drop on every page before </body>
(function(){
  const SITE = {
    webhook: 'https://YOUR_N8N_WEBHOOK_URL/webhook/tracker', // n8n webhook
    cookieName: 'crm_vid',
    cookieTtlDays: 365
  };

  // UUID v4
  function uuidv4(){ return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c=>{var r=Math.random()*16|0,v=c=='x'?r:(r&0x3|0x8);return v.toString(16);});}

  function readCookie(name){
    const m = document.cookie.match('(^|;)\\s*'+name+'=([^;]*)');
    return m ? decodeURIComponent(m[2]) : null;
  }
  function setCookie(name, value, days){
    const d = new Date(); d.setTime(d.getTime() + (days*24*60*60*1000));
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${d.toUTCString()}; SameSite=Lax`;
  }

  // ensure visitor id
  let vid = readCookie(SITE.cookieName);
  if(!vid){ vid = uuidv4(); setCookie(SITE.cookieName, vid, SITE.cookieTtlDays); }

  // gather small device info
  function deviceInfo(){
    return {
      ua: navigator.userAgent,
      language: navigator.language,
      screen: { w: screen.width, h: screen.height },
      url: location.href,
      referrer: document.referrer || null,
      utm: (function(){
        const u = new URL(location.href);
        const params = {};
        ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'].forEach(k=>{
          if(u.searchParams.get(k)) params[k]=u.searchParams.get(k);
        });
        return params;
      })()
    };
  }

  // send event
  function sendEvent(type, props){
    const evt = {
      event_id: uuidv4(),
      event_type: type,
      timestamp: Math.floor(Date.now()/1000),
      visitor_id: vid,
      contact_id: null,
      properties: Object.assign(deviceInfo(), props || {})
    };
    // prefer navigator.sendBeacon for fire-and-forget
    try{
      const payload = JSON.stringify(evt);
      if(navigator.sendBeacon){
        const blob = new Blob([payload], {type: 'application/json'});
        navigator.sendBeacon(SITE.webhook, blob);
      } else {
        fetch(SITE.webhook, {method:'POST', headers:{'Content-Type':'application/json'}, body:payload, keepalive:true});
      }
    }catch(e){ console.warn('tracker send failed', e); }
  }

  // page view
  sendEvent('page_view', {title: document.title});

  // auto attach hidden visitor_id + utm fields to forms
  function attachToForms(){
    document.querySelectorAll('form').forEach(form=>{
      if(form.dataset.crmInjected) return;
      form.dataset.crmInjected = '1';
      const vidInput = document.createElement('input');
      vidInput.type='hidden'; vidInput.name='visitor_id'; vidInput.value=vid;
      form.appendChild(vidInput);
      // also add UTM fields if present
      const utm = deviceInfo().utm;
      Object.keys(utm).forEach(k=>{
        const i = document.createElement('input');
        i.type='hidden'; i.name=k; i.value=utm[k];
        form.appendChild(i);
      });
      // on submit, send 'form_submit' event (non-blocking)
      form.addEventListener('submit', ()=> {
        const data = {};
        new FormData(form).forEach((v,k)=> data[k]=v);
        sendEvent('form_submit', {form_action: form.action||location.href, form_data: data});
      });
    });
  }
  attachToForms();

  // watch DOM for dynamically injected forms (single mutation observer)
  const mo = new MutationObserver(()=>attachToForms());
  mo.observe(document.body, {childList:true, subtree:true});
})();
