"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { createOrder } from "@/lib/orders";
import { TIERS, type Tier } from "@/lib/offer";
import { TERMS_VERSION } from "@/lib/terms";
import { syncToGhl } from "@/lib/ghl";

const PENDING_ORDER_KEY = "wds_pending_order";

// This page's only job is to create the order doc right after checkout (it's
// the only place that has the tier/price/terms info from the just-completed
// Stripe redirect) and then hand off to /dashboard, which owns the actual
// intake form UI for as long as the order sits at "order_placed".
export default function IntakeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const tierParam: Tier =
    searchParams.get("tier") === "base_plus_portal" ? "base_plus_portal" : "base";

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

    (async () => {
      // Guard against creating a duplicate order if this page gets hit twice
      // (back button, double-click on the Stripe return link, etc.) - if the
      // client already has any order, there's nothing new to create here.
      const db = getFirebaseDb();
      const existing = await getDocs(
        query(collection(db, "orders"), where("clientUid", "==", user.uid))
      );
      if (!existing.empty) {
        router.replace("/dashboard");
        return;
      }

      const pendingRaw = sessionStorage.getItem(PENDING_ORDER_KEY);
      const pending = pendingRaw ? JSON.parse(pendingRaw) : null;
      const tier: Tier = pending?.tier ?? tierParam;
      const price: number = pending?.price ?? TIERS[tier].price;
      const termsAcceptedAt: string | null = pending?.termsAcceptedAt ?? null;
      const termsVersion: string = pending?.termsVersion ?? TERMS_VERSION;
      const maintenanceRequested: boolean = pending?.wantsMaintenance ?? false;

      await createOrder({
        clientUid: user.uid,
        clientEmail: user.email ?? "",
        tier,
        price,
        termsAcceptedAt,
        termsVersion,
        maintenanceRequested,
      });
      sessionStorage.removeItem(PENDING_ORDER_KEY);
      syncToGhl({
        clientEmail: user.email ?? "",
        clientName: user.displayName ?? "",
        clientPhone: user.phoneNumber ?? "",
        tier,
      });
      router.replace("/dashboard");
    })().catch((err) =>
      setError(err instanceof Error ? err.message : "Could not start your order.")
    );
  }, [loading, user, tierParam, router]);

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-sm text-accent-text">{error}</div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-16 text-sm text-body">
      Setting up your order…
    </div>
  );
}
