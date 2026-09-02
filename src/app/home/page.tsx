"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Bell, User, Search, Star, Clock, Navigation, PlaySquare } from 'lucide-react';
import { useQuery } from "convex/react";
// @ts-ignore
import { api } from "../../../convex/_generated/api";
import NotificationBell from '../../components/NotificationBell';
import styles from './page.module.css';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in km
}

export default function Home() {
  const venues = useQuery(api.venues.getVenues);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to a central point in Bengaluru if permission denied/error
          setUserLocation({ lat: 12.9716, lng: 77.5946 });
        }
      );
    }
  }, []);

  const categories = [
    { name: 'All' },
    { name: 'RC Racing' },
    { name: 'Drift' },
    { name: 'Off-Road' },
    { name: 'Family' },
    { name: 'Birthday' },
  ];

  const filteredVenues = venues 
    ? venues.filter((v: any) => {
        const matchesCategory = selectedCategory === "All" || v.categories?.includes(selectedCategory);
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery || 
          v.name.toLowerCase().includes(searchLower) || 
          (v.city && v.city.toLowerCase().includes(searchLower)) || 
          (v.experiences && v.experiences.some((e: any) => e.name.toLowerCase().includes(searchLower)));
        
        return matchesCategory && matchesSearch;
      })
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
          <input 
            type="text" 
            placeholder="Search RC tracks, cars or experiences" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
          <h1 className={styles.heroTitle}>
            Your Track. Your Ride.
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
            <Link href={`/venues/${venue.id || venue._id}`} key={venue.id || venue._id} className={styles.venueCard}>
              <img src={venue.imageUrl || undefined} alt={venue.name} className={styles.venueImg} />
              <div className={styles.venueInfo}>
                <div className={styles.venueName}>{venue.name}</div>
                <div className={styles.venueDetails}>
                  <span>
                    <Star size={14} color="var(--warning)" /> 
                    {venue.rating > 0 ? venue.rating : "—"} {venue.reviewCount !== undefined && venue.rating > 0 ? `(${venue.reviewCount})` : ""}
                  </span>
                  <span><Navigation size={14} /> {userLocation && venue.lat && venue.lng ? calculateDistance(userLocation.lat, userLocation.lng, venue.lat, venue.lng).toFixed(1) + ' km' : '— km'}</span>
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
