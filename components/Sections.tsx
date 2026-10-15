import Logo from "./Logo";
import ContactForm from "./ContactForm";

const paras = (t: string) => t.split(/\n\s*\n/).filter(Boolean);

function Heading({ no, title }: { no?: string; title: string }) {
  return (
    <div className="mb-8">
      {no && <span className="mb-2 block text-[13px] uppercase tracking-eyebrow text-wine">{no}</span>}
      <h2 className="font-serif text-[40px] font-normal leading-[1.05] tracking-[-0.01em] md:text-[52px]">{title}</h2>
      <span className="mt-5 block h-px w-[48px] bg-wine" />
    </div>
  );
}

export function About({ c }: { c: Record<string, string> }) {
  return (
    <section id="about" className="scroll-mt-4 border-t border-ink/10 bg-cream">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-16 md:py-20 md:px-[88px] lg:grid-cols-[1fr_1.4fr] lg:gap-24">
        <Heading no="ABOUT" title={c.about_title} />
        <div className="space-y-6 text-[18px] leading-[1.65] text-slate2">
          {paras(c.about_text).map((p, i) => (
            <p key={i} className={i === 0 ? "font-serif text-[26px] leading-[1.35] text-ink" : ""}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Simple({ id, no, title, text }: { id: string; no: string; title: string; text: string }) {
  return (
    <section id={id} className="scroll-mt-4 border-t border-ink/10 bg-cream">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-12 md:py-14 md:px-[88px] lg:grid-cols-[1fr_1.4fr] lg:gap-24">
        <Heading no={no} title={title} />
        <div className="space-y-6 text-[18px] leading-[1.65] text-slate2">
          {paras(text).map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>
    </section>
  );
}

export function Contact({ c }: { c: Record<string, string> }) {
  return (
    <section id="contact" className="scroll-mt-4 border-t border-ink/10 bg-cream">
      <div className="mx-auto grid max-w-[1440px] gap-14 px-6 py-16 md:py-20 md:px-[88px] lg:grid-cols-[1fr_1.2fr] lg:gap-24">
        <div>
          <Heading no="CONTACT" title={c.contact_title} />
          <p className="max-w-[420px] text-[18px] leading-[1.6] text-slate2">{c.contact_text}</p>
          <dl className="mt-10 space-y-5 text-[16px]">
            {c.contact_email && (
              <div><dt className="text-[11px] uppercase tracking-eyebrow text-wine">Email</dt>
                <dd className="mt-1"><a href={`mailto:${c.contact_email}`} className="hover:text-wine">{c.contact_email}</a></dd></div>
            )}
            {c.contact_phone && (
              <div><dt className="text-[11px] uppercase tracking-eyebrow text-wine">Phone</dt>
                <dd className="mt-1">{c.contact_phone}</dd></div>
            )}
            {c.contact_address && (
              <div><dt className="text-[11px] uppercase tracking-eyebrow text-wine">Address</dt>
                <dd className="mt-1 whitespace-pre-line">{c.contact_address}</dd></div>
            )}
          </dl>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}

export function Footer({ c }: { c: Record<string, string> }) {
  return (
    <footer className="bg-ink text-white/80">
      <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-6 px-6 py-10 text-[13px] md:flex-row md:items-center md:px-[88px]">
        <div className="flex items-center gap-4">
          <Logo invert className="h-[56px]" />
        </div>
        <p>© {new Date().getFullYear()} {c.footer_text}</p>
        <a href="#top" className="uppercase tracking-nav hover:text-white">Back to top ↑</a>
      </div>
    </footer>
  );
}
