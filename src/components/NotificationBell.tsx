"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
// @ts-ignore
import { api } from "../../convex/_generated/api";

export default function NotificationBell() {
  const { user } = useUser();
  const notifications = useQuery(api.notifications.getUserNotifications, user ? { userId: user.id } : "skip");

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <Link href="/notifications" style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.05)" }}>
      <Bell size={20} color="var(--text-primary)" />
      {unreadCount > 0 && (
        <div style={{
          position: "absolute",
          top: 6,
          right: 8,
          width: 8,
          height: 8,
          backgroundColor: "var(--accent-primary)",
          borderRadius: "50%",
          boxShadow: "0 0 0 2px var(--bg-primary)"
        }} />
      )}
    </Link>
  );
}
