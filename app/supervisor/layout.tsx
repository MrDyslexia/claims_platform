import type React from "react"

import { ProtectedRoute } from "@/components/protected-route"
import { SupervisorSidebar } from "@/components/supervisor-sidebar"

export default function SupervisorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={["supervisor"]}>
      <div className="flex h-screen bg-background overflow-hidden">
        <aside className="w-64 flex-shrink-0">
          <SupervisorSidebar />
        </aside>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </ProtectedRoute>
  )
}
