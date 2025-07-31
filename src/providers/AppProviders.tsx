"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

// This component will wrap our entire application
export function AppProviders({ children }: { children: React.ReactNode }) {
  // Create a new instance of QueryClient.
  // We use useState to ensure this instance is only created once per component lifecycle.
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}