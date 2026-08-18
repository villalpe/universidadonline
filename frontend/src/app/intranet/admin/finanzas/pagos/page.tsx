"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import IntranetLayout from "@/components/layout/IntranetLayout";
import api from "@/lib/axios";
import Image from "next/image";
import { formatDate } from "@/lib/utils";

interface StudentOption {
  id: number;
  student_code: string;
  user:
    | number
    | {
        id: number;
        first_name?: string;
        last_name?: string;
        full_name?: string;
        username?: string;
      };
  full_name?: string;
  first_name?: string;
  last_name?: string;
}

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

interface StudentPaymentPayload {
  student: number;
  charge: number;
  payment_date: string;
  amount: string;
  method: string;
  status: string;
  transaction_reference: string;
  notes: string;
}

const initialForm: StudentPaymentPayload = {
  student: 0,
  charge: 0,
  payment_date: "",
  amount: "",
  method: "transfer",
  status: "completed",
  transaction_reference: "",
  notes: "",
};

const methodOptions = [
  { value: "cash", label: "Efectivo" },
  { value: "card", label: "Tarjeta" },
  { value: "transfer", label: "Transferencia" },
  { value: "online", label: "Pago en línea" },
  { value: "other", label: "Otro" },
];

const statusOptions = [
  { value: "pending", label: "Pendiente" },
  { value: "completed", label: "Completado" },
  { value: "failed", label: "Fallido" },
  { value: "cancelled", label: "Cancelado" },
];

export default function FinanzasPagosPage() {
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [charges, setCharges] = useState<StudentCharge[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [search, setSearch] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [form, setForm] = useState<StudentPaymentPayload>(initialForm);

  async function loadData() {
    try {
      const [paymentsRes, chargesRes, studentsRes] = await Promise.all([
        api.get("/finance/payments/"),
        api.get("/finance/charges/"),
        api.get("/auth/students/"),
      ]);

      setPayments(paymentsRes.data);
      setCharges(chargesRes.data);
      setStudents(studentsRes.data);
    } catch (err) {
      console.error("Error cargando pagos:", err);
      setError("No fue posible cargar los pagos de alumnos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const visiblePayments = useMemo(() => {
    const term = search.trim().toLowerCase();

    return payments.filter((item) => {
      const matchesMethod =
        selectedMethod === "all" || item.method === selectedMethod;

      const matchesStatus =
        selectedStatus === "all" || item.status === selectedStatus;

      const matchesSearch =
        !term ||
        item.student_name?.toLowerCase().includes(term) ||
        item.student_code?.toLowerCase().includes(term) ||
        item.charge_reference?.toLowerCase().includes(term) ||
        item.transaction_reference?.toLowerCase().includes(term) ||
        item.notes?.toLowerCase().includes(term);

      return matchesMethod && matchesStatus && matchesSearch;
    });
  }, [payments, search, selectedMethod, selectedStatus]);

  const availableCharges = useMemo(() => {
    if (!form.student) return [];

    return charges.filter(
      (item) =>
        item.student === form.student &&
        item.status !== "cancelled" &&
        Number(item.balance) > 0
    );
  }, [charges, form.student]);

  function getStudentLabel(student: StudentOption) {
    const nestedUser =
      typeof student.user === "object" && student.user !== null
        ? student.user
        : null;

    const fullName =
      student.full_name ||
      nestedUser?.full_name ||
      `${student.first_name ?? nestedUser?.first_name ?? ""} ${student.last_name ?? nestedUser?.last_name ?? ""}`.trim();

    return fullName
      ? `${student.student_code} - ${fullName}`
      : student.student_code;
  }

  function getMethodLabel(method: string) {
    return methodOptions.find((item) => item.value === method)?.label ?? method;
  }

  function getStatusLabel(status: string) {
    return statusOptions.find((item) => item.value === status)?.label ?? status;
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  function handleStudentChange(studentId: number) {
    setForm((prev) => ({
      ...prev,
      student: studentId,
      charge: 0,
    }));
  }

  function handleChargeChange(chargeId: number) {
    const selectedCharge = charges.find((item) => item.id === chargeId);

    setForm((prev) => ({
      ...prev,
      charge: chargeId,
      amount: selectedCharge ? selectedCharge.balance : prev.amount,
    }));
  }

  function handleEdit(payment: StudentPayment) {
    setEditingId(payment.id);
    setForm({
      student: payment.student,
      charge: payment.charge,
      payment_date: payment.payment_date ? payment.payment_date.slice(0, 16) : "",
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      transaction_reference: payment.transaction_reference || "",
      notes: payment.notes || "",
    });
    setError("");
    setSuccessMessage("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const payload = {
        ...form,
        payment_date: form.payment_date || null,
      };

      if (editingId) {
        await api.put(`/finance/payments/${editingId}/`, payload);
        setSuccessMessage("Pago actualizado correctamente.");
      } else {
        await api.post("/finance/payments/", payload);
        setSuccessMessage("Pago registrado correctamente.");
      }

      resetForm();
      await loadData();
    } catch (err: any) {
      console.error("Error guardando pago:", err.response?.data || err);
      setError("No fue posible guardar el pago.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <IntranetLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Pagos de alumnos
                </h1>
                <p className="mt-2 text-slate-600">
                  Registra y consulta los pagos aplicados a cargos financieros de los alumnos.
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

        <section className="grid gap-6 lg:grid-cols-[1fr,430px]">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Método
                </label>
                <select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                >
                  <option value="all">Todos</option>
                  {methodOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Estado
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                >
                  <option value="all">Todos</option>
                  {statusOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
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
                  placeholder="Alumno, referencia o nota"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {successMessage}
              </div>
            )}

            <div className="mt-6 space-y-4">
              {loading ? (
                <p className="text-sm text-slate-500">Cargando pagos...</p>
              ) : visiblePayments.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No hay pagos registrados.
                </p>
              ) : (
                visiblePayments.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="space-y-3">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {item.charge_reference}
                          </p>
                          <p className="text-sm text-slate-500">
                            Alumno: {item.student_name} ({item.student_code})
                          </p>
                          <p className="text-sm text-slate-500">
                            Método: {getMethodLabel(item.method)}
                          </p>
                          <p className="text-sm text-slate-500">
                            Estado: {getStatusLabel(item.status)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700"
                        >
                          Editar
                        </button>
                      </div>

                      <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                        <p>Monto: ${item.amount}</p>
                        <p>Fecha de pago: {formatDate(item.payment_date)}</p>
                        <p>
                          Referencia transacción:{" "}
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

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              {editingId ? "Editar pago" : "Nuevo pago"}
            </h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Alumno
                </label>
                <select
                  value={form.student}
                  onChange={(e) => handleStudentChange(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                >
                  <option value={0}>Selecciona un alumno</option>
                  {students.map((item) => (
                    <option key={item.id} value={item.id}>
                      {getStudentLabel(item)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Cargo
                </label>
                <select
                  value={form.charge}
                  onChange={(e) => handleChargeChange(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                  disabled={!form.student}
                >
                  <option value={0}>
                    {form.student
                      ? "Selecciona un cargo"
                      : "Primero selecciona un alumno"}
                  </option>
                  {availableCharges.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.reference} - Saldo ${item.balance}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Fecha y hora de pago
                </label>
                <input
                  type="datetime-local"
                  value={form.payment_date}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      payment_date: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Monto
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Método
                </label>
                <select
                  value={form.method}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      method: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                >
                  {methodOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Estado
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                >
                  {statusOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Referencia de transacción
                </label>
                <input
                  type="text"
                  value={form.transaction_reference}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      transaction_reference: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  placeholder="Ej. SPEI-ABC-123"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Notas
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  placeholder="Observaciones del pago"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Guardando..."
                    : editingId
                    ? "Actualizar pago"
                    : "Registrar pago"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>
      </div>
    </IntranetLayout>
  );
}