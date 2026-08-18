"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import IntranetLayout from "@/components/layout/IntranetLayout";
import api from "@/lib/axios";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { Career, CareerPayload } from "@/types/academics";

const initialForm: CareerPayload = {
  code: "",
  name: "",
  description: "",
  duration_months: 36,
  active: true,
};

export default function AdminCarrerasPage() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<CareerPayload>(initialForm);

  async function loadData() {
    try {
      const response = await api.get("/careers/");
      setCareers(response.data);
    } catch (err) {
      console.error("Error cargando carreras:", err);
      setError("No fue posible cargar las carreras.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredCareers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return careers;

    return careers.filter((item) => {
      return (
        item.code.toLowerCase().includes(term) ||
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term)
      );
    });
  }, [careers, search]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await api.post("/careers/", form);
      setForm(initialForm);
      await loadData();
    } catch (err: any) {
      console.error("Error creando carrera:", err.response?.data || err);
      setError("No fue posible crear la carrera. Revisa los campos capturados.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleCareerStatus(career: Career) {
    try {
      await api.patch(`/careers/${career.id}/`, {
        active: !career.active,
      });
      await loadData();
    } catch (err: any) {
      console.error("Error actualizando carrera:", err.response?.data || err);
      setError("No fue posible actualizar el estado de la carrera.");
    }
  }

  return (
    <IntranetLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>  
              <h1 className="text-3xl font-bold text-slate-900">Carreras</h1>
              <p className="mt-2 text-slate-600">
                Administra las Licenciaturas académicas base de la institución.
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

        <section className="grid gap-6 lg:grid-cols-[1fr,400px]">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Carreras registradas
                </h2>
                <p className="text-sm text-slate-500">
                  Total: {filteredCareers.length}
                </p>
              </div>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por código, nombre o descripción"
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
                <p className="text-sm text-slate-500">Cargando carreras...</p>
              ) : filteredCareers.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No se encontraron carreras.
                </p>
              ) : (
                filteredCareers.map((item) => (
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
                          Duración: {item.duration_months} meses
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                          {item.description || "Sin descripción"}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                          Estado: {item.active ? "Activa" : "Inactiva"}
                        </p>
                        <p className="text-xs text-slate-400">
                          Actualizada: {formatDate(item.updated_at)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleCareerStatus(item)}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                      >
                        {item.active ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Nueva carrera
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
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Duración en meses
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.duration_months}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      duration_months: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </div>

              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, active: e.target.checked }))
                  }
                />
                Carrera activa
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Guardando..." : "Crear carrera"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </IntranetLayout>
  );
}