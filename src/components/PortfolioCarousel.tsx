"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon, ExternalLinkIcon } from "@/components/icons";
import { PORTFOLIO_SITES } from "@/lib/portfolio";

export default function PortfolioCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const amount = (card?.offsetWidth ?? 320) + 20;
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {PORTFOLIO_SITES.map((site) => (
          <a
            key={site.name}
            data-card
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group w-[280px] shrink-0 snap-start overflow-hidden rounded-[14px] border border-border bg-surface sm:w-[340px]"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border bg-panel">
              <Image
                src={site.image}
                alt={site.name}
                fill
                sizes="(max-width: 640px) 280px, 340px"
                className="object-cover object-top transition-transform group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-1.5">
                <p className="text-[14px] font-medium text-headline">{site.name}</p>
                <ExternalLinkIcon className="h-3.5 w-3.5 text-muted" />
              </div>
              <p className="mt-1 text-[12px] text-body">{site.description}</p>
            </div>
          </a>
        ))}
      </div>

      <button
        type="button"
        aria-label="Previous"
        onClick={() => scrollByCard(-1)}
        className="absolute left-0 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface p-2 text-headline shadow-sm sm:flex"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={() => scrollByCard(1)}
        className="absolute right-0 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface p-2 text-headline shadow-sm sm:flex"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
