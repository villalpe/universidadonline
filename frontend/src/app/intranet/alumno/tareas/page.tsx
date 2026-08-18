"use client";

import { useEffect, useMemo, useState } from "react";
import IntranetLayout from "@/components/layout/IntranetLayout";
import api from "@/lib/axios";
import { formatDate } from "@/lib/utils";
import {
  Assignment,
  VirtualClassroom,
  WeeklyModule,
} from "@/types/academics";

export default function AlumnoTareasPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [modules, setModules] = useState<WeeklyModule[]>([]);
  const [classrooms, setClassrooms] = useState<VirtualClassroom[]>([]);
  const [search, setSearch] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState<number | "all">("all");
  const [selectedModule, setSelectedModule] = useState<number | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [assignmentsRes, modulesRes, classroomsRes] = await Promise.all([
        api.get("/assignments/"),
        api.get("/weekly-modules/"),
        api.get("/virtual-classrooms/"),
      ]);

      setAssignments(assignmentsRes.data);
      setModules(modulesRes.data);
      setClassrooms(classroomsRes.data);
    } catch (err) {
      console.error("Error cargando tareas del alumno:", err);
      setError("No fue posible cargar las tareas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  
  const visibleModules = useMemo(() => {
    if (selectedClassroom === "all") {
      return modules.filter((item) => item.is_published);
    }

    return modules.filter(
      (item) => item.is_published && item.virtual_classroom === selectedClassroom
    );
  }, [modules, selectedClassroom]);

  const visibleAssignments = useMemo(() => {
    const term = search.trim().toLowerCase();

    return assignments
      .filter((assignment) => assignment.is_published)
      .filter((assignment) => {
        const module = modules.find((item) => item.id === assignment.weekly_module);
        if (!module || !module.is_published) return false;

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
    <IntranetLayout allowedRoles={["student"]}>
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">Tareas</h1>
          <p className="mt-2 text-slate-600">
            Consulta las actividades publicadas por tus profesores.
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
                No hay tareas publicadas disponibles.
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

                      <p className="mt-3 text-sm font-medium text-slate-700">
                        Instrucciones
                      </p>
                      <div className="mt-1 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 whitespace-pre-line">
                        {item.instructions}
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