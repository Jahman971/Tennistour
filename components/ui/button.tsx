import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-card px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-accent text-black hover:bg-accent/90",
        variant === "secondary" && "border border-white/10 bg-surface text-white hover:bg-white/10",
        variant === "danger" && "bg-danger text-white hover:bg-danger/90",
        variant === "ghost" && "text-white hover:bg-white/10",
        className
      )}
      {...props}
    />
  );
}
