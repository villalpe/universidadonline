"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import IntranetLayout from "@/components/layout/IntranetLayout";
import Image from "next/image";
import api from "@/lib/axios";

interface ChargeConcept {
  id: number;
  code: string;
  name: string;
  category: string;
  description: string;
  default_amount: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface ChargeConceptPayload {
  code: string;
  name: string;
  category: string;
  description: string;
  default_amount: string;
  active: boolean;
}

const initialForm: ChargeConceptPayload = {
  code: "",
  name: "",
  category: "tuition",
  description: "",
  default_amount: "",
  active: true,
};

const categoryOptions = [
  { value: "enrollment", label: "Inscripción" },
  { value: "tuition", label: "Colegiatura" },
  { value: "exam", label: "Examen" },
  { value: "penalty", label: "Recargo" },
  { value: "other", label: "Otro" },
];

export default function FinanzasConceptosPage() {
  const [concepts, setConcepts] = useState<ChargeConcept[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [form, setForm] = useState<ChargeConceptPayload>(initialForm);

  async function loadData() {
    try {
      const response = await api.get("/finance/concepts/");
      setConcepts(response.data);
    } catch (err) {
      console.error("Error cargando conceptos de cobro:", err);
      setError("No fue posible cargar los conceptos de cobro.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const visibleConcepts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return concepts.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      const matchesSearch =
        !term ||
        item.code.toLowerCase().includes(term) ||
        item.name.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [concepts, search, selectedCategory]);

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  function getCategoryLabel(category: string) {
    return (
      categoryOptions.find((item) => item.value === category)?.label ?? category
    );
  }

  function handleEdit(concept: ChargeConcept) {
    setEditingId(concept.id);
    setForm({
      code: concept.code,
      name: concept.name,
      category: concept.category,
      description: concept.description || "",
      default_amount: concept.default_amount,
      active: concept.active,
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
      if (editingId) {
        await api.put(`/finance/concepts/${editingId}/`, form);
        setSuccessMessage("Concepto actualizado correctamente.");
      } else {
        await api.post("/finance/concepts/", form);
        setSuccessMessage("Concepto creado correctamente.");
      }

      resetForm();
      await loadData();
    } catch (err: any) {
      console.error("Error guardando concepto:", err.response?.data || err);
      setError("No fue posible guardar el concepto.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(concept: ChargeConcept) {
    setError("");
    setSuccessMessage("");

    try {
      await api.patch(`/finance/concepts/${concept.id}/`, {
        active: !concept.active,
      });
      setSuccessMessage("Estado del concepto actualizado correctamente.");
      await loadData();
    } catch (err: any) {
      console.error("Error actualizando estado:", err.response?.data || err);
      setError("No fue posible actualizar el estado del concepto.");
    }
  }

  return (
    <IntranetLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Conceptos de cobro
              </h1>
              <p className="mt-2 text-slate-600">
                Administra los conceptos base para cargos financieros.
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

        <section className="grid gap-6 lg:grid-cols-[1fr,420px]">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Categoría
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                >
                  <option value="all">Todas</option>
                  {categoryOptions.map((item) => (
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
                  placeholder="Código, nombre o descripción"
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
                <p className="text-sm text-slate-500">
                  Cargando conceptos de cobro...
                </p>
              ) : visibleConcepts.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No se encontraron conceptos.
                </p>
              ) : (
                visibleConcepts.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.code} - {item.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          Categoría: {getCategoryLabel(item.category)}
                        </p>
                        <p className="text-sm text-slate-600">
                          Monto por defecto: ${item.default_amount}
                        </p>
                        <p className="text-sm text-slate-600">
                          Estado: {item.active ? "Activo" : "Inactivo"}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                          {item.description || "Sin descripción"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleActive(item)}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                        >
                          {item.active ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              {editingId ? "Editar concepto" : "Nuevo concepto"}
            </h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Código
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, code: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm uppercase outline-none focus:border-slate-500"
                  placeholder="Ej. COL2026"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Nombre
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  placeholder="Ej. Colegiatura mensual"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Categoría
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                >
                  {categoryOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Monto por defecto
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.default_amount}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      default_amount: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  placeholder="0.00"
                  required
                />
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
                  placeholder="Descripción del concepto"
                />
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      active: e.target.checked,
                    }))
                  }
                />
                <span className="text-sm text-slate-700">Concepto activo</span>
              </label>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Guardando..."
                    : editingId
                    ? "Actualizar"
                    : "Crear concepto"}
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