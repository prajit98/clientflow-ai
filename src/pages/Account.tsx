import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { z } from "zod";

const niches = ["web-development", "design", "writing", "marketing", "video", "data"];
const levels = ["beginner", "intermediate", "expert"];

const schema = z.object({
  full_name: z.string().trim().min(1, "Required").max(100),
  niche: z.string().max(50).optional().nullable(),
  experience_level: z.string().max(20).optional().nullable(),
});

export default function Account() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [niche, setNiche] = useState<string>("");
  const [level, setLevel] = useState<string>("intermediate");
  const [saving, setSaving] = useState(false);

  const { data: profile, refetch, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setNiche(profile.niche ?? "");
      setLevel(profile.experience_level ?? "intermediate");
    }
  }, [profile]);

  async function save() {
    const parsed = schema.safeParse({ full_name: fullName, niche, experience_level: level });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName, niche: niche || null, experience_level: level }).eq("id", user!.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    refetch();
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div>
            <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-56 animate-pulse rounded bg-muted" />
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_320px]">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft-sm md:p-8">
              <div className="h-6 w-24 animate-pulse rounded bg-muted" />
              <div className="mt-6 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-11 w-full animate-pulse rounded-xl bg-muted" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft-sm">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="mt-3 h-8 w-28 animate-pulse rounded bg-muted" />
              <div className="mt-5 space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
                <div className="h-11 w-full animate-pulse rounded-xl bg-muted" />
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">Account</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-base">Manage your profile, plan and credits.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft-sm md:p-8">
          <h2 className="font-display text-lg font-semibold">Profile</h2>
          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={profile?.email ?? ""} disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Niche</Label>
              <div className="flex flex-wrap gap-2">
                {niches.map((n) => (
                  <button key={n} type="button" onClick={() => setNiche(n)}
                    className={`min-h-10 rounded-full px-4 py-2 text-sm font-medium transition-colors ${niche === n ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Experience level</Label>
              <div className="grid gap-2 sm:grid-cols-3">
                {levels.map((l) => (
                  <button key={l} type="button" onClick={() => setLevel(l)}
                    className={`min-h-11 rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-colors ${level === l ? "border-primary bg-primary-soft text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={save} disabled={saving} className="h-11 w-full shadow-glow sm:w-auto">{saving ? "Saving…" : "Save changes"}</Button>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Current plan</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-display text-2xl font-bold capitalize">{profile?.plan ?? "free"}</span>
              <Badge variant="secondary">Active</Badge>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><span className="font-semibold text-foreground">{profile?.daily_job_limit ?? 25}</span> jobs / day</li>
              <li><span className="font-semibold text-foreground">{profile?.proposal_credit_limit ?? 10}</span> AI proposals / month</li>
            </ul>
            <Button variant="outline" className="mt-5 w-full">Upgrade to Pro</Button>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
