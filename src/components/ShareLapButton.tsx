"use client";

import { useState, useRef } from "react";
import { Share2, MapPin, Loader2, Check } from "lucide-react";
import * as htmlToImage from "html-to-image";
import { toast } from "sonner";
import styles from "./ShareLapButton.module.css";

function formatTime(ms: number) {
  const date = new Date(ms);
  const m = date.getUTCMinutes();
  const s = date.getUTCSeconds();
  const msPart = ms % 1000;
  return `${m}:${s.toString().padStart(2, '0')}.${msPart.toString().padStart(3, '0')}`;
}

export default function ShareLapButton({ lap, driverName }: { lap: any, driverName: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shared, setShared] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!cardRef.current || isSharing) return;

    try {
      setIsSharing(true);
      
      // Wait for a small delay to ensure fonts are loaded if necessary
      await new Promise(resolve => setTimeout(resolve, 100));

      const dataUrl = await htmlToImage.toPng(cardRef.current, { 
        quality: 1.0,
        pixelRatio: 2 // High-res image
      });

      // Convert dataUrl to a File object
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `rcrush-${driverName}-lap.png`, { type: 'image/png' });

      // If browser supports native Web Share API with files
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `RC RUSH - ${driverName}'s Record`,
          text: `Check out my lap time at ${lap.track?.venue?.name}! Beat my time on RC RUSH.`,
        });
      } else {
        // Fallback: Download the image
        const link = document.createElement('a');
        link.download = `rcrush-${driverName}-lap.png`;
        link.href = dataUrl;
        link.click();
      }

      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message.includes('Share canceled')) {
        // User intentionally canceled the native share sheet, ignore gracefully
        console.log('Share canceled by user');
      } else {
        console.error("Error generating or sharing image:", error);
        toast.error("Failed to share image. Please try again.");
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className={styles.shareWrapper}>
      <button 
        onClick={handleShare} 
        className={styles.shareBtn}
        title="Share Brag Card"
        disabled={isSharing}
      >
        {isSharing ? <Loader2 size={16} className="animate-spin" /> : shared ? <Check size={16} color="var(--success)" /> : <Share2 size={16} />}
      </button>

      {/* Hidden DOM element for html-to-image to capture */}
      <div className={styles.bragCardOffscreen}>
        <div ref={cardRef} className={styles.bragCard}>
          <div className={styles.brandHeader}>
            <div className={styles.logo}>RC RUSH</div>
            <div className={styles.driverTag}>{driverName}</div>
          </div>
          
          <div className={styles.mainStats}>
            <div>
              <div className={styles.trackName}>{lap.track?.name || 'Unknown Track'}</div>
              <div className={styles.venueName} style={{ justifyContent: 'center', marginTop: '8px' }}>
                <MapPin size={16} color="var(--accent-primary)" /> {lap.track?.venue?.name || 'Unknown Venue'}
              </div>
            </div>
            
            <div className={styles.timeContainer}>
              <div className={styles.timeLabel}>Personal Record</div>
              <div className={styles.timeValue}>{formatTime(lap.timeMs)}</div>
            </div>
          </div>
          
          <div className={styles.footer}>
            <div className={styles.ctaText}>
              Can you beat this? <span className={styles.ctaHighlight}>Join RC RUSH</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
