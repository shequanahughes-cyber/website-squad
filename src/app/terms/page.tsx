export const metadata = {
  title: "Terms and conditions — Web Design Squad",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="eyebrow mb-2">Legal</p>
      <h1 className="font-serif text-3xl text-headline">
        Web Design Squad — terms of service
      </h1>

      <div className="mt-8 space-y-6 text-[14px] leading-relaxed text-body">
        <section>
          <h2 className="mb-1 font-medium text-headline">AI-assisted development</h2>
          <p>
            Web Design Squad uses AI tools, including Claude, as part of the
            design and development process. All work is reviewed and
            delivered by a human developer, but you should know AI assistance
            is part of how your project is built.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-medium text-headline">Timeline</h2>
          <p>
            Standard delivery is 7–10 business days, counted from the date
            your completed intake form is received — not from your payment
            date. Delays in responding to follow-up questions extend the
            timeline accordingly.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-medium text-headline">Revisions</h2>
          <p>
            Your project includes one (1) round of revisions on the first
            draft. Additional rounds beyond that are available as a separate
            paid change order.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-medium text-headline">
            Review and approval process
          </h2>
          <p>
            You&apos;ll receive a link to your first draft through your
            client dashboard. From there you can either approve the draft
            (moving your project to final delivery) or request your one
            revision, describing the specific changes you&apos;d like. Once a
            revision is submitted and delivered, the project moves to final
            approval — further changes at that point are treated as a new
            change order.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-medium text-headline">Ownership and delivery</h2>
          <div className="rounded-lg border border-dashed border-accent-text bg-accent-tint p-4 text-[13px] text-accent-text">
            Pending legal review — site file ownership, payment, and hosting
            handoff terms go here before this page is used with real
            customers.
          </div>
        </section>

        <p className="text-[12px] text-muted">
          By checking the box during checkout, you acknowledge you&apos;ve
          read and agree to these terms.
        </p>
      </div>
    </div>
  );
}
