"use client";

import { useEffect, useMemo, useState } from "react";
import IntranetLayout from "@/components/layout/IntranetLayout";
import api from "@/lib/axios";
import { formatDate } from "@/lib/utils";
import {
  Assignment,
  Submission,
  VirtualClassroom,
  WeeklyModule,
  SubmissionPrecheck
} from "@/types/academics";

export default function ProfesorEntregasPage() {
  const [classrooms, setClassrooms] = useState<VirtualClassroom[]>([]);
  const [weeklyModules, setWeeklyModules] = useState<WeeklyModule[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [search, setSearch] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState<number | "all">("all");
  const [selectedAssignment, setSelectedAssignment] = useState<number | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [classroomsRes, weeklyModulesRes, assignmentsRes, submissionsRes] =
        await Promise.all([
          api.get("/auth/teacher/classrooms/"),
          api.get("/weekly-modules/"),
          api.get("/assignments/"),
          api.get("/submissions/"),
        ]);

      setClassrooms(classroomsRes.data);
      setWeeklyModules(weeklyModulesRes.data);
      setAssignments(assignmentsRes.data);
      setSubmissions(submissionsRes.data);
    } catch (err) {
      console.error("Error cargando entregas del profesor:", err);
      setError("No fue posible cargar las entregas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const teacherClassroomIds = useMemo(() => {
    return classrooms.map((item) => item.id);
  }, [classrooms]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const module = weeklyModules.find((item) => item.id === assignment.weekly_module);
      return module ? teacherClassroomIds.includes(module.virtual_classroom) : false;
    });
  }, [assignments, weeklyModules, teacherClassroomIds]);

  const filteredSubmissions = useMemo(() => {
    const term = search.trim().toLowerCase();

    return submissions.filter((submission) => {
      const assignment = filteredAssignments.find((item) => item.id === submission.assignment);
      if (!assignment) return false;

      const weeklyModule = weeklyModules.find((item) => item.id === assignment.weekly_module);
      if (!weeklyModule) return false;

      const classroom = classrooms.find((item) => item.id === weeklyModule.virtual_classroom);
      if (!classroom) return false;

      const matchesClassroom =
        selectedClassroom === "all" || classroom.id === selectedClassroom;

      const matchesAssignment =
        selectedAssignment === "all" || assignment.id === selectedAssignment;

      const matchesSearch =
        !term ||
        submission.student_name?.toLowerCase().includes(term) ||
        submission.assignment_title?.toLowerCase().includes(term) ||
        classroom.name?.toLowerCase().includes(term) ||
        submission.status?.toLowerCase().includes(term);

      return matchesClassroom && matchesAssignment && matchesSearch;
    });
  }, [
    submissions,
    filteredAssignments,
    weeklyModules,
    classrooms,
    selectedClassroom,
    selectedAssignment,
    search,
  ]);

  function getStatusLabel(status: string) {
    switch (status) {
      case "submitted":
        return "Entregada";
      case "late":
        return "Tardía";
      case "reviewed":
        return "Revisada";
      case "graded":
        return "Calificada";
      default:
        return status;
    }
  }

  function getAssignmentById(id: number) {
    return filteredAssignments.find((item) => item.id === id);
  }

  function getWeeklyModuleById(id: number) {
    return weeklyModules.find((item) => item.id === id);
  }

  function getClassroomById(id: number) {
    return classrooms.find((item) => item.id === id);
  }

  return (
    <IntranetLayout allowedRoles={["teacher"]}>
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">Entregas</h1>
          <p className="mt-2 text-slate-600">
            Revisa las entregas de tareas realizadas por tus alumnos.
          </p>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Salón virtual
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

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Tarea
              </label>
              <select
                value={selectedAssignment}
                onChange={(e) =>
                  setSelectedAssignment(
                    e.target.value === "all" ? "all" : Number(e.target.value)
                  )
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
              >
                <option value="all">Todas las tareas</option>
                {filteredAssignments
                  .filter((assignment) => {
                    if (selectedClassroom === "all") return true;
                    const module = weeklyModules.find(
                      (item) => item.id === assignment.weekly_module
                    );
                    return module?.virtual_classroom === selectedClassroom;
                  })
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
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
                placeholder="Alumno, tarea, salón o estado"
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
              <p className="text-sm text-slate-500">Cargando entregas...</p>
            ) : filteredSubmissions.length === 0 ? (
              <p className="text-sm text-slate-500">
                No se encontraron entregas.
              </p>
            ) : (
              filteredSubmissions.map((submission) => {
                const assignment = getAssignmentById(submission.assignment);
                const weeklyModule = assignment
                  ? getWeeklyModuleById(assignment.weekly_module)
                  : null;
                const classroom = weeklyModule
                  ? getClassroomById(weeklyModule.virtual_classroom)
                  : null;

                return (
                  <div
                    key={submission.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {submission.student_name}
                        </p>
                        <p className="text-sm text-slate-500">
                          Tarea: {submission.assignment_title}
                        </p>
                        <p className="text-sm text-slate-500">
                          Salón: {classroom?.name ?? "No disponible"}
                        </p>
                        <p className="text-sm text-slate-500">
                          Módulo: {weeklyModule?.title ?? "No disponible"}
                        </p>
                        <p className="text-sm text-slate-600">
                          Estado: {getStatusLabel(submission.status)}
                        </p>
                        <p className="text-sm text-slate-600">
                          Intento: {submission.attempt_number}
                        </p>
                        <p className="text-xs text-slate-400">
                          Entregada: {formatDate(submission.submitted_at)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          Respuesta en texto
                        </p>
                        <div className="mt-1 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                          {submission.text_submission || "Sin contenido en texto."}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          Archivos adjuntos
                        </p>
                        {submission.files.length === 0 ? (
                          <p className="mt-1 text-sm text-slate-500">
                            Sin archivos adjuntos.
                          </p>
                        ) : (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {submission.files.map((file) => (
                              <a
                                key={file.id}
                                href={file.file_url || "#"}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700"
                              >
                                {file.original_name}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* NUEVO: Prevalidación automática PDF */}
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          Prevalidación automática (PDF)
                        </p>

                        {submission.precheck ? (
                          <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <p className="text-sm text-slate-800">
                              Resultado:{" "}
                              <span
                                className={`font-semibold ${
                                  submission.precheck.passed
                                    ? "text-green-700"
                                    : "text-amber-700"
                                }`}
                              >
                                {submission.precheck.passed ? "Aprobado" : "Revisar"}
                              </span>
                            </p>
                            <p className="mt-1 text-sm text-slate-700">
                              Score:{" "}
                              <span className="font-semibold">
                                {submission.precheck.score}/100
                              </span>
                            </p>
                            <p className="mt-1 text-xs text-slate-600">
                              Párrafos: {submission.precheck.paragraph_count} · Palabras:{" "}
                              {submission.precheck.word_count}
                            </p>
                            <div className="mt-2 whitespace-pre-line text-xs text-slate-600">
                              {submission.precheck.feedback}
                            </div>
                          </div>
                        ) : (
                          <p className="mt-1 text-sm text-slate-500">
                            Sin prevalidación (aún no se sube PDF o archivo no compatible).
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </IntranetLayout>
  );
}