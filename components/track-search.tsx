"use client"

import type React from "react"

import { Card, CardBody, Input, Button } from "@heroui/react"
import { Search, Lock } from "lucide-react"
import { useState } from "react"

interface TrackSearchProps {
  onSearch: (code: string, key: string) => void
  isLoading?: boolean
  error?: string
}

export function TrackSearch({ onSearch, isLoading = false, error }: TrackSearchProps) {
  const [claimCode, setClaimCode] = useState("")
  const [accessKey, setAccessKey] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(claimCode, accessKey)
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-2 border-slate-200 shadow-2xl shadow-slate-300/30">
      <CardBody className="p-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Input
                description="Ejemplo: 2025-1234"
                errorMessage={error}
                isInvalid={!!error}
                label="Código de Reclamo"
                placeholder="2025-XXXXXXX"
                size="lg"
                startContent={<Search className="w-4 h-4 text-slate-400" />}
                value={claimCode}
                variant="bordered"
                onChange={(e) => setClaimCode(e.target.value)}
                classNames={{
                  input: "text-slate-800",
                  label: "text-slate-700 font-semibold",
                }}
              />
            </div>

            <div>
              <Input
                description="Enviada a tu correo"
                label="Clave de Acceso"
                placeholder="Ingresa tu clave"
                size="lg"
                startContent={<Lock className="w-4 h-4 text-slate-400" />}
                type="password"
                value={accessKey}
                variant="bordered"
                onChange={(e) => setAccessKey(e.target.value)}
                classNames={{
                  input: "text-slate-800",
                  label: "text-slate-700 font-semibold",
                }}
              />
            </div>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-[#202e5e] to-[#1a2550] hover:from-[#1a2550] hover:to-[#141d42] text-white font-semibold shadow-lg shadow-[#202e5e]/20"
            disabled={isLoading}
            isLoading={isLoading}
            size="lg"
            startContent={!isLoading && <Search className="w-5 h-5" />}
            type="submit"
          >
            Consultar Estado
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}
