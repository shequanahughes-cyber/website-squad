// Fire-and-forget: GHL sync failures must never block order creation.
export function syncToGhl(params: {
  clientEmail: string;
  clientName?: string;
  clientPhone?: string;
  tier: string;
}) {
  fetch("/.netlify/functions/sync-ghl", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).catch(() => {
    // Intentionally ignored.
  });
}
