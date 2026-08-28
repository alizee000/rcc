import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminBottomNav from "@/components/AdminBottomNav";
import styles from "./layout.module.css";
import { LogOut } from "lucide-react";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container">
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className="text-gradient">RC RUSH</span> Admin
        </div>
        <div className={styles.profile}>
          <Link href="/api/auth/signout" className={styles.logoutBtn}>
            <LogOut size={18} />
          </Link>
          <div className={styles.avatar}>
            {session.user?.name?.charAt(0) || "U"}
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
