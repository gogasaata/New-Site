import Arrow from "./Arrow";
import Globe from "./Globe";

export default function Hero({ c }: { c: Record<string, string> }) {
  const bizzes = [1, 2, 3].map((n) => {
    const [first, ...rest] = c[`biz_${n}_name`].split(" ");
    return { n, first, rest: rest.join(" "), short: c[`biz_${n}_short`] };
  });

  return (
    <section id="top" className="relative bg-cream">
      {/* top area */}
      <div className="relative mx-auto min-h-[640px] max-w-[1440px] overflow-hidden lg:h-[41vw] lg:min-h-[540px] lg:max-h-[640px]">
        {/* globe visual: the right half, clipped by the edges of the frame */}
        <div className="absolute inset-0 hidden lg:block">
          {c.globe_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.globe_image_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <Globe />
          )}
        </div>
        {/* mobile globe */}
        <div className="absolute inset-x-0 bottom-0 h-[340px] lg:hidden">
          <Globe />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cream to-transparent" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-center px-6 pb-[340px] pt-36 md:px-[88px] lg:pb-0 lg:pt-[100px]">
          <p className="mb-5 text-[14px] uppercase tracking-eyebrow text-ink/80">{c.hero_eyebrow}</p>
          <h1 className="font-serif text-[56px] font-normal leading-[0.98] tracking-[-0.02em] md:text-[74px] xl:text-[80px]">
            <span className="block text-ink">{c.hero_title_1}</span>
            <span className="block text-wine">{c.hero_title_2}</span>
          </h1>
          <p className="mt-7 max-w-[415px] text-[18px] leading-[1.35] text-ink">{c.hero_text.replace(/-/g, "\u2011")}</p>
          <a
            href="#about"
            className="mt-8 inline-flex h-[47px] w-fit items-center gap-4 bg-wine px-[34px] text-[13px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-wine-dark"
          >
            {c.hero_cta}
            <Arrow className="transition-transform group-hover:translate-x-1" width={24} />
          </a>
        </div>
      </div>

      {/* three-column summary */}
      <div className="mx-auto max-w-[1440px] px-6 md:px-[88px]">
        <div className="grid divide-wine/40 py-10 md:grid-cols-3 md:divide-x md:py-[34px] lg:grid-cols-[339px_373px_1fr]">
          {bizzes.map((b) => (
            <a
              key={b.n}
              href={`#business-${b.n}`}
              className="group block px-0 py-6 md:px-9 md:py-0 md:first:pl-9 lg:[&:nth-child(2)]:pl-[78px] lg:[&:nth-child(3)]:pl-[70px]"
            >
              <span className="block text-[17px] text-wine">0{b.n}</span>
              <span className="mt-2 block font-serif text-[34px] font-normal leading-[1.03] tracking-[-0.01em] text-ink">
                {b.first}
                <br />
                {b.rest}
              </span>
              <span className="mt-4 block h-px w-[36px] bg-wine" />
              <span className="mt-4 block max-w-[240px] text-[16px] leading-[1.3] text-slate2">{b.short}</span>
              <Arrow className="mt-7 text-wine transition-transform duration-300 group-hover:translate-x-2" width={24} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
