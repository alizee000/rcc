"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ToastProvider } from "./Toast";
import ConvexClientProvider from "./ConvexClientProvider";
import UserSync from "./UserSync";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexClientProvider>
        <ToastProvider>
          <UserSync />
          {children}
        </ToastProvider>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
