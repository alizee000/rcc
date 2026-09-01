"use client";

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Bell, User, Search, Star, Clock, Navigation, PlaySquare } from 'lucide-react';
import { useQuery } from "convex/react";
// @ts-ignore
import { api } from "../../../convex/_generated/api";
import NotificationBell from '../../components/NotificationBell';
import styles from './page.module.css';

export default function Home() {
  const venues = useQuery(api.venues.getVenues);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    { name: 'All' },
    { name: 'RC Racing' },
    { name: 'Drift' },
    { name: 'Off-Road' },
    { name: 'Family' },
    { name: 'Birthday' },
  ];

  const filteredVenues = venues 
    ? (selectedCategory === "All" ? venues : venues.filter((v: any) => v.categories?.includes(selectedCategory))) 
    : [];

  return (
    <main className={styles.home}>
      {/* Header */}
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

      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <div className={styles.searchBar}>
          <Search size={18} color="var(--text-secondary)" />
          <input type="text" placeholder="Search RC tracks, cars or experiences" />
        </div>
      </div>

      {/* Hero Section */}
      <div className={styles.hero}>
        <img 
          src="/images/hero.jpg" 
          alt="RC Racing Hero" 
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle} style={{ fontSize: '2.5rem', lineHeight: '1.2' }}>
            <span className={styles.animatedText}>Your Track.</span>
            <span className={`${styles.animatedText} ${styles.delay1}`}>Your Ride.</span>
            <span className={`${styles.animatedText} ${styles.delay2}`}>Your Race.</span>
          </h1>
          <Link href="#nearby" className="btn-primary" style={{ display: 'inline-flex', width: 'fit-content' }}>
            Find a Track
          </Link>
        </div>
      </div>

      {/* Categories */}
      <div className={styles.categories}>
        {categories.map((cat) => (
          <button 
            key={cat.name} 
            onClick={() => setSelectedCategory(cat.name)}
            className={styles.categoryBadge}
            style={{
              backgroundColor: selectedCategory === cat.name ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Trending Reels Banner */}
      <div style={{ padding: "0 16px", marginTop: "24px" }}>
        <Link href="/reels" style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, #ff2a2a, #800000)",
          color: "white",
          textDecoration: "none",
          boxShadow: "0 4px 12px rgba(255, 42, 42, 0.3)"
        }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "4px" }}>Trending Reels 🔥</h2>
            <p style={{ fontSize: "14px", opacity: 0.9 }}>Watch the most epic RC racing moments</p>
          </div>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(4px)"
          }}>
            <PlaySquare size={24} color="white" />
          </div>
        </Link>
      </div>

      {/* Nearby Tracks */}
      <div id="nearby" className={styles.sectionHeader} style={{ scrollMarginTop: 100 }}>
        <h2>Nearby Tracks {selectedCategory !== "All" && `(${selectedCategory})`}</h2>
      </div>

      <div className={styles.horizontalList}>
        {venues === undefined ? (
          <div style={{ padding: 20, color: 'var(--text-secondary)' }}>Loading tracks...</div>
        ) : filteredVenues.length === 0 ? (
          <div style={{ padding: 20, color: 'var(--text-secondary)' }}>No tracks found for this category.</div>
        ) : (
          filteredVenues.map((venue: any) => (
            <Link href={`/venues/${venue.id}`} key={venue.id} className={styles.venueCard}>
              <img src={venue.imageUrl || ''} alt={venue.name} className={styles.venueImg} />
              <div className={styles.venueInfo}>
                <div className={styles.venueName}>{venue.name}</div>
                <div className={styles.venueDetails}>
                  <span><Star size={14} color="var(--warning)" /> {venue.rating}</span>
                  <span><Navigation size={14} /> 5.2 km</span>
                  <span><MapPin size={14} /> {venue.city}</span>
                </div>
                <div className={styles.venueFooter}>
                  <div className={styles.price}>
                    {venue.experiences && venue.experiences.length > 0 
                      ? `From ₹${Math.min(...venue.experiences.map((e: any) => e.price))}`
                      : 'View pricing'}
                  </div>
                  <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '12px', whiteSpace: 'nowrap', flexShrink: 0 }}>Book Now</button>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
      
      {/* Popular Experiences (Mock for now) */}
      <div className={styles.sectionHeader}>
        <h2>Popular Experiences</h2>
      </div>
      <div className={styles.horizontalList}>
         {venues?.[0]?.experiences?.map((exp: any) => (
            <div key={exp.id} className={styles.venueCard} style={{ minWidth: '220px' }}>
              <div className={styles.venueInfo}>
                <div className={styles.venueName}>{exp.name}</div>
                <div className={styles.venueDetails}>
                  <span><Clock size={14} /> {exp.durationMins} mins</span>
                </div>
                <div className={styles.price}>₹{exp.price}</div>
              </div>
            </div>
         ))}
      </div>
    </main>
  );
}
