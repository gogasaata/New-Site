"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";

const NAV = [
  { label: "HOME", href: "#top", id: "top" },
  { label: "ABOUT US", href: "#about", id: "about" },
  { label: "OUR BUSINESSES", href: "#businesses", id: "businesses" },
  { label: "INVESTMENTS", href: "#investments", id: "investments" },
  { label: "PARTNERSHIPS", href: "#partnerships", id: "partnerships" },
  { label: "CONTACT", href: "#contact", id: "contact" },
];

export default function Header() {
  const [active, setActive] = useState("top");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const els = NAV.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-[1440px] items-start justify-between px-6 pt-5 md:px-[88px]">
        <Logo className="h-[64px] md:h-[72px]" />
        <nav className="hidden pt-[22px] lg:block" aria-label="Main">
          <ul className="flex gap-9 text-[12px] uppercase tracking-nav">
            {NAV.map((n) => (
              <li key={n.id}>
                <a
                  href={n.href}
                  className={`relative inline-block pb-2 transition-colors hover:text-wine ${active === n.id ? "text-ink" : "text-ink/80"}`}
                >
                  {n.label}
                  {active === n.id && <span className="absolute inset-x-0 -bottom-[2px] h-[2px] bg-wine" />}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hidden items-center gap-5 pt-[14px] lg:flex">
          <span className="h-[30px] w-px bg-ink" />
          <span className="flex items-center gap-2 text-[12px] tracking-nav">
            EN
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M1 1l4 4 4-4" /></svg>
          </span>
        </div>
        <button
          className="mt-3 flex h-10 w-10 flex-col items-center justify-center gap-[6px] lg:hidden"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span className={`h-px w-6 bg-ink transition ${open ? "translate-y-[7px] rotate-45" : ""}`} />
          <span className={`h-px w-6 bg-ink transition ${open ? "opacity-0" : ""}`} />
          <span className={`h-px w-6 bg-ink transition ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
        </button>
      </div>
      {open && (
        <nav className="mx-6 mt-2 border border-ink/10 bg-cream/95 p-6 backdrop-blur lg:hidden" aria-label="Mobile">
          <ul className="space-y-4 text-[13px] uppercase tracking-nav">
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={n.href} onClick={() => setOpen(false)} className={active === n.id ? "text-wine" : ""}>{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
