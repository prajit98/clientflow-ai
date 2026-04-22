export function formatBudget(min?: number | null, max?: number | null, currency = "USD", isHourly = false) {
  if (!min && !max) return "Budget undisclosed";
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  const suffix = isHourly ? "/hr" : "";
  if (min && max && min !== max) return `${fmt(min)} – ${fmt(max)}${suffix}`;
  return `${fmt((max ?? min) as number)}${suffix}`;
}

export function timeAgo(dateStr?: string | null) {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 36e5);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function scoreColor(score?: number | null) {
  if (score == null) return "text-muted-foreground bg-muted";
  if (score >= 80) return "text-success bg-success/10";
  if (score >= 60) return "text-primary bg-primary-soft";
  if (score >= 40) return "text-warning bg-warning/10";
  return "text-destructive bg-destructive/10";
}