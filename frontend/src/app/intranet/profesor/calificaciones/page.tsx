"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import IntranetLayout from "@/components/layout/IntranetLayout";
import api from "@/lib/axios";
import { formatDate } from "@/lib/utils";
import {
  Assignment,
  GradeRecord,
  GradeRecordPayload,
  Submission,
  VirtualClassroom,
  WeeklyModule,
} from "@/types/academics";

interface StudentOption {
  id: number;
  student_name: string;
  student_code: string;
  virtual_classroom: number;
}

const initialForm: GradeRecordPayload = {
  student: 0,
  virtual_classroom: 0,
  assignment: 0,
  submission: null,
  score: "",
  feedback: "",
  graded_by: null,
  graded_at: null,
};

export default function ProfesorCalificacionesPage() {
  const [gradeRecords, setGradeRecords] = useState<GradeRecord[]>([]);
  const [classrooms, setClassrooms] = useState<VirtualClassroom[]>([]);
  const [weeklyModules, setWeeklyModules] = useState<WeeklyModule[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [enrollments, setEnrollments] = useState<StudentOption[]>([]);
  const [search, setSearch] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState<number | "all">("all");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formNotice, setFormNotice] = useState("");
  const [form, setForm] = useState<GradeRecordPayload>(initialForm);

  async function loadData() {
    try {
      const [
        gradeRecordsRes,
        classroomsRes,
        weeklyModulesRes,
        assignmentsRes,
        submissionsRes,
        enrollmentsRes,
      ] = await Promise.all([
        api.get("/grade-records/"),
        api.get("/auth/teacher/classrooms/"),
        api.get("/weekly-modules/"),
        api.get("/assignments/"),
        api.get("/submissions/"),
        api.get("/classroom-enrollments/"),
      ]);

      setGradeRecords(gradeRecordsRes.data);
      setClassrooms(classroomsRes.data);
      setWeeklyModules(weeklyModulesRes.data);
      setAssignments(assignmentsRes.data);
      setSubmissions(submissionsRes.data);

      const normalizedEnrollments = enrollmentsRes.data.map((item: any) => ({
        id: typeof item.student === "object" ? item.student?.id : item.student,
        student_name:
          item.student_name ||
          item.student_full_name ||
          item.student?.full_name ||
          item.student?.user?.full_name ||
          item.student?.user?.name ||
          "",
        student_code:
          item.student_code ||
          item.student?.student_code ||
          "",
        virtual_classroom:
          typeof item.virtual_classroom === "object"
            ? item.virtual_classroom?.id
            : item.virtual_classroom,
      }));

      setEnrollments(normalizedEnrollments);
    } catch (err) {
      console.error("Error cargando calificaciones:", err);
      setError("No fue posible cargar las calificaciones.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const teacherClassroomIds = useMemo(
    () => classrooms.map((item) => item.id),
    [classrooms]
  );

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const weeklyModule = weeklyModules.find(
        (item) => item.id === assignment.weekly_module
      );
      return weeklyModule
        ? teacherClassroomIds.includes(weeklyModule.virtual_classroom)
        : false;
    });
  }, [assignments, weeklyModules, teacherClassroomIds]);

  const availableAssignments = useMemo(() => {
    if (!form.virtual_classroom) return [];

    return filteredAssignments.filter((assignment) => {
      const weeklyModule = weeklyModules.find(
        (item) => item.id === assignment.weekly_module
      );
      return weeklyModule?.virtual_classroom === form.virtual_classroom;
    });
  }, [filteredAssignments, weeklyModules, form.virtual_classroom]);

  const availableStudents = useMemo(() => {
    if (!form.virtual_classroom) return [];

    const fromEnrollments = enrollments.filter(
      (item) => item.virtual_classroom === form.virtual_classroom
    );

    const fromSubmissionsMap = new Map<number, StudentOption>();

    submissions.forEach((submission) => {
      const assignment = assignments.find((item) => item.id === submission.assignment);
      if (!assignment) return;

      const module = weeklyModules.find((item) => item.id === assignment.weekly_module);
      if (!module) return;

      if (module.virtual_classroom !== form.virtual_classroom) return;

      if (!fromSubmissionsMap.has(submission.student)) {
        fromSubmissionsMap.set(submission.student, {
          id: submission.student,
          student_name: submission.student_name,
          student_code: "",
          virtual_classroom: module.virtual_classroom,
        });
      }
    });

    const merged = new Map<number, StudentOption>();

    fromEnrollments.forEach((item) => merged.set(item.id, item));
    Array.from(fromSubmissionsMap.values()).forEach((item) => {
      if (!merged.has(item.id)) {
        merged.set(item.id, item);
      }
    });

    return Array.from(merged.values());
  }, [enrollments, submissions, assignments, weeklyModules, form.virtual_classroom]);

  const availableSubmissions = useMemo(() => {
    if (!form.assignment) return [];

    return submissions.filter((submission) => {
      if (submission.assignment !== form.assignment) return false;
      if (form.student && submission.student !== form.student) return false;
      return true;
    });
  }, [submissions, form.assignment, form.student]);

  const selectedSubmission = useMemo(() => {
    if (!form.submission) return null;
    return submissions.find((item) => item.id === form.submission) || null;
  }, [submissions, form.submission]);

  const existingGradeForSubmission = useMemo(() => {
    if (!form.submission) return null;

    return (
      gradeRecords.find((record) => record.submission === form.submission) || null
    );
  }, [gradeRecords, form.submission]);

  useEffect(() => {
    if (existingGradeForSubmission) {
      setFormNotice(
        `Esta entrega ya fue calificada con ${existingGradeForSubmission.score}. Edita el registro existente en la lista inferior.`
      );
    } else if (selectedSubmission) {
      setFormNotice(
        `Entrega seleccionada: ${selectedSubmission.student_name}, intento ${selectedSubmission.attempt_number}, enviada el ${formatDate(selectedSubmission.submitted_at)}.`
      );
    } else {
      setFormNotice("");
    }
  }, [existingGradeForSubmission, selectedSubmission]);

  const visibleGradeRecords = useMemo(() => {
    const term = search.trim().toLowerCase();

    return gradeRecords.filter((record) => {
      const matchesClassroom =
        selectedClassroom === "all" ||
        record.virtual_classroom === selectedClassroom;

      const matchesSearch =
        !term ||
        record.student_name?.toLowerCase().includes(term) ||
        record.assignment_title?.toLowerCase().includes(term) ||
        record.classroom_name?.toLowerCase().includes(term) ||
        record.feedback?.toLowerCase().includes(term);

      return matchesClassroom && matchesSearch;
    });
  }, [gradeRecords, selectedClassroom, search]);

  function handleClassroomChange(value: number) {
    setError("");
    setFormNotice("");
    setForm((prev) => ({
      ...prev,
      virtual_classroom: value,
      assignment: 0,
      student: 0,
      submission: null,
    }));
  }

  function handleAssignmentChange(value: number) {
    setError("");
    setFormNotice("");
    setForm((prev) => ({
      ...prev,
      assignment: value,
      student: 0,
      submission: null,
    }));
  }

  function handleStudentChange(value: number) {
    setError("");
    setFormNotice("");
    setForm((prev) => ({
      ...prev,
      student: value,
      submission: null,
    }));
  }

  function handleSubmissionChange(value: string) {
    if (!value) {
      setForm((prev) => ({
        ...prev,
        submission: null,
      }));
      return;
    }

    const submissionId = Number(value);
    const picked = submissions.find((item) => item.id === submissionId);

    setForm((prev) => ({
      ...prev,
      submission: submissionId,
      student: picked?.student ?? prev.student,
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!form.virtual_classroom) {
      setError("Debes seleccionar un salón virtual.");
      setSubmitting(false);
      return;
    }

    if (!form.assignment) {
      setError("Debes seleccionar una tarea.");
      setSubmitting(false);
      return;
    }

    if (!form.student) {
      setError("Debes seleccionar un alumno.");
      setSubmitting(false);
      return;
    }

    if (!form.score) {
      setError("Debes capturar la calificación.");
      setSubmitting(false);
      return;
    }

    if (existingGradeForSubmission) {
      setError(
        "Esa entrega ya fue calificada. Debes editar el registro existente en lugar de crear uno nuevo."
      );
      setSubmitting(false);
      return;
    }

    try {
      await api.post("/grade-records/", form);
      setForm(initialForm);
      setFormNotice("");
      await loadData();
    } catch (err: any) {
      console.error("Error creando calificación:", err.response?.data || err);
      setError("No fue posible registrar la calificación.");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateScore(record: GradeRecord, score: string) {
    try {
      await api.patch(`/grade-records/${record.id}/`, { score });
      await loadData();
    } catch (err: any) {
      console.error("Error actualizando score:", err.response?.data || err);
      setError("No fue posible actualizar la calificación.");
    }
  }

  async function updateFeedback(record: GradeRecord, feedback: string) {
    try {
      await api.patch(`/grade-records/${record.id}/`, { feedback });
      await loadData();
    } catch (err: any) {
      console.error("Error actualizando feedback:", err.response?.data || err);
      setError("No fue posible actualizar la retroalimentación.");
    }
  }

  async function deleteRecord(recordId: number) {
    try {
      await api.delete(`/grade-records/${recordId}/`);
      await loadData();
    } catch (err: any) {
      console.error("Error eliminando calificación:", err.response?.data || err);
      setError("No fue posible eliminar la calificación.");
    }
  }

  return (
    <IntranetLayout allowedRoles={["teacher"]}>
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">Calificaciones</h1>
          <p className="mt-2 text-slate-600">
            Registra y consulta calificaciones por tarea de tus alumnos.
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
                  onChange={(e) =>
                    setSelectedClassroom(
                      e.target.value === "all" ? "all" : Number(e.target.value)
                    )
                  }
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

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Buscar
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Alumno, tarea, salón o feedback"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-6 space-y-4">
              {loading ? (
                <p className="text-sm text-slate-500">
                  Cargando calificaciones...
                </p>
              ) : visibleGradeRecords.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No se encontraron calificaciones registradas.
                </p>
              ) : (
                visibleGradeRecords.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.student_name}
                        </p>
                        <p className="text-sm text-slate-500">
                          Salón: {item.classroom_name}
                        </p>
                        <p className="text-sm text-slate-500">
                          Tarea: {item.assignment_title}
                        </p>
                        <p className="text-sm text-slate-600">
                          Calificación: {item.score}
                        </p>
                        <p className="text-sm text-slate-600">
                          Calificado por: {item.graded_by_name || "Profesor"}
                        </p>
                        <p className="text-xs text-slate-400">
                          Fecha: {item.graded_at ? formatDate(item.graded_at) : "Sin fecha"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                        {item.feedback || "Sin retroalimentación"}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const value = window.prompt(
                              "Nueva calificación",
                              item.score ?? ""
                            );
                            if (value === null) return;
                            updateScore(item, value);
                          }}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                        >
                          Cambiar calificación
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const value = window.prompt(
                              "Retroalimentación",
                              item.feedback ?? ""
                            );
                            if (value === null) return;
                            updateFeedback(item, value);
                          }}
                          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700"
                        >
                          Editar feedback
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteRecord(item.id)}
                          className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">
                Nueva calificación
              </h2>

              {formNotice && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {formNotice}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Salón virtual
                  </label>
                  <select
                    value={form.virtual_classroom}
                    onChange={(e) => handleClassroomChange(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                    required
                  >
                    <option value={0}>Selecciona un salón</option>
                    {classrooms.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Tarea
                  </label>
                  <select
                    value={form.assignment}
                    onChange={(e) => handleAssignmentChange(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                    required
                    disabled={!form.virtual_classroom}
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
                    Alumno
                  </label>
                  <select
                    value={form.student}
                    onChange={(e) => handleStudentChange(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                    required
                    disabled={!form.virtual_classroom}
                  >
                    <option value={0}>Selecciona un alumno</option>
                    {availableStudents.map((item) => (
                      <option
                        key={`${item.virtual_classroom}-${item.id}`}
                        value={item.id}
                      >
                        {item.student_name}{" "}
                        {item.student_code ? `(${item.student_code})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Entrega asociada
                  </label>
                  <select
                    value={form.submission ?? ""}
                    onChange={(e) => handleSubmissionChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                    disabled={!form.assignment}
                  >
                    <option value="">Sin entrega asociada</option>
                    {availableSubmissions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.student_name} - Intento {item.attempt_number} - {formatDate(item.submitted_at)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Calificación
                  </label>
                  <input
                    type="text"
                    value={form.score}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        score: e.target.value,
                      }))
                    }
                    placeholder="Ej. 95"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Retroalimentación
                  </label>
                  <textarea
                    value={form.feedback}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        feedback: e.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                    placeholder="Comentarios para el alumno"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !!existingGradeForSubmission}
                  className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Guardando..."
                    : existingGradeForSubmission
                    ? "Entrega ya calificada"
                    : "Registrar calificación"}
                </button>
              </form>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                Entregas disponibles para esta tarea
              </h3>

              {!form.assignment ? (
                <p className="mt-3 text-sm text-slate-500">
                  Selecciona una tarea para ver las entregas disponibles.
                </p>
              ) : availableSubmissions.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">
                  No hay entregas registradas para la tarea seleccionada.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {availableSubmissions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSubmissionChange(String(item.id))}
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        form.submission === item.id
                          ? "border-slate-900 bg-slate-50"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <p className="font-medium text-slate-900">
                        {item.student_name}
                      </p>
                      <p className="text-sm text-slate-500">
                        Intento {item.attempt_number} · {formatDate(item.submitted_at)}
                      </p>
                      <p className="mt-2 text-sm text-slate-700 line-clamp-3">
                        {item.text_submission || "Sin contenido en texto."}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </IntranetLayout>
  );
}