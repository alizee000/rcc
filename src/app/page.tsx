import { SignIn, SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import styles from "./page.module.css";
import Image from "next/image";

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { userId } = await auth();
  if (userId) {
    redirect("/home");
  }

  const params = await searchParams;
  const isSignUp = params.sign_up === "true";

  return (
    <main className={styles.container}>
      <div className={styles.heroBanner}>
        <div className={styles.overlay} />
      </div>
      
      <div className={styles.content}>
        <div className={styles.branding}>
          <h1 className="text-gradient" style={{ fontSize: "3.5rem", marginBottom: "0.5rem", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>RC RUSH</h1>
          <p style={{ fontSize: "1.2rem", color: "white", maxWidth: "500px", margin: "0 auto", textShadow: "0 2px 10px rgba(0,0,0,0.5)", fontWeight: 500 }}>
            Book. Race. Compete. Repeat.
          </p>
        </div>

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
