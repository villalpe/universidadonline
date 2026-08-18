import "./globals.css";
import type { Metadata } from "next";
import AuthProvider from "@/components/auth/AuthProvider";

export const metadata: Metadata = {
  title: "Corporativo Escolar IMEI SJR",
  description: "Sitio institucional e intranet universitaria",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gradient-to-r from-black to-yellow-400">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}