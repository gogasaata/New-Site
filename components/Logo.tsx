export default function Logo({ className = "" }: { className?: string }) {
  return (
    <a href="#top" aria-label="VIN Holding" className={`inline-block leading-none text-ink ${className}`}>
      <span className="block font-serif text-[54px] font-medium leading-[0.9] tracking-[-0.09em] [font-feature-settings:'liga']">VIN</span>
      <span className="mt-1 block pl-[6px] text-[10px] font-normal uppercase tracking-[0.45em]">Holding</span>
    </a>
  );
}
