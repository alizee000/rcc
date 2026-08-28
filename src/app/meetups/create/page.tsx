"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
// @ts-ignore
import { api } from "../../../../convex/_generated/api";
import styles from "./page.module.css";

export default function CreateMeetup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Use Convex queries
  const venues = useQuery(api.venues.getVenues) || [];
  const users = useQuery(api.users.getUsers) || [];
  const createMeetup = useMutation(api.meetups.createMeetup);
  
  const [searchQuery, setSearchQuery] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    venueId: "",
    date: "",
    timeStart: 12,
    timeEnd: 14 as number | null,
    maxPlayers: 5,
    skillLevel: "All Levels",
    invitedUserIds: [] as string[]
  });

  useEffect(() => {
    if (venues.length > 0 && !formData.venueId) {
      setFormData(prev => ({ ...prev, venueId: venues[0]._id }));
    }
  }, [venues, formData.venueId]);

  const handleNext = () => setStep(2);
  const handlePrev = () => setStep(1);

  const toggleInvite = (id: string) => {
    setFormData(prev => {
      const isInvited = prev.invitedUserIds.includes(id);
      return {
        ...prev,
        invitedUserIds: isInvited 
          ? prev.invitedUserIds.filter(userId => userId !== id)
          : [...prev.invitedUserIds, id]
      };
    });
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      let finalTime = "";
      if (formData.timeStart !== null) {
        const formatAMPM = (h: number) => {
          const ampm = h >= 12 ? 'PM' : 'AM';
          const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
          return `${h12}:00 ${ampm}`;
        };
        
        if (formData.timeEnd !== null) {
          finalTime = `${formatAMPM(formData.timeStart)} - ${formatAMPM(formData.timeEnd)}`;
        } else {
          finalTime = `${formatAMPM(formData.timeStart)}`;
        }
      }

      // Use the first user as the host for MVP
      const host = users[0];
      if (!host) {
        alert("No users found to host the meetup.");
        setLoading(false);
        return;
      }

      const res = await createMeetup({
        title: formData.title,
        description: formData.description,
        venueId: formData.venueId as any,
        date: formData.date,
        time: finalTime,
        maxPlayers: formData.maxPlayers,
        skillLevel: formData.skillLevel,
        hostId: host._id,
        invitedUserIds: formData.invitedUserIds as any[],
      });
      
      router.push(`/meetups/${res.id}`);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to create meetup");
    }
    setLoading(false);
  };

  const isStep1Valid = formData.title && formData.venueId && formData.date && formData.timeStart !== null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/meetups" className={styles.backBtn}>
          <ArrowLeft size={20} />
        </Link>
        <h1 className={styles.title}>Host a Meetup</h1>
      </header>

      {step === 1 && (
        <div style={{ animation: "fadeIn 0.3s" }}>
          <div className={styles.formGroup}>
            <label>Meetup Title</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="e.g., Saturday Drift Session" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Venue</label>
            <select 
              className={styles.input}
              value={formData.venueId}
              onChange={(e) => setFormData({...formData, venueId: e.target.value})}
            >
              <option value="" disabled>Select a venue</option>
              {venues.map(v => (
                <option key={v._id} value={v._id}>{v.name} ({v.city})</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Date</label>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
              {Array.from({ length: 7 }).map((_, i) => {
                const d = new Date();
                d.setHours(0,0,0,0);
                d.setDate(d.getDate() + i);
                
                const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                const isSelected = formData.date === dateStr;
                const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                const dateNum = d.getDate();
                
                return (
                  <div 
                    key={i}
                    onClick={() => setFormData({...formData, date: dateStr})}
                    style={{
                      minWidth: 70,
                      padding: "12px 8px",
                      borderRadius: 16,
                      backgroundColor: isSelected ? "var(--accent-primary)" : "var(--bg-card)",
                      color: isSelected ? "white" : "var(--text-secondary)",
                      border: "2px solid transparent",
                      borderColor: isSelected ? "var(--accent-primary)" : "var(--border)",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      flexShrink: 0
                    }}
                  >
                    <div style={{ fontSize: 12, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>
                      {i === 0 ? "Today" : dayName}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: isSelected ? "white" : "var(--text-primary)" }}>
                      {dateNum}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Time Range (Tap Start, then Tap End)</label>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
              {Array.from({ length: 24 }).map((_, i) => {
                const hour24 = i;
                const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
                const ampm = hour24 >= 12 ? 'PM' : 'AM';
                
                const isStart = formData.timeStart === i;
                const isEnd = formData.timeEnd === i;
                const inRange = formData.timeStart !== null && formData.timeEnd !== null && i > formData.timeStart && i < formData.timeEnd;
                const isSelected = isStart || isEnd || inRange;
                
                return (
                  <div 
                    key={i}
                    onClick={() => {
                      if (formData.timeStart === null || (formData.timeStart !== null && formData.timeEnd !== null)) {
                        setFormData({...formData, timeStart: i, timeEnd: null});
                      } else if (i > formData.timeStart) {
                        setFormData({...formData, timeEnd: i});
                      } else {
                        setFormData({...formData, timeStart: i, timeEnd: null});
                      }
                    }}
                    style={{
                      minWidth: 80,
                      padding: "12px 8px",
                      borderRadius: 16,
                      backgroundColor: isSelected ? "var(--accent-primary)" : "var(--bg-card)",
                      color: isSelected ? "white" : "var(--text-secondary)",
                      border: "2px solid transparent",
                      borderColor: isSelected ? "var(--accent-primary)" : "var(--border)",
                      opacity: inRange ? 0.8 : 1,
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      flexShrink: 0
                    }}
                  >
                    <div style={{ fontSize: 16, fontWeight: 700, color: isSelected ? "white" : "var(--text-primary)", marginBottom: 4 }}>
                      {`${hour12}:00`}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>
                      {ampm}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Max Players</label>
              <input 
                type="number" 
                className={styles.input} 
                value={formData.maxPlayers}
                min={2}
                max={20}
                onChange={(e) => setFormData({...formData, maxPlayers: Number(e.target.value)})}
              />
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Skill Level</label>
              <select 
                className={styles.input}
                value={formData.skillLevel}
                onChange={(e) => setFormData({...formData, skillLevel: e.target.value})}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Pro">Pro</option>
                <option value="All Levels">All Levels</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Description (Optional)</label>
            <textarea 
              className={styles.input} 
              placeholder="What are we doing? Any rules?" 
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ animation: "fadeIn 0.3s" }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Invite Racers</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 16 }}>
            Select users to send them an invitation to your meetup.
          </p>

          <input 
            type="text" 
            className={styles.input} 
            style={{ width: "100%", marginBottom: 16 }}
            placeholder="Search racers by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className={styles.userList}>
            {users
              .filter(user => user.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(user => {
                const isInvited = formData.invitedUserIds.includes(user._id);
                return (
                  <div key={user._id} className={styles.userCard}>
                    <div className={styles.userInfo}>
                      <div className={styles.userAvatar}>
                        {user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</div>
                      </div>
                    </div>
                    <button 
                      className={isInvited ? styles.invitedBtn : styles.inviteBtn}
                      onClick={() => toggleInvite(user._id)}
                    >
                      {isInvited ? (
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><CheckCircle2 size={14} /> Invited</span>
                      ) : "Invite"}
                    </button>
                  </div>
                );
            })}
            
            {users.length === 0 && (
              <div style={{ textAlign: "center", padding: 24, color: "var(--text-secondary)" }}>
                No other users found in the app.
              </div>
            )}
            
            {users.length > 0 && users.filter(user => user.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
              <div style={{ textAlign: "center", padding: 24, color: "var(--text-secondary)" }}>
                No racers found matching "{searchQuery}".
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.footer}>
        {step === 1 ? (
          <button 
            className="btn-primary" 
            style={{ width: "100%" }} 
            onClick={handleNext}
            disabled={!isStep1Valid}
          >
            Continue
          </button>
        ) : (
          <>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={handlePrev}>
              Back
            </button>
            <button 
              className="btn-primary" 
              style={{ flex: 2 }} 
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Meetup"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
