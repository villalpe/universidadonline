"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import IntranetLayout from "@/components/layout/IntranetLayout";
import api from "@/lib/axios";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import {
  AdminRole,
  AdminTeacher,
  AdminTeacherCreatePayload,
} from "@/types/admin";

function getFullName(firstName?: string, lastName?: string) {
  return `${firstName ?? ""} ${lastName ?? ""}`.trim();
}

const initialForm: AdminTeacherCreatePayload = {
  user: {
    email: "",
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    role_id: 0,
  },
  employee_code: "",
  specialty: "",
  hire_date: "",
};

export default function AdminProfesoresPage() {
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<AdminTeacherCreatePayload>(initialForm);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [teachersRes, rolesRes] = await Promise.all([
        api.get("/auth/teachers/"),
        api.get("/auth/roles/"),
      ]);

      setTeachers(teachersRes.data);
      setRoles(rolesRes.data);

      const teacherRole = rolesRes.data.find(
        (role: AdminRole) => role.code === "teacher"
      );

      if (teacherRole) {
        setForm((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            role_id: teacherRole.id,
          },
        }));
      }
    } catch (err) {
      console.error("Error cargando profesores:", err);
      setError("No fue posible cargar la información de profesores.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredTeachers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return teachers;

    return teachers.filter((item) => {
      const fullName = getFullName(
        item.user?.first_name,
        item.user?.last_name
      ).toLowerCase();

      return (
        fullName.includes(term) ||
        item.user?.email?.toLowerCase().includes(term) ||
        item.user?.username?.toLowerCase().includes(term) ||
        item.employee_code?.toLowerCase().includes(term) ||
        item.specialty?.toLowerCase().includes(term)
      );
    });
  }, [search, teachers]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!form.user.role_id) {
      setError("No se encontró el rol de profesor.");
      setSubmitting(false);
      return;
    }

    try {
      await api.post("/auth/teachers/", form);
      setForm((prev) => ({
        ...initialForm,
        user: {
          ...initialForm.user,
          role_id: prev.user.role_id,
        },
      }));
      await loadData();
    } catch (err: any) {
      console.error("Error creando profesor:", err.response?.data || err);
      setError("No fue posible crear el profesor. Revisa los campos capturados.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <IntranetLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>  
              <h1 className="text-3xl font-bold text-slate-900">
                Administración de profesores
              </h1>
              <p className="mt-2 text-slate-600">
                Gestiona cuentas docentes, claves internas y especialidades.
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

        <section className="grid gap-6 lg:grid-cols-[1fr,420px]">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Profesores registrados
                </h2>
                <p className="text-sm text-slate-500">
                  Total: {filteredTeachers.length}
                </p>
              </div>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, email, clave o especialidad"
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
                <p className="text-sm text-slate-500">Cargando profesores...</p>
              ) : filteredTeachers.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No se encontraron profesores.
                </p>
              ) : (
                filteredTeachers.map((item) => {
                  const fullName = getFullName(
                    item.user?.first_name,
                    item.user?.last_name
                  );

                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <p className="font-semibold text-slate-900">
                        {fullName || item.user?.username || "Profesor"}
                      </p>
                      <p className="text-sm text-slate-500">
                        Clave: {item.employee_code ?? "N/D"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {item.user?.email ?? "Sin correo"}
                      </p>
                      <p className="text-sm text-slate-500">
                        Usuario: {item.user?.username ?? "N/D"}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        Especialidad: {item.specialty ?? "N/D"}
                      </p>
                      <p className="text-sm text-slate-600">
                        Contratación: {formatDate(item.hire_date)}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Nuevo profesor
            </h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={form.user.email}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      user: { ...prev.user, email: e.target.value },
                    }))
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
                  value={form.user.username}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      user: { ...prev.user, username: e.target.value },
                    }))
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
                    value={form.user.first_name}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        user: { ...prev.user, first_name: e.target.value },
                      }))
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
                    value={form.user.last_name}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        user: { ...prev.user, last_name: e.target.value },
                      }))
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
                  value={form.user.phone}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      user: { ...prev.user, phone: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={form.user.password}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      user: { ...prev.user, password: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  minLength={8}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Clave de empleado
                </label>
                <input
                  type="text"
                  value={form.employee_code}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      employee_code: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Especialidad
                </label>
                <input
                  type="text"
                  value={form.specialty}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      specialty: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Fecha de contratación
                </label>
                <input
                  type="date"
                  value={form.hire_date}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      hire_date: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Guardando..." : "Crear profesor"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </IntranetLayout>
  );
}