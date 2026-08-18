"use client";

import { useEffect, useMemo, useState } from "react";
import IntranetLayout from "@/components/layout/IntranetLayout";
import api from "@/lib/axios";
import { formatDate } from "@/lib/utils";

interface StudentCharge {
  id: number;
  student: number;
  student_name: string;
  student_code: string;
  concept: number;
  concept_name: string;
  academic_period: number | null;
  academic_period_name: string | null;
  reference: string;
  description: string;
  amount: string;
  due_date: string | null;
  status: string;
  total_paid: string;
  balance: string;
  created_at: string;
  updated_at: string;
}

interface StudentPayment {
  id: number;
  student: number;
  student_name: string;
  student_code: string;
  charge: number;
  charge_reference: string;
  payment_date: string;
  amount: string;
  method: string;
  status: string;
  transaction_reference: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface StatementResponse {
  student_id: number;
  student_code: string;
  student_name: string;
  total_charges: string;
  total_payments: string;
  balance: string;
  charges: StudentCharge[];
  payments: StudentPayment[];
}

const paymentMethodLabels: Record<string, string> = {
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
  online: "Pago en línea",
  other: "Otro",
};

const paymentStatusLabels: Record<string, string> = {
  pending: "Pendiente",
  completed: "Completado",
  failed: "Fallido",
  cancelled: "Cancelado",
};

const chargeStatusLabels: Record<string, string> = {
  pending: "Pendiente",
  partial: "Parcial",
  paid: "Pagado",
  cancelled: "Cancelado",
};

export default function AlumnoEstadoCuentaPage() {
  const [statement, setStatement] = useState<StatementResponse | null>(null);
  const [searchCharge, setSearchCharge] = useState("");
  const [searchPayment, setSearchPayment] = useState("");
  const [selectedChargeStatus, setSelectedChargeStatus] = useState("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const response = await api.get("/auth/my/statement/");
      setStatement(response.data);
    } catch (err) {
      console.error("Error cargando estado de cuenta:", err);
      setError("No fue posible cargar tu estado de cuenta.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const visibleCharges = useMemo(() => {
    if (!statement) return [];

    const term = searchCharge.trim().toLowerCase();

    return statement.charges.filter((item) => {
      const matchesStatus =
        selectedChargeStatus === "all" || item.status === selectedChargeStatus;

      const matchesSearch =
        !term ||
        item.reference.toLowerCase().includes(term) ||
        item.concept_name?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.academic_period_name?.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [statement, searchCharge, selectedChargeStatus]);

  const visiblePayments = useMemo(() => {
    if (!statement) return [];

    const term = searchPayment.trim().toLowerCase();

    return statement.payments.filter((item) => {
      const matchesStatus =
        selectedPaymentStatus === "all" || item.status === selectedPaymentStatus;

      const matchesSearch =
        !term ||
        item.charge_reference?.toLowerCase().includes(term) ||
        item.transaction_reference?.toLowerCase().includes(term) ||
        item.notes?.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [statement, searchPayment, selectedPaymentStatus]);

  return (
    <IntranetLayout allowedRoles={["student"]}>
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">
            Estado de cuenta
          </h1>
          <p className="mt-2 text-slate-600">
            Consulta tus cargos, pagos y saldo actual.
          </p>
        </section>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Cargando estado de cuenta...</p>
          </section>
        ) : !statement ? (
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">
              No fue posible obtener tu información financiera.
            </p>
          </section>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">Alumno</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {statement.student_name}
                </p>
                <p className="text-sm text-slate-500">
                  Matrícula: {statement.student_code}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">Total cargos</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  ${statement.total_charges}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">Total pagado</p>
                <p className="mt-2 text-2xl font-bold text-emerald-600">
                  ${statement.total_payments}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">Saldo actual</p>
                <p className="mt-2 text-2xl font-bold text-amber-600">
                  ${statement.balance}
                </p>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      Mis cargos
                    </h2>
                    <p className="text-sm text-slate-500">
                      Consulta los cargos aplicados a tu cuenta.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Estado
                    </label>
                    <select
                      value={selectedChargeStatus}
                      onChange={(e) => setSelectedChargeStatus(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                    >
                      <option value="all">Todos</option>
                      {Object.entries(chargeStatusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
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
                      value={searchCharge}
                      onChange={(e) => setSearchCharge(e.target.value)}
                      placeholder="Referencia, concepto o descripción"
                      className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {visibleCharges.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No se encontraron cargos.
                    </p>
                  ) : (
                    visibleCharges.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <div className="space-y-3">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {item.reference}
                            </p>
                            <p className="text-sm text-slate-500">
                              Concepto: {item.concept_name}
                            </p>
                            <p className="text-sm text-slate-500">
                              Período: {item.academic_period_name || "Sin período"}
                            </p>
                          </div>

                          <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                            <p>Monto: ${item.amount}</p>
                            <p>Total pagado: ${item.total_paid}</p>
                            <p>Saldo: ${item.balance}</p>
                            <p>
                              Estado:{" "}
                              {chargeStatusLabels[item.status] || item.status}
                            </p>
                            <p>
                              Vencimiento:{" "}
                              {item.due_date ? formatDate(item.due_date) : "Sin fecha"}
                            </p>
                          </div>

                          <p className="text-sm text-slate-600">
                            {item.description || "Sin descripción"}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      Mis pagos
                    </h2>
                    <p className="text-sm text-slate-500">
                      Consulta los pagos registrados en tu cuenta.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Estado
                    </label>
                    <select
                      value={selectedPaymentStatus}
                      onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                    >
                      <option value="all">Todos</option>
                      {Object.entries(paymentStatusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
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
                      value={searchPayment}
                      onChange={(e) => setSearchPayment(e.target.value)}
                      placeholder="Cargo, referencia o notas"
                      className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {visiblePayments.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No se encontraron pagos.
                    </p>
                  ) : (
                    visiblePayments.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <div className="space-y-3">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {item.charge_reference}
                            </p>
                            <p className="text-sm text-slate-500">
                              Método:{" "}
                              {paymentMethodLabels[item.method] || item.method}
                            </p>
                            <p className="text-sm text-slate-500">
                              Estado:{" "}
                              {paymentStatusLabels[item.status] || item.status}
                            </p>
                          </div>

                          <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                            <p>Monto: ${item.amount}</p>
                            <p>Fecha: {formatDate(item.payment_date)}</p>
                            <p>
                              Referencia:{" "}
                              {item.transaction_reference || "Sin referencia"}
                            </p>
                          </div>

                          <p className="text-sm text-slate-600">
                            {item.notes || "Sin notas"}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </IntranetLayout>
  );
}