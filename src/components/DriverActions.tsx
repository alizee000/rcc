"use client";

import { Users, Flag } from "lucide-react";
import styles from "../app/driver/[id]/page.module.css";
import { useToast } from "./Toast";

export default function DriverActions({ driverName }: { driverName: string }) {
  const { showToast } = useToast();

  const handleAddFriend = () => {
    showToast(`Friend request sent to ${driverName}!`);
  };

  const handleChallenge = () => {
    showToast(`Challenge sent to ${driverName}!`);
  };

  return (
    <div className={styles.actions}>
      <button className="btn-primary" style={{ padding: "8px 24px", fontSize: 14 }} onClick={handleAddFriend}>
        <Users size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "bottom" }} /> 
        Add Friend
      </button>
      <button className="btn-secondary" style={{ padding: "8px 24px", fontSize: 14 }} onClick={handleChallenge}>
        <Flag size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "bottom" }} />
        Challenge
      </button>
    </div>
  );
}
