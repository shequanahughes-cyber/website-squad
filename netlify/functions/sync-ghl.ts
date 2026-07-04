import type { Handler } from "@netlify/functions";

type SyncPayload = {
  clientEmail?: string;
  clientName?: string;
  clientPhone?: string;
  tier?: string;
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ success: false, error: "Method not allowed" }) };
  }

  let payload: SyncPayload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ success: false, error: "Invalid JSON body" }) };
  }

  const { clientEmail, clientName, clientPhone, tier } = payload;
  if (!clientEmail) {
    return { statusCode: 400, body: JSON.stringify({ success: false, error: "clientEmail is required" }) };
  }

  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!apiKey || !locationId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: "GHL_API_KEY or GHL_LOCATION_ID not configured" }),
    };
  }

  try {
    const res = await fetch("https://services.leadconnectorhq.com/contacts/upsert", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Version: "2021-07-28",
      },
      body: JSON.stringify({
        locationId,
        email: clientEmail,
        name: clientName || undefined,
        phone: clientPhone || undefined,
        tags: ["web-design-squad", tier].filter(Boolean),
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { statusCode: res.status, body: JSON.stringify({ success: false, error: data }) };
    }
    return { statusCode: 200, body: JSON.stringify({ success: true, data }) };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error calling GHL",
      }),
    };
  }
};
