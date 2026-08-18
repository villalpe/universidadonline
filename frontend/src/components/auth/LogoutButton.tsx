"use client";

import { useAuth } from "@/components/auth/AuthProvider";

export default function LogoutButton() {
  const { logout } = useAuth();

  return (
    <button
      onClick={logout}
      className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
    >
      Cerrar sesión
    </button>
  );
}