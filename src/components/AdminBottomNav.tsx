"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, QrCode, Car, Map } from "lucide-react";
import styles from "../components/BottomNav.module.css"; // Reuse the consumer bottom nav styles

const navItems = [
  { name: "Home", path: "/admin", icon: LayoutDashboard },
  { name: "Bookings", path: "/admin/bookings", icon: CalendarDays },
  { name: "Scan", path: "/admin/checkin", icon: QrCode },
  { name: "Cars", path: "/admin/cars", icon: Car },
  { name: "Tracks", path: "/admin/tracks", icon: Map },
];

export default function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
        
        return (
          <Link 
            key={item.name} 
            href={item.path} 
            className={`${styles.navItem} ${isActive ? styles.navActive : ""}`}
          >
            <Icon size={24} className={styles.icon} />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
