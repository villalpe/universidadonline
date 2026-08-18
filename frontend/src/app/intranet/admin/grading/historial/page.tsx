"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import IntranetLayout from "@/components/layout/IntranetLayout";
import api from "@/lib/axios";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { AdminStudent } from "@/types/admin";
import {
  AcademicHistory,
  AcademicHistoryPayload,
  AcademicPeriod,
  Subject,
} from "@/types/academics";

const initialForm: AcademicHistoryPayload = {
  student: 0,
  subject: 0,
  academic_period: 0,
  final_grade: null,
  status: "in_progress",
  observations: "",
};

export default function AdminHistorialAcademicoPage() {
  const [records, setRecords] = useState<AcademicHistory[]>([]);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<AcademicHistoryPayload>(initialForm);

  async function loadData() {
    try {
      const [recordsRes, studentsRes, subjectsRes, periodsRes] =
        await Promise.all([
          api.get("/academic-history/"),
          api.get("/auth/students/"),
          api.get("/subjects/"),
          api.get("/academic-periods/"),
        ]);

      setRecords(recordsRes.data);
      setStudents(studentsRes.data);
      setSubjects(subjectsRes.data);
      setPeriods(periodsRes.data);
    } catch (err) {
      console.error("Error cargando historial académico:", err);
      setError("No fue posible cargar el historial académico.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function getStudentDisplayName(studentId: number) {
    const student = students.find((item) => item.id === studentId);
    if (!student) return `Alumno #${studentId}`;

    return (
      `${student.user?.first_name ?? ""} ${student.user?.last_name ?? ""}`.trim() ||
      student.user?.username ||
      `Alumno #${studentId}`
    );
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case "in_progress":
        return "En progreso";
      case "passed":
        return "Aprobada";
      case "failed":
        return "Reprobada";
      case "dropped":
        return "Baja";
      default:
        return status;
    }
  }

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return records;

    return records.filter((item) => {
      const studentName = (item.student_name || getStudentDisplayName(item.student)).toLowerCase();
      const subjectName = (item.subject_name || "").toLowerCase();
      const periodName = (item.academic_period_name || "").toLowerCase();
      const statusLabel = getStatusLabel(item.status).toLowerCase();

      return (
        studentName.includes(term) ||
        subjectName.includes(term) ||
        periodName.includes(term) ||
        statusLabel.includes(term)
      );
    });
  }, [records, search, students]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!form.student) {
      setError("Debes seleccionar un alumno.");
      setSubmitting(false);
      return;
    }

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

    try {
      await api.post("/academic-history/", form);
      setForm(initialForm);
      await loadData();
    } catch (err: any) {
      console.error("Error creando historial académico:", err.response?.data || err);
      setError("No fue posible crear el historial académico.");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(record: AcademicHistory, status: string) {
    try {
      await api.patch(`/academic-history/${record.id}/`, { status });
      await loadData();
    } catch (err: any) {
      console.error("Error actualizando estado:", err.response?.data || err);
      setError("No fue posible actualizar el estado del historial.");
    }
  }

  async function updateFinalGrade(record: AcademicHistory, final_grade: string | null) {
    try {
      await api.patch(`/academic-history/${record.id}/`, { final_grade });
      await loadData();
    } catch (err: any) {
      console.error("Error actualizando calificación final:", err.response?.data || err);
      setError("No fue posible actualizar la calificación final.");
    }
  }

  async function deleteRecord(recordId: number) {
    try {
      await api.delete(`/academic-history/${recordId}/`);
      await loadData();
    } catch (err: any) {
      console.error("Error eliminando historial académico:", err.response?.data || err);
      setError("No fue posible eliminar el historial académico.");
    }
  }

  return (
    <IntranetLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>  
              <h1 className="text-3xl font-bold text-slate-900">
                Historial académico
              </h1>
              <p className="mt-2 text-slate-600">
                Administra el resultado final de materias por alumno y período.
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
                  Registros del historial
                </h2>
                <p className="text-sm text-slate-500">
                  Total: {filteredRecords.length}
                </p>
              </div>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por alumno, materia, período o estado"
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
                  Cargando historial académico...
                </p>
              ) : filteredRecords.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No se encontraron registros de historial académico.
                </p>
              ) : (
                filteredRecords.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.student_name || getStudentDisplayName(item.student)}
                        </p>
                        <p className="text-sm text-slate-500">
                          Materia: {item.subject_name}
                        </p>
                        <p className="text-sm text-slate-500">
                          Período: {item.academic_period_name}
                        </p>
                        <p className="text-sm text-slate-600">
                          Estado: {getStatusLabel(item.status)}
                        </p>
                        <p className="text-sm text-slate-600">
                          Calificación final: {item.final_grade ?? "Sin captura"}
                        </p>
                        <p className="text-sm text-slate-600">
                          {item.observations || "Sin observaciones"}
                        </p>
                        <p className="text-xs text-slate-400">
                          Actualizado: {formatDate(item.updated_at)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => updateStatus(item, "in_progress")}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                        >
                          En progreso
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus(item, "passed")}
                          className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700"
                        >
                          Aprobada
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus(item, "failed")}
                          className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
                        >
                          Reprobada
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus(item, "dropped")}
                          className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-medium text-white hover:bg-amber-700"
                        >
                          Baja
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const value = window.prompt(
                              "Captura la calificación final",
                              item.final_grade ?? ""
                            );

                            if (value === null) return;
                            updateFinalGrade(item, value || null);
                          }}
                          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700"
                        >
                          Calificación
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteRecord(item.id)}
                          className="rounded-lg bg-slate-500 px-3 py-2 text-xs font-medium text-white hover:bg-slate-600"
                        >
                          Eliminar
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
              Nuevo registro
            </h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Alumno
                </label>
                <select
                  value={form.student}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      student: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                >
                  <option value={0}>Selecciona un alumno</option>
                  {students.map((item) => {
                    const fullName =
                      `${item.user?.first_name ?? ""} ${item.user?.last_name ?? ""}`.trim() ||
                      item.user?.username ||
                      `Alumno #${item.id}`;

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
                  <option value={0}>Selecciona un período</option>
                  {periods.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Estado
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                >
                  <option value="in_progress">En progreso</option>
                  <option value="passed">Aprobada</option>
                  <option value="failed">Reprobada</option>
                  <option value="dropped">Baja</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Calificación final
                </label>
                <input
                  type="text"
                  value={form.final_grade ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      final_grade: e.target.value || null,
                    }))
                  }
                  placeholder="Opcional"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Observaciones
                </label>
                <textarea
                  value={form.observations}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      observations: e.target.value,
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
                {submitting ? "Guardando..." : "Crear registro"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </IntranetLayout>
  );
}