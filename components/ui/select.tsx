import * as React from "react";
import { cn } from "@/lib/utils";

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-11 w-full rounded-card border border-white/10 bg-black/40 px-3 text-sm outline-none ring-accent/30 transition focus:border-accent focus:ring-4",
        props.className
      )}
    />
  );
}
