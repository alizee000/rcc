"use client";

import Link from 'next/link';
import { MapPin, User } from 'lucide-react';
import NotificationBell from './NotificationBell';
import styles from './TopNav.module.css';

export default function TopNav() {
  return (
    <header className={styles.header}>
      <div className={styles.location}>
        <MapPin size={18} className="text-gradient" />
        <div className={styles.locationText}>Bengaluru, KA</div>
      </div>
      <div className={styles.actions}>
        <NotificationBell />
        <Link href="/profile" className={styles.iconBtn}>
          <User size={20} />
        </Link>
      </div>
    </header>
  );
}
