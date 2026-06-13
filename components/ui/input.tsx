import * as React from "react";
import { cn } from "@/lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-11 w-full rounded-card border border-white/10 bg-black/40 px-3 text-sm outline-none ring-accent/30 transition placeholder:text-white/35 focus:border-accent focus:ring-4",
        props.className
      )}
    />
  );
}
