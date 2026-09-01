"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
// @ts-ignore
import { api } from "../../../convex/_generated/api";

import styles from "./page.module.css";

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useUser();
  const notifications = useQuery(api.notifications.getUserNotifications, user ? { userId: user.id } : "skip");
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead({ notificationId: notification._id });
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAllRead = async () => {
    if (user) {
      await markAllAsRead({ userId: user.id });
    }
  };

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={() => router.back()} className={styles.backBtn}>
            <ArrowLeft size={20} />
          </button>
          <h1 className={styles.title}>Notifications</h1>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className={styles.markAllBtn}>
            <CheckCircle2 size={16} /> Mark all read
          </button>
        )}
      </header>

      <div className={styles.content}>
        {notifications === undefined ? (
          <div className={styles.emptyState}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><Bell size={48} color="var(--text-secondary)" /></div>
            <h3>No notifications yet</h3>
            <p>We'll let you know when there's an update.</p>
          </div>
        ) : (
          <div className={styles.notificationList}>
            {notifications.map((notification) => (
              <div 
                key={notification._id} 
                className={`${styles.notificationCard} ${!notification.isRead ? styles.unread : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className={styles.notificationIcon}>
                  <Bell size={20} color={!notification.isRead ? "var(--accent-primary)" : "var(--text-secondary)"} />
                </div>
                <div className={styles.notificationDetails}>
                  <div className={styles.notificationTitle}>
                    {notification.title}
                  </div>
                  <div className={styles.notificationMessage}>
                    {notification.message}
                  </div>
                  <div className={styles.notificationTime}>
                    {new Date(notification.createdAt).toLocaleString(undefined, {
                      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                    })}
                  </div>
                </div>
                {!notification.isRead && <div className={styles.unreadDot} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
