import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function RequireAuth({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-gradient-soft">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (admin && !isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}