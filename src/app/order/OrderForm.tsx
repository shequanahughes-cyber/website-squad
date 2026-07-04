"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Checklist from "@/components/Checklist";
import { ClockIcon } from "@/components/icons";
import { PORTAL_ADD_ON, BRANDING_ADD_ON, TIERS, type Tier } from "@/lib/offer";
import { TERMS_VERSION } from "@/lib/terms";

const PAYMENT_LINKS: Record<Tier, string> = {
  base: process.env.NEXT_PUBLIC_STRIPE_LINK_BASE || "#",
  base_plus_portal: process.env.NEXT_PUBLIC_STRIPE_LINK_PORTAL || "#",
};

export default function OrderForm() {
  const searchParams = useSearchParams();
  const initialTier =
    searchParams.get("tier") === "base_plus_portal" ? "base_plus_portal" : "base";
  const [tier, setTier] = useState<Tier>(initialTier);
  const [agreed, setAgreed] = useState(false);

  const selected = TIERS[tier];
  const paymentLinkConfigured = PAYMENT_LINKS[tier] !== "#";

  function handleCheckout() {
    if (!agreed) return;
    sessionStorage.setItem(
      "wds_pending_order",
      JSON.stringify({
        tier,
        price: selected.price,
        termsAcceptedAt: new Date().toISOString(),
        termsVersion: TERMS_VERSION,
      })
    );
    window.location.href = PAYMENT_LINKS[tier];
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.6fr_1fr]">
        {/* Left column */}
        <div>
          <p className="eyebrow mb-2">{selected.label}</p>
          <h1 className="max-w-xl font-serif text-3xl leading-snug text-headline">
            Your custom website, built by hand
          </h1>
          <p className="mt-3 max-w-md text-[14px] leading-relaxed text-body">
            A hand-designed multi-page site around your brand, built with
            AI-assisted development and reviewed by a human at every step.
          </p>

          <p className="mt-8 mb-4 text-[11px] font-medium uppercase tracking-[0.06em] text-headline">
            What&apos;s included
          </p>
          <Checklist />

          <p className="mt-8 mb-4 text-[11px] font-medium uppercase tracking-[0.06em] text-headline">
            Add to your build
          </p>
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() =>
                setTier(tier === "base_plus_portal" ? "base" : "base_plus_portal")
              }
              className={`flex items-center justify-between rounded-[10px] border px-4 py-3 text-left transition-colors ${
                tier === "base_plus_portal"
                  ? "border-accent bg-accent-tint"
                  : "border-border bg-surface"
              }`}
            >
              <div>
                <p className="text-[13px] font-medium text-headline">
                  {PORTAL_ADD_ON.title}
                </p>
                <p className="text-[12px] text-body">{PORTAL_ADD_ON.description}</p>
              </div>
              <span className="text-[13px] font-medium text-headline">
                {tier === "base_plus_portal" ? "Added" : `+$${PORTAL_ADD_ON.price}`}
              </span>
            </button>
            <div className="flex items-center justify-between rounded-[10px] border border-border bg-surface px-4 py-3">
              <div>
                <p className="text-[13px] font-medium text-headline">
                  {BRANDING_ADD_ON.title}
                </p>
                <p className="text-[12px] text-body">{BRANDING_ADD_ON.description}</p>
              </div>
              <span className="text-[13px] font-medium text-headline">
                +${BRANDING_ADD_ON.price}
              </span>
            </div>
            <p className="text-[11px] text-muted">
              Want the branding kit too? Mention it on your intake form and
              we&apos;ll follow up with a combined quote.
            </p>
          </div>
        </div>

        {/* Right column: sticky pricing card */}
        <div className="sticky top-6 overflow-hidden rounded-[14px] border border-border bg-surface">
          <div className="bg-panel px-5 py-4">
            <p className="font-serif text-[17px] text-headline">{selected.label}</p>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-medium text-headline">
                ${selected.price}
              </span>
              <span className="text-[13px] text-muted line-through">
                ${selected.listPrice}
              </span>
            </div>
            <p className="mt-1.5 text-[12px] text-body">One-time build</p>
          </div>
          <div className="px-5 py-4">
            <div className="flex justify-between border-b border-border py-2 text-[13px] text-body">
              <span>Deposit today</span>
              <span className="font-medium text-headline">${selected.deposit}</span>
            </div>
            <div className="flex justify-between border-b border-border py-2 text-[13px] text-body">
              <span>Balance at launch</span>
              <span className="font-medium text-headline">${selected.balance}</span>
            </div>
            <div className="flex items-center gap-1.5 py-3 text-[12px] text-body">
              <ClockIcon className="h-3.5 w-3.5" />
              Delivery in 7 to 10 business days
            </div>
            <label className="flex cursor-pointer items-start gap-2 text-[12px] text-body">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 accent-accent"
              />
              <span>
                I agree to the{" "}
                <a href="/terms" target="_blank" className="text-accent-text">
                  terms and conditions
                </a>
                , including AI-assisted development and one included revision.
              </span>
            </label>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={!agreed}
              className="mt-4 w-full rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Accept and pay deposit
            </button>
            {!paymentLinkConfigured && (
              <p className="mt-2 text-center text-[11px] text-muted">
                Dev note: Stripe Payment Link not configured yet for this
                tier (set NEXT_PUBLIC_STRIPE_LINK_
                {tier === "base" ? "BASE" : "PORTAL"} in .env.local).
              </p>
            )}
            <p className="mt-3 text-center text-[11px] text-muted">
              Secure payment via Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
