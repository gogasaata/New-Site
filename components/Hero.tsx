import Arrow from "./Arrow";
import BusinessCards from "./BusinessCards";
import Earth from "./Earth";

export default function Hero({ c }: { c: Record<string, string> }) {
  const items = [1, 2, 3].map((n) => {
    const name = c[`biz_${n}_name`];
    const [first, ...rest] = name.split(" ");
    return { n, name, first, rest: rest.join(" "), short: c[`biz_${n}_short`], full: c[`biz_${n}_full`] };
  });

  return (
    <section id="top" className="relative bg-cream">
      <div className="relative mx-auto max-w-[1440px] overflow-hidden lg:h-[41vw] lg:max-h-[640px] lg:min-h-[540px]">
        <Earth src={c.globe_image_url || "/earth.webp"} />

        <div className="relative z-10 flex h-full flex-col justify-center px-6 pb-[330px] pt-[120px] md:px-[88px] lg:pb-0 lg:pt-[100px]">
          <p className="mb-4 text-[13px] uppercase tracking-eyebrow text-ink/80 md:text-[14px]">{c.hero_eyebrow}</p>
          <h1 className="font-serif text-[52px] font-normal leading-[0.98] tracking-[-0.02em] md:text-[74px] xl:text-[80px]">
            <span className="block text-ink">{c.hero_title_1}</span>
            <span className="block text-wine">{c.hero_title_2}</span>
          </h1>
          <p className="mt-6 max-w-[415px] text-[18px] leading-[1.4] text-ink">{c.hero_text}</p>
          <a
            href="#about"
            className="mt-7 inline-flex h-[47px] w-fit items-center gap-4 bg-wine px-[34px] text-[13px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-wine-dark"
          >
            {c.hero_cta}
            <Arrow width={24} />
          </a>
        </div>
      </div>

      <BusinessCards items={items} />
    </section>
  );
}
