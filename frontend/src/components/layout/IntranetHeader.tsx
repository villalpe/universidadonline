"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import LogoutButton from "@/components/auth/LogoutButton";

export default function IntranetHeader() {
  const { user } = useAuth();

  const fullName =
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() || user?.email;

  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Corporativo Escolar Grupo IMEI en Línea</h1>
        <p className="text-sm text-slate-500">
          {fullName} · {user?.role?.name ?? "Sin rol"}
        </p>
      </div>

      <LogoutButton />
    </header>
  );
}