export type Tier = "base" | "base_plus_portal";

export const CHECKLIST_ITEMS = [
  {
    title: "Custom multi-page site",
    description: "Up to 5 pages built around your brand.",
    icon: "device-desktop",
  },
  {
    title: "Mobile-responsive",
    description: "Works cleanly on phone, tablet, desktop.",
    icon: "device-mobile",
  },
  {
    title: "Contact form",
    description: "So new clients can reach you instantly.",
    icon: "mail",
  },
  {
    title: "On-page SEO basics",
    description: "Titles, structure, and metadata done right.",
    icon: "world",
  },
  {
    title: "Domain connection and go-live",
    description: "We handle the technical launch for you.",
    icon: "rocket",
  },
  {
    title: "One round of revisions",
    description: "One focused revision pass on your first draft.",
    icon: "refresh",
  },
] as const;

export const TIERS: Record<
  Tier,
  {
    label: string;
    price: number;
    listPrice: number;
    deposit: number;
    balance: number;
    description: string;
  }
> = {
  base: {
    label: "The complete build",
    price: 500,
    listPrice: 750,
    deposit: 250,
    balance: 250,
    description: "A hand-designed multi-page site around your brand.",
  },
  base_plus_portal: {
    label: "The complete build + client portal",
    price: 750,
    listPrice: 1000,
    deposit: 250,
    balance: 500,
    description:
      "Everything in the complete build, plus a login-gated client and staff portal for order tracking.",
  },
};

export const PORTAL_ADD_ON = {
  title: "Client and staff portal",
  description: "Login, dashboards, request tracking.",
  price: 250,
};

export const BRANDING_ADD_ON = {
  title: "Logo and branding kit",
  description: "Custom logo, palette, and typography.",
  price: 150,
};
