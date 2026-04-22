import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Target, Zap, Shield, Check } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const features = [
  { icon: Target, title: "Opportunity scoring", body: "Every job gets a 0–100 score for budget, clarity and spam risk — so you spend time only on jobs worth winning." },
  { icon: Sparkles, title: "AI proposals", body: "Generate a tailored proposal in seconds using your niche, voice, and the client's brief." },
  { icon: Zap, title: "First-hour alerts", body: "Apply within the golden window. We surface fresh, high-quality jobs the moment they post." },
  { icon: Shield, title: "Spam shield", body: "Low-budget bait, vague briefs and red-flag clients filtered out before you ever see them." },
];

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Button asChild><Link to="/dashboard">Open dashboard</Link></Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex"><Link to="/auth">Sign in</Link></Button>
                <Button asChild><Link to="/auth?mode=signup">Get started <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-mesh" />
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-16 md:px-6 md:pt-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl text-center">
            <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-center text-xs font-medium text-muted-foreground shadow-soft-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Now scoring 12,400+ fresh jobs every day
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-6xl">
              Stop scrolling job boards.
              <br />
              <span className="bg-gradient-hero bg-clip-text text-transparent">Win better clients.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              ClientFlow scores every freelance opportunity, filters the noise, and writes a tailored proposal in one click.
              You only see jobs worth your time.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="h-12 w-full px-6 text-base shadow-glow sm:w-auto">
                <Link to="/auth?mode=signup">Start free — no card <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="ghost" asChild className="h-12 w-full px-6 text-base sm:w-auto">
                <a href="#features">See how it works</a>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">25 scored jobs / day · 10 AI proposals / month · free forever</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="mx-auto mt-16 max-w-4xl">
            <div className="rounded-3xl border border-border bg-card p-3 shadow-soft-lg">
              <div className="rounded-2xl bg-gradient-soft p-6">
                <div className="grid gap-3">
                  {[
                    { score: 92, title: "Senior React + TypeScript engineer (long-term)", budget: "$60–$90/hr", reason: "Reputable client, clear scope, strong budget." },
                    { score: 78, title: "Brand identity for fintech startup", budget: "$2,500–$5,000", reason: "Healthy budget, well-defined deliverables." },
                    { score: 22, title: "Build me a website cheap fast urgent!!!", budget: "$50–$100", reason: "Vague scope, suspiciously low budget.", bad: true },
                  ].map((j) => (
                    <div key={j.title} className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-soft-sm">
                      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg text-sm font-bold ${j.bad ? "bg-destructive/10 text-destructive" : j.score >= 80 ? "bg-success/10 text-success" : "bg-primary-soft text-primary"}`}>{j.score}</div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="truncate text-sm font-semibold text-foreground">{j.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{j.reason}</p>
                      </div>
                      <span className="hidden shrink-0 text-sm font-semibold text-foreground sm:block">{j.budget}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">A calmer way to find work.</h2>
            <p className="mt-4 text-muted-foreground">Built for freelancers tired of refreshing Upwork at midnight.</p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft-sm transition-shadow hover:shadow-soft-md">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border bg-gradient-soft py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Simple pricing.</h2>
            <p className="mt-4 text-muted-foreground">Start free. Upgrade when you start winning.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { name: "Free", price: "$0", desc: "For trying things out.", features: ["25 scored jobs / day", "10 AI proposals / month", "All quality filters"] },
              { name: "Pro", price: "$19", desc: "For active freelancers.", features: ["Unlimited scored jobs", "200 AI proposals / month", "Instant alerts", "Saved searches"], featured: true },
              { name: "Studio", price: "$49", desc: "For small teams.", features: ["Everything in Pro", "5 team seats", "Shared pipelines", "Priority support"] },
            ].map((p) => (
              <div key={p.name} className={`rounded-2xl border p-6 ${p.featured ? "border-primary bg-card shadow-glow" : "border-border bg-card shadow-soft-sm"}`}>
                {p.featured && <span className="mb-3 inline-block rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">Most popular</span>}
                <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                <p className="mt-4 font-display text-3xl font-bold">{p.price}<span className="text-base font-medium text-muted-foreground">/mo</span></p>
                <ul className="mt-5 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />{f}</li>
                  ))}
                </ul>
                <Button className="mt-6 w-full" variant={p.featured ? "default" : "outline"} asChild>
                  <Link to="/auth?mode=signup">Get {p.name}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-border py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">FAQ</h2>
            <p className="mt-4 text-muted-foreground">A few quick answers for freelancers evaluating ClientFlow on the go.</p>
          </div>

          <div className="mt-12 grid gap-4">
            {[
              {
                question: "How does ClientFlow decide which jobs are worth applying to?",
                answer: "Each opportunity is scored for budget, clarity, and spam risk so the best-fit jobs rise to the top first.",
              },
              {
                question: "Can I edit proposals before sending them?",
                answer: "Yes. Generated proposals are meant to be quick first drafts that you can adjust before copying into your application.",
              },
              {
                question: "Do I need a paid plan to get started?",
                answer: "No. The free plan includes daily scored jobs and a limited number of proposal generations so you can try the workflow first.",
              },
            ].map((item) => (
              <div key={item.question} className="rounded-2xl border border-border bg-card p-6 shadow-soft-sm">
                <h3 className="font-display text-lg font-semibold leading-7">{item.question}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground md:flex-row md:px-6">
          <Logo />
          <p>© {new Date().getFullYear()} ClientFlow. Built for freelancers.</p>
        </div>
      </footer>
    </div>
  );
}
