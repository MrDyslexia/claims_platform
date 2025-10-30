import { Input as HeroInput, type InputProps } from "@heroui/react";

import { cn } from "@/lib/utils";

interface FormInputProps extends Omit<InputProps, "label"> {
  label?: string;
  helperText?: string;
  error?: string;
}

export function FormInput({
  label,
  helperText,
  error,
  className,
  ...props
}: FormInputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label
          className="text-sm font-medium text-foreground block"
          htmlFor={props.id}
        >
          {label}
          {props.isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <HeroInput
        {...props}
        className={cn(className)}
        classNames={{
          input: "text-sm",
          inputWrapper: cn(
            "border-2 border-default-200 hover:border-default-300",
            "data-[hover=true]:border-default-300",
            "group-data-[focus=true]:border-primary",
            error && "border-red-500 hover:border-red-600",
          ),
        }}
      />
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
