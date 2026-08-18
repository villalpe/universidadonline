"use client";

import { useEffect, useMemo, useState } from "react";
import IntranetLayout from "@/components/layout/IntranetLayout";
import api from "@/lib/axios";
import { formatDate } from "@/lib/utils";
import { GradeRecord, VirtualClassroom } from "@/types/academics";

export default function AlumnoCalificacionesPage() {
  const [gradeRecords, setGradeRecords] = useState<GradeRecord[]>([]);
  const [classrooms, setClassrooms] = useState<VirtualClassroom[]>([]);
  const [search, setSearch] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState<number | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [gradesRes, classroomsRes] = await Promise.all([
        api.get("/grade-records/"),
        api.get("/virtual-classrooms/"),
      ]);

      setGradeRecords(gradesRes.data);
      setClassrooms(classroomsRes.data);
    } catch (err) {
      console.error("Error cargando calificaciones del alumno:", err);
      setError("No fue posible cargar tus calificaciones.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const visibleGrades = useMemo(() => {
    const term = search.trim().toLowerCase();

    return gradeRecords.filter((item) => {
      const matchesClassroom =
        selectedClassroom === "all" || item.virtual_classroom === selectedClassroom;

      const matchesSearch =
        !term ||
        item.assignment_title?.toLowerCase().includes(term) ||
        item.classroom_name?.toLowerCase().includes(term) ||
        item.feedback?.toLowerCase().includes(term) ||
        item.graded_by_name?.toLowerCase().includes(term);

      return matchesClassroom && matchesSearch;
    });
  }, [gradeRecords, selectedClassroom, search]);

  return (
    <IntranetLayout allowedRoles={["student"]}>
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">
            Mis calificaciones
          </h1>
          <p className="mt-2 text-slate-600">
            Consulta las calificaciones registradas por tus profesores.
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
                placeholder="Tarea, salón, feedback o profesor"
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
                Cargando calificaciones...
              </p>
            ) : visibleGrades.length === 0 ? (
              <p className="text-sm text-slate-500">
                Aún no tienes calificaciones registradas.
              </p>
            ) : (
              visibleGrades.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {item.assignment_title}
                      </p>
                      <p className="text-sm text-slate-500">
                        Salón: {item.classroom_name}
                      </p>
                      <p className="text-sm text-slate-600">
                        Calificación: {item.score}
                      </p>
                      <p className="text-sm text-slate-600">
                        Profesor: {item.graded_by_name || "No disponible"}
                      </p>
                      <p className="text-xs text-slate-400">
                        Fecha de evaluación: {item.graded_at ? formatDate(item.graded_at) : "Sin fecha"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Retroalimentación
                      </p>
                      <div className="mt-1 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 whitespace-pre-line">
                        {item.feedback || "Sin retroalimentación"}
                      </div>
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