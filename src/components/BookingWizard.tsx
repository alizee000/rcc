"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Check, QrCode, CheckCircle2 } from "lucide-react";
import { useMutation } from "convex/react";
// @ts-ignore
import { api } from "../../convex/_generated/api";
import styles from "../app/book/[id]/page.module.css";

interface Props {
  venue: any;
  user: any;
}

export default function BookingWizard({ venue, user }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTrackId = searchParams.get("trackId");

  const [step, setStep] = useState(1);
  const [selectedTrack, setSelectedTrack] = useState<any>(
    initialTrackId ? venue.tracks?.find((t: any) => t.id === initialTrackId) || null : null
  );
  const [selectedExp, setSelectedExp] = useState<any>(venue.experiences?.[0] || null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(new Date().setHours(0,0,0,0)));
  const [startTimeHour, setStartTimeHour] = useState<number>(10);
  const [endTimeHour, setEndTimeHour] = useState<number>(11);
  const [makeMeetup, setMakeMeetup] = useState(false);
  const [selectedCar, setSelectedCar] = useState<any>(null);

  const durationHours = endTimeHour - startTimeHour;
  const [players, setPlayers] = useState([{ name: user?.name || "" }]);

  const [loading, setLoading] = useState(false);

  const steps = [1, 2, 3, 4, 5];

  const handleNext = () => setStep((s) => Math.min(s + 1, 5));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const formattedStartTime = `${startTimeHour.toString().padStart(2, '0')}:00`;
  const formattedEndTime = `${endTimeHour.toString().padStart(2, '0')}:00`;

  const getCalculatedEndTime = () => formattedEndTime;

  const handleBook = () => {
    setLoading(true);
    try {
      const bookingData = {
        userId: user.id,
        venueId: venue.id,
        experienceId: selectedExp.id,
        slotId: "mock-slider",
        date: selectedDate.toISOString(),
        time: `${formattedStartTime} - ${getCalculatedEndTime()}`,
        totalPrice: selectedExp.price * durationHours,
        players: players.map(p => ({
          name: p.name,
          age: 18
        })),
        makeMeetup,
      };
      
      const encodedData = encodeURIComponent(btoa(JSON.stringify(bookingData)));
      router.push(`/payment/checkout?data=${encodedData}`);
    } catch (error) {
      console.error(error);
      setLoading(false);
      toast.error("Failed to proceed to payment");
    }
  };

  const isNextDisabled = 
    (step === 1 && !selectedTrack) ||
    (step === 3 && !selectedCar) ||
    (step === 4 && players.some(p => !p.name));

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href={`/venues/${venue.id}`} className={styles.backBtn}>
          <ArrowLeft size={20} />
        </Link>
        <h1 className={styles.title}>Book Experience</h1>
      </header>

      <div className={styles.stepper}>
        {steps.map(s => (
          <div 
            key={s} 
            className={`${styles.step} ${step === s ? styles.stepActive : ''} ${step > s ? styles.stepCompleted : ''}`}
          >
            {step > s ? <Check size={16} /> : s}
          </div>
        ))}
      </div>

      <div className={styles.stepContent}>
        {step === 1 && (
          <div>
            <h2 className={styles.sectionTitle}>1. Choose Track</h2>
            <div className={styles.cardList}>
              {venue.tracks?.map((track: any) => (
                <div 
                  key={track.id} 
                  className={`${styles.selectableCard} ${selectedTrack?.id === track.id ? styles.selectableCardSelected : ''}`}
                  style={{
                    position: "relative",
                    backgroundColor: selectedTrack?.id === track.id ? "rgba(255, 42, 42, 0.1)" : ""
                  }}
                  onClick={() => setSelectedTrack(track)}
                >
                  {selectedTrack?.id === track.id && (
                    <div style={{ position: "absolute", top: 12, right: 12, color: "var(--accent-primary)" }}>
                      <CheckCircle2 size={20} fill="currentColor" color="var(--bg-card)" />
                    </div>
                  )}
                  <div>
                    <div className={styles.cardTitle}>{track.name}</div>
                    <div className={styles.cardDesc}>{track.surface} • {track.indoorOutdoor}</div>
                  </div>
                  <div className={styles.cardPrice} style={{fontSize: 14}}>{track.difficulty}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className={styles.sectionTitle}>2. Choose Date & Time</h2>
            <div className={styles.dateSelector}>
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 16, scrollbarWidth: "none" }}>
                {Array.from({ length: 7 }).map((_, i) => {
                  const d = new Date();
                  d.setHours(0,0,0,0);
                  d.setDate(d.getDate() + i);
                  
                  const isSelected = selectedDate.getTime() === d.getTime();
                  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                  const dateNum = d.getDate();
                  
                  return (
                    <div 
                      key={i}
                      onClick={() => {
                        setSelectedDate(d);
                      }}
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
                        transition: "all 0.2s"
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
            
            <div style={{ marginTop: 32, padding: "24px", backgroundColor: "var(--bg-card)", borderRadius: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Select Time</h3>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--accent-primary)", backgroundColor: "rgba(255, 42, 42, 0.1)", padding: "4px 12px", borderRadius: "20px" }}>
                  Duration: {durationHours} Hour{durationHours > 1 ? 's' : ''}
                </span>
              </div>
              
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>{formattedStartTime}</span>
                  <span style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>{formattedEndTime}</span>
                </div>
                
                <div className={styles.sliderWrapper}>
                  <div className={styles.sliderTrack}></div>
                  <div 
                    className={styles.sliderRange} 
                    style={{ 
                      left: `${((startTimeHour - 10) / 13) * 100}%`, 
                      width: `${((endTimeHour - startTimeHour) / 13) * 100}%` 
                    }}
                  ></div>
                  <input 
                    type="range" 
                    min="10" 
                    max="23" 
                    step="1" 
                    value={startTimeHour}
                    onChange={(e) => {
                      let val = parseInt(e.target.value);
                      if (val > endTimeHour - 1) val = endTimeHour - 1;
                      if (endTimeHour - val > 3) setEndTimeHour(val + 3);
                      setStartTimeHour(val);
                    }}
                    className={styles.sliderInput}
                  />
                  <input 
                    type="range" 
                    min="10" 
                    max="23" 
                    step="1" 
                    value={endTimeHour}
                    onChange={(e) => {
                      let val = parseInt(e.target.value);
                      if (val < startTimeHour + 1) val = startTimeHour + 1;
                      if (val - startTimeHour > 3) setStartTimeHour(val - 3);
                      setEndTimeHour(val);
                    }}
                    className={styles.sliderInput}
                  />
                </div>
                
                <div style={{ position: "relative", height: "30px", marginTop: 12, fontSize: 11, color: "var(--text-secondary)" }}>
                  {Array.from({length: 14}, (_, i) => i + 10).map((h, i) => (
                    <span key={h} style={{ 
                      position: "absolute", 
                      left: `${(i / 13) * 100}%`, 
                      transform: "translateX(-50%)", 
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      lineHeight: "1.2"
                    }}>
                      <span style={{ fontWeight: 600 }}>{h > 12 ? h - 12 : h}</span>
                      <span style={{ fontSize: 9, opacity: 0.7 }}>{h >= 12 ? 'PM' : 'AM'}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className={styles.sectionTitle}>3. Choose RC Car</h2>
            <div className={styles.cardList}>
              {venue.cars?.map((car: any) => (
                <div 
                  key={car.id} 
                  className={`${styles.selectableCard} ${selectedCar?.id === car.id ? styles.selectableCardSelected : ''}`}
                  style={{
                    position: "relative",
                    backgroundColor: selectedCar?.id === car.id ? "rgba(255, 42, 42, 0.1)" : ""
                  }}
                  onClick={() => setSelectedCar(car)}
                >
                  {selectedCar?.id === car.id && (
                    <div style={{ position: "absolute", top: 12, right: 12, color: "var(--accent-primary)" }}>
                      <CheckCircle2 size={20} fill="currentColor" color="var(--bg-card)" />
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <img src={car.imageUrl || undefined} alt={car.name} style={{ width: 60, height: 40, objectFit: "cover", borderRadius: 8 }} />
                    <div>
                      <div className={styles.cardTitle}>{car.name}</div>
                      <div className={styles.cardDesc}>{car.type} • {car.speed} Speed</div>
                    </div>
                  </div>
                  <div className={styles.cardPrice} style={{fontSize: 14}}>{car.difficulty}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className={styles.sectionTitle}>4. Player Details</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {players.map((p, index) => (
                <div key={index} style={{ backgroundColor: "var(--bg-card)", padding: 16, borderRadius: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "var(--accent-primary)" }}>
                    Player 1 (Host)
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Your Name</label>
                    <input 
                      type="text" 
                      value={p.name} 
                      onChange={(e) => {
                        const newPlayers = [...players];
                        newPlayers[index].name = e.target.value;
                        setPlayers(newPlayers);
                      }}
                      placeholder="Enter name"
                    />
                  </div>
                </div>
              ))}
              
              <div style={{ padding: 16, borderRadius: 16, border: "1px dashed var(--border)", textAlign: "center" }}>
                <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                  Invite players directly from your Bookings dashboard after confirmation!
                </p>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 16 }}>
              The selected car ({selectedCar?.name}) will be assigned to Player 1.
            </p>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className={styles.sectionTitle}>5. Booking Summary</h2>
            <div style={{ backgroundColor: "var(--bg-card)", padding: 24, borderRadius: 16 }}>
              <div className={styles.summaryRow}>
                <span style={{ color: "var(--text-secondary)" }}>Venue</span>
                <span style={{ fontWeight: 600 }}>{venue.name}</span>
              </div>
              <div className={styles.summaryRow}>
                <span style={{ color: "var(--text-secondary)" }}>Track</span>
                <span style={{ fontWeight: 600 }}>{selectedTrack?.name}</span>
              </div>
              <div className={styles.summaryRow}>
                <span style={{ color: "var(--text-secondary)" }}>Car</span>
                <span style={{ fontWeight: 600 }}>{selectedCar?.name}</span>
              </div>
              <div className={styles.summaryRow}>
                <span style={{ color: "var(--text-secondary)" }}>Experience</span>
                <span style={{ fontWeight: 600 }}>{selectedExp?.name}</span>
              </div>
              <div className={styles.summaryRow}>
                <span style={{ color: "var(--text-secondary)" }}>Date</span>
                <span style={{ fontWeight: 600 }}>{selectedDate.toLocaleDateString()}</span>
              </div>
              <div className={styles.summaryRow}>
                <span style={{ color: "var(--text-secondary)" }}>Time</span>
                <span style={{ fontWeight: 600 }}>{formattedStartTime} - {getCalculatedEndTime()} ({durationHours} hr{durationHours > 1 ? 's' : ''})</span>
              </div>
              <div className={styles.summaryRow}>
                <span style={{ color: "var(--text-secondary)" }}>Players</span>
                <span style={{ fontWeight: 600 }}>{players.length} ({players.map(p => p.name).join(', ')})</span>
              </div>
              
              <div className={styles.summaryTotal}>
                <span>Total Amount</span>
                <span>₹{selectedExp?.price * durationHours}</span>
              </div>
              

            </div>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        {step > 1 && (
          <button className="btn-secondary" style={{ flex: 1 }} onClick={handlePrev}>
            Back
          </button>
        )}
        
        {step < 5 ? (
          <button 
            className="btn-primary" 
            style={{ flex: 2 }} 
            onClick={handleNext}
            disabled={isNextDisabled}
          >
            Continue
          </button>
        ) : (
          <button 
            className="btn-primary" 
            style={{ flex: 2 }} 
            onClick={handleBook}
            disabled={loading}
          >
            {loading ? "Processing..." : "Confirm & Pay"}
          </button>
        )}
      </div>
    </div>
  );
}
