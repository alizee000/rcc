"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, MessageCircle, Share2, Plus, Film } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
// @ts-ignore
import { api } from "../../../convex/_generated/api";
// @ts-ignore
import { Id } from "../../../convex/_generated/dataModel";
import styles from "./page.module.css";
import UploadReelModal from "@/components/UploadReelModal";
import CommentsModal from "@/components/CommentsModal";

export default function ReelsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [activeCommentsReel, setActiveCommentsReel] = useState<Id<"reels"> | null>(null);
  const reels = useQuery(api.reels.getReels);
  const toggleLike = useMutation(api.reels.toggleLike);

  useEffect(() => {
    if (!containerRef.current || !reels) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target.querySelector('video');
        if (!video) return;
        
        if (entry.isIntersecting) {
          video.play().catch(e => console.log("Autoplay prevented:", e));
        } else {
          video.pause();
        }
      });
    }, {
      threshold: 0.6
    });

    const wrappers = containerRef.current.querySelectorAll('.js-reel-wrapper');
    wrappers.forEach(wrapper => observer.observe(wrapper));

    return () => observer.disconnect();
  }, [reels]);

  const handleLike = async (reelId: Id<"reels">) => {
    await toggleLike({ reelId });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/home" className={styles.backBtn}>
          <ArrowLeft size={24} color="white" />
        </Link>
        <h1 className={styles.title}>RC Racing Reels</h1>
        <div style={{ width: 40 }}></div>
      </header>

      {reels === undefined ? (
        <div className={styles.emptyState}>
          <Film size={48} color="var(--text-secondary)" />
          <p>Loading reels...</p>
        </div>
      ) : reels.length === 0 ? (
        <div className={styles.emptyState}>
          <div style={{ height: 80 }}></div> {/* Space for the centered FAB */}
          <h2>No Reels Yet</h2>
          <p>Be the first to upload an epic RC racing moment!</p>
        </div>
      ) : (
        <div className={styles.reelsContainer} ref={containerRef}>
          {reels.map((reel) => (
            <div key={reel._id} className={`${styles.reelWrapper} js-reel-wrapper`}>
              <video
                src={reel.videoUrl}
                className={styles.iframe}
                loop
                muted // Muted required for autoplay on most mobile browsers
                playsInline
              />
              
              <div className={styles.overlay}>
                <div className={styles.overlayBottom}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: 'var(--bg-card)', overflow: 'hidden' }}>
                      <img src={reel.user?.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <span style={{ color: 'white', fontWeight: 600, fontSize: '14px', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                      {reel.user?.name || "Driver"}
                    </span>
                  </div>
                  <h3 className={styles.reelTitle}>{reel.title}</h3>
                  {reel.description && <p className={styles.reelSubtitle}>{reel.description}</p>}
                </div>
                
                <div className={styles.actions}>
                  <button className={styles.actionBtn} onClick={() => handleLike(reel._id)}>
                    <Heart size={28} color={reel.hasLiked ? "#ff2a2a" : "white"} fill={reel.hasLiked ? "#ff2a2a" : "transparent"} />
                    <span>{reel.likes || 0}</span>
                  </button>
                  <button className={styles.actionBtn} onClick={() => setActiveCommentsReel(reel._id)}>
                    <MessageCircle size={28} color="white" />
                    <span>{reel.comments || 0}</span>
                  </button>
                  <button className={styles.actionBtn} onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: reel.title,
                        url: window.location.href,
                      }).catch(() => {});
                    }
                  }}>
                    <Share2 size={28} color="white" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <button className={styles.fab} onClick={() => setShowUpload(true)}>
        <Plus size={32} />
      </button>

      {/* Upload Modal */}
      {showUpload && <UploadReelModal onClose={() => setShowUpload(false)} />}
      
      {/* Comments Modal */}
      {activeCommentsReel && (
        <CommentsModal 
          reelId={activeCommentsReel} 
          onClose={() => setActiveCommentsReel(null)} 
        />
      )}
    </div>
  );
}
