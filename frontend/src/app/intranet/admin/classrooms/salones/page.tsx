"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import IntranetLayout from "@/components/layout/IntranetLayout";
import api from "@/lib/axios";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { AdminTeacher } from "@/types/admin";
import {
  AcademicPeriod,
  StudyPlan,
  Subject,
  VirtualClassroom,
  VirtualClassroomPayload,
} from "@/types/academics";

const initialForm: VirtualClassroomPayload = {
  code: "",
  name: "",
  subject: 0,
  academic_period: 0,
  study_plan: null,
  main_teacher: null,
  max_students: 30,
  start_date: "",
  end_date: "",
  status: "draft",
  description: "",
};

export default function AdminSalonesVirtualesPage() {
  const [classrooms, setClassrooms] = useState<VirtualClassroom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<VirtualClassroomPayload>(initialForm);

  async function loadData() {
    try {
      const [classroomsRes, subjectsRes, periodsRes, plansRes, teachersRes] =
        await Promise.all([
          api.get("/virtual-classrooms/"),
          api.get("/subjects/"),
          api.get("/academic-periods/"),
          api.get("/study-plans/"),
          api.get("/auth/teachers/"),
        ]);

      setClassrooms(classroomsRes.data);
      setSubjects(subjectsRes.data);
      setPeriods(periodsRes.data);
      setStudyPlans(plansRes.data);
      setTeachers(teachersRes.data);
    } catch (err) {
      console.error("Error cargando salones virtuales:", err);
      setError("No fue posible cargar la información de salones virtuales.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function getTeacherName(teacherId: number | null) {
    if (!teacherId) return "Sin profesor principal";

    const teacher = teachers.find((item) => item.id === teacherId);
    if (!teacher) return "Profesor no encontrado";

    return `${teacher.user?.first_name ?? ""} ${teacher.user?.last_name ?? ""}`.trim() || teacher.user?.username || "Profesor";
  }

  const filteredClassrooms = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return classrooms;

    return classrooms.filter((item) => {
      return (
        item.code.toLowerCase().includes(term) ||
        item.name.toLowerCase().includes(term) ||
        item.subject_name?.toLowerCase().includes(term) ||
        item.academic_period_name?.toLowerCase().includes(term) ||
        item.main_teacher_name?.toLowerCase().includes(term) ||
        item.status.toLowerCase().includes(term)
      );
    });
  }, [classrooms, search]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!form.subject) {
      setError("Debes seleccionar una materia.");
      setSubmitting(false);
      return;
    }

    if (!form.academic_period) {
      setError("Debes seleccionar un período académico.");
      setSubmitting(false);
      return;
    }

    if (form.end_date < form.start_date) {
      setError("La fecha de fin no puede ser menor que la fecha de inicio.");
      setSubmitting(false);
      return;
    }

    try {
      await api.post("/virtual-classrooms/", form);
      setForm(initialForm);
      await loadData();
    } catch (err: any) {
      console.error("Error creando salón virtual:", err.response?.data || err);
      setError("No fue posible crear el salón virtual. Revisa los campos capturados.");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(classroom: VirtualClassroom, status: string) {
    try {
      await api.patch(`/virtual-classrooms/${classroom.id}/`, { status });
      await loadData();
    } catch (err: any) {
      console.error("Error actualizando salón virtual:", err.response?.data || err);
      setError("No fue posible actualizar el estado del salón virtual.");
    }
  }

  return (
    <IntranetLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Salones virtuales
              </h1>
              <p className="mt-2 text-slate-600">
                Administra la oferta académica operativa por materia, período y docente.
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

        <section className="grid gap-6 lg:grid-cols-[1fr,430px]">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Salones registrados
                </h2>
                <p className="text-sm text-slate-500">
                  Total: {filteredClassrooms.length}
                </p>
              </div>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por código, nombre, materia, período o estado"
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
                <p className="text-sm text-slate-500">
                  Cargando salones virtuales...
                </p>
              ) : filteredClassrooms.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No se encontraron salones virtuales.
                </p>
              ) : (
                filteredClassrooms.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          Código: {item.code}
                        </p>
                        <p className="text-sm text-slate-500">
                          Materia: {item.subject_name}
                        </p>
                        <p className="text-sm text-slate-500">
                          Período: {item.academic_period_name}
                        </p>
                        <p className="text-sm text-slate-500">
                          Profesor principal: {item.main_teacher_name || getTeacherName(item.main_teacher)}
                        </p>
                        <p className="text-sm text-slate-500">
                          Cupo máximo: {item.max_students}
                        </p>
                        <p className="text-sm text-slate-500">
                          Fechas: {formatDate(item.start_date)} - {formatDate(item.end_date)}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                          Estado: {item.status}
                        </p>
                        <p className="text-sm text-slate-600">
                          {item.description || "Sin descripción"}
                        </p>
                        <p className="text-xs text-slate-400">
                          Actualizado: {formatDate(item.updated_at)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => updateStatus(item, "draft")}
                          className="rounded-lg bg-slate-600 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700"
                        >
                          Borrador
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus(item, "active")}
                          className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700"
                        >
                          Activar
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus(item, "closed")}
                          className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-medium text-white hover:bg-amber-700"
                        >
                          Cerrar
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus(item, "cancelled")}
                          className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Nuevo salón virtual
            </h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Código
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, code: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Nombre
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Materia
                </label>
                <select
                  value={form.subject}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      subject: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                >
                  <option value={0}>Selecciona una materia</option>
                  {subjects
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
                  Período académico
                </label>
                <select
                  value={form.academic_period}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      academic_period: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                >
                  <option value={0}>Selecciona un período académico</option>
                  {periods.map((item) => (
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
                  value={form.study_plan ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      study_plan: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                >
                  <option value="">Sin plan específico</option>
                  {studyPlans
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
                  Profesor principal
                </label>
                <select
                  value={form.main_teacher ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      main_teacher: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                >
                  <option value="">Sin profesor principal</option>
                  {teachers.map((item) => {
                    const fullName =
                      `${item.user?.first_name ?? ""} ${item.user?.last_name ?? ""}`.trim() ||
                      item.user?.username ||
                      `Profesor #${item.id}`;

                    return (
                      <option key={item.id} value={item.id}>
                        {fullName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Cupo máximo
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.max_students}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      max_students: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Fecha inicio
                  </label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        start_date: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Fecha fin
                  </label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        end_date: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                    required
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
                  <option value="draft">Borrador</option>
                  <option value="active">Activo</option>
                  <option value="closed">Cerrado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Descripción
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Guardando..." : "Crear salón virtual"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </IntranetLayout>
  );
}