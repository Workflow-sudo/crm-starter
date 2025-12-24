(() => {
  const ENDPOINT = "https://n8n.skai-lifestyle.com/webhook/event";

  function getVisitorId() {
    let id = localStorage.getItem("visitor_id");
    if (!id) {
      id = "v_" + crypto.randomUUID();
      localStorage.setItem("visitor_id", id);
    }
    return id;
  }

  function sendEvent(payload) {
    payload.visitor_id = getVisitorId();
    payload.timestamp = new Date().toISOString();

    navigator.sendBeacon(
      ENDPOINT,
      JSON.stringify(payload)
    );
  }

  // PAGE VIEW
  const params = new URLSearchParams(location.search);
  sendEvent({
    event: "page_view",
    page_url: location.href,
    referrer: document.referrer || null,
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_content: params.get("utm_content"),
    utm_term: params.get("utm_term")
  });

  // FORM SUBMIT HANDLER
  window.submitLead = function (form) {
    const data = Object.fromEntries(new FormData(form));
    sendEvent({
      event: "form_submit",
      ...data
    });

    window.location.href = "/success.html";
    return false;
  };
})();
