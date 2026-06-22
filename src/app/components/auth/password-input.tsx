"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<React.ComponentProps<"input">, "type">;

/**
 * Password field with a show/hide toggle. The toggle is reachable by keyboard
 * so it stays accessible; pass the usual input props (id, value, onChange,
 * autoComplete, placeholder, minLength…) and keep the associated <label> next
 * to it via htmlFor/id.
 */
export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        className={cn(
          "border-input bg-background ring-ring/50 focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 pr-10 text-sm outline-none focus-visible:ring-2",
          className,
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword((v) => !v)}
        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        aria-pressed={showPassword}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute inset-y-0 right-0 flex items-center rounded-md px-3 outline-none focus-visible:ring-2"
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
