import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { User, Settings, Shield, LogOut, ChevronRight, History } from "lucide-react";
import styles from "../page.module.css";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
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
          {session.user?.name?.charAt(0) || "U"}
        </div>
        <h1 className={styles.heroTitle} style={{ fontSize: 24, marginBottom: 4 }}>{session.user?.name}</h1>
        <p style={{ color: "var(--text-secondary)" }}>{session.user?.email}</p>
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

        <Link href="/api/auth/signout" className={styles.card} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", marginTop: 24 }}>
          <LogOut size={20} color="var(--error)" />
          <div style={{ flex: 1, fontWeight: 600, color: "var(--error)" }}>Sign Out</div>
        </Link>
      </div>
    </div>
  );
}
