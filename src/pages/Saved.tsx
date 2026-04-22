import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/AppShell";
import { JobCard, JobWithScore } from "@/components/jobs/JobCard";
import { useAuth } from "@/hooks/useAuth";

type SavedInteraction = {
  job_id: string;
  created_at: string;
};

export default function Saved() {
  const { user } = useAuth();

  const { data: savedJobs, isLoading } = useQuery({
    queryKey: ["saved-jobs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: interactions, error: interactionsError } = await supabase
        .from("job_interactions")
        .select("job_id, created_at")
        .eq("user_id", user!.id)
        .eq("event_type", "save")
        .order("created_at", { ascending: false });

      if (interactionsError) throw interactionsError;

      const orderedIds = Array.from(
        new Set(((interactions ?? []) as SavedInteraction[]).map((interaction) => interaction.job_id)),
      );

      if (orderedIds.length === 0) return [] as JobWithScore[];

      const { data: jobs, error: jobsError } = await supabase
        .from("jobs")
        .select("id,title,description_clean,budget_min,budget_max,currency,is_hourly,niche,country,source,posted_at,freshness_hours,job_scores(opportunity_score,reason_short,beginner_friendly)")
        .in("id", orderedIds)
        .eq("status", "active");

      if (jobsError) throw jobsError;

      const jobsById = new Map((jobs as unknown as JobWithScore[]).map((job) => [job.id, job]));
      return orderedIds
        .map((id) => jobsById.get(id))
        .filter((job): job is JobWithScore => Boolean(job));
    },
  });

  const savedCount = savedJobs?.length ?? 0;
  const subtitle = useMemo(() => {
    if (savedCount === 0) return "Save promising opportunities so they’re easy to revisit later.";
    if (savedCount === 1) return "1 opportunity saved for later.";
    return `${savedCount} opportunities saved for later.`;
  }, [savedCount]);

  return (
    <AppShell>
      <div className="mb-6 md:mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary">
          <Bookmark className="h-3.5 w-3.5" />
          Saved
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight md:text-3xl">Saved opportunities</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
          {subtitle}
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl border border-border bg-card" />
          ))}
        </div>
      ) : savedCount === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-8 text-center shadow-soft-sm md:py-12">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-primary">
            <Bookmark className="h-5 w-5" />
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold">Nothing saved yet</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Tap save on any job you want to come back to and it’ll appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {savedJobs?.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      )}
    </AppShell>
  );
}
