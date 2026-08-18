"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import IntranetLayout from "@/components/layout/IntranetLayout";
import api from "@/lib/axios";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import {
  AdminCareer,
  AdminRole,
  AdminStudent,
  AdminStudentCreatePayload,
  AdminStudyPlan,
} from "@/types/admin";

function getFullName(firstName?: string, lastName?: string) {
  return `${firstName ?? ""} ${lastName ?? ""}`.trim();
}

const initialForm: AdminStudentCreatePayload = {
  user: {
    email: "",
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    role_id: 0,
  },
  student_code: "",
  career: 0,
  study_plan: 0,
  enrollment_date: "",
  status: "active",
  birth_date: "",
  address: "",
};

export default function AdminAlumnosPage() {
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [careers, setCareers] = useState<AdminCareer[]>([]);
  const [studyPlans, setStudyPlans] = useState<AdminStudyPlan[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<AdminStudentCreatePayload>(initialForm);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [studentsRes, rolesRes, careersRes, studyPlansRes] = await Promise.all([
        api.get("/auth/students/"),
        api.get("/auth/roles/"),
        api.get("/careers/"),
        api.get("/study-plans/"),
      ]);

      setStudents(studentsRes.data);
      setRoles(rolesRes.data);
      setCareers(careersRes.data);
      setStudyPlans(studyPlansRes.data);

      const studentRole = rolesRes.data.find((role: AdminRole) => role.code === "student");

      if (studentRole) {
        setForm((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            role_id: studentRole.id,
          },
        }));
      }
    } catch (err) {
      console.error("Error cargando alumnos:", err);
      setError("No fue posible cargar la información de alumnos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredStudyPlans = useMemo(() => {
    if (!form.career) return studyPlans;
    return studyPlans.filter((item) => item.career === form.career);
  }, [form.career, studyPlans]);

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return students;

    return students.filter((item) => {
      const fullName = getFullName(
        item.user?.first_name,
        item.user?.last_name
      ).toLowerCase();

      return (
        fullName.includes(term) ||
        item.user?.email?.toLowerCase().includes(term) ||
        item.user?.username?.toLowerCase().includes(term) ||
        item.student_code?.toLowerCase().includes(term) ||
        item.status?.toLowerCase().includes(term)
      );
    });
  }, [search, students]);

  function getCareerName(careerId?: number | null) {
    if (!careerId) return "N/D";
    return careers.find((item) => item.id === careerId)?.name ?? "N/D";
  }

  function getStudyPlanName(studyPlanId?: number | null) {
    if (!studyPlanId) return "N/D";
    return studyPlans.find((item) => item.id === studyPlanId)?.name ?? "N/D";
  }  

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!form.career) {
    setError("Debes seleccionar una carrera.");
    setSubmitting(false);
    return;
    }

    if (!form.study_plan) {
    setError("Debes seleccionar un plan de estudio.");
    setSubmitting(false);
    return;
    }

    if (!form.user.role_id) {
    setError("No se encontró el rol de alumno.");
    setSubmitting(false);
    return;
    }    

    try {
      await api.post("/auth/students/", form);
      setForm((prev) => ({
        ...initialForm,
        user: {
          ...initialForm.user,
          role_id: prev.user.role_id,
        },
      }));
      await loadData();
    } catch (err: any) {
      console.error("Error creando alumno:", err);
      console.error("Detalle backend:", err?.response?.data);

      const data = err?.response?.data;

      if (data && typeof data === "object") {
        const messages: string[] = [];

        Object.entries(data).forEach(([field, value]) => {
          if (Array.isArray(value)) {
            value.forEach((msg) => messages.push(`${field}: ${msg}`));
          } else if (typeof value === "string") {
            messages.push(`${field}: ${value}`);
          } else if (value && typeof value === "object") {
            // Para errores anidados (ej. user.email)
            Object.entries(value as Record<string, any>).forEach(([subField, subVal]) => {
              if (Array.isArray(subVal)) {
                subVal.forEach((msg) => messages.push(`${field}.${subField}: ${msg}`));
              } else {
                messages.push(`${field}.${subField}: ${String(subVal)}`);
              }
            });
          }
        });

        setError(
          messages.length
            ? messages.join(" | ")
            : "No fue posible crear el alumno. Revisa los campos capturados."
        );
      } else if (typeof data === "string") {
        setError(data);
      } else {
        setError("No fue posible crear el alumno. Revisa los campos capturados.");
      }
    }
  }

  return (
    <IntranetLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>  
              <h1 className="text-3xl font-bold text-slate-900">
                Administración de alumnos
              </h1>
              <p className="mt-2 text-slate-600">
                Gestiona expedientes estudiantiles, cuentas y datos escolares.
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
                  Alumnos registrados
                </h2>
                <p className="text-sm text-slate-500">
                  Total: {filteredStudents.length}
                </p>
              </div>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, email, matrícula o estado"
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
                <p className="text-sm text-slate-500">Cargando alumnos...</p>
              ) : filteredStudents.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No se encontraron alumnos.
                </p>
              ) : (
                filteredStudents.map((item) => {
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
                        {fullName || item.user?.username || "Alumno"}
                      </p>
                      <p className="text-sm text-slate-500">
                        Matrícula: {item.student_code ?? "N/D"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {item.user?.email ?? "Sin correo"}
                      </p>
                      <p className="text-sm text-slate-500">
                        Usuario: {item.user?.username ?? "N/D"}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        Estado: {item.status ?? "N/D"}
                      </p>
                      <p className="text-sm text-slate-600">
                        Carrera: {getCareerName(item.career)}
                      </p>
                      <p className="text-sm text-slate-600">
                        Plan de estudio: {getStudyPlanName(item.study_plan)}
                      </p>
                      <p className="text-sm text-slate-600">
                        Inscripción: {formatDate(item.enrollment_date)}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Nuevo alumno
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
                  Matrícula
                </label>
                <input
                  type="text"
                  value={form.student_code}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, student_code: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Carrera
                </label>
                <select
                  value={form.career}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      career: Number(e.target.value),
                      study_plan: 0,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                >
                  <option value={0}>Selecciona una carrera</option>
                  {careers
                    .filter((item) => item.active)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>

            <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
                Plan de estudio
            </label>
            <select
                value={form.study_plan}
                onChange={(e) =>
                setForm((prev) => ({
                    ...prev,
                    study_plan: Number(e.target.value),
                }))
                }
                disabled={!form.career || filteredStudyPlans.length === 0}
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100"
                required
            >
                <option value={0}>
                {!form.career
                    ? "Primero selecciona una carrera"
                    : filteredStudyPlans.length === 0
                    ? "No hay planes para esta carrera"
                    : "Selecciona un plan de estudio"}
                </option>

                {filteredStudyPlans
                .filter((item) => item.active)
                .map((item) => (
                    <option key={item.id} value={item.id}>
                    {item.name}
                    </option>
                ))}
            </select>
            </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Fecha de inscripción
                  </label>
                  <input
                    type="date"
                    value={form.enrollment_date}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        enrollment_date: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Fecha de nacimiento
                  </label>
                  <input
                    type="date"
                    value={form.birth_date}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        birth_date: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Estado
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="suspended">Suspendido</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Dirección
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, address: e.target.value }))
                  }
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Guardando..." : "Crear alumno"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </IntranetLayout>
  );
}