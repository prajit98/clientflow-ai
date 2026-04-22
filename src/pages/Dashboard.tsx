import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/AppShell";
import { JobCard, JobWithScore } from "@/components/jobs/JobCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp, Sparkles, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const filters = [
  { id: "all", label: "All", icon: TrendingUp },
  { id: "top", label: "Top scored", icon: Sparkles },
  { id: "fresh", label: "Fresh (<6h)", icon: Clock },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("id,title,description_clean,budget_min,budget_max,currency,is_hourly,niche,country,source,posted_at,freshness_hours,job_scores(opportunity_score,reason_short,beginner_friendly)")
        .eq("status", "active")
        .order("posted_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as unknown as JobWithScore[];
    },
  });

  const filtered = useMemo(() => {
    let list = jobs ?? [];
    if (q) list = list.filter((j) => j.title.toLowerCase().includes(q.toLowerCase()) || j.description_clean?.toLowerCase().includes(q.toLowerCase()));
    if (filter === "top") list = [...list].sort((a, b) => (b.job_scores?.[0]?.opportunity_score ?? 0) - (a.job_scores?.[0]?.opportunity_score ?? 0));
    if (filter === "fresh") list = list.filter((j) => j.posted_at && Date.now() - new Date(j.posted_at).getTime() < 6 * 36e5);
    return list;
  }, [jobs, q, filter]);

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Hi {profile?.full_name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          {jobs?.length ?? 0} fresh opportunities scored just for you.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by keyword…" className="h-11 pl-10" />
        </div>
        <div className="flex gap-2">
          {filters.map((f) => (
            <Button key={f.id} variant={filter === f.id ? "default" : "outline"} size="sm" className="h-11 gap-2" onClick={() => setFilter(f.id)}>
              <f.icon className="h-4 w-4" /> {f.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl border border-border bg-card" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No jobs match your filters.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      )}
    </AppShell>
  );
}