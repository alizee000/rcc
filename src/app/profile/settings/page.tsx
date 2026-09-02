import { UserProfile } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProfileSettingsPage() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "var(--bg-primary)",
      padding: "24px 16px",
      paddingBottom: "100px",
      width: "100%",
      overflowX: "hidden"
    }}>
      <header style={{ display: "flex", alignItems: "center", marginBottom: 24, gap: 16 }}>
        <Link href="/profile" style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          backgroundColor: "var(--bg-card)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white"
        }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Account Settings</h1>
      </header>

      <div style={{ width: "100%" }}>
        <UserProfile 
          routing="hash"
          appearance={{
            elements: {
              rootBox: {
                width: "100%",
              },
              card: {
                backgroundColor: "var(--bg-card)",
                color: "white",
                borderRadius: "16px",
                border: "1px solid var(--border)",
                boxShadow: "none",
                width: "100%",
                maxWidth: "100%"
              },
              headerTitle: {
                color: "white"
              },
              headerSubtitle: {
                color: "var(--text-secondary)"
              },
              socialButtonsBlockButton: {
                borderColor: "var(--border)",
                color: "white"
              },
              dividerLine: {
                backgroundColor: "var(--border)"
              },
              dividerText: {
                color: "var(--text-secondary)"
              },
              formFieldLabel: {
                color: "var(--text-secondary)"
              },
              formFieldInput: {
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border)",
                color: "white"
              },
              footerActionText: {
                color: "var(--text-secondary)"
              },
              footerActionLink: {
                color: "var(--accent-primary)",
                "&:hover": {
                  color: "var(--accent-secondary)"
                }
              },
              primaryButton: {
                backgroundColor: "var(--accent-primary)",
                "&:hover": {
                  backgroundColor: "var(--accent-secondary)"
                }
              },
              profileSectionTitle: {
                color: "var(--text-secondary)"
              },
              navbarButton: {
                color: "var(--text-secondary)"
              },
              navbarButton__active: {
                color: "var(--accent-primary)",
                backgroundColor: "rgba(255, 42, 42, 0.1)"
              },
              profilePage: {
                backgroundColor: "var(--bg-card)"
              },
              pageScrollBox: {
                backgroundColor: "var(--bg-card)"
              },
              badge: {
                backgroundColor: "rgba(255, 42, 42, 0.1)",
                color: "var(--accent-primary)"
              }
            }
          }}
        />
      </div>
    </div>
  );
}
