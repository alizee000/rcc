"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { redirect, useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import Image from "next/image";
import { motion } from "framer-motion";

export default function LandingPage() {
  const { userId } = useAuth();
  if (userId) {
    redirect("/home");
  }

  const searchParams = useSearchParams();
  const isSignUp = searchParams.get("sign_up") === "true";

  return (
    <main className={styles.container}>
      <div className={styles.heroBanner} />
      <div className={styles.overlay} />
      
      <div className={styles.content}>
        <motion.div 
          className={styles.branding}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 
            className={styles.glitchTitle}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            RC RUSH
          </motion.h1>
          <motion.p 
            style={{ fontSize: "1.2rem", color: "var(--text-secondary)", maxWidth: "500px", margin: "0 auto", textShadow: "0 2px 10px rgba(0,0,0,0.8)", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Zero excuses. Just pure speed.
          </motion.p>
        </motion.div>

        <div className={styles.authBox}>
          {isSignUp ? (
            <SignUp routing="hash" signInUrl="/" fallbackRedirectUrl="/home" />
          ) : (
            <SignIn routing="hash" signUpUrl="/?sign_up=true" fallbackRedirectUrl="/home" />
          )}
        </div>
      </div>
    </main>
  );
}
