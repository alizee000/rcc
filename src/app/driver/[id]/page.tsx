import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Trophy, Flag, Clock, Users, ShieldAlert, Award } from "lucide-react";
import { fetchQuery } from "convex/nextjs";
// @ts-ignore
import { api } from "../../../../convex/_generated/api";
import styles from "./page.module.css";
import DriverActions from "@/components/DriverActions";
import ShareLapButton from "@/components/ShareLapButton";

function formatTime(ms: number) {
  const date = new Date(ms);
  const m = date.getUTCMinutes();
  const s = date.getUTCSeconds();
  const msPart = ms % 1000;
  return `${m}:${s.toString().padStart(2, '0')}.${msPart.toString().padStart(3, '0')}`;
}

export const dynamic = 'force-dynamic';

export default async function DriverProfile(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  
  const user = await fetchQuery(api.users.getDriverProfile, { id: params.id });

  if (!user) {
    notFound();
  }

  const lapTimes = user.lapTimes || [];

  let rank = "Rookie Rank";
  let rankColor = "var(--text-secondary)";
  let rankImage = "/images/rank_rookie.jpg";

  if (lapTimes.length > 0) {
    const bestTime = Math.min(...lapTimes.map((l: any) => l.timeMs));
    if (bestTime < 14700) {
      rank = "Pro Rank";
      rankColor = "var(--warning)";
      rankImage = "/images/rank_pro.jpg";
    } else if (bestTime < 15500) {
      rank = "Amateur Rank";
      rankColor = "var(--accent-primary)";
      rankImage = "/images/rank_amateur.jpg";
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/leaderboards" className={styles.backBtn}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ flex: 1, textAlign: "center" }}>
          <h1 className={styles.title}>Driver Profile</h1>
        </div>
        <div style={{ width: 40 }}></div>
      </header>

      <div className={styles.profileHero}>
        <div className={styles.avatar} style={{ padding: 0, overflow: 'hidden', backgroundColor: 'transparent' }}>
          <img src={rankImage} alt={`${rank} Car`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <h2 className={styles.name}>{user.name}</h2>
        <div className={styles.statsRow}>
          <div className={styles.statBadge} style={{ color: rankColor, borderColor: rankColor }}>
            <Trophy size={14} color={rankColor} /> {rank}
          </div>
          <div className={styles.statBadge}>
            <MapPin size={14} /> Bengaluru
          </div>
        </div>
        
        <DriverActions driverName={user.name || "Driver"} />
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Trophy Cabinet</h3>
        <div className={styles.badgeList}>
          <div className={styles.badgeItem}>
            <div className={styles.badgeIcon} style={{ background: "rgba(255, 215, 0, 0.1)" }}>
              <Trophy size={24} color="#FFD700" />
            </div>
            <span>Track King</span>
          </div>
          <div className={styles.badgeItem}>
            <div className={styles.badgeIcon} style={{ background: "rgba(255, 42, 42, 0.1)" }}>
              <Clock size={24} color="var(--accent-primary)" />
            </div>
            <span>Sub-20s</span>
          </div>
          <div className={styles.badgeItem}>
            <div className={styles.badgeIcon} style={{ background: "rgba(0, 230, 118, 0.1)" }}>
              <Award size={24} color="var(--success)" />
            </div>
            <span>10 Wins</span>
          </div>
          <div className={styles.badgeItem}>
            <div className={styles.badgeIcon} style={{ background: "rgba(160, 160, 176, 0.1)" }}>
              <ShieldAlert size={24} color="var(--text-secondary)" />
            </div>
            <span style={{ color: "var(--text-secondary)" }}>Locked</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Personal Records</h3>
        {lapTimes.length > 0 ? (
          <div className={styles.lapList}>
            {lapTimes.map((lap: any) => (
              <div key={lap.id} className={styles.lapCard}>
                <div className={styles.lapHeader}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{lap.track.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                      <MapPin size={10} style={{ display: "inline" }} /> {lap.track.venue.name}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className={styles.lapTime}>{formatTime(lap.timeMs)}</div>
                    <ShareLapButton lap={lap} driverName={user.name || "Driver"} />
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 8 }}>
                  Car: {lap.car?.name || "Custom"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: "24px 0" }}>
            No records found.
          </div>
        )}
      </div>
    </div>
  );
}
