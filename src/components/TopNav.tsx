"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, User } from 'lucide-react';
import NotificationBell from './NotificationBell';
import styles from './TopNav.module.css';

export default function TopNav() {
  const pathname = usePathname();
  const [address, setAddress] = useState("Bengaluru, KA");

  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await res.json();
            if (data && data.address) {
              const locality = data.address.neighbourhood || data.address.suburb || data.address.village || data.address.town || data.address.city_district || "";
              const city = data.address.city || data.address.state_district || data.address.state || "Bengaluru";
              if (locality) {
                setAddress(`${locality}, ${city}`);
              } else {
                setAddress(city);
              }
            }
          } catch (e) {
            console.warn("Failed to fetch address");
          }
        },
        (error) => {
          console.warn("Location permission denied or unavailable. Using default.");
        }
      );
    }
  }, []);

  // Do not show TopNav on the landing/login page
  if (pathname === '/') return null;

  return (
    <header className={styles.header}>
      <div className={styles.location}>
        <MapPin size={18} className="text-gradient" />
        <div className={styles.locationText}>{address}</div>
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
