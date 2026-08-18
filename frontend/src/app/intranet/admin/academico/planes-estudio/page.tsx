"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import IntranetLayout from "@/components/layout/IntranetLayout";
import api from "@/lib/axios";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { Career, StudyPlan, StudyPlanPayload } from "@/types/academics";

const initialForm: StudyPlanPayload = {
  code: "",
  name: "",
  version: "",
  effective_date: "",
  active: true,
  career: 0,
};

export default function AdminPlanesEstudioPage() {
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<StudyPlanPayload>(initialForm);

  async function loadData() {
    try {
      const [plansRes, careersRes] = await Promise.all([
        api.get("/study-plans/"),
        api.get("/careers/"),
      ]);

      setStudyPlans(plansRes.data);
      setCareers(careersRes.data);
    } catch (err) {
      console.error("Error cargando planes de estudio:", err);
      setError("No fue posible cargar los planes de estudio.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function getCareerName(careerId: number) {
    return careers.find((career) => career.id === careerId)?.name ?? "Sin carrera";
  }

  const filteredStudyPlans = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return studyPlans;

    return studyPlans.filter((item) => {
      const careerName = getCareerName(item.career).toLowerCase();

      return (
        item.code.toLowerCase().includes(term) ||
        item.name.toLowerCase().includes(term) ||
        item.version.toLowerCase().includes(term) ||
        careerName.includes(term)
      );
    });
  }, [studyPlans, careers, search]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!form.career) {
      setError("Debes seleccionar una carrera.");
      setSubmitting(false);
      return;
    }

    try {
      await api.post("/study-plans/", form);
      setForm(initialForm);
      await loadData();
    } catch (err: any) {
      console.error("Error creando plan de estudio:", err.response?.data || err);
      setError("No fue posible crear el plan de estudio. Revisa los campos capturados.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStudyPlanStatus(studyPlan: StudyPlan) {
    try {
      await api.patch(`/study-plans/${studyPlan.id}/`, {
        active: !studyPlan.active,
      });
      await loadData();
    } catch (err: any) {
      console.error("Error actualizando plan de estudio:", err.response?.data || err);
      setError("No fue posible actualizar el estado del plan de estudio.");
    }
  }

  return (
    <IntranetLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>  
              <h1 className="text-3xl font-bold text-slate-900">
                Planes de estudio
              </h1>
              <p className="mt-2 text-slate-600">
                Administra versiones curriculares y su vigencia por carrera.
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
                  Planes registrados
                </h2>
                <p className="text-sm text-slate-500">
                  Total: {filteredStudyPlans.length}
                </p>
              </div>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por código, nombre, versión o carrera"
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
                <p className="text-sm text-slate-500">Cargando planes de estudio...</p>
              ) : filteredStudyPlans.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No se encontraron planes de estudio.
                </p>
              ) : (
                filteredStudyPlans.map((item) => (
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
                          Versión: {item.version}
                        </p>
                        <p className="text-sm text-slate-500">
                          Carrera: {getCareerName(item.career)}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                          Vigencia: {formatDate(item.effective_date)}
                        </p>
                        <p className="text-sm text-slate-600">
                          Estado: {item.active ? "Activo" : "Inactivo"}
                        </p>
                        <p className="text-xs text-slate-400">
                          Actualizado: {formatDate(item.updated_at)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleStudyPlanStatus(item)}
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
              Nuevo plan de estudio
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
                  Versión
                </label>
                <input
                  type="text"
                  value={form.version}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, version: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Fecha efectiva
                </label>
                <input
                  type="date"
                  value={form.effective_date}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      effective_date: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Carrera
                </label>
                <select
                  value={form.career}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      career: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                >
                  <option value={0}>Selecciona una carrera</option>
                  {careers
                    .filter((item) => item.active)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>

              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, active: e.target.checked }))
                  }
                />
                Plan activo
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Guardando..." : "Crear plan de estudio"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </IntranetLayout>
  );
}