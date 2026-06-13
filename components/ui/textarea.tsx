import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-28 w-full rounded-card border border-white/10 bg-black/40 px-3 py-3 text-sm outline-none ring-accent/30 transition placeholder:text-white/35 focus:border-accent focus:ring-4",
        props.className
      )}
    />
  );
}
