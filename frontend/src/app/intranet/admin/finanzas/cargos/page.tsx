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

interface ChargeConcept {
  id: number;
  code: string;
  name: string;
  category: string;
  default_amount: string;
  active: boolean;
}

interface AcademicPeriod {
  id: number;
  name: string;
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
  created_at: string;
  updated_at: string;
}

interface StudentChargePayload {
  student: number;
  concept: number;
  academic_period: number | null;
  reference: string;
  description: string;
  amount: string;
  due_date: string;
  status: string;
}

const initialForm: StudentChargePayload = {
  student: 0,
  concept: 0,
  academic_period: null,
  reference: "",
  description: "",
  amount: "",
  due_date: "",
  status: "pending",
};

const statusOptions = [
  { value: "pending", label: "Pendiente" },
  { value: "partial", label: "Parcial" },
  { value: "paid", label: "Pagado" },
  { value: "cancelled", label: "Cancelado" },
];

const editableStatusOptions = [
  { value: "pending", label: "Pendiente" },
  { value: "cancelled", label: "Cancelado" },
];

export default function FinanzasCargosPage() {
  const [charges, setCharges] = useState<StudentCharge[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [concepts, setConcepts] = useState<ChargeConcept[]>([]);
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [form, setForm] = useState<StudentChargePayload>(initialForm);

  async function loadData() {
    try {
        const [chargesRes, studentsRes, conceptsRes, periodsRes] = await Promise.all([
        api.get("/finance/charges/"),
        api.get("/auth/students/"),
        api.get("/finance/concepts/"),
        api.get("/academic-periods/"),
        ]);

      setCharges(chargesRes.data);
      setStudents(studentsRes.data);
      setConcepts(conceptsRes.data);
      setPeriods(periodsRes.data);
    } catch (err) {
      console.error("Error cargando cargos:", err);
      setError("No fue posible cargar los cargos a alumnos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const activeConcepts = useMemo(
    () => concepts.filter((item) => item.active),
    [concepts]
  );

  const visibleCharges = useMemo(() => {
    const term = search.trim().toLowerCase();

    return charges.filter((item) => {
      const matchesStatus =
        selectedStatus === "all" || item.status === selectedStatus;

      const matchesSearch =
        !term ||
        item.reference.toLowerCase().includes(term) ||
        item.student_name?.toLowerCase().includes(term) ||
        item.student_code?.toLowerCase().includes(term) ||
        item.concept_name?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [charges, search, selectedStatus]);

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

  function getStatusLabel(status: string) {
    return statusOptions.find((item) => item.value === status)?.label ?? status;
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  function handleConceptChange(conceptId: number) {
    const selectedConcept = concepts.find((item) => item.id === conceptId);

    setForm((prev) => ({
      ...prev,
      concept: conceptId,
      amount: selectedConcept?.default_amount ?? prev.amount,
    }));
  }

  function handleEdit(charge: StudentCharge) {
    setEditingId(charge.id);
    setForm({
      student: charge.student,
      concept: charge.concept,
      academic_period: charge.academic_period,
      reference: charge.reference,
      description: charge.description || "",
      amount: charge.amount,
      due_date: charge.due_date || "",
      status: charge.status,
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
        academic_period: form.academic_period || null,
        due_date: form.due_date || null,
        status:
            editingId && form.status === "cancelled"
            ? "cancelled"
            : "pending",
    };

      if (editingId) {
        await api.put(`/finance/charges/${editingId}/`, payload);
        setSuccessMessage("Cargo actualizado correctamente.");
      } else {
        await api.post("/finance/charges/", payload);
        setSuccessMessage("Cargo creado correctamente.");
      }

      resetForm();
      await loadData();
    } catch (err: any) {
      console.error("Error guardando cargo:", err.response?.data || err);
      setError("No fue posible guardar el cargo.");
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
                Cargos a alumnos
              </h1>
              <p className="mt-2 text-slate-600">
                Registra y administra los cargos financieros asignados a los alumnos.
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

              <div className="md:col-span-1 lg:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Buscar
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Referencia, alumno, matrícula o concepto"
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
                <p className="text-sm text-slate-500">Cargando cargos...</p>
              ) : visibleCharges.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No se encontraron cargos registrados.
                </p>
              ) : (
                visibleCharges.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="space-y-3">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {item.reference}
                          </p>
                          <p className="text-sm text-slate-500">
                            Alumno: {item.student_name} ({item.student_code})
                          </p>
                          <p className="text-sm text-slate-500">
                            Concepto: {item.concept_name}
                          </p>
                          <p className="text-sm text-slate-500">
                            Período: {item.academic_period_name || "Sin período"}
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
                        <p>Total pagado: ${item.total_paid}</p>
                        <p>Saldo: ${item.balance}</p>
                        <p>Estado: {getStatusLabel(item.status)}</p>
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
            <h2 className="text-xl font-semibold text-slate-900">
              {editingId ? "Editar cargo" : "Nuevo cargo"}
            </h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Alumno
                </label>
                <select
                  value={form.student}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      student: Number(e.target.value),
                    }))
                  }
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
                  Concepto de cobro
                </label>
                <select
                  value={form.concept}
                  onChange={(e) => handleConceptChange(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                >
                  <option value={0}>Selecciona un concepto</option>
                  {activeConcepts.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.code} - {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Período académico
                </label>
                <select
                  value={form.academic_period ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      academic_period: e.target.value
                        ? Number(e.target.value)
                        : null,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                >
                  <option value="">Sin período</option>
                  {periods.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Referencia
                </label>
                <input
                  type="text"
                  value={form.reference}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      reference: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  placeholder="Ej. CARGO-2026-0001"
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
                  Fecha límite
                </label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      due_date: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                />
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
                    disabled={!editingId}
                >
                    {!editingId ? (
                    <option value="pending">Pendiente</option>
                    ) : (
                    editableStatusOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                        {item.label}
                        </option>
                    ))
                    )}
                </select>
                <p className="mt-1 text-xs text-slate-500">
                    {editingId
                    ? "Solo puedes cancelar manualmente un cargo. Los estados pendiente, parcial y pagado se calculan automáticamente según los pagos."
                    : "Los cargos nuevos se crean como pendientes. El estado cambia automáticamente según los pagos."}
                </p>
            </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Descripción
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  placeholder="Descripción del cargo"
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
                    ? "Actualizar cargo"
                    : "Crear cargo"}
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