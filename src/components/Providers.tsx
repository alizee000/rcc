"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ToastProvider } from "./Toast";
import ConvexClientProvider from "./ConvexClientProvider";
import UserSync from "./UserSync";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#FF1053",
          colorBackground: "rgba(10, 10, 18, 0.95)",
          colorInputBackground: "rgba(255, 255, 255, 0.05)",
          colorInputText: "#FFFFFF",
          colorText: "#FFFFFF",
          colorTextSecondary: "#A0A0A0",
          borderRadius: "12px",
        },
        elements: {
          card: {
            boxShadow: "0 0 24px rgba(255, 16, 83, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(16px)",
          },
          formButtonPrimary: {
            boxShadow: "0 0 16px rgba(255, 16, 83, 0.6)",
            textTransform: "uppercase",
            fontWeight: "bold",
            letterSpacing: "1px",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0 0 24px rgba(255, 16, 83, 1)",
              transform: "scale(1.02)",
            }
          },
          headerTitle: {
            textTransform: "uppercase",
            letterSpacing: "2px",
            fontSize: "24px",
            color: "#FFFFFF",
          },
          headerSubtitle: {
            color: "#A0A0A0",
          },
          socialButtonsBlockButtonText: {
            color: "#FFFFFF",
            fontWeight: "600",
          },
          formFieldLabel: {
            color: "#FFFFFF",
          },
          dividerText: {
            color: "#A0A0A0",
          },
          footerActionText: {
            color: "#A0A0A0",
          },
          footerActionLink: {
            color: "#FF1053",
          },
          socialButtonsBlockButton: {
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            }
          },
        }
      }}
    >
      <ConvexClientProvider>
        <ToastProvider>
          <UserSync />
          {children}
        </ToastProvider>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
