import { ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { House, User, Shield, LogOut, Sparkles, Bookmark, LayoutDashboard } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: ReactNode }) {
  const { isAdmin, signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    }`;

  const mobileNavClass = ({ isActive }: { isActive: boolean }) =>
    `flex min-h-[60px] flex-1 flex-col items-center justify-center rounded-2xl px-3 py-2 text-xs font-medium transition-colors ${
      isActive ? "bg-primary-soft text-primary" : "text-muted-foreground"
    }`;

  const homeActive = location.pathname === "/dashboard" || location.pathname.startsWith("/jobs/") || location.pathname === "/admin";

  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 md:px-6">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-60 shrink-0 flex-col rounded-2xl border border-border bg-card p-4 shadow-soft-sm md:flex">
          <Logo className="mb-8 px-2" />
          <nav className="flex flex-1 flex-col gap-1">
            <NavLink to="/dashboard" className={linkClass}>
              <LayoutDashboard className="h-4 w-4" /> Opportunities
            </NavLink>
            <NavLink to="/account" className={linkClass}>
              <User className="h-4 w-4" /> Account
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={linkClass}>
                <Shield className="h-4 w-4" /> Moderation
              </NavLink>
            )}
          </nav>
          <div className="mt-4 rounded-xl bg-gradient-mesh p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Pro tip
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Apply within the first hour for 3× higher reply rates.
            </p>
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <p className="truncate px-2 text-xs text-muted-foreground">{user?.email}</p>
            <Button variant="ghost" size="sm" className="mt-2 w-full justify-start gap-2" onClick={async () => { await signOut(); navigate("/"); }}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 pb-24 md:pb-0">
          <div className="md:hidden mb-4 flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-soft-sm">
            <Logo />
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg" onClick={async () => { await signOut(); navigate("/"); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          {children}
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 px-4 pt-3 backdrop-blur md:hidden"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}
      >
        <div className="mx-auto flex max-w-md items-center gap-2 rounded-[1.75rem] border border-border/80 bg-card p-2 shadow-soft-lg">
          <NavLink to="/dashboard" end className={() => mobileNavClass({ isActive: homeActive })}>
            <House className="mb-1 h-5 w-5" />
            Home
          </NavLink>
          <NavLink to="/saved" className={mobileNavClass}>
            <Bookmark className="mb-1 h-5 w-5" />
            Saved
          </NavLink>
          <NavLink to="/account" className={mobileNavClass}>
            <User className="mb-1 h-5 w-5" />
            Account
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
