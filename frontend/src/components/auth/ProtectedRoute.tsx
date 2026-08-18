"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: string[];
};

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading, authenticated } = useAuth();

  useEffect(() => {
    if (!loading && !authenticated) {
      router.push("/login");
      return;
    }

    if (
      !loading &&
      authenticated &&
      allowedRoles &&
      user?.role &&
      !allowedRoles.includes(user.role.code)
    ) {
      router.push("/intranet");
    }
  }, [loading, authenticated, user, allowedRoles, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">Cargando...</p>
      </main>
    );
  }

  if (!authenticated) return null;

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role.code)) {
    return null;
  }

  return <>{children}</>;
}