"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, Car, Map, QrCode, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import styles from "../app/admin/layout.module.css";

const navItems = [
  { name: "Overview", path: "/admin", icon: LayoutDashboard },
  { name: "Bookings", path: "/admin/bookings", icon: CalendarDays },
  { name: "QR Check-in", path: "/admin/checkin", icon: QrCode },
  { name: "Cars", path: "/admin/cars", icon: Car },
  { name: "Tracks & Slots", path: "/admin/tracks", icon: Map },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className="text-gradient">RC RUSH</span><br/>
        <span style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "uppercase" }}>Venue Partner</span>
      </div>
      
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
          
          return (
            <Link 
              key={item.name} 
              href={item.path} 
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "0 24px", marginTop: "auto" }}>
        <button 
          className={styles.navItem} 
          style={{ width: "100%", padding: "12px 0", color: "var(--error)" }}
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
