import prisma from "@/lib/prisma";
import styles from "../layout.module.css";
import { Plus } from "lucide-react";
import AdminActionButton from "@/components/AdminActions";

export const dynamic = 'force-dynamic';

export default async function AdminTracks() {
  const venueId = "venue-1"; // Mock active venue

  const tracks = await prisma.track.findMany({
    where: { venueId }
  });

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Tracks & Facilities</h1>
          <p className={styles.pageSubtitle}>Manage your physical tracks and their capacities.</p>
        </div>
        
        <AdminActionButton className="btn-primary" style={{ display: "flex", gap: 8, alignItems: "center" }} actionMessage="Opening Add Track Modal...">
          <Plus size={18} />
          Add Track
        </AdminActionButton>
      </div>

      <div>
        {tracks.map((track) => (
          <div key={track.id} className={styles.listCard}>
            <div className={styles.listHeader}>
              <span>{track.name}</span>
              <span className={`${styles.badge} ${styles.badgeSuccess}`}>Active</span>
            </div>
            
            <div className={styles.listContent}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Surface: {track.surfaceType}</span>
                <span>Capacity: {track.capacity} Racers Max</span>
              </div>
            </div>
            
            <div className={styles.listFooter}>
              <AdminActionButton className="btn-secondary" style={{ padding: "6px 12px", fontSize: 12, width: "100%" }} actionMessage={`Edit ${track.name}`}>Edit Track</AdminActionButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
