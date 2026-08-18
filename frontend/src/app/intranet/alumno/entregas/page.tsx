"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import IntranetLayout from "@/components/layout/IntranetLayout";
import api from "@/lib/axios";
import { formatDate } from "@/lib/utils";
import {
  Assignment,
  Submission,
  VirtualClassroom,
  WeeklyModule,
} from "@/types/academics";

interface SubmissionPayload {
  assignment: number;
  text_submission: string;
  status: string;
}

const initialForm: SubmissionPayload = {
  assignment: 0,
  text_submission: "",
  status: "submitted",
};

export default function AlumnoEntregasPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [modules, setModules] = useState<WeeklyModule[]>([]);
  const [classrooms, setClassrooms] = useState<VirtualClassroom[]>([]);
  const [search, setSearch] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState<number | "all">("all");
  const [selectedAssignment, setSelectedAssignment] = useState<number | "all">("all");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [form, setForm] = useState<SubmissionPayload>(initialForm);

  async function loadData() {
    try {
      const [submissionsRes, assignmentsRes, modulesRes, classroomsRes] =
        await Promise.all([
          api.get("/submissions/"),
          api.get("/assignments/"),
          api.get("/weekly-modules/"),
          api.get("/virtual-classrooms/"),
        ]);

      setSubmissions(submissionsRes.data);
      setAssignments(assignmentsRes.data);
      setModules(modulesRes.data);
      setClassrooms(classroomsRes.data);
    } catch (err) {
      console.error("Error cargando entregas del alumno:", err);
      setError("No fue posible cargar tus entregas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const availableAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const module = modules.find((item) => item.id === assignment.weekly_module);
      if (!module || !module.is_published) return false;

      const classroom = classrooms.find((item) => item.id === module.virtual_classroom);
      if (!classroom) return false;

      const matchesClassroom =
        selectedClassroom === "all" || classroom.id === selectedClassroom;

      return assignment.is_published && matchesClassroom;
    });
  }, [assignments, modules, classrooms, selectedClassroom]);

  const visibleSubmissions = useMemo(() => {
    const term = search.trim().toLowerCase();

    return submissions.filter((submission) => {
      const assignment = assignments.find((item) => item.id === submission.assignment);
      if (!assignment) return false;

      const module = modules.find((item) => item.id === assignment.weekly_module);
      if (!module) return false;

      const classroom = classrooms.find((item) => item.id === module.virtual_classroom);
      if (!classroom) return false;

      const matchesClassroom =
        selectedClassroom === "all" || classroom.id === selectedClassroom;

      const matchesAssignment =
        selectedAssignment === "all" || submission.assignment === selectedAssignment;

      const matchesSearch =
        !term ||
        submission.assignment_title?.toLowerCase().includes(term) ||
        submission.status?.toLowerCase().includes(term) ||
        classroom.name.toLowerCase().includes(term);

      return matchesClassroom && matchesAssignment && matchesSearch;
    });
  }, [
    submissions,
    assignments,
    modules,
    classrooms,
    selectedClassroom,
    selectedAssignment,
    search,
  ]);

  function getStatusLabel(status: string) {
    switch (status) {
      case "submitted":
        return "Entregada";
      case "late":
        return "Tardía";
      case "reviewed":
        return "Revisada";
      case "graded":
        return "Calificada";
      default:
        return status;
    }
  }

  function getClassroomNameByAssignment(assignmentId: number) {
    const assignment = assignments.find((item) => item.id === assignmentId);
    if (!assignment) return "Salón no disponible";

    const module = modules.find((item) => item.id === assignment.weekly_module);
    if (!module) return "Salón no disponible";

    return (
      classrooms.find((item) => item.id === module.virtual_classroom)?.name ??
      "Salón no disponible"
    );
  }

  function handleFileChange(files: FileList | null) {
    if (!files) {
      setSelectedFiles([]);
      return;
    }

    setSelectedFiles(Array.from(files));
  }

  async function uploadFilesForSubmission(submissionId: number) {
    if (selectedFiles.length === 0) return;

    setUploadingFiles(true);

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("submission", String(submissionId));
        formData.append("file", file);
        formData.append("original_name", file.name);

        await api.post("/submission-files/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
    } catch (err: any) {
      console.error("Error subiendo archivos:", err.response?.data || err);
      throw new Error("No fue posible subir uno o más archivos.");
    } finally {
      setUploadingFiles(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    if (!form.assignment) {
      setError("Debes seleccionar una tarea.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await api.post("/submissions/", form);
      const createdSubmission = response.data;

      if (selectedFiles.length > 0) {
        await uploadFilesForSubmission(createdSubmission.id);
      }

      setForm(initialForm);
      setSelectedFiles([]);
      setSuccessMessage(
        `Entrega registrada correctamente (intento #${createdSubmission.attempt_number ?? "?"}).`
      );
      await loadData();
    } catch (err: any) {
      console.error("Error creando entrega:", err.response?.data || err);
      setError(err?.message || "No fue posible registrar la entrega.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <IntranetLayout allowedRoles={["student"]}>
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">Mis entregas</h1>
          <p className="mt-2 text-slate-600">
            Envía y consulta tus entregas de tareas.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr,430px]">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Filtrar por salón
                </label>
                <select
                  value={selectedClassroom}
                  onChange={(e) => {
                    const value =
                      e.target.value === "all" ? "all" : Number(e.target.value);
                    setSelectedClassroom(value);
                    setSelectedAssignment("all");
                  }}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                >
                  <option value="all">Todos los salones</option>
                  {classrooms.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Filtrar por tarea
                </label>
                <select
                  value={selectedAssignment}
                  onChange={(e) =>
                    setSelectedAssignment(
                      e.target.value === "all" ? "all" : Number(e.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                >
                  <option value="all">Todas las tareas</option>
                  {availableAssignments.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
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
                  placeholder="Tarea, salón o estado"
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
                <p className="text-sm text-slate-500">Cargando entregas...</p>
              ) : visibleSubmissions.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No tienes entregas registradas.
                </p>
              ) : (
                visibleSubmissions.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.assignment_title}
                        </p>
                        <p className="text-sm text-slate-500">
                          Salón: {getClassroomNameByAssignment(item.assignment)}
                        </p>
                        <p className="text-sm text-slate-600">
                          Estado: {getStatusLabel(item.status)}
                        </p>
                        <p className="text-sm text-slate-600">
                          Intento: {item.attempt_number}
                        </p>
                        <p className="text-xs text-slate-400">
                          Enviado: {formatDate(item.submitted_at)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          Texto enviado
                        </p>
                        <div className="mt-1 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 whitespace-pre-line">
                          {item.text_submission || "Sin contenido en texto."}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          Archivos adjuntos
                        </p>
                        {item.files.length === 0 ? (
                          <p className="mt-1 text-sm text-slate-500">
                            Sin archivos adjuntos.
                          </p>
                        ) : (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {item.files.map((file) => (
                              <a
                                key={file.id}
                                href={file.file_url || "#"}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700"
                              >
                                {file.original_name}
                              </a>
                            ))}
                          </div>
                        )}

                        <div className="pt-3">
                          <button
                            type="button"
                            onClick={() => {
                              setForm((prev) => ({
                                ...prev,
                                assignment: item.assignment,
                                text_submission: "",
                                status: "submitted",
                              }));
                              setSelectedFiles([]);
                              setSuccessMessage("");
                              setError("");
                              window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                            }}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Reentregar tarea
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Nueva entrega
            </h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Tarea
                </label>
                <select
                  value={form.assignment}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      assignment: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                  required
                >
                  <option value={0}>Selecciona una tarea</option>
                  {availableAssignments.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Texto de entrega
                </label>
                <textarea
                  value={form.text_submission}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      text_submission: e.target.value,
                    }))
                  }
                  rows={8}
                  placeholder="Escribe aquí tu respuesta o entrega en texto"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Archivos adjuntos
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => handleFileChange(e.target.files)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Formatos permitidos: PDF (.pdf), Word (.docx), Excel (.xlsx) e imágenes.
                </p>

                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700"
                      >
                        {file.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || uploadingFiles}
                className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Registrando entrega..."
                  : uploadingFiles
                  ? "Subiendo archivos..."
                  : "Registrar entrega"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </IntranetLayout>
  );
}