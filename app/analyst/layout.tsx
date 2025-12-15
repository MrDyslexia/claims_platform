"use client"

import type React from "react"

import { ProtectedRoute } from "@/components/protected-route"
import { AnalystSidebar } from "@/components/analyst-sidebar"

export default function AnalystLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={["analista"]}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <AnalystSidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
