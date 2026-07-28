"use client";

import { useState } from "react";
import { submitIntake } from "@/lib/orders";
import IntakeFileUpload from "@/components/IntakeFileUpload";

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

export default function IntakeFormCard({ orderId }: { orderId: string }) {
  const [formValues, setFormValues] = useState<Record<string, string>>(
    Object.fromEntries(FIELDS.map((f) => [f.name, ""]))
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await submitIntake(orderId, formValues);
      // No redirect needed - the dashboard's live listener picks up the
      // status change to "intake_submitted" and swaps this card out itself.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your intake form.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-[14px] border border-border bg-surface p-6">
      <p className="text-[15px] font-medium text-headline">Tell us about your project</p>
      <p className="mt-1 text-[12px] text-body">
        A few details so we can start building right away.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
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
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-headline outline-none focus:border-accent"
            />
          </div>
        ))}
        <IntakeFileUpload orderId={orderId} />
        {error && <p className="text-[12px] text-accent-text">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          Submit intake form
        </button>
      </form>
    </div>
  );
}
