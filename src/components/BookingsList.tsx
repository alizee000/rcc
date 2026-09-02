"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Calendar, Clock, MapPin, QrCode, X, Check, UserPlus, MessageSquare } from "lucide-react";
import styles from "../app/bookings/page.module.css";
import InviteToBookingModal from "./InviteToBookingModal";
import BookingLobbyModal from "./BookingLobbyModal";
// @ts-ignore
import { api } from "../../convex/_generated/api";

export default function BookingsList({ user, bookings = [], invites = [] }: { user: any, bookings?: any[], invites?: any[] }) {
  const [activeTab, setActiveTab] = useState("UPCOMING");
  const [showPass, setShowPass] = useState<any>(null);
  const [inviteModalBookingId, setInviteModalBookingId] = useState<string | null>(null);
  const [lobbyModalBooking, setLobbyModalBooking] = useState<any>(null);

  const acceptInvite = useMutation(api.bookings.acceptBookingInvite);
  const declineInvite = useMutation(api.bookings.declineBookingInvite);

  const handleAccept = async (inviteId: string) => {
    try {
      await acceptInvite({ inviteId: inviteId as any });
      // Depending on implementation, you might want to refresh router or let convex react update
      window.location.reload(); // Simple refresh for now to update Server Components
    } catch (e) {
      alert("Failed to accept");
    }
  };

  const handleDecline = async (inviteId: string) => {
    try {
      await declineInvite({ inviteId: inviteId as any });
      window.location.reload();
    } catch (e) {
      alert("Failed to decline");
    }
  };

  // If there are no bookings, fallback to an empty array
  const displayBookings = bookings.length > 0 ? bookings : [];

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
          className={`${styles.tab} ${activeTab === "INVITES" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("INVITES")}
        >
          Invites {invites.length > 0 && <span style={{ background: "var(--accent-primary)", color: "white", borderRadius: 10, padding: "2px 6px", fontSize: 10, marginLeft: 4 }}>{invites.length}</span>}
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
          {displayBookings.map((b) => (
            <div key={b.id} className={styles.bookingCard}>
              <div className={`${styles.statusIndicator} ${b.status === "CONFIRMED" ? styles.statusConfirmed : styles.statusPending}`}></div>
              
              <div className={styles.header}>
                <div className={styles.venueName}>{b.venue?.name || "Bengaluru RC Raceway"}</div>
                <div className={`${styles.statusText} ${b.status === "CONFIRMED" ? styles.textConfirmed : styles.textPending}`}>
                  {b.status}
                </div>
              </div>
              
              <div className={styles.details}>
                <div className={styles.detailRow}>
                  <Calendar size={14} /> <span suppressHydrationWarning>{new Date(b.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className={styles.detailRow}>
                  <Clock size={14} /> {b.time || '18:00 - 19:00'} ({typeof b.experience === 'string' ? b.experience : b.experience?.name || 'RC Experience'})
                </div>
                <div className={styles.detailRow}>
                  <MapPin size={14} /> {b.venue?.city || "Bengaluru"}
                </div>
                <div className={styles.detailRow} style={{ color: 'var(--text-secondary)', fontSize: 11, marginTop: 4 }}>
                  Booked on: <span suppressHydrationWarning>{new Date(b._creationTime || b.createdAt || Date.now()).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
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
                <button 
                  className="btn-secondary" 
                  style={{ flex: 1, padding: "8px" }}
                  onClick={() => {
                    if (b.venue?.lat && b.venue?.lng) {
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${b.venue.lat},${b.venue.lng}`, "_blank");
                    } else if (b.venue?.address) {
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.venue.address)}`, "_blank");
                    } else {
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.venue?.name || "Bengaluru")}`, "_blank");
                    }
                  }}
                >
                  Directions
                </button>
              </div>

              {/* Show Invite Racers button only if the current user owns this booking */}
              {b.userId === user.id && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      className="btn-secondary" 
                      style={{ flex: 1, padding: "8px", display: "flex", justifyContent: "center", alignItems: "center", gap: 8, borderColor: "var(--border)", color: "var(--text-secondary)" }}
                      onClick={() => setInviteModalBookingId(b.id)}
                    >
                      <UserPlus size={16} /> Invite Racers
                    </button>
                    <button 
                      className="btn-primary" 
                      style={{ flex: 1, padding: "8px", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}
                      onClick={() => setLobbyModalBooking(b)}
                    >
                      <MessageSquare size={16} /> Enter Lobby
                    </button>
                  </div>
                  
                  {b.sentInvites && b.sentInvites.length > 0 && (
                    <div style={{ marginTop: 16, backgroundColor: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 12, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-secondary)', margin: 0 }}>Invited Racers ({b.sentInvites.length})</h4>
                        {b.sentInvites.length > 3 && (
                          <span style={{ fontSize: 11, color: 'var(--accent-primary)', cursor: 'pointer' }} onClick={() => setLobbyModalBooking(b)}>
                            View all
                          </span>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {b.sentInvites.slice(0, 3).map((inv: any) => (
                          <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                            <span>{inv.inviteeName}</span>
                            <span style={{ 
                              fontSize: 10, 
                              fontWeight: 600, 
                              padding: '2px 6px', 
                              borderRadius: 4,
                              backgroundColor: inv.status === 'ACCEPTED' ? 'rgba(0, 255, 128, 0.1)' : inv.status === 'DECLINED' ? 'rgba(255, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                              color: inv.status === 'ACCEPTED' ? 'var(--success)' : inv.status === 'DECLINED' ? '#ff4d4d' : 'var(--text-secondary)'
                            }}>
                              {inv.status}
                            </span>
                          </div>
                        ))}
                        {b.sentInvites.length > 3 && (
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', marginTop: 4 }}>
                            +{b.sentInvites.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {displayBookings.length === 0 && (
            <div className={styles.emptyState}>
              <Calendar size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
              <h3>No upcoming bookings</h3>
              <p>You have no races scheduled.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "INVITES" && (
        <div>
          {invites.map((inv) => (
            <div key={inv._id} className={styles.bookingCard}>
              <div className={styles.header}>
                <div className={styles.venueName}>Invite from {inv.inviter?.name}</div>
                <div className={`${styles.statusText} ${styles.textPending}`}>
                  PENDING
                </div>
              </div>
              
              <div className={styles.details}>
                <div className={styles.detailRow}>
                  <Calendar size={14} /> <span suppressHydrationWarning>{new Date(inv.booking.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className={styles.detailRow}>
                  <Clock size={14} /> {inv.booking.time || '18:00 - 19:00'} ({typeof inv.booking.experience === 'string' ? inv.booking.experience : inv.booking.experience?.name || 'RC Experience'})
                </div>
                <div className={styles.detailRow}>
                  <MapPin size={14} /> {inv.booking.venue?.city || "Bengaluru"} - {inv.booking.venue?.name}
                </div>
                <div className={styles.detailRow} style={{ color: 'var(--text-secondary)', fontSize: 11, marginTop: 4 }}>
                  Booked on: <span suppressHydrationWarning>{new Date(inv.booking._creationTime || inv.booking.createdAt || Date.now()).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              
              <div className={styles.actions}>
                <button 
                  className="btn-primary" 
                  style={{ flex: 1, padding: "8px", backgroundColor: "var(--success)" }}
                  onClick={() => handleAccept(inv._id)}
                >
                  <Check size={16} /> Accept
                </button>
                <button 
                  className="btn-secondary" 
                  style={{ flex: 1, padding: "8px" }}
                  onClick={() => handleDecline(inv._id)}
                >
                  <X size={16} /> Decline
                </button>
              </div>
            </div>
          ))}
          {invites.length === 0 && (
            <div className={styles.emptyState}>
              <UserPlus size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
              <h3>No pending invites</h3>
              <p>You haven't been invited to any races.</p>
            </div>
          )}
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
                  <span className={styles.infoValue}>{typeof showPass.experience === 'string' ? showPass.experience : showPass.experience?.name || 'RC Experience'}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Time</span>
                  <span className={styles.infoValue}>{showPass.time || '18:00 - 19:00'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {inviteModalBookingId && (
        <InviteToBookingModal 
          bookingId={inviteModalBookingId}
          inviterId={user.id}
          onClose={() => setInviteModalBookingId(null)}
        />
      )}

      {lobbyModalBooking && (
        <BookingLobbyModal
          booking={lobbyModalBooking}
          user={user}
          onClose={() => setLobbyModalBooking(null)}
        />
      )}
    </div>
  );
}
