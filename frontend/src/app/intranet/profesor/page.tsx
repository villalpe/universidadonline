"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import IntranetLayout from "@/components/layout/IntranetLayout";
import StatCard from "@/components/ui/StatCard";
import {
  TeacherAssignment,
  TeacherClassroom,
  TeacherGradebookItem,
  TeacherSubmission,
} from "@/types/teacher";
import { formatDate } from "@/lib/utils";

export default function ProfesorDashboardPage() {
  const [classrooms, setClassrooms] = useState<TeacherClassroom[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [submissions, setSubmissions] = useState<TeacherSubmission[]>([]);
  const [gradebook, setGradebook] = useState<TeacherGradebookItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeacherData() {
      try {
        const [
          classroomsRes,
          assignmentsRes,
          submissionsRes,
          gradebookRes,
        ] = await Promise.all([
          api.get("/auth/teacher/classrooms/"),
          api.get("/auth/teacher/assignments/"),
          api.get("/auth/teacher/submissions/"),
          api.get("/auth/teacher/gradebook/"),
        ]);

        setClassrooms(classroomsRes.data);
        setAssignments(assignmentsRes.data);
        setSubmissions(submissionsRes.data);
        setGradebook(gradebookRes.data);
      } catch (error) {
        console.error("Error cargando dashboard de profesor:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTeacherData();
  }, []);

  if (loading) {
    return (
      <IntranetLayout allowedRoles={["teacher"]}>
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-slate-600">Cargando panel del profesor...</p>
        </div>
      </IntranetLayout>
    );
  }

  return (
    <IntranetLayout allowedRoles={["teacher"]}>
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">Panel del Profesor</h1>
          <p className="mt-2 text-slate-600">
            Gestiona tus grupos, tareas, entregas y evaluación académica.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Grupos asignados"
            value={classrooms.length}
            subtitle="Salones activos del profesor"
          />
          <StatCard
            title="Tareas publicadas"
            value={assignments.length}
            subtitle="Actividades registradas"
          />
          <StatCard
            title="Entregas recibidas"
            value={submissions.length}
            subtitle="Submissions de alumnos"
          />
          <StatCard
            title="Registros en gradebook"
            value={gradebook.length}
            subtitle="Evaluaciones registradas"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Mis grupos</h2>

            <div className="mt-4 space-y-4">
              {classrooms.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No hay grupos asignados.
                </p>
              ) : (
                classrooms.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <p className="font-semibold text-slate-900">
                      {item.name ?? "Grupo sin nombre"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {item.code ?? "Sin código"} · {item.subject_name ?? "Sin materia"}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Estado: {item.status ?? "N/D"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Tareas recientes
            </h2>

            <div className="mt-4 space-y-4">
              {assignments.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No hay tareas registradas.
                </p>
              ) : (
                assignments.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <p className="font-semibold text-slate-900">
                      {item.title ?? "Actividad"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {item.classroom_name ?? "Grupo no disponible"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {item.weekly_module_title ?? "Módulo no disponible"}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Fecha límite: {formatDate(item.due_date)}
                    </p>
                    <p className="text-sm text-slate-600">
                      Publicada: {item.is_published ? "Sí" : "No"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Entregas recientes
            </h2>

            <div className="mt-4 space-y-4">
              {submissions.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No hay entregas registradas.
                </p>
              ) : (
                submissions.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <p className="font-semibold text-slate-900">
                      {item.assignment_title ?? "Actividad"}
                    </p>
                    <p className="text-sm text-slate-500">
                      Alumno: {item.student_name ?? "N/D"}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Entregado: {formatDate(item.submitted_at)}
                    </p>
                    <p className="text-sm text-slate-600">
                      Estado: {item.status ?? "N/D"}
                    </p>

                    {item.files && item.files.length > 0 && (
                      <p className="text-sm text-slate-600">
                        Archivo adjunto: {item.files[0].original_name ?? "PDF entregado"}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Gradebook reciente
            </h2>

            <div className="mt-4 space-y-4">
              {gradebook.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No hay evaluaciones registradas.
                </p>
              ) : (
                gradebook.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <p className="font-semibold text-slate-900">
                      {item.assignment_title ?? "Actividad"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {item.classroom_name ?? "Grupo no disponible"}
                    </p>
                    <p className="text-sm text-slate-500">
                      Alumno: {item.student_name ?? "N/D"}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Calificación: {item.final_score ?? item.score ?? "N/D"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {item.feedback ?? "Sin retroalimentación"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </IntranetLayout>
  );
}