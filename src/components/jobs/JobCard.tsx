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
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="group block rounded-2xl border border-border bg-card p-5 shadow-soft-sm transition-all hover:-translate-y-0.5 hover:shadow-soft-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium uppercase tracking-wide text-foreground/70">{job.source}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgo(job.posted_at)}</span>
            {job.country && <><span>·</span><span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{job.country}</span></>}
          </div>
          <h3 className="mt-2 font-display text-base font-semibold leading-snug text-foreground group-hover:text-primary">
            {job.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{job.description_clean}</p>
        </div>
        <div className={`shrink-0 rounded-xl px-3 py-2 text-center ${scoreColor(score?.opportunity_score ?? null)}`}>
          <div className="text-xl font-bold leading-none">{score?.opportunity_score?.toFixed(0) ?? "—"}</div>
          <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wide opacity-80">score</div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="font-semibold">{formatBudget(job.budget_min, job.budget_max, job.currency || "USD", !!job.is_hourly)}</Badge>
        {job.niche && <Badge variant="outline">{job.niche}</Badge>}
        {score?.beginner_friendly && (
          <Badge className="bg-success/10 text-success hover:bg-success/15">
            <Sparkles className="mr-1 h-3 w-3" /> Beginner-friendly
          </Badge>
        )}
        <span className="ml-auto inline-flex items-center text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          View <ArrowUpRight className="ml-1 h-3 w-3" />
        </span>
      </div>
      {score?.reason_short && (
        <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground/80">AI:</span> {score.reason_short}
        </p>
      )}
    </Link>
  );
}