"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import IntranetLayout from "@/components/layout/IntranetLayout";
import api from "@/lib/axios";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { AdminStudent } from "@/types/admin";
import {
  ClassroomEnrollment,
  ClassroomEnrollmentPayload,
  VirtualClassroom,
} from "@/types/academics";

const initialForm: ClassroomEnrollmentPayload = {
  student: 0,
  virtual_classroom: 0,
  status: "active",
  final_grade: null,
};

export default function AdminInscripcionesPage() {
  const [enrollments, setEnrollments] = useState<ClassroomEnrollment[]>([]);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [classrooms, setClassrooms] = useState<VirtualClassroom[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<ClassroomEnrollmentPayload>(initialForm);

  async function loadData() {
    try {
      const [enrollmentsRes, studentsRes, classroomsRes] = await Promise.all([
        api.get("/classroom-enrollments/"),
        api.get("/auth/students/"),
        api.get("/virtual-classrooms/"),
      ]);

      setEnrollments(enrollmentsRes.data);
      setStudents(studentsRes.data);
      setClassrooms(classroomsRes.data);
    } catch (err) {
      console.error("Error cargando inscripciones:", err);
      setError("No fue posible cargar las inscripciones académicas.");
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

  function getClassroomDisplayName(classroomId: number) {
    const classroom = classrooms.find((item) => item.id === classroomId);
    if (!classroom) return `Salón #${classroomId}`;
    return classroom.name;
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case "active":
        return "Activa";
      case "dropped":
        return "Baja";
      case "completed":
        return "Completada";
      default:
        return status;
    }
  }

  const filteredEnrollments = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return enrollments;

    return enrollments.filter((item) => {
      const studentName = (item.student_name || getStudentDisplayName(item.student)).toLowerCase();
      const studentCode = (item.student_code || "").toLowerCase();
      const classroomName = (item.classroom_name || getClassroomDisplayName(item.virtual_classroom)).toLowerCase();
      const statusLabel = getStatusLabel(item.status).toLowerCase();

      return (
        studentName.includes(term) ||
        studentCode.includes(term) ||
        classroomName.includes(term) ||
        statusLabel.includes(term)
      );
    });
  }, [enrollments, search, students, classrooms]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!form.student) {
      setError("Debes seleccionar un alumno.");
      setSubmitting(false);
      return;
    }

    if (!form.virtual_classroom) {
      setError("Debes seleccionar un salón virtual.");
      setSubmitting(false);
      return;
    }

    try {
      await api.post("/classroom-enrollments/", form);
      setForm(initialForm);
      await loadData();
    } catch (err: any) {
      console.error("Error creando inscripción:", err.response?.data || err);
      setError("No fue posible crear la inscripción académica.");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(enrollment: ClassroomEnrollment, status: string) {
    try {
      await api.patch(`/classroom-enrollments/${enrollment.id}/`, {
        status,
      });
      await loadData();
    } catch (err: any) {
      console.error("Error actualizando inscripción:", err.response?.data || err);
      setError("No fue posible actualizar el estado de la inscripción.");
    }
  }

  async function updateFinalGrade(enrollment: ClassroomEnrollment, final_grade: string | null) {
    try {
      await api.patch(`/classroom-enrollments/${enrollment.id}/`, {
        final_grade,
      });
      await loadData();
    } catch (err: any) {
      console.error("Error actualizando calificación final:", err.response?.data || err);
      setError("No fue posible actualizar la calificación final.");
    }
  }

  async function deleteEnrollment(enrollmentId: number) {
    try {
      await api.delete(`/classroom-enrollments/${enrollmentId}/`);
      await loadData();
    } catch (err: any) {
      console.error("Error eliminando inscripción:", err.response?.data || err);
      setError("No fue posible eliminar la inscripción.");
    }
  }

  return (
    <IntranetLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>  
              <h1 className="text-3xl font-bold text-slate-900">
                Inscripciones académicas
              </h1>
              <p className="mt-2 text-slate-600">
                Gestiona la inscripción de alumnos en salones virtuales.
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
                  Inscripciones registradas
                </h2>
                <p className="text-sm text-slate-500">
                  Total: {filteredEnrollments.length}
                </p>
              </div>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por alumno, matrícula, salón o estado"
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
                  Cargando inscripciones académicas...
                </p>
              ) : filteredEnrollments.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No se encontraron inscripciones académicas.
                </p>
              ) : (
                filteredEnrollments.map((item) => (
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
                          Matrícula: {item.student_code || "N/D"}
                        </p>
                        <p className="text-sm text-slate-500">
                          Salón: {item.classroom_name || getClassroomDisplayName(item.virtual_classroom)}
                        </p>
                        <p className="text-sm text-slate-600">
                          Estado: {getStatusLabel(item.status)}
                        </p>
                        <p className="text-sm text-slate-600">
                          Calificación final: {item.final_grade ?? "Sin captura"}
                        </p>
                        <p className="text-xs text-slate-400">
                          Inscrito: {formatDate(item.enrolled_at)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => updateStatus(item, "active")}
                          className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700"
                        >
                          Activar
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
                          onClick={() => updateStatus(item, "completed")}
                          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700"
                        >
                          Completar
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
                          className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                        >
                          Calificación
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteEnrollment(item.id)}
                          className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
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
              Nueva inscripción
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
                  Salón virtual
                </label>
                <select
                  value={form.virtual_classroom}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      virtual_classroom: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                >
                  <option value={0}>Selecciona un salón virtual</option>
                  {classrooms
                    .filter((item) => item.status !== "closed" && item.status !== "cancelled")
                    .map((item) => (
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
                  <option value="active">Activa</option>
                  <option value="dropped">Baja</option>
                  <option value="completed">Completada</option>
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

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Guardando..." : "Crear inscripción"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </IntranetLayout>
  );
}