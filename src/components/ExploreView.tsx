"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MapPin, Navigation, Star, Filter } from "lucide-react";
import styles from "../app/explore/page.module.css";

export default function ExploreView({ venues }: { venues: any[] }) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    if (initialCategory && !activeFilters.includes(initialCategory)) {
      setActiveFilters((prev) => [...prev, initialCategory]);
    }
  }, [initialCategory]);

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const filteredVenues = useMemo(() => {
    if (activeFilters.length === 0) return venues;

    return venues.filter(venue => {
      // AND logic: Every selected filter must be satisfied by the venue
      return activeFilters.every(filter => {
        if (filter === "Indoor") {
          return venue.tracks?.some((t: any) => t.indoorOutdoor === "Indoor");
        }
        if (filter === "Outdoor") {
          return venue.tracks?.some((t: any) => t.indoorOutdoor === "Outdoor");
        }
        if (filter === "Top Rated") {
          return venue.rating >= 4.5;
        }
        if (filter === "Drift") {
          return venue.cars?.some((c: any) => c.type.toLowerCase().includes("drift"));
        }
        if (filter === "Off-Road") {
          return venue.cars?.some((c: any) => 
            c.type.toLowerCase().includes("buggy") || 
            c.type.toLowerCase().includes("monster") ||
            c.type.toLowerCase().includes("off-road")
          );
        }
        if (filter === "RC Racing") {
          return venue.cars?.length > 0;
        }
        return true;
      });
    });
  }, [venues, activeFilters]);

  const filterOptions = ["Top Rated", "Indoor", "Outdoor", "Drift", "Off-Road", "RC Racing"];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Explore Tracks</h1>

        <div className={styles.filters}>
          <div style={{ display: "flex", alignItems: "center", paddingRight: 8, color: "var(--text-secondary)" }}>
            <Filter size={16} />
          </div>
          {filterOptions.map(option => (
            <button 
              key={option}
              className={activeFilters.includes(option) ? styles.filterPillActive : styles.filterPill}
              onClick={() => toggleFilter(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.contentArea}>
        <div className={styles.listView}>
          {filteredVenues.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-secondary)" }}>
              No venues found matching your filters.
            </div>
          ) : (
            filteredVenues.map((venue) => (
              <div key={venue.id} className={styles.venueCard}>
                <Link href={`/venues/${venue.id}`} style={{ display: "block", cursor: "pointer" }}>
                  <img src={venue.imageUrl || undefined} alt={venue.name} className={styles.venueImg} />
                </Link>
                
                <div className={styles.venueInfo}>
                  <div className={styles.venueHeader}>
                    <h3 className={styles.venueName}>{venue.name}</h3>
                    <div className={styles.venueRating}>
                      <Star size={14} fill="currentColor" />
                      {venue.rating}
                    </div>
                  </div>
                  
                  <div className={styles.venueDetails}>
                    <span><Navigation size={14} /> 5.2 km</span>
                    <span><MapPin size={14} /> {venue.city}</span>
                    {venue.tracks?.length > 0 && (
                      <span>• {venue.tracks[0]?.indoorOutdoor}</span>
                    )}
                  </div>
                  
                  <div className={styles.venueFooter}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div className={styles.priceLabel}>Starting from</div>
                      <div className={styles.priceValue}>
                        ₹{venue.experiences?.length > 0 ? Math.min(...venue.experiences.map((e: any) => e.price)) : 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
