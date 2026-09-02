"use client";

import Link from "next/link";
import { Plus, MapPin, Calendar, Users, Trophy, Clock } from "lucide-react";
import { useQuery } from "convex/react";
// @ts-ignore
import { api } from "../../../convex/_generated/api";
import styles from "./page.module.css";

export default function MeetupsFeed() {
  const meetups = useQuery(api.meetups.getMeetups) || [];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Community Meetups</h1>
          <p className={styles.subtitle}>Join an open race or host your own!</p>
        </div>
      </header>

      <div>
        {meetups.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>
            <Users size={48} style={{ opacity: 0.5, marginBottom: 16 }} />
            <p>No upcoming meetups found.</p>
            <p style={{ fontSize: 14, marginTop: 8 }}>Be the first to host one!</p>
          </div>
        ) : (
          meetups.map((meetup) => {
            const joinedCount = meetup.participants.filter((p: any) => p.status === "JOINED").length;
            const isFull = joinedCount >= meetup.maxPlayers;
            
            return (
              <Link href={`/meetups/${meetup.id}`} key={meetup.id} className={styles.meetupCard}>
                <div className={styles.cardImageContainer}>
                  <img src={meetup.venue.imageUrl || undefined} alt={meetup.venue.name} className={styles.cardImg} />
                  <div className={styles.cardStatus}>{meetup.players.length}/{meetup.maxPlayers} Racers</div>
                  <div className={styles.cardTitle}>{meetup.title}</div>
                </div>
                
                <div className={styles.cardContent}>
                  <div style={{ display: "flex", gap: 16, marginBottom: 16, marginTop: 4 }}>
                    <div style={{ 
                      backgroundColor: "rgba(255, 42, 42, 0.1)",
                      border: "1px solid rgba(255, 42, 42, 0.2)",
                      borderRadius: "var(--radius-sm)",
                      padding: "8px 12px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 64
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-primary)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                        {new Date(meetup.date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.1 }}>
                        {new Date(meetup.date).getDate()}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                        {new Date(meetup.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
                      <div className={styles.infoRow} style={{ marginBottom: 0, fontWeight: 600, color: "var(--text-primary)", fontSize: 15 }}>
                        <Clock size={16} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                        {meetup.time}
                      </div>
                      <div className={styles.infoRow} style={{ marginBottom: 0 }}>
                        <MapPin size={16} style={{ flexShrink: 0 }} /> {meetup.venue.name}, {meetup.venue.city}
                      </div>
                      <div className={styles.infoRow} style={{ marginBottom: 0 }}>
                        <Trophy size={16} style={{ flexShrink: 0 }} /> {meetup.skillLevel}
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.footer}>
                    <div className={styles.hostInfo}>
                      <div className={styles.avatar}>
                        {meetup.host.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span>Hosted by <strong>{meetup.host.name}</strong></span>
                    </div>
                    
                    <div style={{ fontSize: 12, fontWeight: 600, color: isFull ? "var(--accent-primary)" : "var(--success)" }}>
                      {joinedCount} / {meetup.maxPlayers} Joined
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
