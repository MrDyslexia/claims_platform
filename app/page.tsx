import { ClaimsWizard } from "@/components/claims-wizard"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Sistema de Reclamos Corporativos</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Presenta tu reclamo de manera segura y profesional. Nuestro sistema te guiará paso a paso para documentar
              tu caso de forma completa.
            </p>
          </div>
          <ClaimsWizard />
        </div>
      </div>
    </main>
  )
}
