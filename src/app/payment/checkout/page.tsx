"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Smartphone, ShieldCheck, Check } from "lucide-react";
import { useMutation } from "convex/react";
// @ts-ignore
import { api } from "../../../../convex/_generated/api";

import styles from "./page.module.css";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dataParam = searchParams.get("data");

  const [bookingData, setBookingData] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const createBooking = useMutation(api.bookings.createBooking);

  useEffect(() => {
    if (dataParam) {
      try {
        const decoded = JSON.parse(atob(decodeURIComponent(dataParam)));
        setBookingData(decoded);
      } catch (e) {
        console.error("Failed to parse booking data", e);
        router.push("/");
      }
    } else {
      router.push("/");
    }
  }, [dataParam, router]);

  if (!bookingData) {
    return <div className={styles.loading}>Loading secure payment...</div>;
  }

  const handlePay = async () => {
    setIsProcessing(true);
    
    // Simulate API delay for payment processing
    setTimeout(async () => {
      try {
        // Now we actually create the CONFIRMED booking since payment succeeded
        const result = await createBooking(bookingData);
        router.push(`/payment/${result.id}/success`);
      } catch (err) {
        console.error(err);
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
          <div className={styles.amountValue}>₹{bookingData.totalPrice}</div>
          <div className={styles.transactionId}>Txn ID: RC-{Math.random().toString(36).substring(2, 10).toUpperCase()}-PAY</div>
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

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
