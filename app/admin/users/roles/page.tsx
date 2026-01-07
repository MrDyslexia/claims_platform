/* eslint-disable no-console */
"use client"

import React from "react"
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Textarea,
  Checkbox,
  Tabs,
  Tab,
  Select,
  SelectItem,
} from "@heroui/react"
import { Plus, Edit, Trash2, Shield, CheckCircle2 } from "lucide-react"

import {
  useGetListaCompletaUsuarios,
  eliminarRol,
  crearRol,
  actualizarRol,
  listarArquetipos,
  obtenerCategoriasDisponibles,
  asignarCategoriasRol,
  obtenerCategoriasRol,
} from "@/lib/api/usuarios"
import type { Rol, Arquetipo, Categoria } from "@/lib/api/usuarios"

interface Permiso {
  id_permiso: number
  codigo: string
  nombre: string
  descripcion?: string
  categoria?: string
}

export default function RolesPage() {
  const [token, setToken] = React.useState<string | null>(null)
  const { data, loading, error, refetch } = useGetListaCompletaUsuarios(token)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [editingRole, setEditingRole] = React.useState<Rol | null>(null)
  const [formData, setFormData] = React.useState({
    nombre: "",
    descripcion: "",
    permisos: [] as number[],
  })
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [deletingRole, setDeletingRole] = React.useState<Rol | null>(null)
  const [deleteError, setDeleteError] = React.useState<string | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const [arquetipos, setArquetipos] = React.useState<Arquetipo[]>([])
  const [categoriasDisponibles, setCategoriasDisponibles] = React.useState<Categoria[]>([])
  const [selectedArquetipos, setSelectedArquetipos] = React.useState<string[]>([])
  const [selectedCategorias, setSelectedCategorias] = React.useState<string[]>([])

  React.useEffect(() => {
    const storedToken = localStorage.getItem("auth_token")

    setToken(storedToken)
  }, [])

  // Cargar arquetipos y categorías
  React.useEffect(() => {
    if (token) {
      listarArquetipos(token)
        .then((res) => setArquetipos(res.data || []))
        .catch((err) => console.error("Error al cargar arquetipos:", err))

      obtenerCategoriasDisponibles(token)
        .then((res) => setCategoriasDisponibles(res.categorias || []))
        .catch((err) => console.error("Error al cargar categorías:", err))
    }
  }, [token])

  // Obtener datos del backend
  const rolesDisponibles = data?.roles_disponibles || []
  const permisosDisponibles = data?.permisos_disponibles || []

  const handleOpenModal = async (role?: Rol | null) => {
    setSaveError(null)
    if (role) {
      setEditingRole(role)
      setFormData({
        nombre: role.nombre,
        descripcion: role.descripcion || "",
        permisos: role.permisos?.map((p) => p.id_permiso) || [],
      })
      setSelectedArquetipos(role.arquetipo_id ? [role.arquetipo_id.toString()] : [])
      
      // Cargar categorías del rol desde el backend
      if (token) {
        try {
          const catData = await obtenerCategoriasRol(token, role.id_rol)
          setSelectedCategorias(catData.categorias?.map((c) => c.id.toString()) || [])
        } catch (err) {
          console.error("Error al cargar categorías del rol:", err)
          setSelectedCategorias([])
        }
      } else {
        setSelectedCategorias([])
      }
    } else {
      setEditingRole(null)
      setFormData({
        nombre: "",
        descripcion: "",
        permisos: [],
      })
      setSelectedArquetipos([])
      setSelectedCategorias([])
    }
    onOpen()
  }

  const handleArquetiposChange = (arquetipoIds: string[]) => {
    setSelectedArquetipos(arquetipoIds)
    if (arquetipoIds.length > 0) {
      // Recolectar permisos de todos los arquetipos seleccionados
      const permisosUnicos = new Set<number>()
      arquetipoIds.forEach((arquetipoId) => {
        const arquetipo = arquetipos.find((a) => a.id.toString() === arquetipoId)
        if (arquetipo && arquetipo.permisos) {
          arquetipo.permisos.forEach((p: any) => {
            permisosUnicos.add(p.id_permiso || p.id)
          })
        }
      })
      setFormData((prev) => ({
        ...prev,
        permisos: Array.from(permisosUnicos),
      }))
    } else {
      // Si no hay arquetipos seleccionados, limpiar permisos
      setFormData((prev) => ({
        ...prev,
        permisos: [],
      }))
    }
  }

  const handleSave = async () => {
    if (!token) {
      setSaveError("No hay token de autenticación")

      return
    }

    if (!formData.nombre.trim()) {
      setSaveError("El nombre del rol es requerido")

      return
    }

    if (!editingRole && selectedArquetipos.length === 0) {
      setSaveError("Debes seleccionar al menos un arquetipo para crear el rol")

      return
    }

    setIsSaving(true)
    setSaveError(null)

    try {
      let rolId: number
      
      if (editingRole) {
        // Actualizar rol existente
        await actualizarRol(token, editingRole.id_rol, formData.nombre, formData.descripcion, formData.permisos)
        rolId = editingRole.id_rol
      } else {
        const nuevoRol = await crearRol(
          token,
          formData.nombre,
          formData.descripcion,
          selectedArquetipos.length > 0 ? Number.parseInt(selectedArquetipos[0]) : 0,
          formData.permisos,
        )
        rolId = nuevoRol.id
      }

      // Asignar categorías al rol
      const categoriaIds = selectedCategorias.map((c) => parseInt(c))
      await asignarCategoriasRol(token, rolId, categoriaIds)

      // Recargar la lista de roles
      refetch()

      // Cerrar el modal
      onClose()
    } catch (err: any) {
      console.error("❌ Error al guardar rol:", err)
      setSaveError(err.message || "Error al guardar el rol")
    } finally {
      setIsSaving(false)
    }
  }

  const handleOpenDeleteModal = (role: Rol) => {
    setDeletingRole(role)
    setDeleteError(null)
    onDeleteOpen()
  }

  const handleDelete = async () => {
    if (!deletingRole || !token) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      await eliminarRol(token, deletingRole.id_rol)

      // Recargar la lista de roles
      refetch()

      // Cerrar el modal
      onDeleteClose()
    } catch (err: any) {
      console.error("❌ Error al eliminar rol:", err)
      setDeleteError(err.message || "Error al eliminar el rol")
    } finally {
      setIsDeleting(false)
    }
  }

  const togglePermission = (permisoId: number) => {
    setFormData((prev) => ({
      ...prev,
      permisos: prev.permisos.includes(permisoId)
        ? prev.permisos.filter((id) => id !== permisoId)
        : [...prev.permisos, permisoId],
    }))
  }

  // Agrupar permisos por categoría
  const permisosByCategory = permisosDisponibles.reduce(
    (acc, permiso) => {
      const category = permiso.categoria || "General"

      if (!acc[category]) {
        acc[category] = []
      }

      acc[category].push(permiso)

      return acc
    },
    {} as Record<string, Permiso[]>,
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p>Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 text-danger">
          <p className="font-semibold">Error al cargar datos</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Roles y Permisos</h1>
          <p className="text-muted-foreground mt-1">Configura roles y sus permisos asociados</p>
        </div>
        <Button color="primary" startContent={<Plus className="h-4 w-4" />} onPress={() => handleOpenModal()}>
          Nuevo Rol
        </Button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rolesDisponibles.map((role) => (
          <Card key={role.id_rol}>
            <CardHeader className="flex justify-between items-start">
              <div className="flex items-center gap-2 flex-1">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{role.nombre}</h3>
                </div>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <p className="text-sm text-muted-foreground">{role.descripcion || "Sin descripción"}</p>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Permisos ({role.permisos?.length || 0})
                </p>
                <div className="space-y-1">
                  {role.permisos?.slice(0, 3).map((permiso) => (
                    <div key={permiso.id_permiso} className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      <span>{permiso.nombre}</span>
                    </div>
                  ))}
                  {role.permisos && role.permisos.length > 3 && (
                    <p className="text-xs text-muted-foreground">+{role.permisos.length - 3} más</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button className="flex-1" size="sm" variant="bordered" onPress={() => handleOpenModal(role)}>
                  <Edit className="h-3 w-3" />
                  Editar
                </Button>
                <Button
                  isIconOnly
                  color="danger"
                  size="sm"
                  variant="bordered"
                  onPress={() => handleOpenDeleteModal(role)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Role Modal */}
      <Modal isOpen={isOpen} scrollBehavior="inside" size="3xl" onClose={onClose}>
        <ModalContent>
          <ModalHeader>{editingRole ? "Editar Rol" : "Nuevo Rol"}</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {saveError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>
                </div>
              )}
              <Input
                isRequired
                label="Nombre del Rol"
                placeholder="Ej: Administrador"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nombre: e.target.value,
                  })
                }
              />
              <Textarea
                label="Descripción"
                minRows={2}
                placeholder="Describe las responsabilidades de este rol"
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    descripcion: e.target.value,
                  })
                }
              />

              {!editingRole && (
                <Select
                  isRequired
                  description="Selecciona uno o más arquetipos para cargar sus permisos"
                  label="Arquetipo de Rol"
                  aria-label="Arquetipo"
                  placeholder="Seleccione arquetipos"
                  selectedKeys={selectedArquetipos}
                  selectionMode="multiple"
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys) as string[]
                    handleArquetiposChange(selected)
                  }}
                >
                  {arquetipos.map((arq) => (
                    <SelectItem key={arq.id.toString()}>{arq.nombre}</SelectItem>
                  ))}
                </Select>
              )}

              <Select
                description="Selecciona una o más categorías. Deja vacío para acceso a todas"
                label="Categoría de Denuncia (Opcional)"
                placeholder="Sin restricción de categoría"
                selectedKeys={selectedCategorias}
                selectionMode="multiple"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys) as string[]
                  setSelectedCategorias(selected)
                }}
              >
                {categoriasDisponibles.map((cat) => (
                  <SelectItem key={cat.id.toString()}>{cat.nombre}</SelectItem>
                ))}
              </Select>

              <div>
                <h3 className="font-semibold mb-3">Permisos</h3>
                {Object.keys(permisosByCategory).length > 0 ? (
                  <Tabs aria-label="Permissions by category">
                    {Object.entries(permisosByCategory).map(([categoria, permisos]) => (
                      <Tab key={categoria} title={categoria.charAt(0).toUpperCase() + categoria.slice(1)}>
                        <div className="space-y-2 pt-4">
                          {permisos.map((permiso) => (
                            <div
                              key={permiso.id_permiso}
                              className="flex items-center justify-between p-3 bg-default-50 dark:bg-default-100/50 rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-sm">{permiso.nombre}</p>
                                <p className="text-xs text-muted-foreground">{permiso.codigo}</p>
                              </div>
                              <Checkbox
                                isSelected={formData.permisos.includes(permiso.id_permiso)}
                                onValueChange={() => togglePermission(permiso.id_permiso)}
                              />
                            </div>
                          ))}
                        </div>
                      </Tab>
                    ))}
                  </Tabs>
                ) : (
                  <p className="text-sm text-muted-foreground">No hay permisos disponibles</p>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button disabled={isSaving} variant="bordered" onPress={onClose}>
              Cancelar
            </Button>
            <Button color="primary" isLoading={isSaving} onPress={handleSave}>
              {editingRole ? "Guardar Cambios" : "Crear Rol"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          <ModalHeader>Confirmar Eliminación</ModalHeader>
          <ModalBody>
            {deleteError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-3">
                <p className="text-sm text-red-600 dark:text-red-400">{deleteError}</p>
              </div>
            )}
            <p>
              ¿Estás seguro de que deseas eliminar el rol <strong>{deletingRole?.nombre}</strong>?
            </p>
            <p className="text-sm text-danger mt-2">
              Esta acción no se puede deshacer. Los usuarios con este rol perderán los permisos asociados.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button disabled={isDeleting} variant="bordered" onPress={onDeleteClose}>
              Cancelar
            </Button>
            <Button color="danger" isLoading={isDeleting} onPress={handleDelete}>
              Eliminar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
