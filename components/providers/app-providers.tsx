"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TopProgress } from "@/components/top-progress";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <Suspense fallback={null}>
        <TopProgress />
      </Suspense>
      {children}
      <Toaster closeButton richColors position="top-right" />
    </ThemeProvider>
  );
}
