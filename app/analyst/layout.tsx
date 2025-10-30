import type React from "react";

import { ProtectedRoute } from "@/components/protected-route";
import { AnalystSidebar } from "@/components/analyst-sidebar";

export default function AnalystLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["analista"]}>
      <div className="flex h-screen bg-background">
        <AnalystSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
