import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Gift, Award, Star, Zap } from "lucide-react";
import styles from "../page.module.css";

export default async function RewardsPage() {
  const session = await getServerSession(authOptions);

  return (
    <div style={{ padding: "24px 16px" }}>
      <header style={{ marginBottom: 32, textAlign: "center" }}>
        <h1 className={styles.heroTitle} style={{ fontSize: 28, marginBottom: 8 }}>Rewards</h1>
        <p style={{ color: "var(--text-secondary)" }}>Earn points for every race</p>
      </header>

      <div className={styles.card} style={{ textAlign: "center", padding: 32, marginBottom: 24, background: "linear-gradient(135deg, rgba(255,42,42,0.2) 0%, rgba(18,18,18,1) 100%)", border: "1px solid var(--accent-primary)" }}>
        <Award size={48} color="var(--warning)" style={{ margin: "0 auto 16px auto" }} />
        <div style={{ fontSize: 48, fontWeight: 800, fontFamily: "var(--font-outfit)", lineHeight: 1 }}>
          450
        </div>
        <div style={{ color: "var(--text-secondary)", marginTop: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
          Total Points
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
          <span style={{ color: "var(--text-secondary)" }}>Next Tier: Pro Racer</span>
          <span style={{ fontWeight: 700, color: "var(--accent-primary)" }}>50 pts to go</span>
        </div>
        <div style={{ width: "100%", height: 8, backgroundColor: "var(--bg-card)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ width: "90%", height: "100%", backgroundColor: "var(--accent-primary)" }}></div>
        </div>
      </div>

      <h2 className={styles.sectionTitle} style={{ fontSize: 18, marginTop: 32 }}>Available Rewards</h2>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className={styles.card} style={{ display: "flex", alignItems: "center", gap: 16, padding: 16 }}>
          <div style={{ background: "rgba(255, 196, 0, 0.1)", padding: 12, borderRadius: 12 }}>
            <Zap size={24} color="var(--warning)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Free Battery Upgrade</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Swap to a high-cap battery</div>
          </div>
          <button className="btn-primary" style={{ padding: "6px 12px", fontSize: 12 }}>200 pts</button>
        </div>

        <div className={styles.card} style={{ display: "flex", alignItems: "center", gap: 16, padding: 16 }}>
          <div style={{ background: "rgba(0, 230, 118, 0.1)", padding: 12, borderRadius: 12 }}>
            <Star size={24} color="var(--success)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>15 Min Free Session</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Add 15m to any booking</div>
          </div>
          <button className="btn-primary" style={{ padding: "6px 12px", fontSize: 12, opacity: 0.5 }} disabled>500 pts</button>
        </div>
      </div>
    </div>
  );
}
