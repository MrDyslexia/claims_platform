"use client";

import type {
  CategoryMetadata,
  SubcategoryMetadata,
} from "@/lib/form-metadata";

import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionItem,
  Checkbox,
  CheckboxGroup,
} from "@heroui/react";

interface CategoryStepProps {
  readonly formData: Record<string, any>;
  readonly onUpdate: (data: Record<string, any>) => void;
  readonly categories: CategoryMetadata[];
}

export function CategoryStep({
  formData,
  onUpdate,
  categories,
}: CategoryStepProps) {
  const [selectedCategory, setSelectedCategory] = useState(
    formData.category || "",
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState(
    formData.subcategory || "",
  );

  // 🔄 sincronizar cuando formData cambie desde afuera
  useEffect(() => {
    setSelectedCategory(formData.category || "");
    setSelectedSubcategory(formData.subcategory || "");
  }, [formData.category, formData.subcategory]);

  const handleCategorySelect = (category: CategoryMetadata) => {
    setSelectedCategory(category.id);
    setSelectedSubcategory("");
    onUpdate({
      category: category.id,
      categoryName: category.name,
      subcategory: "",
      subcategoryName: "",
    });
  };

  const handleSubcategorySelect = (
    category: CategoryMetadata,
    subcategory: SubcategoryMetadata,
  ) => {
    setSelectedCategory(category.id);
    setSelectedSubcategory(subcategory.code);
    onUpdate({
      category: category.id,
      categoryName: category.name,
      subcategory: subcategory.code,
      subcategoryName: subcategory.name,
    });
  };

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <div className="px-4 overflow-hidden">
        <h3 className="text-lg font-semibold mb-4">
          Selecciona la categoría principal
        </h3>
        <Accordion variant="bordered">
          {categories.map((category: CategoryMetadata) => (
            <AccordionItem
              key={category.id}
              title={category.name}
              value={category.id}
              onPress={() => handleCategorySelect(category)}
            >
              <CheckboxGroup
                value={
                  selectedCategory === category.id ? [selectedSubcategory] : []
                }
              >
                {category.subcategories.map(
                  (subcategory: SubcategoryMetadata) => (
                    <Checkbox
                      key={subcategory.code}
                      disabled={selectedCategory !== category.id}
                      value={subcategory.code}
                      onChange={() =>
                        handleSubcategorySelect(category, subcategory)
                      }
                    >
                      {subcategory.name}
                    </Checkbox>
                  ),
                )}
              </CheckboxGroup>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
