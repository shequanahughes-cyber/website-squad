"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createOrder, submitIntake } from "@/lib/orders";
import { TIERS, type Tier } from "@/lib/offer";
import { TERMS_VERSION } from "@/lib/terms";
import { syncToGhl } from "@/lib/ghl";

const PENDING_ORDER_KEY = "wds_pending_order";
const ACTIVE_ORDER_KEY = "wds_active_order_id";

const FIELDS: { name: string; label: string; placeholder: string }[] = [
  { name: "businessName", label: "Business name", placeholder: "Acme Co." },
  {
    name: "pagesWanted",
    label: "Pages you want",
    placeholder: "Home, About, Services, Contact",
  },
  {
    name: "brandStyle",
    label: "Brand colors / style notes",
    placeholder: "Colors, fonts, sites you like the look of",
  },
  {
    name: "contentReady",
    label: "Do you have copy and photos ready?",
    placeholder: "Yes, attached / No, I need help writing it",
  },
  {
    name: "additionalNotes",
    label: "Anything else we should know?",
    placeholder: "Optional",
  },
];

export default function IntakeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const tierParam: Tier =
    searchParams.get("tier") === "base_plus_portal" ? "base_plus_portal" : "base";

  const [orderId, setOrderId] = useState<string | null>(null);
  const [creating, setCreating] = useState(true);
  const [formValues, setFormValues] = useState<Record<string, string>>(
    Object.fromEntries(FIELDS.map((f) => [f.name, ""]))
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const redirect = `/order/intake?tier=${tierParam}`;
      router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }
    if (hasStarted.current) return;
    hasStarted.current = true;

    const existing = sessionStorage.getItem(ACTIVE_ORDER_KEY);
    if (existing) {
      Promise.resolve().then(() => {
        setOrderId(existing);
        setCreating(false);
      });
      return;
    }

    const pendingRaw = sessionStorage.getItem(PENDING_ORDER_KEY);
    const pending = pendingRaw ? JSON.parse(pendingRaw) : null;
    const tier: Tier = pending?.tier ?? tierParam;
    const price: number = pending?.price ?? TIERS[tier].price;
    const termsAcceptedAt: string | null = pending?.termsAcceptedAt ?? null;
    const termsVersion: string = pending?.termsVersion ?? TERMS_VERSION;
    const maintenanceRequested: boolean = pending?.wantsMaintenance ?? false;

    createOrder({
      clientUid: user.uid,
      clientEmail: user.email ?? "",
      tier,
      price,
      termsAcceptedAt,
      termsVersion,
      maintenanceRequested,
    })
      .then((id) => {
        sessionStorage.setItem(ACTIVE_ORDER_KEY, id);
        sessionStorage.removeItem(PENDING_ORDER_KEY);
        setOrderId(id);
        syncToGhl({
          clientEmail: user.email ?? "",
          clientName: user.displayName ?? "",
          clientPhone: user.phoneNumber ?? "",
          tier,
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not start your order."))
      .finally(() => setCreating(false));
  }, [loading, user, tierParam, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitIntake(orderId, formValues);
      sessionStorage.removeItem(ACTIVE_ORDER_KEY);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your intake form.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || creating) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-sm text-body">
        Setting up your order…
      </div>
    );
  }

  if (error && !orderId) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-sm text-accent-text">
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <p className="eyebrow mb-2">Order placed</p>
      <h1 className="font-serif text-2xl text-headline">Tell us about your project</h1>
      <p className="mt-2 text-[13px] text-body">
        A few details so we can start building right away.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {FIELDS.map((field) => (
          <div key={field.name}>
            <label className="mb-1 block text-[12px] font-medium text-headline">
              {field.label}
            </label>
            <textarea
              value={formValues[field.name]}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, [field.name]: e.target.value }))
              }
              placeholder={field.placeholder}
              rows={field.name === "businessName" ? 1 : 2}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-headline outline-none focus:border-accent"
            />
          </div>
        ))}
        {error && <p className="text-[12px] text-accent-text">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !orderId}
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          Submit intake form
        </button>
      </form>
    </div>
  );
}
