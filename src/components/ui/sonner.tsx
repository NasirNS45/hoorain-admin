import type { ComponentProps } from "react";
import { Toaster as Sonner } from "sonner";

export function Toaster(props: ComponentProps<typeof Sonner>) {
  return (
    <Sonner
      toastOptions={{
        classNames: {
          toast: "bg-card text-foreground border-border",
          description: "text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}
