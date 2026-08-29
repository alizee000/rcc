import Link from "next/link";
import { ArrowLeft, PlaySquare, Heart, MessageCircle, Share2 } from "lucide-react";
import styles from "./page.module.css";

export default function ReelsPage() {
  // Real RC car youtube shorts IDs
  const reelIds = [
    "S66F6H4b5p8",
    "HGMmGHDWzI8",
    "_95Fn3N-q2A",
    "soaCJqzQcuw",
    "nNKI6s__5DU"
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/home" className={styles.backBtn}>
          <ArrowLeft size={24} color="white" />
        </Link>
        <h1 className={styles.title}>RC Racing Reels</h1>
        <div style={{ width: 24 }}></div>
      </header>

      <div className={styles.reelsContainer}>
        {reelIds.map((id, index) => (
          <div key={index} className={styles.reelWrapper}>
            <iframe
              className={styles.iframe}
              src={`https://www.youtube.com/embed/${id}?autoplay=0&loop=1&controls=0&modestbranding=1&rel=0&playsinline=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
            
            {/* Overlay UI for Reels */}
            <div className={styles.overlay}>
              <div className={styles.overlayBottom}>
                <h3 className={styles.reelTitle}>Epic RC Drift Battle 🔥</h3>
                <p className={styles.reelSubtitle}>#rcdrift #rcracing #rccars</p>
              </div>
              
              <div className={styles.actions}>
                <button className={styles.actionBtn}>
                  <Heart size={28} color="white" />
                  <span>{12 + index}k</span>
                </button>
                <button className={styles.actionBtn}>
                  <MessageCircle size={28} color="white" />
                  <span>{142 + index * 10}</span>
                </button>
                <button className={styles.actionBtn}>
                  <Share2 size={28} color="white" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
