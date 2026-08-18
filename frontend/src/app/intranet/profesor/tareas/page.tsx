"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import IntranetLayout from "@/components/layout/IntranetLayout";
import api from "@/lib/axios";
import { formatDate } from "@/lib/utils";
import {
  Assignment,
  VirtualClassroom,
  WeeklyModule,
} from "@/types/academics";

interface AssignmentPayload {
  weekly_module: number;
  title: string;
  instructions: string;
  due_date: string;
  max_score: string;
  allow_text_submission: boolean;
  is_published: boolean;
}

const initialForm: AssignmentPayload = {
  weekly_module: 0,
  title: "",
  instructions: "",
  due_date: "",
  max_score: "100",
  allow_text_submission: true,
  is_published: false,
};

export default function ProfesorTareasPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [modules, setModules] = useState<WeeklyModule[]>([]);
  const [classrooms, setClassrooms] = useState<VirtualClassroom[]>([]);
  const [search, setSearch] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState<number | "all">("all");
  const [selectedModule, setSelectedModule] = useState<number | "all">("all");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState<AssignmentPayload>(initialForm);

  async function loadData() {
    try {
      const [assignmentsRes, modulesRes, classroomsRes] = await Promise.all([
        api.get("/assignments/"),
        api.get("/weekly-modules/"),
        api.get("/auth/teacher/classrooms/"),
      ]);

      setAssignments(assignmentsRes.data);
      setModules(modulesRes.data);
      setClassrooms(classroomsRes.data);
    } catch (err) {
      console.error("Error cargando tareas del profesor:", err);
      setError("No fue posible cargar las tareas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const visibleModules = useMemo(() => {
    if (selectedClassroom === "all") return modules;
    return modules.filter((item) => item.virtual_classroom === selectedClassroom);
  }, [modules, selectedClassroom]);

  const visibleAssignments = useMemo(() => {
    const term = search.trim().toLowerCase();

    return assignments.filter((assignment) => {
      const module = modules.find((item) => item.id === assignment.weekly_module);
      if (!module) return false;

      const classroom = classrooms.find((item) => item.id === module.virtual_classroom);
      if (!classroom) return false;

      const matchesClassroom =
        selectedClassroom === "all" || classroom.id === selectedClassroom;

      const matchesModule =
        selectedModule === "all" || assignment.weekly_module === selectedModule;

      const matchesSearch =
        !term ||
        assignment.title.toLowerCase().includes(term) ||
        assignment.instructions.toLowerCase().includes(term) ||
        assignment.weekly_module_title?.toLowerCase().includes(term) ||
        classroom.name.toLowerCase().includes(term);

      return matchesClassroom && matchesModule && matchesSearch;
    });
  }, [assignments, modules, classrooms, selectedClassroom, selectedModule, search]);

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!form.weekly_module) {
      setError("Debes seleccionar un módulo semanal.");
      setSubmitting(false);
      return;
    }

    if (!form.title.trim()) {
      setError("Debes capturar el título de la tarea.");
      setSubmitting(false);
      return;
    }

    if (!form.instructions.trim()) {
      setError("Debes capturar las instrucciones.");
      setSubmitting(false);
      return;
    }

    if (!form.due_date) {
      setError("Debes capturar la fecha límite.");
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        ...form,
        due_date: new Date(form.due_date).toISOString(),
      };

      if (editingId) {
        await api.patch(`/assignments/${editingId}/`, payload);
      } else {
        await api.post("/assignments/", payload);
      }

      resetForm();
      await loadData();
    } catch (err: any) {
      console.error("Error guardando tarea:", err.response?.data || err);
      setError("No fue posible guardar la tarea.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(assignment: Assignment) {
    const localDueDate = assignment.due_date
      ? new Date(assignment.due_date).toISOString().slice(0, 16)
      : "";

    setEditingId(assignment.id);
    setForm({
      weekly_module: assignment.weekly_module,
      title: assignment.title,
      instructions: assignment.instructions,
      due_date: localDueDate,
      max_score: assignment.max_score,
      allow_text_submission: assignment.allow_text_submission,
      is_published: assignment.is_published,
    });
  }

  async function togglePublished(assignment: Assignment) {
    try {
      await api.patch(`/assignments/${assignment.id}/`, {
        is_published: !assignment.is_published,
      });
      await loadData();
    } catch (err: any) {
      console.error("Error actualizando publicación de tarea:", err.response?.data || err);
      setError("No fue posible actualizar la publicación de la tarea.");
    }
  }

  async function deleteAssignment(assignmentId: number) {
    try {
      await api.delete(`/assignments/${assignmentId}/`);
      if (editingId === assignmentId) {
        resetForm();
      }
      await loadData();
    } catch (err: any) {
      console.error("Error eliminando tarea:", err.response?.data || err);
      setError("No fue posible eliminar la tarea.");
    }
  }

  function getModuleTitle(moduleId: number) {
    return modules.find((item) => item.id === moduleId)?.title ?? "Módulo no disponible";
  }

  function getClassroomNameByModule(moduleId: number) {
    const module = modules.find((item) => item.id === moduleId);
    if (!module) return "Salón no disponible";

    return (
      classrooms.find((item) => item.id === module.virtual_classroom)?.name ??
      "Salón no disponible"
    );
  }

  return (
    <IntranetLayout allowedRoles={["teacher"]}>
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">Tareas</h1>
          <p className="mt-2 text-slate-600">
            Crea y administra las tareas de tus módulos semanales.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr,430px]">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Filtrar por salón
                </label>
                <select
                  value={selectedClassroom}
                  onChange={(e) => {
                    const value =
                      e.target.value === "all" ? "all" : Number(e.target.value);
                    setSelectedClassroom(value);
                    setSelectedModule("all");
                  }}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                >
                  <option value="all">Todos los salones</option>
                  {classrooms.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Filtrar por módulo
                </label>
                <select
                  value={selectedModule}
                  onChange={(e) =>
                    setSelectedModule(
                      e.target.value === "all" ? "all" : Number(e.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                >
                  <option value="all">Todos los módulos</option>
                  {visibleModules.map((item) => (
                    <option key={item.id} value={item.id}>
                      Semana {item.week_number}: {item.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Buscar
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Título, instrucciones, módulo o salón"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-6 space-y-4">
              {loading ? (
                <p className="text-sm text-slate-500">Cargando tareas...</p>
              ) : visibleAssignments.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No se encontraron tareas.
                </p>
              ) : (
                visibleAssignments.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.title}
                        </p>
                        <p className="text-sm text-slate-500">
                          Salón: {getClassroomNameByModule(item.weekly_module)}
                        </p>
                        <p className="text-sm text-slate-500">
                          Módulo: {getModuleTitle(item.weekly_module)}
                        </p>
                        <p className="text-sm text-slate-500">
                          Fecha límite: {formatDate(item.due_date)}
                        </p>
                        <p className="text-sm text-slate-600">
                          Puntaje máximo: {item.max_score}
                        </p>
                        <p className="text-sm text-slate-600">
                          Entrega en texto: {item.allow_text_submission ? "Sí" : "No"}
                        </p>
                        <p className="text-sm text-slate-600">
                          Estado: {item.is_published ? "Publicada" : "Borrador"}
                        </p>
                        <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 whitespace-pre-line">
                          {item.instructions}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => togglePublished(item)}
                          className={`rounded-lg px-3 py-2 text-xs font-medium text-white ${
                            item.is_published
                              ? "bg-amber-600 hover:bg-amber-700"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {item.is_published ? "Despublicar" : "Publicar"}
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
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingId ? "Editar tarea" : "Nueva tarea"}
              </h2>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancelar edición
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Módulo semanal
                </label>
                <select
                  value={form.weekly_module}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      weekly_module: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                >
                  <option value={0}>Selecciona un módulo</option>
                  {modules.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.classroom_name} — Semana {item.week_number}: {item.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Título
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Ej. Ensayo, cuestionario, práctica, reporte..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Instrucciones
                </label>
                <textarea
                  value={form.instructions}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      instructions: e.target.value,
                    }))
                  }
                  rows={6}
                  placeholder="Describe qué debe hacer el alumno, criterios, formato de entrega, etc."
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Fecha límite
                </label>
                <input
                  type="datetime-local"
                  value={form.due_date}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      due_date: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Puntaje máximo
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.max_score}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      max_score: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.allow_text_submission}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      allow_text_submission: e.target.checked,
                    }))
                  }
                />
                Permitir entrega en texto
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      is_published: e.target.checked,
                    }))
                  }
                />
                Publicar tarea al guardar
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Guardando..."
                  : editingId
                  ? "Actualizar tarea"
                  : "Crear tarea"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </IntranetLayout>
  );
}