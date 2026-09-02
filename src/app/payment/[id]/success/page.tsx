"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Check, QrCode } from "lucide-react";
import { useQuery } from "convex/react";
// @ts-ignore
import { api } from "../../../../../convex/_generated/api";
// @ts-ignore
import { Id } from "../../../../../convex/_generated/dataModel";

import styles from "./page.module.css";

export default function PaymentSuccessPage() {
  const params = useParams();
  const bookingId = params.id as Id<"bookings">;

  const booking = useQuery(api.bookings.getBookingById, { id: bookingId });

  if (booking === undefined) {
    return <div className={styles.container}><div className={styles.loading}>Loading...</div></div>;
  }

  if (booking === null) {
    return <div className={styles.container}><div className={styles.loading}>Booking not found.</div></div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.successScreen}>
        <div className={styles.checkWrapper}>
          <Check size={64} />
        </div>
        <h1 className={styles.title}>Secured the bag 🏁</h1>
        <p className={styles.subtitle}>
          See you on the track. Don't be late.
        </p>
        
        <div className={styles.qrPlaceholder}>
          <QrCode size={120} color="black" />
        </div>
        
        <div className={styles.bookingId}>
          Booking ID: {booking.qrCode}
        </div>
        
        <Link href="/bookings" className="btn-primary" style={{ width: "100%", textAlign: "center" }}>
          View My Bookings
        </Link>
      </div>
    </div>
  );
}
