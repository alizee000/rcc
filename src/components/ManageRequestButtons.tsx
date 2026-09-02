"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
// @ts-ignore
import { api } from "../../convex/_generated/api";
// @ts-ignore
import { Id } from "../../convex/_generated/dataModel";

export default function ManageRequestButtons({ participantId }: { participantId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const approve = useMutation(api.meetups.approveJoinRequest);
  const decline = useMutation(api.meetups.declineJoinRequest);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await approve({ participantId: participantId as Id<"meetupParticipants"> });
      router.refresh();
    } catch (e: any) {
      toast.error("Failed to approve");
    }
    setLoading(false);
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      await decline({ participantId: participantId as Id<"meetupParticipants"> });
      router.refresh();
    } catch (e: any) {
      toast.error("Failed to decline");
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
      <button 
        onClick={handleApprove}
        disabled={loading}
        style={{
          padding: "6px 12px",
          borderRadius: "6px",
          border: "none",
          backgroundColor: "var(--success)",
          color: "white",
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontWeight: 600,
          fontSize: "12px"
        }}
      >
        <Check size={14} /> Approve
      </button>
      <button 
        onClick={handleDecline}
        disabled={loading}
        style={{
          padding: "6px 12px",
          borderRadius: "6px",
          border: "1px solid var(--border)",
          backgroundColor: "transparent",
          color: "var(--text-primary)",
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontWeight: 600,
          fontSize: "12px"
        }}
      >
        <X size={14} /> Decline
      </button>
    </div>
  );
}
