"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { X, Send, User, MapPin, Calendar, Clock } from "lucide-react";
// @ts-ignore
import { api } from "../../convex/_generated/api";
import styles from "./BookingLobbyModal.module.css";

export default function BookingLobbyModal({ 
  booking, 
  user,
  onClose 
}: { 
  booking: any, 
  user: any,
  onClose: () => void 
}) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const messages = useQuery(api.bookings.getBookingMessages, { bookingId: booking.id });
  const sendMessage = useMutation(api.bookings.sendBookingMessage);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    const text = message.trim();
    setMessage(""); // optimistic clear
    await sendMessage({
      bookingId: booking.id,
      userId: user.id,
      text
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <h2 className={styles.title}>Race Lobby</h2>
            <div className={styles.subtitle}>
              <MapPin size={12} /> {booking.venue?.name} &bull; <Calendar size={12} /> <span suppressHydrationWarning>{new Date(booking.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.rosterSection}>
          <h3 className={styles.rosterTitle}>Roster ({booking.sentInvites?.length || 0})</h3>
          <div className={styles.rosterScroll}>
            {/* Host */}
            <div className={styles.rosterCard}>
              <div className={styles.avatar}><User size={20} /></div>
              <div className={styles.rosterName}>You (Host)</div>
              <div className={`${styles.statusBadge} ${styles.statusAccepted}`}>HOST</div>
            </div>
            
            {/* Invites */}
            {booking.sentInvites?.map((inv: any) => (
              <div key={inv.id} className={styles.rosterCard}>
                <div className={styles.avatar}><User size={20} /></div>
                <div className={styles.rosterName}>{inv.inviteeName}</div>
                <div className={`${styles.statusBadge} ${inv.status === 'ACCEPTED' ? styles.statusAccepted : inv.status === 'DECLINED' ? styles.statusDeclined : styles.statusPending}`}>
                  {inv.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.chatSection}>
          <div className={styles.chatHistory}>
            {messages === undefined ? (
              <div className={styles.emptyChat}>Loading chat...</div>
            ) : messages.length === 0 ? (
              <div className={styles.emptyChat}>No messages yet. Say hi!</div>
            ) : (
              messages.map((msg: any) => {
                const isMe = msg.userId === user.id;
                return (
                  <div key={msg._id} className={`${styles.messageWrapper} ${isMe ? styles.messageMe : styles.messageThem}`}>
                    {!isMe && (
                      <div className={styles.messageAvatar}>
                        {msg.user?.imageUrl ? <img src={msg.user.imageUrl} alt="" /> : <User size={14} />}
                      </div>
                    )}
                    <div className={styles.messageContent}>
                      {!isMe && <div className={styles.messageSender}>{msg.user?.name}</div>}
                      <div className={styles.messageBubbleWrapper}>
                        <div className={styles.messageBubble}>{msg.text}</div>
                        <div className={styles.messageTime}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className={styles.chatInputForm} onSubmit={handleSend}>
            <input 
              type="text" 
              className={styles.chatInput} 
              placeholder="Message the lobby..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" className={styles.sendBtn} disabled={!message.trim()}>
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
