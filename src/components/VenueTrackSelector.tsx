"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import styles from "../app/venues/[id]/page.module.css";

interface Props {
  venueId: string;
  tracks: any[];
}

export default function VenueTrackSelector({ venueId, tracks }: Props) {
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(tracks.length > 0 ? tracks[0].id : null);

  return (
    <>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Available Tracks</h2>
        <div className={styles.horizontalList}>
          {tracks.map((track) => (
            <div 
              key={track.id} 
              className={styles.trackCard}
              style={{
                borderColor: selectedTrackId === track.id ? "var(--accent-primary)" : "rgba(255,255,255,0.05)",
                boxShadow: selectedTrackId === track.id ? "0 0 0 2px var(--accent-primary)" : "none",
                backgroundColor: selectedTrackId === track.id ? "rgba(255, 42, 42, 0.1)" : "",
                cursor: "pointer",
                position: "relative"
              }}
              onClick={() => setSelectedTrackId(track.id)}
            >
              {selectedTrackId === track.id && (
                <div style={{ position: "absolute", top: 12, right: 12, color: "var(--accent-primary)" }}>
                  <CheckCircle2 size={20} fill="currentColor" color="var(--bg-card)" />
                </div>
              )}
              <div className={styles.trackInfo}>
                <div className={styles.trackName}>{track.name}</div>
                <div className={styles.trackStats}>
                  <span className={styles.statBadge}>{track.surface}</span>
                  <span className={styles.statBadge}>{track.indoorOutdoor}</span>
                  <span className={styles.statBadge}>{track.difficulty}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.ctaContainer}>
        <Link 
          href={`/book/${venueId}${selectedTrackId ? `?trackId=${selectedTrackId}` : ''}`} 
          className="btn-primary" 
          style={{ width: "100%", padding: "16px", fontSize: "18px", display: "block", textAlign: "center" }}
        >
          Book Now
        </Link>
      </div>
    </>
  );
}
