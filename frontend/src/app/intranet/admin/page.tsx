"use client";

import { useEffect, useMemo, useState } from "react";
import IntranetLayout from "@/components/layout/IntranetLayout";
import StatCard from "@/components/ui/StatCard";
import Image from "next/image";
import api from "@/lib/axios";
import { formatDate } from "@/lib/utils";
import {
  AdminStudent,
  AdminTeacher,
  AdminUser,
  AdminVirtualClassroom,
} from "@/types/admin";
import { FinanceCharge, FinancePayment } from "@/types/finance";

function getFullName(firstName?: string, lastName?: string) {
  return `${firstName ?? ""} ${lastName ?? ""}`.trim();
}

function formatCurrency(value: string | number) {
  const amount = typeof value === "string" ? Number(value) : value;

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount || 0);
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [classrooms, setClassrooms] = useState<AdminVirtualClassroom[]>([]);
  const [charges, setCharges] = useState<FinanceCharge[]>([]);
  const [payments, setPayments] = useState<FinancePayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [
          usersRes,
          studentsRes,
          teachersRes,
          classroomsRes,
          chargesRes,
          paymentsRes,
        ] = await Promise.all([
          api.get("/auth/users/"),
          api.get("/auth/students/"),
          api.get("/auth/teachers/"),
          api.get("/virtual-classrooms/"),
          api.get("/finance/charges/"),
          api.get("/finance/payments/"),
        ]);

        setUsers(usersRes.data);
        setStudents(studentsRes.data);
        setTeachers(teachersRes.data);
        setClassrooms(classroomsRes.data);
        setCharges(chargesRes.data);
        setPayments(paymentsRes.data);
      } catch (error) {
        console.error("Error cargando dashboard de administrador:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, []);

  const pendingCharges = useMemo(
    () => charges.filter((item) => Number(item.balance || 0) > 0).length,
    [charges]
  );

  const totalPendingBalance = useMemo(
    () => charges.reduce((sum, item) => sum + Number(item.balance || 0), 0),
    [charges]
  );

  const totalCollected = useMemo(
    () => payments.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [payments]
  );

  if (loading) {
    return (
      <IntranetLayout allowedRoles={["admin"]}>
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-slate-600">Cargando dashboard administrador...</p>
        </div>
      </IntranetLayout>
    );
  }

  console.log(users)

  return (
    <IntranetLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Dashboard Administrativo</h1>
              <p className="mt-2 text-slate-600">
                Administra la oferta académica base de la institución.
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

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
          <StatCard
            title="Usuarios"
            value={users.length}
            subtitle="Total registrados"
          />
          <StatCard
            title="Alumnos"
            value={students.length}
            subtitle="Perfiles estudiantiles"
          />
          <StatCard
            title="Profesores"
            value={teachers.length}
            subtitle="Perfiles docentes"
          />
          <StatCard
            title="Grupos"
            value={classrooms.length}
            subtitle="Salones virtuales"
          />
          <StatCard
            title="Pagos"
            value={payments.length}
            subtitle="Movimientos registrados"
          />
          <StatCard
            title="Cobrado"
            value={formatCurrency(totalCollected)}
            subtitle="Ingresos recibidos por la universidad"
          />
          <StatCard
            title="Saldo pendiente"
            value={formatCurrency(totalPendingBalance)}
            subtitle={`${pendingCharges} cargos con saldo`}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Usuarios recientes
            </h2>

            <div className="mt-4 space-y-4">
              {users.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No hay usuarios registrados.
                </p>
              ) : (
                users.slice(0, 5).map((item) => {
                  const fullName = getFullName(item.first_name, item.last_name);

                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <p className="font-semibold text-slate-900">
                        {fullName || item.username}
                      </p>
                      <p className="text-sm text-slate-500">{item.email}</p>
                      <p className="mt-2 text-sm text-slate-600">
                        Rol: {item.role?.name ?? "Sin rol"}
                      </p>
                      <p className="text-sm text-slate-600">
                        Estado: {item.is_active ? "Activo" : "Inactivo"}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Alumnos registrados
            </h2>

            <div className="mt-4 space-y-4">
              {students.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No hay alumnos registrados.
                </p>
              ) : (
                students.slice(0, 5).map((item) => {
                  const fullName = getFullName(
                    item.user?.first_name,
                    item.user?.last_name
                  );

                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <p className="font-semibold text-slate-900">
                        {fullName || item.user?.username || "Alumno"}
                      </p>
                      <p className="text-sm text-slate-500">
                        Matrícula: {item.student_code ?? "N/D"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {item.user?.email ?? "Sin correo"}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        Estado: {item.status ?? "N/D"}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Profesores registrados
            </h2>

            <div className="mt-4 space-y-4">
              {teachers.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No hay profesores registrados.
                </p>
              ) : (
                teachers.slice(0, 5).map((item) => {
                  const fullName = getFullName(
                    item.user?.first_name,
                    item.user?.last_name
                  );

                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <p className="font-semibold text-slate-900">
                        {fullName || item.user?.username || "Profesor"}
                      </p>
                      <p className="text-sm text-slate-500">
                        Clave: {item.employee_code ?? "N/D"}
                      </p>
                      <p className="text-sm text-slate-500">
                        Especialidad: {item.specialty ?? "N/D"}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        {item.user?.email ?? "Sin correo"}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Grupos recientes
            </h2>

            <div className="mt-4 space-y-4">
              {classrooms.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No hay grupos registrados.
                </p>
              ) : (
                classrooms.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <p className="font-semibold text-slate-900">
                      {item.name ?? "Grupo"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {item.code ?? "Sin código"} · {item.subject_name ?? "Sin materia"}
                    </p>
                    <p className="text-sm text-slate-500">
                      Periodo: {item.academic_period_name ?? "N/D"}
                    </p>
                    <p className="text-sm text-slate-500">
                      Profesor: {item.main_teacher_name ?? "N/D"}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Estado: {item.status ?? "N/D"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section>
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Resumen financiero
            </h2>

            <div className="mt-4 space-y-4">
              {charges.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No hay cargos registrados.
                </p>
              ) : (
                charges.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <p className="font-semibold text-slate-900">
                      {item.reference ?? "Sin referencia"}
                    </p>
                    <p className="text-sm text-slate-500">
                      Alumno: {item.student_name ?? "N/D"} · {item.student_code ?? "N/D"}
                    </p>
                    <p className="text-sm text-slate-500">
                      Concepto: {item.concept_name ?? "N/D"}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Monto: {formatCurrency(item.amount)}
                    </p>
                    <p className="text-sm text-slate-600">
                      Pagado: {formatCurrency(item.total_paid)}
                    </p>
                    <p className="text-sm text-slate-600">
                      Saldo: {formatCurrency(item.balance)}
                    </p>
                    <p className="text-sm text-slate-600">
                      Estado: {item.status ?? "N/D"}
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