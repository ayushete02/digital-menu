"use client";

import { Toaster as SonnerToaster } from "sonner";

export const Toaster = () => (
  <SonnerToaster
    position="top-center"
    toastOptions={{
      className: "bg-card text-card-foreground border border-border",
    }}
  />
);
