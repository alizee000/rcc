import prisma from "@/lib/prisma";
import styles from "../layout.module.css";
import { Plus, Wrench as Tool, CheckCircle, Clock } from "lucide-react";
import AdminActionButton from "@/components/AdminActions";

export const dynamic = 'force-dynamic';

export default async function AdminCars() {
  const venueId = "venue-1"; // Mock active venue

  const cars = await prisma.car.findMany({
    where: { venueId },
    orderBy: { type: 'asc' }
  });

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Fleet Management</h1>
          <p className={styles.pageSubtitle}>Manage your RC cars and their maintenance status.</p>
        </div>
        
        <AdminActionButton className="btn-primary" style={{ display: "flex", gap: 8, alignItems: "center" }} actionMessage="Opening Add Car Modal...">
          <Plus size={18} />
          Add New Car
        </AdminActionButton>
      </div>

      <div>
        {cars.map((car) => (
          <div key={car.id} className={styles.listCard}>
            <div className={styles.listHeader}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <img 
                  src={car.imageUrl || "/images/car_drift.jpg"} 
                  alt={car.name}
                  style={{ width: 60, height: 40, objectFit: "cover", borderRadius: 4 }}
                />
                <span>{car.name}</span>
              </div>
              <div>
                {car.status === "AVAILABLE" && <span className={`${styles.badge} ${styles.badgeSuccess}`}><CheckCircle size={12} style={{display: 'inline', marginRight: 4, verticalAlign: 'text-bottom'}} />Available</span>}
                {car.status === "BOOKED" && <span className={`${styles.badge} ${styles.badgeWarning}`}><Clock size={12} style={{display: 'inline', marginRight: 4, verticalAlign: 'text-bottom'}} />Booked</span>}
                {car.status === "MAINTENANCE" && <span className={`${styles.badge} ${styles.badgeError}`}><Tool size={12} style={{display: 'inline', marginRight: 4, verticalAlign: 'text-bottom'}} />Maintenance</span>}
              </div>
            </div>
            
            <div className={styles.listContent}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Type: {car.type}</span>
                <span>Speed: {car.speed}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Difficulty: {car.difficulty}</span>
              </div>
            </div>
            
            <div className={styles.listFooter}>
              <AdminActionButton className="btn-secondary" style={{ padding: "6px 12px", fontSize: 12, width: "100%" }} actionMessage={`Edit ${car.name}`}>Edit Car</AdminActionButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
