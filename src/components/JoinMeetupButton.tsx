"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useMutation } from "convex/react";
import { toast } from "sonner";
// @ts-ignore
import { api } from "../../convex/_generated/api";

export default function JoinMeetupButton({ meetupId, initialStatus, isFull, userId }: { meetupId: string, initialStatus: string | null, isFull: boolean, userId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const joinMeetup = useMutation(api.meetups.joinMeetup);

  const handleJoin = async () => {
    if (!userId) {
      toast.error("Please log in to join.");
      return;
    }
    
    setLoading(true);
    try {
      await joinMeetup({
        meetupId: meetupId as any,
        userId: userId as any
      });
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to join meetup");
    }
    setLoading(false);
  };

  if (initialStatus === "JOINED") {
    return (
      <button className="btn-secondary" disabled style={{ width: "100%", backgroundColor: "var(--success)", color: "white", borderColor: "var(--success)" }}>
        You're In!
      </button>
    );
  }

  if (initialStatus === "PENDING") {
    return (
      <button className="btn-secondary" disabled style={{ width: "100%" }}>
        Requested
      </button>
    );
  }

  if (initialStatus === "INVITED") {
    return (
      <button className="btn-primary" onClick={handleJoin} disabled={loading} style={{ width: "100%" }}>
        {loading ? "Accepting..." : "Accept Invite"}
      </button>
    );
  }

  if (isFull) {
    return (
      <button className="btn-secondary" disabled style={{ width: "100%" }}>
        Meetup Full
      </button>
    );
  }

  return (
    <button className="btn-primary" onClick={handleJoin} disabled={loading} style={{ width: "100%" }}>
      {loading ? "Sending..." : "Send Request to Join"}
    </button>
  );
}
