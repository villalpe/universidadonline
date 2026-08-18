"use client";

import { useEffect, useMemo, useState } from "react";
import IntranetLayout from "@/components/layout/IntranetLayout";
import api from "@/lib/axios";
import { formatDate } from "@/lib/utils";
import { VirtualClassroom, WeeklyModule } from "@/types/academics";

export default function AlumnoModulosPage() {
  const [modules, setModules] = useState<WeeklyModule[]>([]);
  const [classrooms, setClassrooms] = useState<VirtualClassroom[]>([]);
  const [search, setSearch] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState<number | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [modulesRes, classroomsRes] = await Promise.all([
        api.get("/weekly-modules/"),
        api.get("/virtual-classrooms/"),
      ]);

      setModules(modulesRes.data);
      setClassrooms(classroomsRes.data);
    } catch (err) {
      console.error("Error cargando módulos del alumno:", err);
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

    return modules
      .filter((item) => item.is_published)
      .filter((item) => {
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
  }, [modules, selectedClassroom, search]);

  return (
    <IntranetLayout allowedRoles={["student"]}>
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">
            Contenido de clase
          </h1>
          <p className="mt-2 text-slate-600">
            Consulta los módulos semanales publicados por tus profesores.
          </p>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

            <div className="md:col-span-1 lg:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Buscar
              </label>
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
              <p className="text-sm text-slate-500">
                Cargando contenido de clase...
              </p>
            ) : visibleModules.length === 0 ? (
              <p className="text-sm text-slate-500">
                No hay módulos publicados disponibles.
              </p>
            ) : (
              visibleModules.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        Semana {item.week_number}: {item.title}
                      </p>
                      <p className="text-sm text-slate-500">
                        Salón: {item.classroom_name}
                      </p>
                      <p className="text-sm text-slate-500">
                        Fechas: {formatDate(item.start_date)} - {formatDate(item.end_date)}
                      </p>
                      <p className="mt-3 text-sm font-medium text-slate-700">
                        Contenido
                      </p>
                      <div className="mt-1 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 whitespace-pre-line">
                        {item.description || "Sin descripción"}
                      </div>

                      {(item.video_file_url || item.video_url) && (
                        <div className="mt-4">
                          <p className="mb-2 text-sm font-medium text-slate-700">
                            Video de la clase
                          </p>
                          <video
                            controls
                            preload="metadata"
                            className="w-full max-w-2xl rounded-xl border border-slate-200 bg-black"
                          >
                            <source
                              src={item.video_file_url || item.video_url || ""}
                              type="video/mp4"
                            />
                            Tu navegador no soporta video HTML5.
                          </video>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </IntranetLayout>
  );
}