// Label + control + mensaje de error de validacion. El control (input/select/textarea) va como children.
import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

export const inputClass =
  "rounded border border-slate-300 bg-white px-3 py-2 aria-invalid:border-red-500 aria-invalid:bg-red-50/40";

export const FormField = ({ label, error, className = "", children }: FormFieldProps) => (
  <label className={`flex flex-col gap-1 text-sm text-slate-700 ${className}`}>
    {label}
    {children}
    {error && <span className="text-xs text-red-600">{error}</span>}
  </label>
);
