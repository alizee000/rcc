import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import styles from "./layout.module.css";
import Link from "next/link";
import { QrCode, ArrowRight } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  // In MVP we assume the venue partner is looking at Venue 1 (Bengaluru)
  const venueId = "venue-1"; // Matching seeded ID

  // Fetch some stats
  const totalCars = await prisma.car.count({ where: { venueId } });
  const activeBookings = await prisma.booking.count({ 
    where: { 
      venueId,
      status: "CONFIRMED"
    } 
  });

  // Mock revenue for today
  const todayRevenue = activeBookings * 1250;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard Overview</h1>
          <p className={styles.pageSubtitle}>Welcome back, {session?.user?.name || "Partner"}. Here's what's happening today.</p>
        </div>
        
        <Link href="/admin/checkin" className="btn-primary" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <QrCode size={18} />
          Scan Check-in
        </Link>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.statLabel}>Today's Bookings</div>
          <div className={styles.statValue}>{activeBookings}</div>
          <div style={{ fontSize: 13, color: "var(--success)", marginTop: 8 }}>+3 since last hour</div>
        </div>
        
        <div className={styles.card}>
          <div className={styles.statLabel}>Active Cars</div>
          <div className={styles.statValue}>{totalCars}</div>
          <div style={{ fontSize: 13, color: "var(--warning)", marginTop: 8 }}>1 currently in maintenance</div>
        </div>
        
        <div className={styles.card}>
          <div className={styles.statLabel}>Today's Revenue</div>
          <div className={styles.statValue}>₹{todayRevenue.toLocaleString()}</div>
          <div style={{ fontSize: 13, color: "var(--success)", marginTop: 8 }}>12% above average</div>
        </div>
      </div>

      <div className={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Recent Bookings</h2>
          <Link href="/admin/bookings" style={{ color: "var(--accent-primary)", fontSize: 14, display: "flex", alignItems: "center", gap: 4 }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>
        
        <div className={styles.listCard}>
          <div className={styles.listHeader}>
            <span>RCR-84291</span>
            <span className={`${styles.badge} ${styles.badgeSuccess}`}>Confirmed</span>
          </div>
          <div className={styles.listContent}>
            <div>Customer: <strong>Alex Driver</strong></div>
            <div>Exp: Pro Race (60m)</div>
          </div>
        </div>

        <div className={styles.listCard}>
          <div className={styles.listHeader}>
            <span>RCR-92011</span>
            <span className={`${styles.badge} ${styles.badgeWarning}`}>Pending</span>
          </div>
          <div className={styles.listContent}>
            <div>Customer: <strong>Sam Racer</strong></div>
            <div>Exp: Beginner (30m)</div>
          </div>
        </div>

        <div className={styles.listCard}>
          <div className={styles.listHeader}>
            <span>RCR-10492</span>
            <span className={`${styles.badge} ${styles.badgeSuccess}`}>Confirmed</span>
          </div>
          <div className={styles.listContent}>
            <div>Customer: <strong>Family Group</strong></div>
            <div>Exp: Track Rent (120m)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
