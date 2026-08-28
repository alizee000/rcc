import prisma from "@/lib/prisma";
import styles from "../layout.module.css";
import { Search } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminBookings() {
  const venueId = "venue-1"; // Mock active venue

  const bookings = await prisma.booking.findMany({
    where: { venueId },
    include: {
      slot: true,
      experience: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Bookings & Slots</h1>
          <p className={styles.pageSubtitle}>View all reservations and manage schedule.</p>
        </div>
      </div>

      <div className={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ position: "relative", width: "300px" }}>
            <Search size={18} style={{ position: "absolute", left: 12, top: 10, color: "var(--text-secondary)" }} />
            <input 
              type="text" 
              placeholder="Search by ID or name..."
              style={{
                width: "100%",
                padding: "10px 10px 10px 40px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                color: "white"
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <select style={{ padding: "10px", borderRadius: "var(--radius-sm)", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", color: "white" }}>
              <option>All Statuses</option>
              <option>Confirmed</option>
              <option>Pending</option>
              <option>Live</option>
              <option>Completed</option>
            </select>
            <input type="date" style={{ padding: "10px", borderRadius: "var(--radius-sm)", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", color: "white" }} />
          </div>
        </div>
        
      <div>
        <div className={styles.listCard}>
          <div className={styles.listHeader}>
            <span>RCR-84291</span>
            <span className={`${styles.badge} ${styles.badgeSuccess}`}>Confirmed</span>
          </div>
          
          <div className={styles.listContent}>
            <div>Customer: <strong>Alex Driver</strong></div>
            <div>Experience: Pro Race (60m)</div>
            <div>Time: Today, 18:00 - 19:00</div>
          </div>
          
          <div className={styles.listFooter}>
            <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: 12, width: "100%" }}>Manage</button>
          </div>
        </div>

        <div className={styles.listCard}>
          <div className={styles.listHeader}>
            <span>RCR-92011</span>
            <span className={`${styles.badge} ${styles.badgeWarning}`}>Pending</span>
          </div>
          
          <div className={styles.listContent}>
            <div>Customer: <strong>Sam Racer</strong></div>
            <div>Experience: Beginner (30m)</div>
            <div>Time: Today, 19:30 - 20:00</div>
          </div>
          
          <div className={styles.listFooter}>
            <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: 12, width: "100%" }}>Manage</button>
          </div>
        </div>

        <div className={styles.listCard}>
          <div className={styles.listHeader}>
            <span>RCR-10492</span>
            <span className={`${styles.badge} ${styles.badgeSuccess}`}>Confirmed</span>
          </div>
          
          <div className={styles.listContent}>
            <div>Customer: <strong>Family Group (3)</strong></div>
            <div>Experience: Track Rent (120m)</div>
            <div>Time: Tomorrow, 14:00 - 16:00</div>
          </div>
          
          <div className={styles.listFooter}>
            <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: 12, width: "100%" }}>Manage</button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
