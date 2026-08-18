import PublicLayout from "@/components/layout/PublicLayout";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <PublicLayout>
      <section className="mx-4 mt-2 md:mx-6 md:mt-8">
        <div
          className="overflow-hidden rounded-2xl bg-slate-200 shadow-sm"
          style={{
            backgroundImage: "url('/images/somosIMEI.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            height: "36rem",
          }}
        />
      </section>

      <section className="mt-6">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="rounded-2xl bg-white px-8 py-10 shadow-sm ring-1 ring-slate-200 md:px-12 md:py-12 p-4">
            <div className="max-w-6xl">

              <h1 className="text-center mt-1 text-4xl font-bold leading-tight 
                            bg-gradient-to-r from-black to-yellow-400 bg-clip-text text-transparent
                            md:text-5xl xl:text-6xl">
                Corporativo Escolar Grupo IMEI SJR
              </h1>

              <p className="mt-6 max-w-6xl text-lg leading-7 text-slate-600 md:text-1xl">
                Institución educativa interesada en el desarrollo integral y
                profesional, con una propuesta académica orientada a la formación
                humana, el acompañamiento docente y el crecimiento de cada alumno.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/admisiones"
                  className="inline-flex items-center justify-center rounded-md bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700"
                >
                  Conoce más
                </Link>

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Entrar al Campus Online
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 mb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">
                Oferta académica
              </h2>
              <p className="mt-3 text-slate-600">
                Conoce nuestros programas, carreras y planes de estudio.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">
                Aula virtual
              </h2>
              <p className="mt-3 text-slate-600">
                Accede a tareas, entregas, calificaciones e historial académico.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">
                Servicios escolares
              </h2>
              <p className="mt-3 text-slate-600">
                Consulta pagos, estado de cuenta y seguimiento administrativo.
              </p>
            </div>
          </div>
        </div>
      </section>

    <div className="flex justify-center my-10">
      <div className="flex gap-2 text-3xl text-slate-400">
        <span>•</span>
        <span>•</span>
        <span>•</span>
      </div>
    </div>

      <section className="mt-6 mb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mt-1 mb-2 text-4xl font-bold leading-tight 
                            bg-gradient-to-r from-black to-yellow-400 bg-clip-text text-transparent
                            md:text-5xl xl:text-6xl"><h1>
              Elige tu programa ideal 
            </h1>
              <p className="mt-6 mb-4 max-w-6xl text-lg leading-7 text-slate-800 md:text-2xl">
                Preparatoria, Licenciatura, Maestría en linea...
              </p>            
            
            </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">
                Licenciatura en Psicología
              </h2>
                <Link
                  href="/admisiones"
                  className="inline-flex items-center justify-center rounded-md bg-slate-900 px-5 py-3 my-3 font-semibold text-white transition hover:bg-slate-700"
                >
                  Conoce más
                </Link>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">
                Licenciatura en Criminalística
              </h2>
                <Link
                  href="/admisiones"
                  className="inline-flex items-center justify-center rounded-md bg-slate-900 px-5 py-3 my-3 font-semibold text-white transition hover:bg-slate-700"
                >
                  Conoce más
                </Link>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">
                Licenciatura en Sistemas
              </h2>
                <Link
                  href="/admisiones"
                  className="inline-flex items-center justify-center rounded-md bg-slate-900 px-5 py-3 my-3 font-semibold text-white transition hover:bg-slate-700"
                >
                  Conoce más
                </Link>
            </div>
          </div>
        </div>
      </section>

    <div className="flex justify-center my-10">
      <div className="flex gap-2 text-3xl text-slate-400">
        <span>•</span>
        <span>•</span>
        <span>•</span>
      </div>
    </div>

    
      <section className="mt-6 mb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">

          {/* Título */}
          <div
            className="text-center mt-4 my-5 text-2xl font-bold leading-tight 
                      bg-gradient-to-r from-black to-yellow-400 bg-clip-text text-transparent
                      md:text-5xl xl:text-4xl"
          >
            <h1>Si eliges tu carrera presencial...conoce nuestras instalaciones en SJR</h1>

          </div>
          <div>
            <h3 className="text-center mt-4 my-5 text-2xl font-bold leading-tight 
                      bg-gradient-to-r from-black to-yellow-400 bg-clip-text text-transparent
                      md:text-3xl xl:text-xl">Dr. Ruiz Olloqui 3, Centro, 76800 San Juan del Río, Querétaro, San Juan del Río, Mexico 427 274 6206</h3>
          </div>

          {/* Grid de imágenes */}
          <div className="grid gap-6 md:grid-cols-3">

            {/* Psicología */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <Image
                src="/images/IMEI1280-1.jpg"
                alt="Licenciatura en Psicología"
                width={1280}
                height={720}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>

            {/* Criminalística */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <Image
                src="/images/IMEI21280-2.jpg"
                alt="Licenciatura en Criminalística"
                width={1280}
                height={720}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>

            {/* Sistemas */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <Image
                src="/images/IMEI31280-3.jpg"
                alt="Licenciatura en Sistemas"
                width={1280}
                height={720}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>

          </div>
        </div>
      </section>

    <div className="flex justify-center my-10">
      <div className="flex gap-2 text-3xl text-slate-400">
        <span>•</span>
        <span>•</span>
        <span>•</span>
      </div>
    </div>

      <section className="mb-16 mt-10">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
              Preguntas frecuentes
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900 md:text-3xl bg-gradient-to-r from-black to-yellow-400 bg-clip-text text-transparent">
              Resolvemos tus dudas sobre Corporativo Escolar Grupo IMEI SJR
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Aquí encontrarás información general sobre inscripciones, modalidad,
              validez, atención y funcionamiento de nuestra oferta académica.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <details className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-slate-900">
                ¿Qué modalidades de estudio ofrece la universidad?
                <span className="text-xl text-slate-500 transition group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Contamos con modalidades presencial, en línea y opciones de educación
                continua, buscando adaptarnos a las necesidades académicas y laborales
                de cada estudiante.
              </p>
            </details>

            <details className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-slate-900">
                ¿La universidad cuenta con validez oficial?
                <span className="text-xl text-slate-500 transition group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Sí, nuestros programas se desarrollan conforme a la normatividad
                aplicable. Si deseas información específica de una carrera o programa,
                puedes solicitarla directamente en admisiones.
              </p>
            </details>

            <details className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-slate-900">
                ¿Cómo puedo iniciar mi proceso de admisión?
                <span className="text-xl text-slate-500 transition group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Puedes comenzar contactándonos desde la sección de admisiones o por
                nuestros canales de atención. Ahí te orientaremos sobre requisitos,
                fechas, documentación y siguientes pasos.
              </p>
            </details>

            <details className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-slate-900">
                ¿Puedo estudiar y trabajar al mismo tiempo?
                <span className="text-xl text-slate-500 transition group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Sí. Nuestra propuesta académica busca brindar flexibilidad para que
                muchos estudiantes puedan continuar con su formación mientras atienden
                responsabilidades personales o laborales.
              </p>
            </details>

            <details className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-slate-900">
                ¿Dónde se ubican sus instalaciones?
                <span className="text-xl text-slate-500 transition group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Nuestras instalaciones en San Juan del Río se encuentran en Dr. Ruiz
                Olloqui 3, Centro, 76800 San Juan del Río, Querétaro. Si deseas una
                visita o más información, también puedes comunicarte por teléfono o
                mediante la sección de contacto.
              </p>
            </details>
          </div>
        </div>
      </section>

      
    </PublicLayout>
  );
}