"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Button, Input } from "@heroui/react";
import { Search, MapPin, Globe, CircleCheckBig } from "lucide-react";

interface LocationStepProps {
  readonly formData: Record<string, any>;
  readonly onUpdate: (data: Record<string, any>) => void;
  readonly countries: string[];
}

export function LocationStep({
  formData,
  onUpdate,
  countries,
}: LocationStepProps) {
  const [selectedCountry, setSelectedCountry] = useState(
    formData.country || "",
  );
  const [searchTerm, setSearchTerm] = useState("");

  // 🔄 Sincronizar cuando formData cambie desde afuera
  useEffect(() => {
    setSelectedCountry(formData.country || "");
  }, [formData.country]);

  const filteredCountries = countries.filter((country) =>
    country.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    onUpdate({ country });
  };

  return (
    <div className="space-y-6">
      <div className="px-4 overflow-hidden">
        <h3 className="text-lg font-semibold mb-2">
          ¿En qué país ocurrió el hecho?
        </h3>
        <p className="text-muted-foreground">
          Selecciona el país donde tuvo lugar la situación que deseas reportar
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Buscar país..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Selected Country Display */}
      {selectedCountry && (
        <Card className="bg-primary/5 border-primary/20">
          <CardBody className="p-4">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">
                  País seleccionado: {selectedCountry}
                </p>
                <p className="text-sm text-muted-foreground">
                  El reclamo será procesado según las regulaciones de este país
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Countries Grid */}
      <Card>
        <CardHeader>
          <h1 className="text-base flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Selecciona un país</span>
          </h1>
          <h2>
            {searchTerm
              ? `${filteredCountries.length} países encontrados`
              : `${countries.length} países disponibles`}
          </h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-80 overflow-y-auto">
            {filteredCountries.map((country) => (
              <Button
                key={country}
                className="justify-start h-auto p-3 text-left"
                startContent={
                  selectedCountry === country ? (
                    <CircleCheckBig className="h-5 w-5 text-primary" />
                  ) : null
                }
                variant={selectedCountry === country ? "flat" : "bordered"}
                onPress={() => handleCountrySelect(country)}
              >
                {country}
              </Button>
            ))}
          </div>
          {filteredCountries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No se encontraron países con ese término</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
