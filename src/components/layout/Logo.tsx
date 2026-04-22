import { Link } from "react-router-dom";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 font-display font-bold text-lg tracking-tight ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-hero text-primary-foreground shadow-glow">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <path d="M4 6h16M4 12h10M4 18h6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </span>
      ClientFlow
    </Link>
  );
}