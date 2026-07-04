import Link from "next/link";
import Checklist from "@/components/Checklist";
import TrustBand from "@/components/TrustBand";
import QuoteStrip from "@/components/QuoteStrip";
import PortfolioCarousel from "@/components/PortfolioCarousel";
import { TIERS } from "@/lib/offer";

const STEPS = [
  { title: "Order placed", description: "Pick your tier and pay your deposit." },
  { title: "Intake submitted", description: "Tell us about your brand and pages." },
  { title: "We build", description: "Your site takes shape, human-reviewed at every step." },
  { title: "Draft review", description: "See your first draft, approve it or request your one revision." },
  { title: "Delivered", description: "Your site goes live on your domain." },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="eyebrow mb-2">The complete build</p>
      <h1 className="max-w-xl font-serif text-4xl leading-tight text-headline">
        Your custom website, built by hand
      </h1>
      <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-body">
        A hand-designed multi-page site around your brand, built with
        AI-assisted development and reviewed by a human at every step.
      </p>

      <div className="mt-6">
        <QuoteStrip />
      </div>

      <div className="mt-8 flex gap-3">
        <Link
          href="/order"
          className="rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white hover:opacity-90"
        >
          Start your order
        </Link>
        <Link
          href="/terms"
          className="rounded-lg border border-border bg-surface px-6 py-3 text-sm font-medium text-headline hover:bg-panel"
        >
          Read the terms
        </Link>
      </div>

      <div className="mt-10">
        <TrustBand />
      </div>

      <section className="mt-16">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.06em] text-headline">
          Recent work
        </p>
        <PortfolioCarousel />
      </section>

      <section className="mt-16">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.06em] text-headline">
          What&apos;s included
        </p>
        <Checklist />
      </section>

      <section className="mt-16">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.06em] text-headline">
          Choose your build
        </p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {(Object.entries(TIERS) as [keyof typeof TIERS, (typeof TIERS)[keyof typeof TIERS]][]).map(
            ([key, tier]) => (
              <div
                key={key}
                className="rounded-[14px] border border-border bg-surface p-6"
              >
                <p className="font-serif text-lg text-headline">{tier.label}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-medium text-headline">
                    ${tier.price}
                  </span>
                  <span className="text-[13px] text-muted line-through">
                    ${tier.listPrice}
                  </span>
                </div>
                <p className="mt-2 text-[13px] text-body">{tier.description}</p>
                <p className="mt-3 text-[12px] text-muted">
                  ${tier.deposit} deposit today, ${tier.balance} at launch
                </p>
                <Link
                  href={`/order?tier=${key}`}
                  className="mt-5 block rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-medium text-white hover:opacity-90"
                >
                  Choose this build
                </Link>
              </div>
            )
          )}
        </div>
      </section>

      <section className="mt-16">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.06em] text-headline">
          How it works
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          {STEPS.map((step, i) => (
            <div key={step.title} className="rounded-xl border border-border bg-surface p-4">
              <p className="text-[11px] text-muted">Step {i + 1}</p>
              <p className="mt-1 text-[13px] font-medium text-headline">{step.title}</p>
              <p className="mt-1 text-[12px] text-body">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
