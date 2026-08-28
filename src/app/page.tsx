import Link from 'next/link';
import { MapPin, Bell, User, Search, Star, Clock, Navigation } from 'lucide-react';
import { fetchQuery } from "convex/nextjs";
// @ts-ignore
import { api } from "../../convex/_generated/api";
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const venues = await fetchQuery(api.venues.getVenues);

  const categories = [
    { name: '🏎️ RC Racing' },
    { name: '🏁 Drift' },
    { name: '🚙 Off-Road' },
    { name: '👨‍👩‍👧 Family' },
    { name: '🎂 Birthday' },
  ];

  return (
    <main className={styles.home}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.location}>
          <MapPin size={18} className="text-gradient" />
          <div className={styles.locationText}>Bengaluru, KA</div>
        </div>
        <div className={styles.actions}>
          <Link href="/notifications" className={styles.iconBtn}>
            <Bell size={20} />
          </Link>
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
          <h1 className={`${styles.heroTitle} text-gradient`}>Ready to<br/>Race?</h1>
          <Link href="/explore" className="btn-primary" style={{ display: 'inline-flex', width: 'fit-content' }}>
            Find a Track
          </Link>
        </div>
      </div>

      {/* Categories */}
      <div className={styles.categories}>
        {categories.map((cat) => (
          <Link key={cat.name} href={`/explore?category=${encodeURIComponent(cat.name.replace(/[^a-zA-Z -]/g, '').trim())}`} className={styles.categoryBadge}>
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Nearby Tracks */}
      <div className={styles.sectionHeader}>
        <h2>Nearby Tracks</h2>
        <Link href="/explore" className={styles.seeAll}>See All</Link>
      </div>

      <div className={styles.horizontalList}>
        {venues.map((venue) => (
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
                  {venue.experiences.length > 0 
                    ? `From ₹${Math.min(...venue.experiences.map(e => e.price))}`
                    : 'View pricing'}
                </div>
                <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '12px', whiteSpace: 'nowrap', flexShrink: 0 }}>Book Now</button>
              </div>
            </div>
          </Link>
        ))}
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
