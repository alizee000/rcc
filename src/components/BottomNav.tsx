"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Calendar, Users, User } from 'lucide-react';
import styles from './BottomNav.module.css';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Leaderboard', path: '/leaderboards', icon: Trophy },
    { name: 'Bookings', path: '/bookings', icon: Calendar },
    { name: 'Meetups', path: '/meetups', icon: Users },
    { name: 'Profile', path: '/profile', icon: User },
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
