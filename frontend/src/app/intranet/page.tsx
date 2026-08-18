"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";

export default function IntranetHomePage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.role?.code) return;

    if (user.role.code === "student") {
      router.replace("/intranet/alumno");
      return;
    }

    if (user.role.code === "teacher") {
      router.replace("/intranet/profesor");
      return;
    }

    if (user.role.code === "admin") {
      router.replace("/intranet/admin");
      return;
    }

    router.replace("/login");
  }, [user, router]);

  return (
    <ProtectedRoute>
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">Redirigiendo...</p>
      </main>
    </ProtectedRoute>
  );
}