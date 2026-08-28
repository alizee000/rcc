import { currentUser } from "@clerk/nextjs/server";

import Link from "next/link";
import { User, Settings, Shield, ChevronRight, History } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";
import styles from "../home/page.module.css";

export default async function ProfilePage() {
  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div style={{ padding: "24px 16px" }}>
      <header style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ 
          width: 80, 
          height: 80, 
          borderRadius: "50%", 
          backgroundColor: "var(--accent-primary)", 
          margin: "0 auto 16px auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          fontWeight: 800,
          color: "white"
        }}>
          {user.firstName?.charAt(0) || user.emailAddresses?.[0]?.emailAddress?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <h1 className={styles.heroTitle} style={{ fontSize: 24, marginBottom: 4 }}>{user.fullName || user.firstName}</h1>
        <p style={{ color: "var(--text-secondary)" }}>{user.emailAddresses?.[0]?.emailAddress}</p>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        
        <Link href="/bookings" className={styles.card} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px" }}>
          <History size={20} color="var(--text-secondary)" />
          <div style={{ flex: 1, fontWeight: 600 }}>Booking History</div>
          <ChevronRight size={20} color="var(--text-secondary)" />
        </Link>
        
        <Link href="#" className={styles.card} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px" }}>
          <User size={20} color="var(--text-secondary)" />
          <div style={{ flex: 1, fontWeight: 600 }}>Edit Profile</div>
          <ChevronRight size={20} color="var(--text-secondary)" />
        </Link>

        <Link href="#" className={styles.card} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px" }}>
          <Settings size={20} color="var(--text-secondary)" />
          <div style={{ flex: 1, fontWeight: 600 }}>Settings & Preferences</div>
          <ChevronRight size={20} color="var(--text-secondary)" />
        </Link>
        
        {/* Admin Portal Link for Venues */}
        <Link href="/admin" className={styles.card} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", border: "1px solid var(--accent-primary)" }}>
          <Shield size={20} color="var(--accent-primary)" />
          <div style={{ flex: 1, fontWeight: 600, color: "var(--accent-primary)" }}>Venue Partner Portal</div>
          <ChevronRight size={20} color="var(--accent-primary)" />
        </Link>

        <SignOutButton className={styles.card} style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 24, width: "100%" }} />
      </div>
    </div>
  );
}
