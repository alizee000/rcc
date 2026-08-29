"use client";

import { useState } from "react";
import { QrCode, CheckCircle, Search, ArrowLeft } from "lucide-react";
import layoutStyles from "../layout.module.css";
import styles from "./page.module.css";
import Link from "next/link";

export default function AdminCheckIn() {
  const [bookingId, setBookingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleValidate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!bookingId) return;

    setLoading(true);
    setError("");
    
    // Simulate API call to validate booking
    setTimeout(() => {
      setLoading(false);
      
      if (bookingId.toUpperCase() === "RCR-84291") {
        setResult({
          id: "RCR-84291",
          customer: "Alex Driver",
          experience: "Pro Race",
          duration: "60 mins",
          carAssigned: "Nitro RS4 (On-Road)",
          time: "18:00 - 19:00"
        });
      } else {
        setError("Invalid Booking ID or booking not found for today.");
      }
    }, 1000);
  };

  const handleCheckIn = () => {
    // In real app, this would mutate status to "LIVE"
    alert("Checked in successfully! Car is now assigned to track.");
    setResult(null);
    setBookingId("");
  };

  return (
    <div>
      <div className={layoutStyles.pageHeader}>
        <div>
          <Link href="/admin" style={{ display: "flex", alignItems: "center", marginBottom: 12, color: "var(--text-secondary)", fontSize: 14 }}>
            <ArrowLeft size={16} style={{ marginRight: 8 }} /> Back to Dashboard
          </Link>
          <h1 className={layoutStyles.pageTitle}>Scanner & Check-in</h1>
          <p className={layoutStyles.pageSubtitle}>Validate racer passes and assign cars to the track.</p>
        </div>
      </div>

      <div className={styles.container}>
        {!result ? (
          <div className={styles.scannerCard}>
            <div className={styles.scannerViewport}>
              <div className={styles.scanLine}></div>
              <QrCode size={64} style={{ opacity: 0.3 }} />
              <div style={{ position: "absolute", bottom: 16, fontSize: 12, color: "var(--text-secondary)" }}>
                Camera access simulated
              </div>
            </div>
            
            <p style={{ color: "var(--text-secondary)", marginBottom: 16 }}>
              Point camera at the racer's Digital Pass QR code
            </p>
            
            <div className={styles.orDivider}>OR ENTER MANUALLY</div>
            
            <form onSubmit={handleValidate} className={styles.inputGroup}>
              <input 
                type="text" 
                placeholder="e.g. RCR-84291" 
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
              />
              <button 
                type="submit" 
                className="btn-primary" 
                style={{ padding: "0 24px" }}
                disabled={loading || !bookingId}
              >
                {loading ? "..." : "Validate"}
              </button>
            </form>
            
            {error && <div style={{ color: "var(--error)", marginTop: 16, fontSize: 14 }}>{error}</div>}
          </div>
        ) : (
          <div className={styles.successModal}>
            <CheckCircle size={64} color="var(--success)" style={{ margin: "0 auto 16px auto" }} />
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Valid Pass</h2>
            <p style={{ color: "var(--success)" }}>Ready for the track</p>
            
            <div className={styles.detailsList}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Customer</span>
                <span className={styles.detailValue}>{result.customer}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Experience</span>
                <span className={styles.detailValue}>{result.experience} ({result.duration})</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Time Slot</span>
                <span className={styles.detailValue}>{result.time}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Assigned Car</span>
                <span className={styles.detailValue} style={{ color: "var(--accent-primary)" }}>{result.carAssigned}</span>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setResult(null)}>
                Cancel
              </button>
              <button className="btn-primary" style={{ flex: 2 }} onClick={handleCheckIn}>
                Confirm Check-in
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
