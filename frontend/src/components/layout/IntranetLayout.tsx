"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import IntranetSidebar from "@/components/layout/IntranetSidebar";
import IntranetHeader from "@/components/layout/IntranetHeader";

interface IntranetLayoutProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function IntranetLayout({
  children,
  allowedRoles,
}: IntranetLayoutProps) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div className="min-h-screen bg-slate-100">
        <div className="flex min-h-screen">
          <IntranetSidebar />
          <div className="flex min-h-screen flex-1 flex-col ">
            <IntranetHeader />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}