# Web Design Squad — Storefront & Order Tracking App
Project Brief for Claude Code build

---

## 1. What this app is

A single Next.js + Firebase app with two zones:

- **Public storefront** — offer page, pricing tiers, terms & conditions, order flow, intake form.
- **Authenticated dashboard** — client view (order status, draft review, approve/request revision) and staff/admin view (all orders, status controls, upload draft links).

This is NOT a multi-vendor marketplace. It's a single-service ordering + fulfillment tracker for Web Design Squad, styled like a simplified Fiverr order flow.

---

## 2. Stack (matches existing SOP)

- Next.js (App Router) + Tailwind CSS
- Firebase Authentication (Email/Password + Google) + Firestore
- Netlify hosting, auto-deploy from GitHub main
- Apply all known gotchas from the `client-site-build` skill (Netlify secrets scanner, env vars, SSR guard, COOP header, composite indexes, field-name consistency)

**Payment (new decision for this build):** default to **Stripe Payment Links** — one link per tier ($500 Base, $750 Base+Portal). No card data touches your app or your database. If you'd rather use GHL's built-in checkout instead of Stripe, swap this in; the rest of the flow doesn't change.

---

## 3. Order status lifecycle

Single `status` field drives everything the client and staff see:

1. `order_placed` — payment confirmed
2. `intake_submitted` — client completed intake form
3. `in_progress` — build underway
4. `draft_submitted` — first draft live, awaiting client review
5. `revision_requested` — client used their one included revision
6. `approved` — client approved the draft
7. `delivered` — final site/portal live, project closed

Only one revision round is included. Once `revision_requested` has been used once, the UI should show "Revision used" instead of offering the button again — additional rounds require a manual off-app conversation (upsell/change order), not a button in the app.

---

## 4. Data model (Firestore)

**`orders/{orderId}`**
```
clientUid: string
clientEmail: string
tier: "base" | "base_plus_portal"
price: number
status: one of the 7 states above
termsAcceptedAt: timestamp
termsVersion: string        // bump this if T&Cs change
intakeFormData: object      // or a link if using external Google Form
draftUrl: string | null
revisionUsed: boolean
revisionNotes: string | null   // client's one revision request, in their own words
approvedAt: timestamp | null
deliveredAt: timestamp | null
createdAt: timestamp
updatedAt: timestamp
```

**`users/{uid}`**
```
role: "client" | "staff"
email: string
orderIds: array of order references
```

Staff accounts continue to be created manually by editing this field in the Firestore console, consistent with current practice.

---

## 5. Pages / routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Storefront: offer, tiers, how it works, FAQ |
| `/terms` | Public | Full Terms & Conditions (Section 7 below) |
| `/order` | Public | Tier selection → terms checkbox (must check to proceed) → Stripe Payment Link |
| `/order/intake` | Public (post-payment redirect) | Intake form, tied to orderId from Stripe redirect metadata |
| `/signup`, `/login` | Public | Client account creation, Google sign-in |
| `/dashboard` | Client (auth) | Their order card: current status, draft link when available, Approve / Request Revision buttons |
| `/staff/dashboard` | Staff (auth) | Table of all orders, filter by status, update status, paste draft URL, mark revision used |

---

## 6. Client dashboard behavior (the "Fiverr-style" part)

- Client sees a single status tracker (progress bar or step list) for their order.
- When status = `draft_submitted`, dashboard shows the draft URL plus two buttons: **Approve** and **Request Revision**.
- **Approve** → status becomes `approved`, timestamp recorded, staff notified (email or just visible on staff dashboard).
- **Request Revision** → only shown if `revisionUsed` is false. Client types their revision notes in a text box, submits → status becomes `revision_requested`, `revisionUsed` flips to true, notes saved to `revisionNotes`.
- After a revision is delivered, staff manually moves status back to `draft_submitted` for final review, but the Request Revision button no longer appears (revision already used) — only Approve remains.

---

## 7. Terms & Conditions (draft copy — review before publishing)

> **Web Design Squad — Terms of Service**
>
> **AI-Assisted Development.** Web Design Squad uses AI tools, including Claude, as part of the design and development process. All work is reviewed and delivered by a human developer, but you should know AI assistance is part of how your project is built.
>
> **Timeline.** Standard delivery is 7–10 business days, counted from the date your completed intake form is received — not from your payment date. Delays in responding to follow-up questions extend the timeline accordingly.
>
> **Revisions.** Your project includes **one (1) round of revisions** on the first draft. Additional rounds beyond that are available as a separate paid change order.
>
> **Review & Approval Process.** You'll receive a link to your first draft through your client dashboard. From there you can either **Approve** the draft (moving your project to final delivery) or **Request your one revision**, describing the specific changes you'd like. Once a revision is submitted and delivered, the project moves to final approval — further changes at that point are treated as a new change order.
>
> **Ownership & Delivery.** [Insert your existing ownership/payment terms here — site files, domain, hosting handoff, etc.]
>
> By checking the box during checkout, you acknowledge you've read and agree to these terms.

Treat this as a first draft, not final legal copy — you may want a lawyer or a legal-templates service to review before this goes live, especially the ownership/liability sections marked `[Insert...]`.

---

## 8. Build order for Claude Code

1. Scaffold project, storefront pages (`/`, `/terms`), Tailwind styling per `BRAND.md`.
2. `/order` flow with terms checkbox gating the Stripe Payment Link.
3. Firebase Auth + Firestore setup (apply all standard gotchas up front).
4. Intake form → creates the `orders/{orderId}` doc.
5. Client `/dashboard` with status tracker + Approve/Request Revision logic.
6. Staff `/staff/dashboard` with status controls + draft URL field.
7. QA pass using existing Section 7 checklist from the main SOP, plus: verify revision button correctly disappears after one use, verify terms checkbox blocks checkout until checked.

---

*Feed this file to Claude Code alongside a `BRAND.md` for this project, same as the Archway and Younique builds.*
