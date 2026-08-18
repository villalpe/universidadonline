"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import IntranetLayout from "@/components/layout/IntranetLayout";
import api from "@/lib/axios";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import { AdminRole, AdminUser, AdminUserCreatePayload } from "@/types/admin";

function getFullName(firstName?: string, lastName?: string) {
  return `${firstName ?? ""} ${lastName ?? ""}`.trim();
}

const initialForm: AdminUserCreatePayload = {
  email: "",
  username: "",
  password: "",
  first_name: "",
  last_name: "",
  phone: "",
  role_id: 0,
};

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<AdminUserCreatePayload>(initialForm);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get("/auth/users/"),
        api.get("/auth/roles/"),
      ]);

      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      setError("No fue posible cargar la información de usuarios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return users;

    return users.filter((item) => {
      const fullName = getFullName(item.first_name, item.last_name).toLowerCase();

      return (
        fullName.includes(term) ||
        item.email.toLowerCase().includes(term) ||
        item.username.toLowerCase().includes(term) ||
        item.role?.name?.toLowerCase().includes(term) ||
        item.role?.code?.toLowerCase().includes(term)
      );
    });
  }, [search, users]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await api.post("/auth/users/", form);
      setForm(initialForm);
      await loadData();
    } catch (err: any) {
      console.error("Error creando usuario:", err);
      setError("No fue posible crear el usuario. Revisa los campos capturados.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleUserStatus(user: AdminUser) {
    try {
      await api.patch(`/auth/users/${user.id}/`, {
        is_active: !user.is_active,
      });
      await loadData();
    } catch (err) {
      console.error("Error actualizando estado del usuario:", err);
      setError("No fue posible actualizar el estado del usuario.");
    }
  }

  return (
    <IntranetLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Administración de usuarios
              </h1>
              <p className="mt-2 text-slate-600">
                Gestiona usuarios del sistema, roles y estado de acceso.
              </p>
            </div>
            <div className="flex justify-end">
              <Image
                src="/images/logo.png"
                alt="Logo corporativo Universidad IMEI SJR"
                width={160}
                height={160}
                className="h-20 w-auto object-contain md:h-24"
              />
            </div>            
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr,380px]">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Usuarios registrados
                </h2>
                <p className="text-sm text-slate-500">
                  Total: {filteredUsers.length}
                </p>
              </div>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, email, usuario o rol"
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500 md:max-w-sm"
              />
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-4 space-y-4">
              {loading ? (
                <p className="text-sm text-slate-500">Cargando usuarios...</p>
              ) : filteredUsers.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No se encontraron usuarios.
                </p>
              ) : (
                filteredUsers.map((item) => {
                  const fullName = getFullName(item.first_name, item.last_name);

                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {fullName || item.username}
                          </p>
                          <p className="text-sm text-slate-500">{item.email}</p>
                          <p className="text-sm text-slate-500">
                            Usuario: {item.username}
                          </p>
                          <p className="text-sm text-slate-500">
                            Rol: {item.role?.name ?? "Sin rol"}
                          </p>
                          <p className="text-sm text-slate-500">
                            Teléfono: {item.phone || "N/D"}
                          </p>
                          <p className="mt-2 text-sm text-slate-600">
                            Estado: {item.is_active ? "Activo" : "Inactivo"}
                          </p>
                          <p className="text-xs text-slate-400">
                            Creado: {formatDate(item.created_at)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleUserStatus(item)}
                          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                        >
                          {item.is_active ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Nuevo usuario
            </h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Username
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, username: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, first_name: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, last_name: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Rol
                </label>
                <select
                  value={form.role_id}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      role_id: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                >
                  <option value={0}>Selecciona un rol</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  minLength={8}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Guardando..." : "Crear usuario"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </IntranetLayout>
  );
}