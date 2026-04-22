import { Link } from "react-router-dom";
import { ArrowUpRight, Clock, MapPin, Sparkles } from "lucide-react";
import { formatBudget, scoreColor, timeAgo } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export type JobWithScore = {
  id: string;
  title: string;
  description_clean: string | null;
  budget_min: number | null;
  budget_max: number | null;
  currency: string | null;
  is_hourly: boolean | null;
  niche: string | null;
  country: string | null;
  source: string;
  posted_at: string | null;
  job_scores: Array<{ opportunity_score: number | null; reason_short: string | null; beginner_friendly: boolean | null }> | null;
};

export function JobCard({ job }: { job: JobWithScore }) {
  const score = job.job_scores?.[0];
  const mobileTag = job.niche ?? (score?.beginner_friendly ? "Beginner-friendly" : job.source);

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="group block rounded-2xl border border-border bg-card p-5 shadow-soft-sm transition-all hover:-translate-y-0.5 hover:shadow-soft-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2 md:p-5"
    >
      <div className="space-y-4 md:hidden">
        <h3 className="line-clamp-2 font-display text-base font-semibold leading-6 text-foreground">
          {job.title}
        </h3>

        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="secondary" className="min-h-9 px-3.5 py-1.5 text-sm font-semibold">
            {formatBudget(job.budget_min, job.budget_max, job.currency || "USD", !!job.is_hourly)}
          </Badge>
          <Badge variant="outline" className="min-h-9 max-w-[11rem] px-3.5 py-1.5 text-sm">
            <span className="block truncate">{mobileTag}</span>
          </Badge>
        </div>

        <span className="flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft-sm">
          View opportunity <ArrowUpRight className="ml-2 h-4 w-4" />
        </span>
      </div>

      <div className="hidden md:block">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="rounded-full bg-secondary px-2.5 py-1 font-semibold uppercase tracking-wide text-foreground/70">
                {job.source}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                <Clock className="h-3 w-3" /> {timeAgo(job.posted_at)}
              </span>
              {job.country && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                  <MapPin className="h-3 w-3" /> {job.country}
                </span>
              )}
            </div>
            <h3 className="mt-3 font-display text-base font-semibold leading-snug text-foreground group-hover:text-primary">
              {job.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {job.description_clean}
            </p>
          </div>
          <div className={`shrink-0 rounded-xl px-3 py-2.5 text-center ${scoreColor(score?.opportunity_score ?? null)}`}>
            <div className="text-xl font-bold leading-none">{score?.opportunity_score?.toFixed(0) ?? "—"}</div>
            <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] opacity-80">Score</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <Badge variant="secondary" className="min-h-8 px-3 py-1 text-xs font-semibold">
            {formatBudget(job.budget_min, job.budget_max, job.currency || "USD", !!job.is_hourly)}
          </Badge>
          {job.niche && <Badge variant="outline" className="min-h-8 px-3 py-1">{job.niche}</Badge>}
          {score?.beginner_friendly && (
            <Badge className="min-h-8 px-3 py-1 bg-success/10 text-success hover:bg-success/15">
              <Sparkles className="mr-1 h-3 w-3" /> Beginner-friendly
            </Badge>
          )}
          <span className="ml-auto inline-flex items-center text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            View <ArrowUpRight className="ml-1 h-3 w-3" />
          </span>
        </div>

        {score?.reason_short && (
          <p className="mt-3 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">
            <span className="font-semibold text-foreground/80">AI:</span> {score.reason_short}
          </p>
        )}
      </div>
    </Link>
  );
}
