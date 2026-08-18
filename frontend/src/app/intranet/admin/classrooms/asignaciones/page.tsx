"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import IntranetLayout from "@/components/layout/IntranetLayout";
import api from "@/lib/axios";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { AdminTeacher } from "@/types/admin";
import {
  TeacherAssignment,
  TeacherAssignmentPayload,
  VirtualClassroom,
} from "@/types/academics";

const initialForm: TeacherAssignmentPayload = {
  teacher: 0,
  virtual_classroom: 0,
  role_in_class: "main",
};

export default function AdminAsignacionesDocentesPage() {
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [classrooms, setClassrooms] = useState<VirtualClassroom[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<TeacherAssignmentPayload>(initialForm);

  async function loadData() {
    try {
      const [assignmentsRes, teachersRes, classroomsRes] = await Promise.all([
        api.get("/teacher-assignments/"),
        api.get("/auth/teachers/"),
        api.get("/virtual-classrooms/"),
      ]);

      setAssignments(assignmentsRes.data);
      setTeachers(teachersRes.data);
      setClassrooms(classroomsRes.data);
    } catch (err) {
      console.error("Error cargando asignaciones docentes:", err);
      setError("No fue posible cargar las asignaciones docentes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function getTeacherDisplayName(teacherId: number) {
    const teacher = teachers.find((item) => item.id === teacherId);
    if (!teacher) return `Profesor #${teacherId}`;

    return (
      `${teacher.user?.first_name ?? ""} ${teacher.user?.last_name ?? ""}`.trim() ||
      teacher.user?.username ||
      `Profesor #${teacherId}`
    );
  }

  function getClassroomDisplayName(classroomId: number) {
    const classroom = classrooms.find((item) => item.id === classroomId);
    if (!classroom) return `Salón #${classroomId}`;
    return classroom.name;
  }

  function getRoleLabel(role: string) {
    switch (role) {
      case "main":
        return "Profesor titular";
      case "assistant":
        return "Asistente";
      case "reviewer":
        return "Revisor";
      default:
        return role;
    }
  }

  const filteredAssignments = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return assignments;

    return assignments.filter((item) => {
      const teacherName = (item.teacher_name || getTeacherDisplayName(item.teacher)).toLowerCase();
      const classroomName = (item.classroom_name || getClassroomDisplayName(item.virtual_classroom)).toLowerCase();
      const roleLabel = getRoleLabel(item.role_in_class).toLowerCase();

      return (
        teacherName.includes(term) ||
        classroomName.includes(term) ||
        roleLabel.includes(term)
      );
    });
  }, [assignments, search, teachers, classrooms]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!form.teacher) {
      setError("Debes seleccionar un profesor.");
      setSubmitting(false);
      return;
    }

    if (!form.virtual_classroom) {
      setError("Debes seleccionar un salón virtual.");
      setSubmitting(false);
      return;
    }

    try {
      await api.post("/teacher-assignments/", form);
      setForm(initialForm);
      await loadData();
    } catch (err: any) {
      console.error("Error creando asignación docente:", err.response?.data || err);
      setError("No fue posible crear la asignación docente.");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateRole(assignment: TeacherAssignment, role_in_class: string) {
    try {
      await api.patch(`/teacher-assignments/${assignment.id}/`, {
        role_in_class,
      });
      await loadData();
    } catch (err: any) {
      console.error("Error actualizando asignación docente:", err.response?.data || err);
      setError("No fue posible actualizar el rol de la asignación docente.");
    }
  }

  async function deleteAssignment(assignmentId: number) {
    try {
      await api.delete(`/teacher-assignments/${assignmentId}/`);
      await loadData();
    } catch (err: any) {
      console.error("Error eliminando asignación docente:", err.response?.data || err);
      setError("No fue posible eliminar la asignación docente.");
    }
  }

  return (
    <IntranetLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>  
              <h1 className="text-3xl font-bold text-slate-900">
                Asignaciones docentes
              </h1>
              <p className="mt-2 text-slate-600">
                Asigna profesores a salones virtuales con un rol específico.
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
                  Asignaciones registradas
                </h2>
                <p className="text-sm text-slate-500">
                  Total: {filteredAssignments.length}
                </p>
              </div>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por profesor, salón o rol"
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
                  Cargando asignaciones docentes...
                </p>
              ) : filteredAssignments.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No se encontraron asignaciones docentes.
                </p>
              ) : (
                filteredAssignments.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.teacher_name || getTeacherDisplayName(item.teacher)}
                        </p>
                        <p className="text-sm text-slate-500">
                          Salón: {item.classroom_name || getClassroomDisplayName(item.virtual_classroom)}
                        </p>
                        <p className="text-sm text-slate-600">
                          Rol: {getRoleLabel(item.role_in_class)}
                        </p>
                        <p className="text-xs text-slate-400">
                          Asignado: {formatDate(item.assigned_at)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => updateRole(item, "main")}
                          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700"
                        >
                          Titular
                        </button>
                        <button
                          type="button"
                          onClick={() => updateRole(item, "assistant")}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                        >
                          Asistente
                        </button>
                        <button
                          type="button"
                          onClick={() => updateRole(item, "reviewer")}
                          className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-medium text-white hover:bg-amber-700"
                        >
                          Revisor
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteAssignment(item.id)}
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
              Nueva asignación
            </h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Profesor
                </label>
                <select
                  value={form.teacher}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      teacher: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                >
                  <option value={0}>Selecciona un profesor</option>
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
                  {classrooms.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Rol en clase
                </label>
                <select
                  value={form.role_in_class}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      role_in_class: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                >
                  <option value="main">Profesor titular</option>
                  <option value="assistant">Asistente</option>
                  <option value="reviewer">Revisor</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Guardando..." : "Crear asignación"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </IntranetLayout>
  );
}