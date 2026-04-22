import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, MapPin, Sparkles, Copy, Bookmark, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { formatBudget, scoreColor, timeAgo } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [proposal, setProposal] = useState("");
  const [generating, setGenerating] = useState(false);

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*, job_scores(*)")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (job && user) {
      supabase.from("job_interactions").insert({ user_id: user.id, job_id: job.id, event_type: "view" });
    }
  }, [job, user]);

  const score = (job as any)?.job_scores?.[0];

  async function generateProposal() {
    if (!job || !user) return;
    setGenerating(true);
    // Mock AI generation locally — wire to edge function later
    await new Promise((r) => setTimeout(r, 900));
    const text = `Hi there,

I read your post about "${job.title}" and it sounds like a great fit. I've shipped similar ${job.niche?.replace("-", " ") ?? "projects"} for clients in your space and can help you ${(job.description_clean ?? "").split(".")[0].toLowerCase()}.

Here's how I'd approach it:
1. Discovery call to lock the scope and success metrics
2. A short paid pilot so you can see the quality risk-free
3. Weekly demos with clear acceptance criteria

I work async, in your timezone friendly hours, and you'll always know exactly what I'm doing.

Would Tuesday or Wednesday work for a 20-min intro?

Best,
`;
    setProposal(text);
    await supabase.from("job_interactions").insert({ user_id: user.id, job_id: job.id, event_type: "proposal_generated" });
    await supabase.from("credit_transactions").insert({ user_id: user.id, amount: -1, type: "proposal", description: `Proposal for ${job.title}` });
    setGenerating(false);
  }

  async function save() {
    if (!job || !user) return;
    await supabase.from("job_interactions").insert({ user_id: user.id, job_id: job.id, event_type: "save" });
    toast.success("Saved");
  }

  if (isLoading) return <AppShell><div className="h-96 animate-pulse rounded-2xl bg-card" /></AppShell>;
  if (!job) return <AppShell><p>Job not found.</p></AppShell>;

  return (
    <AppShell>
      <Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All opportunities
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft-sm md:p-8">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-semibold uppercase tracking-wide text-foreground/70">{job.source}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(job.posted_at)}</span>
              {job.country && <><span>·</span><span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{job.country}</span></>}
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight md:text-3xl">{job.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-sm font-semibold">{formatBudget(job.budget_min, job.budget_max, job.currency || "USD", !!job.is_hourly)}</Badge>
              {job.niche && <Badge variant="outline">{job.niche}</Badge>}
              {job.remote_type && <Badge variant="outline">{job.remote_type}</Badge>}
            </div>
            <div className="prose prose-sm mt-6 max-w-none text-foreground/90">
              <p className="whitespace-pre-line leading-relaxed">{job.description_clean}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-6">
              {job.canonical_url && (
                <Button variant="outline" asChild>
                  <a href={job.canonical_url} target="_blank" rel="noreferrer">View on {job.source} <ExternalLink className="ml-2 h-4 w-4" /></a>
                </Button>
              )}
              <Button variant="outline" onClick={save}><Bookmark className="mr-2 h-4 w-4" /> Save</Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft-sm md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-semibold">AI Proposal</h2>
                <p className="text-sm text-muted-foreground">Drafted in your voice. Edit before sending.</p>
              </div>
              <Button onClick={generateProposal} disabled={generating} className="shadow-glow">
                <Sparkles className="mr-2 h-4 w-4" /> {generating ? "Generating…" : proposal ? "Regenerate" : "Generate"}
              </Button>
            </div>
            {proposal && (
              <div className="mt-5">
                <Textarea value={proposal} onChange={(e) => setProposal(e.target.value)} rows={14} className="font-sans text-sm leading-relaxed" />
                <Button variant="outline" size="sm" className="mt-3" onClick={() => { navigator.clipboard.writeText(proposal); toast.success("Copied"); }}>
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Opportunity score</p>
            <div className={`mt-3 inline-flex items-baseline gap-2 rounded-xl px-4 py-3 ${scoreColor(score?.opportunity_score)}`}>
              <span className="font-display text-4xl font-bold">{score?.opportunity_score?.toFixed(0) ?? "—"}</span>
              <span className="text-sm font-medium">/100</span>
            </div>
            {score?.reason_short && <p className="mt-3 text-sm text-muted-foreground">{score.reason_short}</p>}
            <div className="mt-5 space-y-3">
              {[
                ["Quality", score?.quality_score],
                ["Budget", score?.budget_score],
                ["Clarity", score?.clarity_score],
                ["Spam risk", score?.spam_risk],
              ].map(([label, val]) => (
                <div key={label as string}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold">{val != null ? Number(val).toFixed(0) : "—"}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-gradient-hero" style={{ width: `${Math.min(100, Number(val) || 0)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}