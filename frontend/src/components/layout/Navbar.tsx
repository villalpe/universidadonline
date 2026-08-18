"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const [showAcademicMenu, setShowAcademicMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileAcademicMenu, setShowMobileAcademicMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function updateMenuPosition() {
      if (!triggerRef.current) return;

      const rect = triggerRef.current.getBoundingClientRect();

      setMenuPosition({
        top: rect.bottom + 12,
        left: Math.max(16, rect.left - 220),
      });
    }

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setShowAcademicMenu(false);
      }
    }

    function handleWindowChange() {
      if (showAcademicMenu) {
        updateMenuPosition();
      }
    }

    if (showAcademicMenu) {
      updateMenuPosition();
      window.addEventListener("resize", handleWindowChange);
      window.addEventListener("scroll", handleWindowChange, true);
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("resize", handleWindowChange);
      window.removeEventListener("scroll", handleWindowChange, true);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAcademicMenu]);

  function closeAllMenus() {
    setShowAcademicMenu(false);
    setShowMobileMenu(false);
    setShowMobileAcademicMenu(false);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <Link href="/" className="flex items-center gap-3" onClick={closeAllMenus}>
            <Image
              src="/images/logo.png"
              alt="Logo corporativo Universidad IMEI SJR"
              width={76}
              height={76}
              className="h-18 w-auto object-contain md:h-20"
            />
            <div className="leading-tight">
              <p className="text-base font-bold text-slate-900 md:text-lg">
                Universidad IMEI SJR
              </p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 md:text-xs">
                Campus Online
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
            <Link href="/" className="transition hover:text-slate-900">
              Inicio
            </Link>

            <Link href="/nosotros" className="transition hover:text-slate-900">
              Nosotros
            </Link>

            <div className="flex items-center gap-1">
              <Link
                href="/oferta-academica"
                className="transition hover:text-slate-900"
              >
                Oferta Académica
              </Link>

              <button
                ref={triggerRef}
                type="button"
                aria-label="Mostrar menú de oferta académica"
                aria-expanded={showAcademicMenu}
                onClick={() => setShowAcademicMenu((prev) => !prev)}
                className="rounded-md px-1 py-1 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <span
                  className={`inline-block transition-transform duration-200 ${
                    showAcademicMenu ? "rotate-180" : "rotate-0"
                  }`}
                >
                  ▾
                </span>
              </button>
            </div>

            <Link href="/admisiones" className="transition hover:text-slate-900">
              Admisiones
            </Link>

            <Link href="/contacto" className="transition hover:text-slate-900">
              Contacto
            </Link>

            <Link
              href="/login"
              className="transition hover:text-slate-900"
            >
              Campus SJR
            </Link>

            <Link
              href="/login"
              className="rounded-md bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700"
            >
              Campus Online
            </Link>
          </nav>

          <button
            type="button"
            aria-label="Abrir menú principal"
            aria-expanded={showMobileMenu}
            onClick={() => setShowMobileMenu((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition hover:bg-slate-100 md:hidden"
          >
            <div className="flex flex-col items-center justify-center gap-1.5">
              <span
                className={`block h-0.5 w-5 bg-slate-700 transition-transform duration-200 ${
                  showMobileMenu ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-slate-700 transition-opacity duration-200 ${
                  showMobileMenu ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-slate-700 transition-transform duration-200 ${
                  showMobileMenu ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </div>

        {showMobileMenu && (
          <div className="border-t border-slate-200 bg-white/95 px-4 py-4 shadow-lg backdrop-blur md:hidden">
            <div className="flex flex-col space-y-3 text-sm font-medium text-slate-700">
              <Link
                href="/"
                onClick={closeAllMenus}
                className="rounded-md px-2 py-2 transition hover:bg-slate-100"
              >
                Inicio
              </Link>

              <Link
                href="/nosotros"
                onClick={closeAllMenus}
                className="rounded-md px-2 py-2 transition hover:bg-slate-100"
              >
                Nosotros
              </Link>

              <div className="rounded-xl border border-slate-200 bg-slate-50/80">
                <div className="flex items-center justify-between px-3 py-2">
                  <Link href="/oferta-academica" onClick={closeAllMenus}>
                    Oferta Académica
                  </Link>

                  <button
                    type="button"
                    aria-label="Mostrar submenú de oferta académica"
                    aria-expanded={showMobileAcademicMenu}
                    onClick={() =>
                      setShowMobileAcademicMenu((prev) => !prev)
                    }
                    className="rounded-md px-2 py-1 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    <span
                      className={`inline-block transition-transform duration-200 ${
                        showMobileAcademicMenu ? "rotate-180" : "rotate-0"
                      }`}
                    >
                      ▾
                    </span>
                  </button>
                </div>

                {showMobileAcademicMenu && (
                  <div className="space-y-1 border-t border-slate-200 px-3 py-3">
                    <Link
                      href="/oferta-academica/preparatoria"
                      className="block rounded-md px-2 py-2 transition hover:bg-white"
                      onClick={closeAllMenus}
                    >
                      Preparatoria
                    </Link>

                    <Link
                      href="/oferta-academica/licenciaturas"
                      className="block rounded-md px-2 py-2 transition hover:bg-white"
                      onClick={closeAllMenus}
                    >
                      Licenciaturas
                    </Link>

                    <Link
                      href="/oferta-academica/maestrias"
                      className="block rounded-md px-2 py-2 transition hover:bg-white"
                      onClick={closeAllMenus}
                    >
                      Maestrías
                    </Link>

                    <div className="pt-2">
                      <p className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Educación en línea
                      </p>

                      <div className="mt-2 space-y-1 pl-2">
                        <Link
                          href="/oferta-academica/educacion-en-linea/preparatoria"
                          className="block rounded-md px-2 py-2 transition hover:bg-white"
                          onClick={closeAllMenus}
                        >
                          Preparatoria en línea
                        </Link>
                        <Link
                          href="/oferta-academica/educacion-en-linea/licenciatura"
                          className="block rounded-md px-2 py-2 transition hover:bg-white"
                          onClick={closeAllMenus}
                        >
                          Licenciatura en línea
                        </Link>
                        <Link
                          href="/oferta-academica/educacion-en-linea/maestria"
                          className="block rounded-md px-2 py-2 transition hover:bg-white"
                          onClick={closeAllMenus}
                        >
                          Maestría en línea
                        </Link>
                        <Link
                          href="/oferta-academica/educacion-en-linea/diplomados"
                          className="block rounded-md px-2 py-2 transition hover:bg-white"
                          onClick={closeAllMenus}
                        >
                          Diplomados en línea
                        </Link>
                        <Link
                          href="/oferta-academica/educacion-en-linea/bootcamps"
                          className="block rounded-md px-2 py-2 transition hover:bg-white"
                          onClick={closeAllMenus}
                        >
                          Bootcamps en línea
                        </Link>
                      </div>
                    </div>

                    <div className="pt-2">
                      <p className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Educación continua
                      </p>

                      <div className="mt-2 space-y-1 pl-2">
                        <Link
                          href="/oferta-academica/educacion-continua/cursos-ingles"
                          className="block rounded-md px-2 py-2 transition hover:bg-white"
                          onClick={closeAllMenus}
                        >
                          Cursos en Inglés
                        </Link>
                        <Link
                          href="/oferta-academica/educacion-continua/lenguaje-senas"
                          className="block rounded-md px-2 py-2 transition hover:bg-white"
                          onClick={closeAllMenus}
                        >
                          Lenguaje de señas
                        </Link>
                        <Link
                          href="/oferta-academica/educacion-continua/cursos-especializados"
                          className="block rounded-md px-2 py-2 transition hover:bg-white"
                          onClick={closeAllMenus}
                        >
                          Cursos especializados
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/admisiones"
                onClick={closeAllMenus}
                className="rounded-md px-2 py-2 transition hover:bg-slate-100"
              >
                Admisiones
              </Link>

              <Link
                href="/contacto"
                onClick={closeAllMenus}
                className="rounded-md px-2 py-2 transition hover:bg-slate-100"
              >
                Contacto
              </Link>

              <Link
                href="/login"
                className="rounded-md px-2 py-2 transition hover:bg-slate-100"
                onClick={closeAllMenus}
              >
                Campus SJR
              </Link>              

              <Link
                href="/login"
                className="inline-flex w-fit items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700"
                onClick={closeAllMenus}
              >
                Campus Online
              </Link>
            </div>
          </div>
        )}
      </header>

      {showAcademicMenu && (
        <div
          ref={menuRef}
          className="fixed z-[1000] hidden w-[340px] rounded-xl border border-slate-200 bg-white p-3 shadow-2xl md:block"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
        >
          <div className="space-y-1">
            <Link
              href="/oferta-academica/preparatoria"
              className="block rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
              onClick={closeAllMenus}
            >
              Preparatoria
            </Link>

            <Link
              href="/oferta-academica/licenciaturas"
              className="block rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
              onClick={closeAllMenus}
            >
              Licenciaturas
            </Link>

            <Link
              href="/oferta-academica/maestrias"
              className="block rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
              onClick={closeAllMenus}
            >
              Maestrías
            </Link>

            <div className="rounded-lg px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-800">
                Educación en línea
              </p>
              <div className="mt-2 space-y-1 pl-2">
                <Link
                  href="/oferta-academica/educacion-en-linea/preparatoria"
                  className="block rounded-md px-2 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                  onClick={closeAllMenus}
                >
                  Preparatoria en línea
                </Link>
                <Link
                  href="/oferta-academica/educacion-en-linea/licenciatura"
                  className="block rounded-md px-2 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                  onClick={closeAllMenus}
                >
                  Licenciatura en línea
                </Link>
                <Link
                  href="/oferta-academica/educacion-en-linea/maestria"
                  className="block rounded-md px-2 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                  onClick={closeAllMenus}
                >
                  Maestría en línea
                </Link>
                <Link
                  href="/oferta-academica/educacion-en-linea/diplomados"
                  className="block rounded-md px-2 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                  onClick={closeAllMenus}
                >
                  Diplomados en línea
                </Link>
                <Link
                  href="/oferta-academica/educacion-en-linea/bootcamps"
                  className="block rounded-md px-2 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                  onClick={closeAllMenus}
                >
                  Bootcamps en línea
                </Link>
              </div>
            </div>

            <div className="rounded-lg px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-800">
                Educación continua
              </p>
              <div className="mt-2 space-y-1 pl-2">
                <Link
                  href="/oferta-academica/educacion-continua/cursos-ingles"
                  className="block rounded-md px-2 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                  onClick={closeAllMenus}
                >
                  Cursos en Inglés
                </Link>
                <Link
                  href="/oferta-academica/educacion-continua/lenguaje-senas"
                  className="block rounded-md px-2 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                  onClick={closeAllMenus}
                >
                  Lenguaje de señas
                </Link>
                <Link
                  href="/oferta-academica/educacion-continua/cursos-especializados"
                  className="block rounded-md px-2 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                  onClick={closeAllMenus}
                >
                  Cursos especializados
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}