"use client";

import { useEffect, useMemo, useState } from "react";
import IntranetLayout from "@/components/layout/IntranetLayout";
import api from "@/lib/axios";
import { formatDate } from "@/lib/utils";
import { VirtualClassroom } from "@/types/academics";

export default function ProfesorSalonesPage() {
  const [classrooms, setClassrooms] = useState<VirtualClassroom[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const response = await api.get("/auth/teacher/classrooms/");
      setClassrooms(response.data);
    } catch (err) {
      console.error("Error cargando salones del profesor:", err);
      setError("No fue posible cargar tus salones virtuales.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function getStatusLabel(status: string) {
    switch (status) {
      case "draft":
        return "Borrador";
      case "active":
        return "Activo";
      case "closed":
        return "Cerrado";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  }

  const filteredClassrooms = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return classrooms;

    return classrooms.filter((item) => {
      return (
        item.code.toLowerCase().includes(term) ||
        item.name.toLowerCase().includes(term) ||
        item.subject_name?.toLowerCase().includes(term) ||
        item.academic_period_name?.toLowerCase().includes(term) ||
        item.main_teacher_name?.toLowerCase().includes(term) ||
        item.status.toLowerCase().includes(term)
      );
    });
  }, [classrooms, search]);

  return (
    <IntranetLayout allowedRoles={["teacher"]}>
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">Mis salones</h1>
          <p className="mt-2 text-slate-600">
            Consulta los salones virtuales en los que tienes asignación docente.
          </p>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Salones asignados
              </h2>
              <p className="text-sm text-slate-500">
                Total: {filteredClassrooms.length}
              </p>
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código, nombre, materia, período o estado"
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
                Cargando tus salones virtuales...
              </p>
            ) : filteredClassrooms.length === 0 ? (
              <p className="text-sm text-slate-500">
                No tienes salones virtuales asignados.
              </p>
            ) : (
              filteredClassrooms.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">
                        Código: {item.code}
                      </p>
                      <p className="text-sm text-slate-500">
                        Materia: {item.subject_name}
                      </p>
                      <p className="text-sm text-slate-500">
                        Período: {item.academic_period_name}
                      </p>
                      <p className="text-sm text-slate-500">
                        Profesor principal: {item.main_teacher_name || "Sin asignar"}
                      </p>
                      <p className="text-sm text-slate-500">
                        Cupo máximo: {item.max_students}
                      </p>
                      <p className="text-sm text-slate-500">
                        Fechas: {formatDate(item.start_date)} - {formatDate(item.end_date)}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        Estado: {getStatusLabel(item.status)}
                      </p>
                      <p className="text-sm text-slate-600">
                        {item.description || "Sin descripción"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </IntranetLayout>
  );
}