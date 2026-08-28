"use client";

import { useState } from "react";
import { Calendar, Clock, MapPin, QrCode, X } from "lucide-react";
import styles from "../app/bookings/page.module.css";

export default function BookingsList({ user, venues }: { user: any, venues: any[] }) {
  const [activeTab, setActiveTab] = useState("UPCOMING");
  const [showPass, setShowPass] = useState<any>(null);

  // Mock booking data
  const mockBookings = [
    {
      id: "RCR-84291",
      venue: venues[0] || { name: "Bengaluru RC Raceway" },
      experience: "Pro Race",
      date: new Date().toLocaleDateString(),
      time: "18:00 - 19:00",
      status: "CONFIRMED",
      players: 1,
    }
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Bookings</h1>
      
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === "UPCOMING" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("UPCOMING")}
        >
          Upcoming
        </button>
        <button 
          className={`${styles.tab} ${activeTab === "PAST" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("PAST")}
        >
          Past Sessions
        </button>
      </div>

      {activeTab === "UPCOMING" && (
        <div>
          {mockBookings.map((b) => (
            <div key={b.id} className={styles.bookingCard}>
              <div className={`${styles.statusIndicator} ${b.status === "CONFIRMED" ? styles.statusConfirmed : styles.statusPending}`}></div>
              
              <div className={styles.header}>
                <div className={styles.venueName}>{b.venue.name}</div>
                <div className={`${styles.statusText} ${b.status === "CONFIRMED" ? styles.textConfirmed : styles.textPending}`}>
                  {b.status}
                </div>
              </div>
              
              <div className={styles.details}>
                <div className={styles.detailRow}>
                  <Calendar size={14} /> {b.date}
                </div>
                <div className={styles.detailRow}>
                  <Clock size={14} /> {b.time} ({b.experience})
                </div>
                <div className={styles.detailRow}>
                  <MapPin size={14} /> {b.venue.city || "Bengaluru"}
                </div>
              </div>
              
              <div className={styles.actions}>
                <button 
                  className="btn-primary" 
                  style={{ flex: 1, padding: "8px" }}
                  onClick={() => setShowPass(b)}
                >
                  <QrCode size={16} /> View Pass
                </button>
                <button className="btn-secondary" style={{ flex: 1, padding: "8px" }}>
                  Directions
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "PAST" && (
        <div className={styles.emptyState}>
          <Calendar size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
          <h3>No past bookings</h3>
          <p>You haven't completed any races yet.</p>
        </div>
      )}

      {/* Digital Pass Modal */}
      {showPass && (
        <div className={styles.modalOverlay}>
          <div className={styles.passCard}>
            <button className={styles.closeBtn} onClick={() => setShowPass(null)}>
              <X size={24} />
            </button>
            <div className={styles.passHeader}>
              <div className={styles.passTitle}>RC RUSH PASS</div>
              <div style={{ opacity: 0.8, fontSize: 14 }}>READY TO RACE</div>
            </div>
            
            <div className={styles.passContent}>
              <div className={styles.qrWrapper}>
                <QrCode size={180} color="black" />
              </div>
              
              <div className={styles.passInfo}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Booking ID</span>
                  <span className={styles.infoValue}>{showPass.id}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Player</span>
                  <span className={styles.infoValue}>{user?.name}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Experience</span>
                  <span className={styles.infoValue}>{showPass.experience}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Time</span>
                  <span className={styles.infoValue}>{showPass.time}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
