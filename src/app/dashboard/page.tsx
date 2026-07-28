"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import StatusTracker from "@/components/StatusTracker";
import IntakeFormCard from "@/components/IntakeFormCard";
import { ExternalLinkIcon, InfoIcon } from "@/components/icons";
import { approveOrder, requestRevision, type Order } from "@/lib/orders";
import { TIERS, type Tier } from "@/lib/offer";

const COMPLETION_LINKS: Record<Tier, string> = {
  base: process.env.NEXT_PUBLIC_STRIPE_LINK_COMPLETION_BASE || "#",
  base_plus_portal: process.env.NEXT_PUBLIC_STRIPE_LINK_COMPLETION_PORTAL || "#",
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [showRevisionBox, setShowRevisionBox] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login?redirect=/dashboard");
      return;
    }
    const db = getFirebaseDb();
    // No orderBy here on purpose - a where+orderBy combo needs a Firestore
    // composite index. Sorting the (small) result set client-side avoids that.
    const q = query(collection(db, "orders"), where("clientUid", "==", user.uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);
        orders.sort(
          (a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0)
        );
        setOrder(orders[0] ?? null);
        setOrdersLoading(false);
      },
      (err) => {
        setLoadError(err.message);
        setOrdersLoading(false);
      }
    );
    return unsub;
  }, [loading, user, router]);

  if (loading || ordersLoading) {
    return <div className="mx-auto max-w-2xl px-6 py-16 text-sm text-body">Loading…</div>;
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-sm text-accent-text">
        Couldn&apos;t load your order: {loadError}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-sm text-body">You haven&apos;t placed an order yet.</p>
        <a
          href="/order"
          className="mt-4 inline-block rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white"
        >
          Start your order
        </a>
      </div>
    );
  }

  async function handleApprove() {
    setBusy(true);
    try {
      await approveOrder(order!.id);
    } finally {
      setBusy(false);
    }
  }

  async function handleRequestRevision() {
    if (!revisionNotes.trim()) return;
    setBusy(true);
    try {
      await requestRevision(order!.id, revisionNotes.trim());
      setShowRevisionBox(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="eyebrow mb-2">Your project</p>
      <h1 className="font-serif text-2xl text-headline">{TIERS[order.tier].label}</h1>

      <div className="mt-8 mb-8">
        <StatusTracker status={order.status} />
      </div>

      {order.status === "draft_submitted" && (
        <div className="rounded-[14px] border border-border bg-surface p-6">
          <div className="mb-3.5 flex items-center justify-between">
            <div>
              <p className="text-[15px] font-medium text-headline">
                Your draft is ready
              </p>
              <p className="text-[12px] text-body">
                Take a look, then approve it{" "}
                {!order.revisionUsed && "or use your one included revision"}.
              </p>
            </div>
            <span className="whitespace-nowrap rounded-full bg-accent-tint px-3 py-1.5 text-[11px] font-medium text-accent-text">
              Awaiting your review
            </span>
          </div>
          {order.draftUrl && (
            <a
              href={order.draftUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-background px-3.5 py-2.5 text-[13px] text-headline"
            >
              <ExternalLinkIcon className="h-4 w-4 text-accent-text" />
              View your draft site
            </a>
          )}
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={handleApprove}
              disabled={busy}
              className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-[13px] font-medium text-white disabled:opacity-50"
            >
              Approve draft
            </button>
            {!order.revisionUsed && (
              <button
                type="button"
                onClick={() => setShowRevisionBox((v) => !v)}
                disabled={busy}
                className="flex-1 rounded-lg border border-border bg-surface px-4 py-2.5 text-[13px] font-medium text-headline disabled:opacity-50"
              >
                Request my revision
              </button>
            )}
          </div>
          {showRevisionBox && (
            <div className="mt-3.5 flex flex-col gap-2">
              <textarea
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="Describe the specific changes you'd like"
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-headline outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={handleRequestRevision}
                disabled={busy || !revisionNotes.trim()}
                className="self-start rounded-lg bg-accent px-4 py-2 text-[13px] font-medium text-white disabled:opacity-50"
              >
                Submit revision request
              </button>
            </div>
          )}
          <p className="mt-3.5 flex items-center gap-1.5 text-[11px] text-muted">
            <InfoIcon className="h-3.5 w-3.5" />
            {order.revisionUsed
              ? "You've used your included revision."
              : "You have 1 of 1 revisions remaining."}
          </p>
        </div>
      )}

      {order.status === "revision_requested" && (
        <div className="rounded-[14px] border border-border bg-surface p-6 text-[13px] text-body">
          We&apos;ve received your revision request and we&apos;re working on
          it. We&apos;ll let you know as soon as your updated draft is ready
          to review.
        </div>
      )}

      {order.status === "approved" && (
        <div className="rounded-[14px] border border-border bg-surface p-6">
          <p className="text-[15px] font-medium text-headline">
            Your draft is approved
          </p>
          <p className="mt-1 text-[12px] text-body">
            Pay your final balance to complete delivery and go live.
          </p>
          <div className="mt-4 flex items-center justify-between rounded-lg bg-panel px-4 py-3">
            <span className="text-[13px] text-body">Balance due</span>
            <span className="text-[15px] font-medium text-headline">
              ${TIERS[order.tier].balance}
            </span>
          </div>
          <a
            href={COMPLETION_LINKS[order.tier]}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block rounded-lg bg-accent px-4 py-2.5 text-center text-[13px] font-medium text-white"
          >
            Pay final balance
          </a>
          {COMPLETION_LINKS[order.tier] === "#" && (
            <p className="mt-2 text-center text-[11px] text-muted">
              Dev note: completion Payment Link not configured yet for this
              tier.
            </p>
          )}
        </div>
      )}

      {order.status === "delivered" && (
        <div className="rounded-[14px] border border-border bg-surface p-6">
          <p className="text-[13px] text-body">
            Your project is complete and live.
          </p>
          {order.draftUrl && (
            <a
              href={order.draftUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-background px-3.5 py-2.5 text-[13px] text-headline"
            >
              <ExternalLinkIcon className="h-4 w-4 text-accent-text" />
              View your live site
            </a>
          )}
        </div>
      )}

      {order.status === "order_placed" && <IntakeFormCard orderId={order.id} />}

      {["intake_submitted", "in_progress"].includes(order.status) && (
        <div className="rounded-[14px] border border-border bg-surface p-6 text-[13px] text-body">
          We&apos;re on it — standard delivery is 7 to 10 business days from
          your completed intake form. We&apos;ll notify you here as soon as
          your first draft is ready.
        </div>
      )}
    </div>
  );
}
