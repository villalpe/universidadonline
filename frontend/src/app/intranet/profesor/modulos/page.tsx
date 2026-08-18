"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import IntranetLayout from "@/components/layout/IntranetLayout";
import api from "@/lib/axios";
import { formatDate } from "@/lib/utils";
import { VirtualClassroom, WeeklyModule } from "@/types/academics";

interface WeeklyModulePayload {
  virtual_classroom: number;
  week_number: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  is_published: boolean;
}

const initialForm: WeeklyModulePayload = {
  virtual_classroom: 0,
  week_number: 1,
  title: "",
  description: "",
  start_date: "",
  end_date: "",
  is_published: false,
};

export default function ProfesorModulosPage() {
  const [modules, setModules] = useState<WeeklyModule[]>([]);
  const [classrooms, setClassrooms] = useState<VirtualClassroom[]>([]);
  const [search, setSearch] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState<number | "all">("all");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState<WeeklyModulePayload>(initialForm);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  async function loadData() {
    try {
      const [modulesRes, classroomsRes] = await Promise.all([
        api.get("/weekly-modules/"),
        api.get("/auth/teacher/classrooms/"),
      ]);

      setModules(modulesRes.data);
      setClassrooms(classroomsRes.data);
    } catch (err) {
      console.error("Error cargando módulos semanales:", err);
      setError("No fue posible cargar los módulos semanales.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const visibleModules = useMemo(() => {
    const term = search.trim().toLowerCase();

    return modules.filter((item) => {
      const matchesClassroom =
        selectedClassroom === "all" || item.virtual_classroom === selectedClassroom;

      const matchesSearch =
        !term ||
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.classroom_name?.toLowerCase().includes(term) ||
        `semana ${item.week_number}`.includes(term);

      return matchesClassroom && matchesSearch;
    });
  }, [modules, search, selectedClassroom]);

  function resetForm() {
    setForm(initialForm);
    setVideoFile(null);
    setEditingId(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!form.virtual_classroom) {
      setError("Debes seleccionar un salón virtual.");
      setSubmitting(false);
      return;
    }

    if (!form.title.trim()) {
      setError("Debes capturar el título del módulo.");
      setSubmitting(false);
      return;
    }

    if (!form.start_date || !form.end_date) {
      setError("Debes capturar fecha de inicio y fin.");
      setSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("virtual_classroom", String(form.virtual_classroom));
      formData.append("week_number", String(form.week_number));
      formData.append("title", form.title);
      formData.append("description", form.description ?? "");
      formData.append("start_date", form.start_date);
      formData.append("end_date", form.end_date);
      formData.append("is_published", String(form.is_published));

      if (videoFile) {
        formData.append("video_file", videoFile);
      }

      if (editingId) {
        await api.patch(`/weekly-modules/${editingId}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/weekly-modules/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      resetForm();
      await loadData();
    } catch (err: any) {
      console.error("Error guardando módulo semanal:", err.response?.data || err);
      setError("No fue posible guardar el módulo semanal.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(module: WeeklyModule) {
    setEditingId(module.id);
    setVideoFile(null);
    setForm({
      virtual_classroom: module.virtual_classroom,
      week_number: module.week_number,
      title: module.title,
      description: module.description,
      start_date: module.start_date,
      end_date: module.end_date,
      is_published: module.is_published,
    });
  }

  async function togglePublished(module: WeeklyModule) {
    try {
      await api.patch(`/weekly-modules/${module.id}/`, {
        is_published: !module.is_published,
      });
      await loadData();
    } catch (err: any) {
      console.error("Error actualizando publicación del módulo:", err.response?.data || err);
      setError("No fue posible actualizar la publicación del módulo.");
    }
  }

  async function deleteModule(moduleId: number) {
    try {
      await api.delete(`/weekly-modules/${moduleId}/`);
      if (editingId === moduleId) {
        resetForm();
      }
      await loadData();
    } catch (err: any) {
      console.error("Error eliminando módulo semanal:", err.response?.data || err);
      setError("No fue posible eliminar el módulo semanal.");
    }
  }

  return (
    <IntranetLayout allowedRoles={["teacher"]}>
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">Módulos semanales</h1>
          <p className="mt-2 text-slate-600">
            Organiza el contenido, tema y planeación de tus clases por semana.
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
                  onChange={(e) =>
                    setSelectedClassroom(
                      e.target.value === "all" ? "all" : Number(e.target.value)
                    )
                  }
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

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Buscar</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Título, descripción, salón o semana"
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
                <p className="text-sm text-slate-500">Cargando módulos semanales...</p>
              ) : visibleModules.length === 0 ? (
                <p className="text-sm text-slate-500">No se encontraron módulos semanales.</p>
              ) : (
                visibleModules.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          Semana {item.week_number}: {item.title}
                        </p>
                        <p className="text-sm text-slate-500">Salón: {item.classroom_name}</p>
                        <p className="text-sm text-slate-500">
                          Fechas: {formatDate(item.start_date)} - {formatDate(item.end_date)}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                          Estado: {item.is_published ? "Publicado" : "Borrador"}
                        </p>

                        {(item.video_file_url || item.video_url) && (
                          <a
                            href={item.video_file_url || item.video_url || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-block text-xs text-blue-600 hover:underline"
                          >
                            Ver video del módulo
                          </a>
                        )}

                        <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 whitespace-pre-line">
                          {item.description || "Sin descripción"}
                        </div>
                        <p className="mt-2 text-xs text-slate-400">
                          Actualizado: {formatDate(item.updated_at)}
                        </p>
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
                          onClick={() => deleteModule(item.id)}
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
                {editingId ? "Editar módulo" : "Nuevo módulo"}
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
                  <option value={0}>Selecciona un salón</option>
                  {classrooms.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Semana</label>
                <input
                  type="number"
                  min={1}
                  value={form.week_number}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      week_number: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Título</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Ej. Introducción al tema"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Explicación / contenido
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={6}
                  placeholder="Explica aquí el contenido de la semana, indicaciones, lecturas, objetivos, etc."
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Fecha de inicio
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
                    Fecha de fin
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
                  Video de clase (opcional)
                </label>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg"
                  onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Recomendado: MP4 (H.264/AAC), 720p, 30–90 s, 10–40 MB (máximo 80 MB).
                </p>
                {editingId && (() => {
                  const current = modules.find((m) => m.id === editingId);
                  const currentVideo = current?.video_file_url || current?.video_url;
                  if (!currentVideo) return null;
                  return (
                    <a
                      href={currentVideo}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-xs text-blue-600 hover:underline"
                    >
                      Ver video actual
                    </a>
                  );
                })()}
              </div>

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
                Publicar módulo al guardar
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Guardando..."
                  : editingId
                  ? "Actualizar módulo"
                  : "Crear módulo"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </IntranetLayout>
  );
}