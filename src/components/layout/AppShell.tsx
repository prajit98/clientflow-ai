import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, User, Shield, LogOut, Sparkles } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: ReactNode }) {
  const { isAdmin, signOut, user } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    }`;

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

        <main className="min-w-0 flex-1">
          <div className="md:hidden mb-4 flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-soft-sm">
            <Logo />
            <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate("/"); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          <div className="md:hidden mb-4 flex gap-2 overflow-x-auto">
            <NavLink to="/dashboard" className={linkClass}>Opportunities</NavLink>
            <NavLink to="/account" className={linkClass}>Account</NavLink>
            {isAdmin && <NavLink to="/admin" className={linkClass}>Moderation</NavLink>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}