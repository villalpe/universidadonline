import LoginForm from "@/components/auth/LoginForm";
import Image from "next/image";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center" >
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg" >
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-4">
          <div className="flex justify-center lg:col-span-10 lg:justify-start">
            <Image
              src="/images/logo.png"
              alt="Logo corporativo Universidad IMEI SJR"
              width={160}
              height={160}
              className="h-24 w-auto object-contain md:h-24"
            />
          </div>
        </div>
        <div className="my-2">
          <h1 className="text-center lg:text-center text-xl font-bold text-slate-550">
            Acceso a Campus Online IMEI
          </h1>
        </div>
        <p className="mt-2 text-center text-md text-slate-600">
          Ingresa con tu correo institucional y contraseña.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}