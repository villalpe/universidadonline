"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import IntranetLayout from "@/components/layout/IntranetLayout";
import api from "@/lib/axios";
import Image from "next/image";
import {
  StudyPlan,
  StudyPlanSubject,
  StudyPlanSubjectPayload,
  Subject,
} from "@/types/academics";

const initialForm: StudyPlanSubjectPayload = {
  cycle_number: 1,
  order: 1,
  mandatory: true,
  passing_grade: "70.00",
  study_plan: 0,
  subject: 0,
};

export default function AdminPlanMateriasPage() {
  const [items, setItems] = useState<StudyPlanSubject[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<StudyPlanSubjectPayload>(initialForm);

  async function loadData() {
    try {
      const [itemsRes, plansRes, subjectsRes] = await Promise.all([
        api.get("/study-plan-subjects/"),
        api.get("/study-plans/"),
        api.get("/subjects/"),
      ]);

      setItems(itemsRes.data);
      setStudyPlans(plansRes.data);
      setSubjects(subjectsRes.data);
    } catch (err) {
      console.error("Error cargando plan por materia:", err);
      setError("No fue posible cargar la información de plan por materia.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function getStudyPlanName(id: number) {
    return studyPlans.find((item) => item.id === id)?.name ?? `Plan #${id}`;
  }

  function getSubjectName(id: number) {
    return subjects.find((item) => item.id === id)?.name ?? `Materia #${id}`;
  }

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return items;

    return items.filter((item) => {
      const studyPlanName = getStudyPlanName(item.study_plan).toLowerCase();
      const subjectName = getSubjectName(item.subject).toLowerCase();

      return (
        studyPlanName.includes(term) ||
        subjectName.includes(term) ||
        String(item.cycle_number).includes(term) ||
        String(item.order).includes(term) ||
        item.passing_grade.toLowerCase().includes(term)
      );
    });
  }, [items, search, studyPlans, subjects]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!form.study_plan) {
      setError("Debes seleccionar un plan de estudio.");
      setSubmitting(false);
      return;
    }

    if (!form.subject) {
      setError("Debes seleccionar una materia.");
      setSubmitting(false);
      return;
    }

    try {
      await api.post("/study-plan-subjects/", form);
      setForm(initialForm);
      await loadData();
    } catch (err: any) {
      console.error("Error creando relación plan-materia:", err.response?.data || err);
      setError("No fue posible crear la relación entre plan y materia.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleMandatory(item: StudyPlanSubject) {
    try {
      await api.patch(`/study-plan-subjects/${item.id}/`, {
        mandatory: !item.mandatory,
      });
      await loadData();
    } catch (err: any) {
      console.error("Error actualizando relación plan-materia:", err.response?.data || err);
      setError("No fue posible actualizar la relación plan-materia.");
    }
  }

  return (
    <IntranetLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-12 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Plan por materia
              </h1>
              <p className="mt-2 text-slate-600">
                Asigna materias a planes de estudio con ciclo, orden y criterios mínimos.
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
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Relaciones registradas
                </h2>
                <p className="text-sm text-slate-500">
                  Total: {filteredItems.length}
                </p>
              </div>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por plan, materia, ciclo u orden"
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
                  Cargando relaciones plan-materia...
                </p>
              ) : filteredItems.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No se encontraron relaciones.
                </p>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {getSubjectName(item.subject)}
                        </p>
                        <p className="text-sm text-slate-500">
                          Plan: {getStudyPlanName(item.study_plan)}
                        </p>
                        <p className="text-sm text-slate-500">
                          Ciclo: {item.cycle_number}
                        </p>
                        <p className="text-sm text-slate-500">
                          Orden: {item.order}
                        </p>
                        <p className="text-sm text-slate-500">
                          Calificación mínima: {item.passing_grade}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                          Obligatoria: {item.mandatory ? "Sí" : "No"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleMandatory(item)}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                      >
                        {item.mandatory ? "Marcar opcional" : "Marcar obligatoria"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Nueva relación
            </h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Plan de estudio
                </label>
                <select
                  value={form.study_plan}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      study_plan: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                >
                  <option value={0}>Selecciona un plan</option>
                  {studyPlans
                    .filter((item) => item.active)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Materia
                </label>
                <select
                  value={form.subject}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      subject: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                >
                  <option value={0}>Selecciona una materia</option>
                  {subjects
                    .filter((item) => item.active)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Ciclo
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.cycle_number}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        cycle_number: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Orden
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.order}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        order: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Calificación mínima aprobatoria
                </label>
                <input
                  type="text"
                  value={form.passing_grade}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      passing_grade: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </div>

              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.mandatory}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      mandatory: e.target.checked,
                    }))
                  }
                />
                Materia obligatoria
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Guardando..." : "Crear relación"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </IntranetLayout>
  );
}