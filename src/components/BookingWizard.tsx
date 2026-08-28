"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Check, QrCode, CheckCircle2 } from "lucide-react";
import styles from "../app/book/[id]/page.module.css";

interface Props {
  venue: any;
  user: any;
}

export default function BookingWizard({ venue, user }: Props) {
  const searchParams = useSearchParams();
  const initialTrackId = searchParams.get("trackId");

  const [step, setStep] = useState(1);
  const [selectedTrack, setSelectedTrack] = useState<any>(
    initialTrackId ? venue.tracks?.find((t: any) => t.id === initialTrackId) || null : null
  );
  const [selectedExp, setSelectedExp] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(new Date().setHours(0,0,0,0)));
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [players, setPlayers] = useState([{ name: user?.name || "", age: "" }]);
  const [loading, setLoading] = useState(false);
  const [bookingComplete, setBookingComplete] = useState<any>(null);

  const steps = [1, 2, 3, 4, 5, 6];

  const handleNext = () => setStep((s) => Math.min(s + 1, 6));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleBook = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venueId: venue.id,
          experienceId: selectedExp.id,
          slotId: selectedSlot.id,
          date: selectedDate,
          carId: selectedCar.id,
          players,
          totalPrice: selectedExp.price
        })
      });
      
      if (!res.ok) throw new Error("Booking failed");
      const data = await res.json();
      
      // Simulate payment delay
      setTimeout(() => {
        setLoading(false);
        setBookingComplete(data);
      }, 1500);
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("Failed to create booking");
    }
  };

  if (bookingComplete) {
    return (
      <div className={styles.container}>
        <div className={styles.successScreen}>
          <div style={{ color: "var(--success)", marginBottom: 16 }}>
            <Check size={64} />
          </div>
          <h1 className={styles.title}>Booking Confirmed!</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>
            Your race session at {venue.name} is confirmed.
          </p>
          
          <div className={styles.qrPlaceholder}>
            <QrCode size={120} color="black" />
          </div>
          
          <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 32 }}>
            Booking ID: {bookingComplete.qrCode}
          </div>
          
          <Link href="/bookings" className="btn-primary" style={{ width: "100%" }}>
            View My Bookings
          </Link>
        </div>
      </div>
    );
  }

  const isNextDisabled = 
    (step === 1 && !selectedTrack) ||
    (step === 2 && !selectedExp) || 
    (step === 3 && !selectedSlot) || 
    (step === 4 && !selectedCar) ||
    (step === 5 && players.some(p => !p.name || !p.age));

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
            <h2 className={styles.sectionTitle}>2. Choose Experience</h2>
            <div className={styles.cardList}>
              {venue.experiences.map((exp: any) => (
                <div 
                  key={exp.id} 
                  className={`${styles.selectableCard} ${selectedExp?.id === exp.id ? styles.selectableCardSelected : ''}`}
                  style={{
                    position: "relative",
                    backgroundColor: selectedExp?.id === exp.id ? "rgba(255, 42, 42, 0.1)" : ""
                  }}
                  onClick={() => setSelectedExp(exp)}
                >
                  {selectedExp?.id === exp.id && (
                    <div style={{ position: "absolute", top: 12, right: 12, color: "var(--accent-primary)" }}>
                      <CheckCircle2 size={20} fill="currentColor" color="var(--bg-card)" />
                    </div>
                  )}
                  <div>
                    <div className={styles.cardTitle}>{exp.name}</div>
                    <div className={styles.cardDesc}>{exp.durationMins} mins • Max {exp.maxPlayers} players</div>
                  </div>
                  <div className={styles.cardPrice}>₹{exp.price}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className={styles.sectionTitle}>3. Choose Date & Time</h2>
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
                        setSelectedSlot(null);
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
            
            <div className={styles.slotsGrid}>
              {venue.slots.filter((s: any) => new Date(s.date).toDateString() === selectedDate.toDateString()).map((slot: any) => {
                const isFull = slot.bookedCount >= slot.capacity;
                const isSelected = selectedSlot?.id === slot.id;
                
                return (
                  <button
                    key={slot.id}
                    disabled={isFull}
                    className={`${styles.slotBtn} ${isSelected ? styles.slotBtnSelected : ''} ${isFull ? styles.slotBtnDisabled : ''}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot.startTime}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className={styles.sectionTitle}>4. Choose RC Car</h2>
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
                    <img src={car.imageUrl} alt={car.name} style={{ width: 60, height: 40, objectFit: "cover", borderRadius: 8 }} />
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

        {step === 5 && (
          <div>
            <h2 className={styles.sectionTitle}>5. Player Details</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {players.map((p, index) => (
                <div key={index} style={{ backgroundColor: "var(--bg-card)", padding: 16, borderRadius: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "var(--accent-primary)" }}>
                    Player {index + 1}
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Player Name</label>
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
                  <div className={styles.inputGroup}>
                    <label>Player Age</label>
                    <input 
                      type="number" 
                      value={p.age} 
                      onChange={(e) => {
                        const newPlayers = [...players];
                        newPlayers[index].age = e.target.value;
                        setPlayers(newPlayers);
                      }}
                      placeholder="Enter age"
                    />
                  </div>
                </div>
              ))}
              
              {selectedExp && players.length < selectedExp.maxPlayers && (
                <button 
                  className="btn-secondary" 
                  style={{ alignSelf: "flex-start", fontSize: 14, padding: "8px 16px" }}
                  onClick={() => setPlayers([...players, { name: "", age: "" }])}
                >
                  + Add Player (Max {selectedExp.maxPlayers})
                </button>
              )}
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 16 }}>
              The selected car ({selectedCar?.name}) will be assigned to Player 1.
            </p>
          </div>
        )}

        {step === 6 && (
          <div>
            <h2 className={styles.sectionTitle}>6. Booking Summary</h2>
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
                <span style={{ fontWeight: 600 }}>{selectedSlot?.startTime} - {selectedSlot?.endTime}</span>
              </div>
              <div className={styles.summaryRow}>
                <span style={{ color: "var(--text-secondary)" }}>Players</span>
                <span style={{ fontWeight: 600 }}>{players.length} ({players.map(p => p.name).join(', ')})</span>
              </div>
              
              <div className={styles.summaryTotal}>
                <span>Total Amount</span>
                <span>₹{selectedExp?.price}</span>
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
        
        {step < 6 ? (
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
