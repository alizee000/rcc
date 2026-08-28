"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinMeetupButton({ meetupId, initialStatus, isFull }: { meetupId: string, initialStatus: string | null, isFull: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/meetups/${meetupId}/join`, {
        method: "POST"
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to join meetup");
      }
    } catch (error) {
      console.error(error);
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
      {loading ? "Joining..." : "Join Meetup"}
    </button>
  );
}
