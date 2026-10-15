export default function Arrow({ className = "", width = 28 }: { className?: string; width?: number }) {
  return (
    <svg width={width} height="12" viewBox="0 0 28 12" fill="none" stroke="currentColor" strokeWidth="1.3" className={className} aria-hidden>
      <path d="M0 6h26M21 1l5 5-5 5" />
    </svg>
  );
}
