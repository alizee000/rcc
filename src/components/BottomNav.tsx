"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Calendar, Users, PlaySquare } from 'lucide-react';
import styles from './BottomNav.module.css';

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === '/') return null;

  const navItems = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Leaderboard', path: '/leaderboards', icon: Trophy },
    { name: 'Reels', path: '/reels', icon: PlaySquare },
    { name: 'Bookings', path: '/bookings', icon: Calendar },
    { name: 'Meetups', path: '/meetups', icon: Users },
  ];

  return (
    <nav className={styles.nav}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
        
        return (
          <Link 
            key={item.name} 
            href={item.path} 
            className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
          >
            <Icon size={24} />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
