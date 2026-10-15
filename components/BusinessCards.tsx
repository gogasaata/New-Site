"use client";

import { useEffect, useState } from "react";
import Arrow from "./Arrow";

type Biz = { n: number; first: string; rest: string; short: string; name: string; full: string };

export default function BusinessCards({ items }: { items: Biz[] }) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    const read = () => {
      const m = window.location.hash.match(/^#business-(\d)$/);
      if (m) setOpen(Number(m[1]));
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  const current = items.find((b) => b.n === open);

  return (
    <div id="businesses" className="mx-auto max-w-[1440px] scroll-mt-4 px-6 md:px-[88px]">
      <div className="grid divide-y divide-wine/30 md:grid-cols-3 md:divide-x md:divide-y-0">
        {items.map((b) => {
          const active = open === b.n;
          return (
            <button
              key={b.n}
              type="button"
              aria-expanded={active}
              aria-controls="business-detail"
              onClick={() => setOpen(active ? null : b.n)}
              className="group block min-w-0 py-7 text-left md:px-6 md:py-9 md:first:pl-9 lg:px-9 lg:[&:nth-child(2)]:pl-14 lg:[&:nth-child(3)]:pl-14"
            >
              <span className="block text-[16px] text-wine">0{b.n}</span>
              <span className="mt-2 block font-serif text-[clamp(26px,2.7vw,34px)] font-normal leading-[1.05] tracking-[-0.01em] text-ink">
                {b.first}
                <br />
                {b.rest}
              </span>
              <span className="mt-3 block h-px w-9 bg-wine" />
              <span className="mt-3 block max-w-[250px] text-[16px] leading-[1.35] text-slate2">{b.short}</span>
              <Arrow
                className={`mt-5 text-wine transition-transform duration-300 ${active ? "rotate-90" : "group-hover:translate-x-2"}`}
                width={24}
              />
            </button>
          );
        })}
      </div>

      <div id="business-detail" className={`grid transition-[grid-template-rows] duration-500 ${current ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          {current && (
            <div className="grid gap-4 border-t border-wine/30 py-8 md:grid-cols-[1fr_1.6fr] md:gap-12 md:px-9">
              <div>
                <span className="text-[16px] text-wine">0{current.n}</span>
                <h3 className="mt-1 font-serif text-[30px] leading-[1.1] text-ink">{current.name}</h3>
              </div>
              <div>
                <p className="text-[17px] leading-[1.6] text-slate2">{current.full}</p>
                <div className="mt-5 flex gap-8 text-[12px] uppercase tracking-nav">
                  <a href="#contact" className="text-wine hover:underline">Get in touch</a>
                  <button type="button" onClick={() => setOpen(null)} className="text-ink/60 hover:text-ink">Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
