import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import AdminBottomNav from "@/components/AdminBottomNav";
import styles from "./layout.module.css";
import { SignOutButton } from "@/components/SignOutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="container">
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className="text-gradient">RC RUSH</span> Admin
        </div>
        <div className={styles.profile}>
          <SignOutButton className={styles.logoutBtn} showText={false} style={{ display: "flex" }} />
          <div className={styles.avatar}>
            {user.firstName?.charAt(0) || user.emailAddresses?.[0]?.emailAddress?.charAt(0)?.toUpperCase() || "U"}
          </div>
        </div>
      </header>
      <main className={styles.main}>
        {children}
      </main>
      <AdminBottomNav />
    </div>
  );
}
