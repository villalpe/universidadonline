"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import api from "@/lib/axios";
import { saveTokens } from "@/lib/auth";
import { LoginPayload, TokenResponse } from "@/types/auth";
import { useAuth } from "@/components/auth/AuthProvider";

const loginSchema = z.object({
  email: z.email("Correo inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export default function LoginForm() {
  const router = useRouter();
  const { fetchMe } = useAuth();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginPayload) => {
    try {
      setServerError("");

      const response = await api.post<TokenResponse>("/auth/login/", data);
      saveTokens(response.data.access, response.data.refresh);

      await fetchMe();
      router.push("/intranet");
    } catch {
      setServerError("Credenciales inválidas. Verifica tus datos.");
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Correo electrónico
        </label>
        <input
          type="email"
          {...register("email")}
          className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Contraseña
        </label>
        <input
          type="password"
          {...register("password")}
          className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {isSubmitting ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}