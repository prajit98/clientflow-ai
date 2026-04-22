import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle2, XCircle } from "lucide-react";
import { formatBudget, scoreColor, timeAgo } from "@/lib/format";
import { toast } from "sonner";

export default function Admin() {
  const qc = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*, job_scores(opportunity_score, spam_risk, reason_short)")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as any[];
    },
  });

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("jobs").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(status === "rejected" ? "Removed" : "Approved");
    qc.invalidateQueries({ queryKey: ["admin-jobs"] });
  }

  const flagged = jobs?.filter((j) => (j.job_scores?.[0]?.spam_risk ?? 0) >= 50) ?? [];
  const others = jobs?.filter((j) => (j.job_scores?.[0]?.spam_risk ?? 0) < 50) ?? [];

  return (
    <AppShell>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
          <Shield className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Moderation</h1>
          <p className="text-muted-foreground">Review high-risk jobs flagged by the AI.</p>
        </div>
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="font-display text-lg font-semibold">Flagged ({flagged.length})</h2>
          <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/15">High spam risk</Badge>
        </div>
        <Table jobs={flagged} loading={isLoading} onApprove={(id) => setStatus(id, "active")} onReject={(id) => setStatus(id, "rejected")} flagged />
      </section>

      <section className="mt-10">
        <h2 className="mb-3 font-display text-lg font-semibold">All jobs</h2>
        <Table jobs={others} loading={isLoading} onApprove={(id) => setStatus(id, "active")} onReject={(id) => setStatus(id, "rejected")} />
      </section>
    </AppShell>
  );
}

function Table({ jobs, loading, onApprove, onReject, flagged = false }: { jobs: any[]; loading: boolean; onApprove: (id: string) => void; onReject: (id: string) => void; flagged?: boolean }) {
  if (loading) return <div className="h-40 animate-pulse rounded-2xl border border-border bg-card" />;
  if (jobs.length === 0) return <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">Nothing here.</div>;
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft-sm">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-5 py-3 font-medium">Job</th>
            <th className="px-5 py-3 font-medium">Score</th>
            <th className="px-5 py-3 font-medium hidden md:table-cell">Status</th>
            <th className="px-5 py-3 font-medium hidden md:table-cell">Posted</th>
            <th className="px-5 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((j) => {
            const s = j.job_scores?.[0];
            return (
              <tr key={j.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-5 py-4">
                  <div className="font-medium text-foreground">{j.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{formatBudget(j.budget_min, j.budget_max, j.currency, j.is_hourly)} · {j.source}</div>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${scoreColor(s?.opportunity_score)}`}>
                    {s?.opportunity_score?.toFixed(0) ?? "—"}
                  </span>
                </td>
                <td className="hidden px-5 py-4 md:table-cell">
                  <Badge variant={j.status === "active" ? "secondary" : j.status === "rejected" ? "outline" : "default"} className="capitalize">{j.status}</Badge>
                </td>
                <td className="hidden px-5 py-4 text-muted-foreground md:table-cell">{timeAgo(j.posted_at)}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    {j.status !== "active" && (
                      <Button size="sm" variant="outline" onClick={() => onApprove(j.id)}>
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Approve
                      </Button>
                    )}
                    {j.status !== "rejected" && (
                      <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => onReject(j.id)}>
                        <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}