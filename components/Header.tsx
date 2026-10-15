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
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = Math.min(window.innerHeight * 0.35, 180);
      let current = NAV[0].id;
      let best = -Infinity;
      for (const n of NAV) {
        const el = document.getElementById(n.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        // the section whose top is closest above the reading line (DOM order differs from menu order)
        if (top <= line && top > best) { best = top; current = n.id; }
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = "contact";
      setActive(current);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-[1440px] items-start justify-between px-6 pt-5 md:px-[88px]">
        <Logo className="h-[64px] md:h-[72px]" />
        <nav className="hidden pt-[22px] lg:absolute lg:left-1/2 lg:block lg:-translate-x-1/2" aria-label="Main">
          <ul className="flex gap-9 whitespace-nowrap text-[12px] uppercase tracking-nav">
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
