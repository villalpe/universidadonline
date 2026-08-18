"use client";

import { useEffect, useMemo, useState } from "react";
import IntranetLayout from "@/components/layout/IntranetLayout";
import StatCard from "@/components/ui/StatCard";
import api from "@/lib/axios";
import { formatDate } from "@/lib/utils";
import {
  FinanceCharge,
  FinanceConcept,
  FinancePayment,
} from "@/types/finance";

function formatCurrency(value: string | number) {
  const amount = typeof value === "string" ? Number(value) : value;

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount || 0);
}

export default function FinanzasDashboardPage() {
  const [charges, setCharges] = useState<FinanceCharge[]>([]);
  const [payments, setPayments] = useState<FinancePayment[]>([]);
  const [concepts, setConcepts] = useState<FinanceConcept[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFinanceData() {
      try {
        const [chargesRes, paymentsRes, conceptsRes] = await Promise.all([
          api.get("/finance/charges/"),
          api.get("/finance/payments/"),
          api.get("/finance/concepts/"),
        ]);

        setCharges(chargesRes.data);
        setPayments(paymentsRes.data);
        setConcepts(conceptsRes.data);
      } catch (error) {
        console.error("Error cargando dashboard de finanzas:", error);
      } finally {
        setLoading(false);
      }
    }

    loadFinanceData();
  }, []);

  const totalCharged = useMemo(
    () => charges.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [charges]
  );

  const totalPaid = useMemo(
    () => payments.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [payments]
  );

  const totalBalance = useMemo(
    () => charges.reduce((sum, item) => sum + Number(item.balance || 0), 0),
    [charges]
  );

  const pendingCharges = useMemo(
    () => charges.filter((item) => Number(item.balance || 0) > 0).length,
    [charges]
  );

  if (loading) {
    return (
      <IntranetLayout allowedRoles={["admin"]}>
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-slate-600">Cargando panel de finanzas...</p>
        </div>
      </IntranetLayout>
    );
  }

  return (
    <IntranetLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">
            Dashboard Finanzas
          </h1>
          <p className="mt-3 text-slate-600">
            Consulta cargos, pagos, conceptos y balance financiero general.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Cargos registrados"
            value={charges.length}
            subtitle="Total de cargos emitidos"
          />
          <StatCard
            title="Pagos registrados"
            value={payments.length}
            subtitle="Total de pagos aplicados"
          />
          <StatCard
            title="Monto cobrado"
            value={formatCurrency(totalPaid)}
            subtitle="Suma de pagos registrados"
          />
          <StatCard
            title="Saldo pendiente"
            value={formatCurrency(totalBalance)}
            subtitle={`${pendingCharges} cargos con saldo`}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Cargos recientes
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
                      {item.concept_name}
                    </p>
                    <p className="text-sm text-slate-500">
                      Alumno: {item.student_name} · {item.student_code}
                    </p>
                    <p className="text-sm text-slate-500">
                      Periodo: {item.academic_period_name}
                    </p>
                    <p className="text-sm text-slate-500">
                      Referencia: {item.reference}
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
                      Estado: {item.status}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Pagos recientes
            </h2>

            <div className="mt-4 space-y-4">
              {payments.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No hay pagos registrados.
                </p>
              ) : (
                payments.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <p className="font-semibold text-slate-900">
                      {item.charge_reference}
                    </p>
                    <p className="text-sm text-slate-500">
                      Alumno: {item.student_name} · {item.student_code}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Monto: {formatCurrency(item.amount)}
                    </p>
                    <p className="text-sm text-slate-600">
                      Método: {item.method}
                    </p>
                    <p className="text-sm text-slate-600">
                      Fecha: {formatDate(item.payment_date)}
                    </p>
                    <p className="text-sm text-slate-600">
                      Estado: {item.status}
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
              Conceptos de cobro
            </h2>

            <div className="mt-4 space-y-4">
              {concepts.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No hay conceptos registrados.
                </p>
              ) : (
                concepts.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <p className="font-semibold text-slate-900">
                      {item.code} · {item.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      Categoría: {item.category}
                    </p>
                    <p className="text-sm text-slate-500">
                      {item.description || "Sin descripción"}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Monto por defecto: {formatCurrency(item.default_amount)}
                    </p>
                    <p className="text-sm text-slate-600">
                      Estado: {item.active ? "Activo" : "Inactivo"}
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