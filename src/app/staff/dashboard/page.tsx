"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import StaffOrderRow from "@/components/StaffOrderRow";
import type { Order } from "@/lib/orders";

export default function StaffDashboardPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login?redirect=/staff/dashboard");
      return;
    }
    if (profile && profile.role !== "staff") {
      router.replace("/dashboard");
      return;
    }
    if (profile?.role !== "staff") return;

    const db = getFirebaseDb();
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order));
        setOrdersLoading(false);
      },
      (err) => {
        setLoadError(err.message);
        setOrdersLoading(false);
      }
    );
    return unsub;
  }, [loading, user, profile, router]);

  if (loading || !profile || profile.role !== "staff" || ordersLoading) {
    return <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-body">Loading…</div>;
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-accent-text">
        Couldn&apos;t load orders: {loadError}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="eyebrow mb-2">Staff</p>
      <h1 className="font-serif text-2xl text-headline">All orders</h1>

      <div className="mt-6 overflow-x-auto rounded-[14px] border border-border bg-surface">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted">
              <th className="px-3 py-3 font-medium">Client</th>
              <th className="px-3 py-3 font-medium">Tier</th>
              <th className="px-3 py-3 font-medium">Maintenance</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Draft URL</th>
              <th className="px-3 py-3 font-medium">Revision used</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-[13px] text-muted">
                  No orders yet.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <StaffOrderRow key={order.id} order={order} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
