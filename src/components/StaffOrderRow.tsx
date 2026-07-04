"use client";

import { useState } from "react";
import { STATUS_STEPS, updateOrderByStaff, type Order, type OrderStatus } from "@/lib/orders";

const ALL_STATUSES: OrderStatus[] = [
  ...STATUS_STEPS.map((s) => s.status),
  "revision_requested",
];

export default function StaffOrderRow({ order }: { order: Order }) {
  const [draftUrl, setDraftUrl] = useState(order.draftUrl ?? "");
  const [busy, setBusy] = useState(false);

  const draftUrlDirty = draftUrl !== (order.draftUrl ?? "");

  async function handleStatusChange(status: OrderStatus) {
    setBusy(true);
    try {
      await updateOrderByStaff(order.id, { status });
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveDraftUrl() {
    setBusy(true);
    try {
      await updateOrderByStaff(order.id, { draftUrl: draftUrl || null });
    } finally {
      setBusy(false);
    }
  }

  async function handleRevisionUsedToggle(checked: boolean) {
    setBusy(true);
    try {
      await updateOrderByStaff(order.id, { revisionUsed: checked });
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr className="border-b border-border align-top">
      <td className="px-3 py-3 text-[13px] text-headline">{order.clientEmail}</td>
      <td className="px-3 py-3 text-[13px] text-body">{order.tier}</td>
      <td className="px-3 py-3">
        <select
          value={order.status}
          onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
          disabled={busy}
          className="rounded-lg border border-border bg-surface px-2 py-1.5 text-[12px] text-headline"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-3">
        <div className="flex gap-1.5">
          <input
            type="url"
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            placeholder="https://…"
            className="w-48 rounded-lg border border-border bg-surface px-2 py-1.5 text-[12px] text-headline outline-none focus:border-accent"
          />
          {draftUrlDirty && (
            <button
              type="button"
              onClick={handleSaveDraftUrl}
              disabled={busy}
              className="rounded-lg bg-accent px-2.5 py-1.5 text-[12px] font-medium text-white disabled:opacity-50"
            >
              Save
            </button>
          )}
        </div>
      </td>
      <td className="px-3 py-3 text-center">
        <input
          type="checkbox"
          checked={order.revisionUsed}
          onChange={(e) => handleRevisionUsedToggle(e.target.checked)}
          disabled={busy}
          className="accent-accent"
        />
      </td>
    </tr>
  );
}
