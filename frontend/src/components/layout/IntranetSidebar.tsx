"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

function isActivePath(pathname: string, href: string) {
  if (href === "/intranet") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function linkClasses(pathname: string, href: string) {
  const active = isActivePath(pathname, href);

  return `block rounded-lg px-4 py-2 text-sm font-medium transition ${
    active
      ? "bg-slate-900 text-white shadow-sm"
      : "text-slate-700 hover:bg-slate-200"
  }`;
}

function sectionTitleClasses() {
  return "px-4 pb-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-700";
}

export default function IntranetSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const role = user?.role?.code;

  return (
    <aside className="w-full max-w-xs border-r bg-white p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900">Campus Online</h2>
        <p className="text-sm text-slate-700">Universidad IMEI SJR</p>
              <Image
                src="/images/logo.png"
                alt="Logo corporativo Universidad IMEI SJR"
                width={120}
                height={120}
                className="h-16 w-auto object-contain md:h-18 mt-2 m-0"
              />
      </div>

      <nav className="space-y-2">
        <Link href="/intranet" className={linkClasses(pathname, "/intranet")}>
          Inicio
        </Link>

        {role === "student" && (
          <div className="pt-2">
            <p className={sectionTitleClasses()}>
              Alumno
            </p>

            <div className="space-y-2">
              <Link
                href="/intranet/alumno"
                className={linkClasses(pathname, "/intranet/alumno")}
              >
                Mi panel
              </Link>
              <Link
                href="/intranet/alumno/salones"
                className={linkClasses(pathname, "/intranet/alumno/salones")}
              >
                Mis salones
              </Link>
              <Link
                href="/intranet/alumno/modulos"
                className={linkClasses(pathname, "/intranet/alumno/modulos")}
              >
                Contenido de clase
              </Link>
              <Link
                href="/intranet/alumno/tareas"
                className={linkClasses(pathname, "/intranet/alumno/tareas")}
              >
                Tareas
              </Link>
              <Link
                href="/intranet/alumno/entregas"
                className={linkClasses(pathname, "/intranet/alumno/entregas")}
              >
                Mis entregas
              </Link>
              <Link
                href="/intranet/alumno/calificaciones"
                className={linkClasses(pathname, "/intranet/alumno/calificaciones")}
              >
                Mis calificaciones
              </Link>
              <Link
                href="/intranet/alumno/estado-cuenta"
                className={linkClasses(pathname, "/intranet/alumno/estado-cuenta")}
              >
                Estado de cuenta
              </Link>
            </div>
          </div>
        )}

        {role === "teacher" && (
          <div className="pt-2">
            <p className={sectionTitleClasses()}>
              Profesor
            </p>

            <div className="space-y-2">
              <Link
                href="/intranet/profesor"
                className={linkClasses(pathname, "/intranet/profesor")}
              >
                Panel profesor
              </Link>
              <Link
                href="/intranet/profesor/salones"
                className={linkClasses(pathname, "/intranet/profesor/salones")}
              >
                Mis salones
              </Link>
              <Link
                href="/intranet/profesor/modulos"
                className={linkClasses(pathname, "/intranet/profesor/modulos")}
              >
                Módulos semanales
              </Link>
              <Link
                href="/intranet/profesor/tareas"
                className={linkClasses(pathname, "/intranet/profesor/tareas")}
              >
                Tareas
              </Link>
              <Link
                href="/intranet/profesor/entregas"
                className={linkClasses(pathname, "/intranet/profesor/entregas")}
              >
                Entregas
              </Link>
              <Link
                href="/intranet/profesor/calificaciones"
                className={linkClasses(pathname, "/intranet/profesor/calificaciones")}
              >
                Calificaciones
              </Link>
            </div>
          </div>
        )}

        {role === "admin" && (
          <>
            <div className="pt-2">
              <p className={sectionTitleClasses()}>
                Administración
              </p>

              <div className="space-y-2">
                <Link
                  href="/intranet/admin"
                  className={linkClasses(pathname, "/intranet/admin")}
                >
                  Panel administrador
                </Link>
                <Link
                  href="/intranet/admin/usuarios"
                  className={linkClasses(pathname, "/intranet/admin/usuarios")}
                >
                  Usuarios
                </Link>
                <Link
                  href="/intranet/admin/alumnos"
                  className={linkClasses(pathname, "/intranet/admin/alumnos")}
                >
                  Alumnos
                </Link>
                <Link
                  href="/intranet/admin/profesores"
                  className={linkClasses(pathname, "/intranet/admin/profesores")}
                >
                  Profesores
                </Link>
              </div>
            </div>

            <div className="pt-4">
              <p className={sectionTitleClasses()}>
                Académico
              </p>

              <div className="space-y-2">
                <Link
                  href="/intranet/admin/academico/carreras"
                  className={linkClasses(pathname, "/intranet/admin/academico/carreras")}
                >
                  Carreras
                </Link>
                <Link
                  href="/intranet/admin/academico/planes-estudio"
                  className={linkClasses(pathname, "/intranet/admin/academico/planes-estudio")}
                >
                  Planes de estudio
                </Link>
                <Link
                  href="/intranet/admin/academico/materias"
                  className={linkClasses(pathname, "/intranet/admin/academico/materias")}
                >
                  Materias
                </Link>
                <Link
                  href="/intranet/admin/academico/periodos"
                  className={linkClasses(pathname, "/intranet/admin/academico/periodos")}
                >
                  Períodos académicos
                </Link>
                <Link
                  href="/intranet/admin/academico/plan-materias"
                  className={linkClasses(pathname, "/intranet/admin/academico/plan-materias")}
                >
                  Plan por materia
                </Link>
              </div>
            </div>

            <div className="pt-4">
              <p className={sectionTitleClasses()}>
                Operación académica
              </p>

              <div className="space-y-2">
                <Link
                  href="/intranet/admin/classrooms/salones"
                  className={linkClasses(pathname, "/intranet/admin/classrooms/salones")}
                >
                  Salones virtuales
                </Link>
                <Link
                  href="/intranet/admin/classrooms/asignaciones"
                  className={linkClasses(pathname, "/intranet/admin/classrooms/asignaciones")}
                >
                  Asignaciones docentes
                </Link>
                <Link
                  href="/intranet/admin/classrooms/inscripciones"
                  className={linkClasses(pathname, "/intranet/admin/classrooms/inscripciones")}
                >
                  Inscripciones académicas
                </Link>
              </div>
            </div>

            <div className="pt-4">
              <p className={sectionTitleClasses()}>
                Calificaciones
              </p>

              <div className="space-y-2">
                <Link
                  href="/intranet/admin/grading/historial"
                  className={linkClasses(pathname, "/intranet/admin/grading/historial")}
                >
                  Historial académico
                </Link>
              </div>
            </div>

            <div className="pt-4">
              <p className={sectionTitleClasses()}>
                Finanzas
              </p>

              <div className="space-y-2">
                <Link
                  href="/intranet/admin/finanzas/conceptos"
                  className={linkClasses(pathname, "/intranet/admin/finanzas/conceptos")}
                >
                  Conceptos de cobro
                </Link>
                <Link
                  href="/intranet/admin/finanzas/cargos"
                  className={linkClasses(pathname, "/intranet/admin/finanzas/cargos")}
                >
                  Cargos a alumnos
                </Link>
                <Link
                  href="/intranet/admin/finanzas/pagos"
                  className={linkClasses(pathname, "/intranet/admin/finanzas/pagos")}
                >
                  Pagos de alumnos
                </Link>
              </div>
            </div>
          </>
        )}
      </nav>
    </aside>
  );
}