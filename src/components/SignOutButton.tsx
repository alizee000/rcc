"use client";

import { useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

export function SignOutButton({ className, style, showText = true }: { className?: string, style?: React.CSSProperties, showText?: boolean }) {
  const { signOut } = useClerk();
  
  return (
    <button 
      onClick={() => signOut({ redirectUrl: "/" })} 
      className={className} 
      style={{ ...style, cursor: "pointer", background: "none", border: "none", textAlign: "left", padding: showText ? "16px 20px" : 0 }}
    >
      <LogOut size={20} color={showText ? "var(--error)" : "inherit"} />
      {showText && <div style={{ flex: 1, fontWeight: 600, color: "var(--error)" }}>Sign Out</div>}
    </button>
  );
}
