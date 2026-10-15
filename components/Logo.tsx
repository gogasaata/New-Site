export default function Logo({ className = "h-[68px]", invert = false }: { className?: string; invert?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo.png" alt="VIN Group" className={`w-auto select-none ${invert ? "invert" : ""} ${className}`} />
  );
}
