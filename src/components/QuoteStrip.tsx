import { CLIENT_QUOTES } from "@/lib/offer";

export default function QuoteStrip() {
  return (
    <div className="flex flex-wrap gap-3">
      {CLIENT_QUOTES.map((quote) => (
        <span
          key={quote}
          className="rounded-full border border-border bg-surface px-4 py-2 text-[13px] text-headline"
        >
          &ldquo;{quote}&rdquo;
        </span>
      ))}
    </div>
  );
}
