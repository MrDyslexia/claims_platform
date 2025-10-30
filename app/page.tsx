"use client";

import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import Link from "next/link";
import { Search } from "lucide-react";
import { useState } from "react";

import { ClaimsWizard } from "@/components/claims-wizard";
import LoginDrawer from "@/components/login-drawer";

export default function HomePage() {
  const [isLoginDrawerOpen, setIsLoginDrawerOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Sistema de Reclamos Corporativos
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Presenta tu reclamo de manera segura y profesional. Nuestro
              sistema te guiará paso a paso para documentar tu caso de forma
              completa.
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <Card className="bg-success-50 dark:bg-success-950/20 border-2 border-success-200 dark:border-success-800">
                <CardBody className="flex flex-row items-center justify-between gap-4 p-4">
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-success-700 dark:text-success-300">
                      ¿Ya enviaste un reclamo?
                    </h3>
                    <p className="text-sm text-success-600 dark:text-success-400">
                      Consulta el estado de tu reclamo con tu código
                    </p>
                  </div>
                  <Button
                    as={Link}
                    className="shrink-0"
                    color="success"
                    href="/track"
                    size="lg"
                    startContent={<Search className="w-4 h-4" />}
                    variant="solid"
                  >
                    Seguimiento
                  </Button>
                </CardBody>
              </Card>

              <Card className="bg-primary-50 dark:bg-primary-950/20 border-2 border-primary-200 dark:border-primary-800">
                <CardBody className="flex flex-row items-center justify-between gap-4 p-4">
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-300">
                      ¿Eres administrador?
                    </h3>
                    <p className="text-sm text-primary-600 dark:text-primary-400">
                      Accede al panel de administración
                    </p>
                  </div>
                  <Button
                    className="shrink-0"
                    color="primary"
                    size="lg"
                    variant="solid"
                    onPress={() => setIsLoginDrawerOpen(true)}
                  >
                    Acceder
                  </Button>
                </CardBody>
              </Card>
            </div>
          </div>
          <ClaimsWizard />
        </div>
      </div>

      <LoginDrawer
        isOpen={isLoginDrawerOpen}
        onOpenChange={setIsLoginDrawerOpen}
      />
    </main>
  );
}
