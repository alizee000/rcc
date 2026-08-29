import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star, MapPin, Share2, Clock, Users } from "lucide-react";
import { fetchQuery } from "convex/nextjs";
// @ts-ignore
import { api } from "../../../../convex/_generated/api";
// @ts-ignore
import { Id } from "../../../../convex/_generated/dataModel";
import styles from "./page.module.css";
import VenueActions from "@/components/VenueActions";
import VenueTrackSelector from "@/components/VenueTrackSelector";

export const dynamic = 'force-dynamic';

export default async function VenueDetail(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  
  let venue;
  try {
    venue = await fetchQuery(api.venues.getVenueById, { id: params.id as Id<"venues"> });
  } catch (e) {
    // If ID is invalid format
    return notFound();
  }

  if (!venue) {
    notFound();
  }

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <Link href="/home" className={styles.backBtn}>
          <ArrowLeft size={20} />
        </Link>
        <img src={venue.imageUrl || ""} alt={venue.name} className={styles.heroImg} />
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{venue.name}</h1>
            <div className={styles.rating}>
              <Star size={16} fill="currentColor" /> {venue.rating} (124 reviews)
            </div>
          </div>
        </div>

        <VenueActions venueName={venue.name} lat={venue.lat} lng={venue.lng} />

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>About</h2>
          <p className={styles.description}>{venue.description}</p>
        </div>

        <VenueTrackSelector venueId={venue.id} tracks={venue.tracks} />

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Available RC Cars</h2>
          <div className={styles.horizontalList}>
            {venue.cars.map((car) => (
              <div key={car.id} className={styles.carCard}>
                <img src={car.imageUrl || ""} alt={car.name} className={styles.carImg} />
                <div className={styles.carInfo}>
                  <div className={styles.carName}>{car.name}</div>
                  <div className={styles.carType}>{car.type}</div>
                  <div className={styles.carStats}>
                    <span className={styles.statBadge}>{car.speed} Speed</span>
                    <span className={styles.statBadge}>{car.difficulty}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Experiences</h2>
          <div>
            {venue.experiences.map((exp) => (
              <div key={exp.id} className={styles.experienceCard}>
                <div className={styles.expInfo}>
                  <h4>{exp.name}</h4>
                  <div className={styles.expDetails}>
                    <span><Clock size={14} /> {exp.durationMins} mins</span>
                    <span><Users size={14} /> Max {exp.maxPlayers} players</span>
                  </div>
                </div>
                <div className={styles.expPrice}>₹{exp.price}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
