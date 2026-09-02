"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { X, Search, UserPlus, Check } from "lucide-react";
// @ts-ignore
import { api } from "../../convex/_generated/api";
// @ts-ignore
import { Id } from "../../convex/_generated/dataModel";

export default function InviteToBookingModal({ bookingId, inviterId, onClose }: { bookingId: string, inviterId: string, onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [invitedUsers, setInvitedUsers] = useState<Set<string>>(new Set());
  const users = useQuery(api.users.getUsers) || [];
  const inviteToBooking = useMutation(api.bookings.inviteToBooking);
  const router = useRouter();

  const handleInvite = async (userId: string) => {
    if (invitedUsers.has(userId)) return;
    try {
      await inviteToBooking({ bookingId: bookingId as Id<"bookings">, inviterId, inviteeId: userId });
      setInvitedUsers(prev => new Set(prev).add(userId));
    } catch (e) {
      console.error("Failed to send invite", e);
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.7)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16
    }}>
      <div style={{
        backgroundColor: "var(--bg-card)",
        borderRadius: "var(--radius-lg)",
        width: "100%", maxWidth: 400,
        maxHeight: "80vh",
        display: "flex", flexDirection: "column",
        overflow: "hidden"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Invite Racers</h2>
          <button onClick={onClose} style={{ color: "var(--text-secondary)" }}><X size={20} /></button>
        </div>

        <div style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", backgroundColor: "var(--bg-primary)", padding: "8px 12px", borderRadius: "var(--radius-sm)", marginBottom: 16 }}>
            <Search size={16} color="var(--text-secondary)" style={{ marginRight: 8 }} />
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: "transparent", border: "none", outline: "none", width: "100%", color: "white" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", maxHeight: "40vh" }}>
            {users
              .filter(u => u.clerkId && u.clerkId !== inviterId && u.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(user => {
                return (
                  <div key={user._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
                        {user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div style={{ fontWeight: 600 }}>{user.name}</div>
                    </div>
                    {(() => {
                      const isInvited = invitedUsers.has(user.clerkId);
                      return (
                        <button 
                          onClick={() => handleInvite(user.clerkId)} 
                          style={{ 
                            padding: "6px 12px", borderRadius: "var(--radius-full)", 
                            backgroundColor: isInvited ? "var(--success)" : "var(--accent-primary)", color: "white", 
                            fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4,
                            cursor: isInvited ? "default" : "pointer",
                            opacity: isInvited ? 0.8 : 1,
                            border: "none"
                          }}
                        >
                          {isInvited ? <Check size={14} /> : <UserPlus size={14} />} 
                          {isInvited ? "Sent" : "Invite"}
                        </button>
                      );
                    })()}
                  </div>
                )
            })}
            {users.length === 0 && <div style={{ textAlign: "center", color: "var(--text-secondary)" }}>No users found.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
