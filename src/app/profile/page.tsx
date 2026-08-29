import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Settings, Shield, ChevronRight, History } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";

export default async function ProfilePage() {
  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  const glassCardStyle = {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "16px 20px",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "16px",
    color: "white",
    textDecoration: "none",
    transition: "all 0.3s ease"
  };

  return (
    <div style={{ 
      minHeight: "100vh",
      padding: "40px 24px 100px 24px",
      backgroundImage: 'linear-gradient(to bottom, rgba(10, 10, 10, 0.5), rgba(10, 10, 10, 0.95)), url("/profile-bg.jpg")',
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      color: "white"
    }}>
      <header style={{ marginBottom: 40, textAlign: "center", position: "relative", zIndex: 10 }}>
        <div style={{ 
          width: 90, 
          height: 90, 
          borderRadius: "50%", 
          backgroundColor: "rgba(255, 42, 42, 0.8)", 
          border: "3px solid rgba(255, 255, 255, 0.8)",
          margin: "0 auto 16px auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 36,
          fontWeight: 800,
          color: "white",
          boxShadow: "0 8px 32px rgba(255, 42, 42, 0.4)",
          backdropFilter: "blur(8px)"
        }}>
          {user.firstName?.charAt(0) || user.emailAddresses?.[0]?.emailAddress?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
          {user.fullName || user.firstName}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
          {user.emailAddresses?.[0]?.emailAddress}
        </p>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative", zIndex: 10 }}>
        
        <Link href="/bookings" style={glassCardStyle}>
          <History size={22} color="rgba(255,255,255,0.7)" />
          <div style={{ flex: 1, fontWeight: 600, fontSize: 16 }}>Booking History</div>
          <ChevronRight size={20} color="rgba(255,255,255,0.5)" />
        </Link>
        
        <Link href="#" style={glassCardStyle}>
          <User size={22} color="rgba(255,255,255,0.7)" />
          <div style={{ flex: 1, fontWeight: 600, fontSize: 16 }}>Edit Profile</div>
          <ChevronRight size={20} color="rgba(255,255,255,0.5)" />
        </Link>

        <Link href="#" style={glassCardStyle}>
          <Settings size={22} color="rgba(255,255,255,0.7)" />
          <div style={{ flex: 1, fontWeight: 600, fontSize: 16 }}>Settings & Preferences</div>
          <ChevronRight size={20} color="rgba(255,255,255,0.5)" />
        </Link>
        
        {/* Admin Portal Link for Venues */}
        <Link href="/admin" style={{
          ...glassCardStyle,
          border: "1px solid rgba(255, 42, 42, 0.4)",
          background: "linear-gradient(135deg, rgba(255, 42, 42, 0.1), rgba(255, 42, 42, 0.05))"
        }}>
          <Shield size={22} color="#ff2a2a" />
          <div style={{ flex: 1, fontWeight: 600, color: "#ff2a2a", fontSize: 16 }}>Venue Partner Portal</div>
          <ChevronRight size={20} color="#ff2a2a" />
        </Link>

        <SignOutButton style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          gap: 12, 
          marginTop: 32, 
          width: "100%",
          padding: "16px",
          backgroundColor: "rgba(255,255,255,0.1)",
          border: "none",
          borderRadius: "16px",
          color: "white",
          fontWeight: 600,
          fontSize: 16,
          backdropFilter: "blur(12px)",
          cursor: "pointer"
        }} />
      </div>
    </div>
  );
}
