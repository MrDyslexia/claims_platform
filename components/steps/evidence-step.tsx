"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardBody, CardHeader, Button, Badge} from "@heroui/react";
import { Upload, FileText, ImageIcon, X, File, AlertCircle } from "lucide-react"

interface EvidenceStepProps {
  readonly formData: any
  readonly onUpdate: (data: any) => void
}

export function EvidenceStep({ formData, onUpdate }: EvidenceStepProps) {
  const [files, setFiles] = useState(formData.evidence || [])
  const maxFiles = 10
  const maxFileSize = 10 * 1024 * 1024 // 10MB

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])

    if (files.length + selectedFiles.length > maxFiles) {
      alert(`Máximo ${maxFiles} archivos permitidos`)
      return
    }

    const validFiles = selectedFiles.filter((file) => {
      if (file.size > maxFileSize) {
        alert(`El archivo ${file.name} es muy grande. Máximo 10MB por archivo.`)
        return false
      }
      return true
    })

    const newFiles = validFiles.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
    }))

    const updatedFiles = [...files, ...newFiles]
    setFiles(updatedFiles)
    onUpdate({ ...formData, evidence: updatedFiles })
  }

  const removeFile = (id: number) => {
    const updatedFiles = files.filter((file: any) => file.id !== id)
    setFiles(updatedFiles)
    onUpdate({ ...formData, evidence: updatedFiles })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return ImageIcon
    if (type.includes("pdf") || type.includes("document")) return FileText
    return File
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Documentos y evidencias</h3>
        <p className="text-muted-foreground mb-6">
          Sube documentos, fotografías o cualquier evidencia que respalde tu reclamo (opcional)
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <h1 className="text-base flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Subir archivos</span>
          </h1>
          <h2>Formatos aceptados: PDF, DOC, DOCX, JPG, PNG, GIF (máximo 10MB por archivo)</h2>
        </CardHeader>
        <CardBody>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-accent/50 transition-colors">
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Arrastra archivos aquí o haz clic para seleccionar</p>
              <p className="text-xs text-muted-foreground">Máximo {maxFiles} archivos, 10MB cada uno</p>
            </div>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span>
              {files.length} de {maxFiles} archivos
            </span>
            <span>
              Tamaño total: {formatFileSize(files.reduce((total: number, file: any) => total + file.size, 0))}
            </span>
          </div>
        </CardBody>
      </Card>

      {/* Files List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <h1 className="text-base">Archivos subidos ({files.length})</h1>
            <h2>Lista de documentos y evidencias agregadas</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {files.map((file: any) => {
                const FileIcon = getFileIcon(file.type)
                return (
                  <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                    <div className="flex items-center space-x-3">
                      <FileIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="faded" className="text-xs">
                            {formatFileSize(file.size)}
                          </Badge>
                          <Badge variant="faded" className="text-xs">
                            {file.type.split("/")[1]?.toUpperCase() || "FILE"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {files.length === 0 && (
        <Card className="border-dashed">
          <CardBody className="p-8 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No hay archivos subidos</p>
            <p className="text-sm">Las evidencias son opcionales pero pueden fortalecer tu reclamo</p>
          </CardBody>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardBody className="p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-700 mb-1">Información sobre evidencias</p>
              <ul className="text-blue-600 space-y-1 text-xs">
                <li>• Las evidencias son opcionales pero recomendadas</li>
                <li>• Incluye capturas de pantalla, correos, contratos, facturas, etc.</li>
                <li>• Asegúrate de que los documentos sean legibles</li>
                <li>• No incluyas información personal sensible innecesaria</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
