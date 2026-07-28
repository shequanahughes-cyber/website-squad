"use client";

import { useState } from "react";
import {
  STATUS_STEPS,
  updateOrderByStaff,
  type Order,
  type OrderStatus,
  type IntakeFormData,
} from "@/lib/orders";
import { FileIcon, ExternalLinkIcon } from "@/components/icons";

const ALL_STATUSES: OrderStatus[] = [
  ...STATUS_STEPS.map((s) => s.status),
  "revision_requested",
];

const INTAKE_TEXT_FIELDS: { key: keyof IntakeFormData; label: string }[] = [
  { key: "businessName", label: "Business name" },
  { key: "pagesWanted", label: "Pages wanted" },
  { key: "brandStyle", label: "Brand style" },
  { key: "contentReady", label: "Content ready" },
  { key: "additionalNotes", label: "Additional notes" },
];

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function StaffOrderRow({ order }: { order: Order }) {
  const [draftUrl, setDraftUrl] = useState(order.draftUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const intake = order.intakeFormData;
  const uploadedFiles = intake?.uploadedFiles ?? [];
  const intakeEntries = INTAKE_TEXT_FIELDS.filter((f) => intake?.[f.key]);
  const hasIntakeDetails = intakeEntries.length > 0 || uploadedFiles.length > 0;

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
    <>
    <tr className="border-b border-border align-top">
      <td className="px-3 py-3 text-[13px] text-headline">{order.clientEmail}</td>
      <td className="px-3 py-3 text-[13px] text-body">{order.tier}</td>
      <td className="px-3 py-3">
        {hasIntakeDetails ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="whitespace-nowrap rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12px] font-medium text-headline hover:bg-panel"
          >
            {expanded ? "Hide intake" : "View intake"}
          </button>
        ) : (
          <span className="text-[12px] text-muted">—</span>
        )}
      </td>
      <td className="px-3 py-3 text-center">
        {order.maintenanceRequested && (
          <span className="whitespace-nowrap rounded-full bg-accent-tint px-2.5 py-1 text-[11px] font-medium text-accent-text">
            Wants maintenance
          </span>
        )}
      </td>
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
    {expanded && hasIntakeDetails && (
      <tr className="border-b border-border bg-panel/40">
        <td colSpan={7} className="px-3 py-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {intakeEntries.map((f) => (
              <div key={f.key}>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                  {f.label}
                </p>
                <p className="text-[13px] text-headline">{intake?.[f.key] as string}</p>
              </div>
            ))}
          </div>
          {uploadedFiles.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">
                Files
              </p>
              <div className="flex flex-col gap-1.5">
                {uploadedFiles.map((file) => (
                  <a
                    key={file.url}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-fit items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12px] text-headline hover:bg-panel"
                  >
                    <FileIcon className="h-3.5 w-3.5 text-accent-text" />
                    {file.name}
                    <span className="text-muted">({formatSize(file.size)})</span>
                    <ExternalLinkIcon className="h-3 w-3 text-muted" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </td>
      </tr>
    )}
    </>
  );
}
