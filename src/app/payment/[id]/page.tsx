"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Smartphone, ShieldCheck, Check } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
// @ts-ignore
import { api } from "../../../../convex/_generated/api";
// @ts-ignore
import { Id } from "../../../../convex/_generated/dataModel";

import styles from "./page.module.css";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as Id<"bookings">;

  const booking = useQuery(api.bookings.getBookingById, { id: bookingId });
  const confirmPayment = useMutation(api.bookings.confirmPayment);

  const [paymentMethod, setPaymentMethod] = useState("upi"); // upi, card, netbanking
  const [upiId, setUpiId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (booking === undefined) {
    return <div className={styles.loading}>Loading payment securely...</div>;
  }

  if (booking === null || booking.status === "CONFIRMED") {
    // If already confirmed or doesn't exist, redirect safely
    router.push(booking?.status === "CONFIRMED" ? `/payment/${bookingId}/success` : "/bookings");
    return <div className={styles.loading}>Redirecting...</div>;
  }

  const handlePay = async () => {
    setIsProcessing(true);
    
    // Simulate API delay for payment processing
    setTimeout(async () => {
      try {
        await confirmPayment({ bookingId });
        router.push(`/payment/${bookingId}/success`);
      } catch (err) {
        alert("Payment failed. Please try again.");
        setIsProcessing(false);
      }
    }, 2500);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          <ArrowLeft size={20} />
        </button>
        <h1 className={styles.title}>Complete Payment</h1>
      </header>

      <div className={styles.content}>
        <div className={styles.amountCard}>
          <div className={styles.amountLabel}>Total Payable Amount</div>
          <div className={styles.amountValue}>₹{booking.totalPrice}</div>
          <div className={styles.transactionId}>Txn ID: {booking.qrCode}-PAY</div>
        </div>

        <h2 className={styles.sectionTitle}>Select Payment Method</h2>
        
        <div className={styles.paymentMethods}>
          <div 
            className={`${styles.methodCard} ${paymentMethod === 'upi' ? styles.methodActive : ''}`}
            onClick={() => setPaymentMethod('upi')}
          >
            <div className={styles.methodIcon}><Smartphone size={24} color={paymentMethod === 'upi' ? "var(--accent-primary)" : "var(--text-secondary)"} /></div>
            <div className={styles.methodDetails}>
              <div className={styles.methodTitle}>UPI</div>
              <div className={styles.methodDesc}>GPay, PhonePe, Paytm</div>
            </div>
            {paymentMethod === 'upi' && <div className={styles.checkIcon}><Check size={18} /></div>}
          </div>
        </div>

        {paymentMethod === 'upi' && (
          <div className={styles.upiSection}>
            <div className={styles.upiApps}>
              <div className={styles.upiApp} onClick={handlePay}>
                <div className={styles.upiAppIcon} style={{ background: "#ea4335" }}>G</div>
                <div className={styles.upiAppName}>GPay</div>
              </div>
              <div className={styles.upiApp} onClick={handlePay}>
                <div className={styles.upiAppIcon} style={{ background: "#5f259f" }}>P</div>
                <div className={styles.upiAppName}>PhonePe</div>
              </div>
              <div className={styles.upiApp} onClick={handlePay}>
                <div className={styles.upiAppIcon} style={{ background: "#00baf2" }}>Paytm</div>
                <div className={styles.upiAppName}>Paytm</div>
              </div>
            </div>

            <div className={styles.divider}>
              <span>OR ENTER UPI ID</span>
            </div>

            <div className={styles.upiInputGroup}>
              <input 
                type="text" 
                placeholder="example@upi" 
                className={styles.upiInput}
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
              <button 
                className={styles.verifyBtn} 
                disabled={!upiId.includes("@")}
                onClick={handlePay}
              >
                Verify & Pay
              </button>
            </div>
          </div>
        )}

        <div className={styles.secureBadge}>
          <ShieldCheck size={18} color="var(--success)" />
          <span>100% Secure Payments</span>
        </div>
      </div>

      {isProcessing && (
        <div className={styles.processingOverlay}>
          <div className={styles.spinner}></div>
          <div className={styles.processingText}>Processing Payment...</div>
          <div className={styles.processingSub}>Please do not close this window</div>
        </div>
      )}
    </div>
  );
}
