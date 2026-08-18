"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import IntranetLayout from "@/components/layout/IntranetLayout";
import StatCard from "@/components/ui/StatCard";
import {
  StudentAssignment,
  StudentClassroom,
  StudentGrade,
  StudentProfile,
  StudentStatement,
} from "@/types/student";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AlumnoDashboardPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [classrooms, setClassrooms] = useState<StudentClassroom[]>([]);
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [statement, setStatement] = useState<StudentStatement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudentData() {
      try {
        const [profileRes, classroomsRes, assignmentsRes, gradesRes, statementRes] =
          await Promise.all([
            api.get("/auth/my/profile/"),
            api.get("/auth/my/classrooms/"),
            api.get("/auth/my/assignments/"),
            api.get("/auth/my/grades/"),
            api.get("/auth/my/statement/"),
          ]);

        setProfile(profileRes.data);
        setClassrooms(classroomsRes.data);
        setAssignments(assignmentsRes.data);
        setGrades(gradesRes.data);
        setStatement(statementRes.data);
      } catch (error) {
        console.error("Error cargando dashboard de alumno:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStudentData();
  }, []);

  if (loading) {
    return (
      <IntranetLayout allowedRoles={["student"]}>
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-slate-600">Cargando panel del alumno...</p>
        </div>
      </IntranetLayout>
    );
  }

  return (
    <IntranetLayout allowedRoles={["student"]}>
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">Panel del Alumno</h1>
          <p className="mt-2 text-slate-600">
            Bienvenido a tu intranet académica y financiera.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Matrícula</p>
              <p className="text-lg font-semibold text-slate-900">
                {profile?.student_code ?? "Sin matrícula"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Estado</p>
              <p className="text-lg font-semibold capitalize text-slate-900">
                {profile?.status ?? "Sin estado"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Carrera</p>
              <p className="text-lg font-semibold text-slate-900">
                {profile?.career?.name ?? "No disponible"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Plan de estudio</p>
              <p className="text-lg font-semibold text-slate-900">
                {profile?.study_plan?.name ?? "No disponible"}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Materias inscritas"
            value={classrooms.length}
            subtitle="Clases activas del alumno"
          />
          <StatCard
            title="Tareas disponibles"
            value={assignments.length}
            subtitle="Actividades asignadas"
          />
          <StatCard
            title="Calificaciones"
            value={grades.length}
            subtitle="Registros de evaluación"
          />
          <StatCard
            title="Saldo estimado"
            value={formatCurrency(statement?.balance)}
            subtitle="Resumen financiero"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Mis clases</h2>

            <div className="mt-4 space-y-4">
              {classrooms.length === 0 ? (
                <p className="text-sm text-slate-500">No hay clases inscritas.</p>
              ) : (
                classrooms.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <p className="font-semibold text-slate-900">
                      {item.name ?? "Clase sin nombre"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {item.code ?? "Sin código"} ·{" "}
                      {item.subject_name ?? "Sin materia"}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Estado: {item.status ?? "Activo"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Próximas tareas
            </h2>

            <div className="mt-4 space-y-4">
              {assignments.length === 0 ? (
                <p className="text-sm text-slate-500">No hay tareas disponibles.</p>
              ) : (
                assignments.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-500">
                      {item.classroom_name ?? "Clase no disponible"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {item.weekly_module_title ?? "Módulo no disponible"}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Entrega: {formatDate(item.due_date)}
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
              Calificaciones recientes
            </h2>

            <div className="mt-4 space-y-4">
              {grades.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No hay calificaciones registradas.
                </p>
              ) : (
                grades.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <p className="font-semibold text-slate-900">
                      {item.assignment_title ?? "Actividad"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {item.classroom_name ?? "Clase no disponible"}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Calificación: {item.final_score ?? item.score ?? "N/D"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.feedback ?? "Sin retroalimentación"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Estado de cuenta
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div>
                <p className="text-sm text-slate-500">Alumno</p>
                <p className="font-semibold text-slate-900">
                  {statement?.student_name ?? "No disponible"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Matrícula</p>
                <p className="font-semibold text-slate-900">
                  {statement?.student_code ?? "No disponible"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Total cargos</p>
                <p className="font-semibold text-slate-900">
                  {formatCurrency(statement?.total_charges)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Total pagos</p>
                <p className="font-semibold text-slate-900">
                  {formatCurrency(statement?.total_payments)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Saldo</p>
                <p className="font-semibold text-slate-900">
                  {formatCurrency(statement?.balance)}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {statement?.charges?.length ? (
                statement.charges.slice(0, 5).map((charge) => (
                  <div
                    key={charge.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <p className="font-semibold text-slate-900">
                      {charge.concept_name ?? "Cargo"}
                    </p>

                    <p className="text-sm text-slate-500">
                      {charge.description ?? "Sin descripción"}
                    </p>

                    <p className="text-sm text-slate-500">
                      Periodo: {charge.academic_period_name ?? "No disponible"}
                    </p>

                    <p className="text-sm text-slate-500">
                      Referencia: {charge.reference ?? "Sin referencia"}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      Fecha límite: {formatDate(charge.due_date)}
                    </p>

                    <p className="text-sm text-slate-600">
                      Monto: {formatCurrency(charge.amount)}
                    </p>

                    <p className="text-sm text-slate-600">
                      Pagado: {formatCurrency(charge.total_paid)}
                    </p>

                    <p className="text-sm text-slate-600">
                      Saldo del cargo: {formatCurrency(charge.balance)}
                    </p>

                    <p className="text-sm text-slate-600">
                      Estado: {charge.status ?? "N/D"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No hay cargos registrados.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </IntranetLayout>
  );
}