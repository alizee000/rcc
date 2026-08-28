"use client";

import { MapPin, Share2 } from "lucide-react";
import styles from "../app/venues/[id]/page.module.css";
import { useToast } from "./Toast";

interface Props {
  venueName: string;
  lat: number;
  lng: number;
}

export default function VenueActions({ venueName, lat, lng }: Props) {
  const { showToast } = useToast();

  const handleDirections = () => {
    // Open Google Maps
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Race with me at ${venueName}!`,
          text: `Check out ${venueName} on RC Rush!`,
          url: url,
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard!");
    }
  };

  return (
    <div className={styles.actions}>
      <button className={styles.actionBtn} onClick={handleDirections}>
        <MapPin size={16} /> Directions
      </button>
      <button className={styles.actionBtn} onClick={handleShare}>
        <Share2 size={16} /> Share
      </button>
    </div>
  );
}
