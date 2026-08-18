"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import IntranetLayout from "@/components/layout/IntranetLayout";
import api from "@/lib/axios";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { AcademicPeriod, AcademicPeriodPayload } from "@/types/academics";

const initialForm: AcademicPeriodPayload = {
  code: "",
  name: "",
  start_date: "",
  end_date: "",
  enrollment_start: "",
  enrollment_end: "",
  status: "active",
};

export default function AdminPeriodosPage() {
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<AcademicPeriodPayload>(initialForm);

  async function loadData() {
    try {
      const response = await api.get("/academic-periods/");
      setPeriods(response.data);
    } catch (err) {
      console.error("Error cargando períodos académicos:", err);
      setError("No fue posible cargar los períodos académicos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredPeriods = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return periods;

    return periods.filter((item) => {
      return (
        item.code.toLowerCase().includes(term) ||
        item.name.toLowerCase().includes(term) ||
        item.status.toLowerCase().includes(term)
      );
    });
  }, [periods, search]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (form.start_date > form.end_date) {
      setError("La fecha de inicio no puede ser mayor que la fecha de fin.");
      setSubmitting(false);
      return;
    }

    if (form.enrollment_start > form.enrollment_end) {
      setError("La fecha inicial de inscripción no puede ser mayor que la fecha final de inscripción.");
      setSubmitting(false);
      return;
    }

    try {
      await api.post("/academic-periods/", form);
      setForm(initialForm);
      await loadData();
    } catch (err: any) {
      console.error("Error creando período académico:", err.response?.data || err);
      setError("No fue posible crear el período académico. Revisa los campos capturados.");
    } finally {
      setSubmitting(false);
    }
  }

  async function updatePeriodStatus(period: AcademicPeriod, status: string) {
    try {
      await api.patch(`/academic-periods/${period.id}/`, { status });
      await loadData();
    } catch (err: any) {
      console.error("Error actualizando período académico:", err.response?.data || err);
      setError("No fue posible actualizar el estado del período académico.");
    }
  }

  return (
    <IntranetLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Períodos académicos
              </h1>
              <p className="mt-2 text-slate-600">
                Administra la apertura de ciclos escolares y sus ventanas de inscripción.
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
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Períodos registrados
                </h2>
                <p className="text-sm text-slate-500">
                  Total: {filteredPeriods.length}
                </p>
              </div>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por código, nombre o estado"
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500 md:max-w-sm"
              />
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-4 space-y-4">
              {loading ? (
                <p className="text-sm text-slate-500">
                  Cargando períodos académicos...
                </p>
              ) : filteredPeriods.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No se encontraron períodos académicos.
                </p>
              ) : (
                filteredPeriods.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          Código: {item.code}
                        </p>
                        <p className="text-sm text-slate-500">
                          Periodo: {formatDate(item.start_date)} - {formatDate(item.end_date)}
                        </p>
                        <p className="text-sm text-slate-500">
                          Inscripción: {formatDate(item.enrollment_start)} - {formatDate(item.enrollment_end)}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                          Estado: {item.status}
                        </p>
                        <p className="text-xs text-slate-400">
                          Actualizado: {formatDate(item.updated_at)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => updatePeriodStatus(item, "active")}
                          className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700"
                        >
                          Activar
                        </button>
                        <button
                          type="button"
                          onClick={() => updatePeriodStatus(item, "inactive")}
                          className="rounded-lg bg-slate-600 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700"
                        >
                          Inactivar
                        </button>
                        <button
                          type="button"
                          onClick={() => updatePeriodStatus(item, "closed")}
                          className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
                        >
                          Cerrar
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
              Nuevo período académico
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
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
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
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Fecha inicio
                  </label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, start_date: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Fecha fin
                  </label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, end_date: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Inicio inscripción
                  </label>
                  <input
                    type="date"
                    value={form.enrollment_start}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        enrollment_start: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Fin inscripción
                  </label>
                  <input
                    type="date"
                    value={form.enrollment_end}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        enrollment_end: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Estado
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="closed">Cerrado</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Guardando..." : "Crear período académico"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </IntranetLayout>
  );
}