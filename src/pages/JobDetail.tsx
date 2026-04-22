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
import { cn } from "@/lib/utils";

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [proposal, setProposal] = useState("");
  const [generating, setGenerating] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

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

  useEffect(() => {
    setDescriptionExpanded(false);
  }, [job?.id]);

  const score = (job as any)?.job_scores?.[0];
  const description = job?.description_clean?.trim() ?? "";
  const hasLongDescription = description.length > 420 || description.split(/\n+/).length > 5;
  const hasProposal = proposal.trim().length > 0;
  const proposalWordCount = proposal.trim() ? proposal.trim().split(/\s+/).length : 0;

  async function generateProposal() {
    if (!job || !user) return;
    setGenerating(true);
    try {
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
      await Promise.allSettled([
        supabase.from("job_interactions").insert({ user_id: user.id, job_id: job.id, event_type: "proposal_generated" }),
        supabase.from("credit_transactions").insert({ user_id: user.id, amount: -1, type: "proposal", description: `Proposal for ${job.title}` }),
      ]);
    } catch {
      toast.error("Couldn’t generate a proposal right now");
    } finally {
      setGenerating(false);
    }
  }

  async function save() {
    if (!job || !user) return;
    await supabase.from("job_interactions").insert({ user_id: user.id, job_id: job.id, event_type: "save" });
    toast.success("Saved");
  }

  async function copyProposal() {
    if (!hasProposal) return;
    try {
      await navigator.clipboard.writeText(proposal);
      toast.success("Proposal copied");
    } catch {
      toast.error("Couldn’t copy the proposal");
    }
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft-sm md:p-8">
                <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                <div className="mt-4 h-8 w-4/5 animate-pulse rounded bg-muted" />
                <div className="mt-3 h-8 w-40 animate-pulse rounded-full bg-muted" />
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="h-12 animate-pulse rounded-xl bg-muted" />
                  <div className="h-12 animate-pulse rounded-xl bg-muted" />
                </div>
                <div className="mt-6 space-y-3 border-t border-border pt-6">
                  <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft-sm md:p-8">
                <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                <div className="mt-4 h-12 w-full animate-pulse rounded-xl bg-muted" />
                <div className="mt-5 h-40 animate-pulse rounded-xl bg-muted" />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft-sm">
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              <div className="mt-4 h-16 w-28 animate-pulse rounded-xl bg-muted" />
              <div className="mt-5 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 w-full animate-pulse rounded bg-muted" />
                    <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!job) {
    return (
      <AppShell>
        <div className="grid min-h-[60vh] place-items-center">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-soft-sm">
            <h1 className="font-display text-2xl font-bold tracking-tight">Job not found</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              This opportunity may have been removed or is no longer available.
            </p>
            <Button asChild className="mt-6 h-11 px-5 shadow-glow">
              <Link to="/dashboard">Back to opportunities</Link>
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All opportunities
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft-sm md:p-8">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-secondary px-3 py-1 font-semibold uppercase tracking-wide text-foreground/70">
                {job.source}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                <Clock className="h-3 w-3" />{timeAgo(job.posted_at)}
              </span>
              {job.country && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                  <MapPin className="h-3 w-3" />{job.country}
                </span>
              )}
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold tracking-tight leading-tight md:text-3xl">{job.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <Badge variant="secondary" className="min-h-9 px-3.5 py-1.5 text-sm font-semibold">
                {formatBudget(job.budget_min, job.budget_max, job.currency || "USD", !!job.is_hourly)}
              </Badge>
              {job.niche && <Badge variant="outline">{job.niche}</Badge>}
              {job.remote_type && <Badge variant="outline">{job.remote_type}</Badge>}
            </div>
            <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap">
              {job.canonical_url ? (
                <Button className="h-12 w-full shadow-glow sm:w-auto" asChild>
                  <a href={job.canonical_url} target="_blank" rel="noreferrer">
                    Apply on {job.source} <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <Button className="h-12 w-full sm:w-auto" disabled>
                  Application link unavailable
                </Button>
              )}
              <Button variant="outline" className="h-12 w-full sm:w-auto" onClick={save}>
                <Bookmark className="mr-2 h-4 w-4" /> Save
              </Button>
            </div>

            <div className="mt-6 border-t border-border pt-6">
              <div className="mb-3">
                <h2 className="font-display text-lg font-semibold">Job description</h2>
                <p className="mt-1 text-sm text-muted-foreground">What the client shared about the project.</p>
              </div>

              {description ? (
                <>
                  <div className="relative">
                    <div
                      className={cn(
                        "whitespace-pre-line text-sm leading-7 text-foreground/90 md:text-[15px]",
                        hasLongDescription && !descriptionExpanded && "max-h-48 overflow-hidden md:max-h-none md:overflow-visible",
                      )}
                    >
                      {description}
                    </div>
                    {hasLongDescription && !descriptionExpanded && (
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card to-transparent md:hidden" />
                    )}
                  </div>

                  {hasLongDescription && (
                    <button
                      type="button"
                      onClick={() => setDescriptionExpanded((value) => !value)}
                      className="mt-3 text-sm font-semibold text-primary hover:text-primary/80 md:hidden"
                    >
                      {descriptionExpanded ? "Show less" : "Read more"}
                    </button>
                  )}
                </>
              ) : (
                <div className="rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
                  No description is available for this opportunity yet.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-soft-sm md:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold">AI Proposal</h2>
                <p className="text-sm leading-6 text-muted-foreground">Generate a fast first draft, tweak it, and copy it into your application.</p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                {hasProposal && (
                  <Button variant="outline" className="h-11 w-full sm:w-auto" onClick={copyProposal} disabled={generating}>
                    <Copy className="mr-2 h-4 w-4" /> Copy
                  </Button>
                )}
                <Button onClick={generateProposal} disabled={generating} className="h-12 w-full shadow-glow sm:w-auto">
                  <Sparkles className={cn("mr-2 h-4 w-4", generating && "animate-pulse")} />
                  {generating ? (hasProposal ? "Refreshing draft…" : "Generating…") : proposal ? "Regenerate" : "Generate"}
                </Button>
              </div>
            </div>

            <div className="mt-5">
              {generating && !hasProposal ? (
                <div aria-live="polite" className="rounded-2xl border border-dashed border-primary/30 bg-primary-soft/50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft-sm">
                      <Sparkles className="h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Generating your proposal…</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Pulling the job context into a quick, editable first draft.
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 space-y-3">
                    <div className="h-4 w-5/6 animate-pulse rounded bg-primary/15" />
                    <div className="h-4 w-full animate-pulse rounded bg-primary/15" />
                    <div className="h-4 w-4/5 animate-pulse rounded bg-primary/15" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-primary/15" />
                  </div>
                </div>
              ) : hasProposal ? (
                <div className="space-y-3">
                  <div className="rounded-xl bg-muted/45 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Draft ready to edit</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          Adjust the tone, examples, or CTA before sending.
                        </p>
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {proposalWordCount} words
                      </p>
                    </div>
                  </div>

                  {generating && (
                    <div aria-live="polite" className="rounded-xl border border-primary/20 bg-primary-soft/40 px-4 py-3 text-sm text-primary">
                      Refreshing your draft with a new variation…
                    </div>
                  )}

                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <span>Editable proposal</span>
                      <span>Tap to update</span>
                    </div>
                    <Textarea
                      value={proposal}
                      onChange={(e) => setProposal(e.target.value)}
                      readOnly={generating}
                      rows={14}
                      className={cn(
                        "min-h-[320px] rounded-xl border-border/80 bg-background px-4 py-4 font-sans text-base leading-7 shadow-soft-sm md:min-h-[360px] md:text-sm md:leading-6",
                        generating && "cursor-wait opacity-70",
                      )}
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-muted/25 p-5">
                  <p className="font-medium text-foreground">Generate a proposal in one tap</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    ClientFlow will create a quick draft from the job details so you can polish it and send it faster.
                  </p>
                </div>
              )}
            </div>
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
