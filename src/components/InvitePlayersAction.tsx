"use client";

import { useState } from "react";
import InvitePlayersModal from "./InvitePlayersModal";

export default function InvitePlayersAction({ 
  meetupId, 
  currentParticipants 
}: { 
  meetupId: string; 
  currentParticipants: string[]; 
}) {
  const [showInviteModal, setShowInviteModal] = useState(false);

  return (
    <>
      <button 
        className="btn-primary" 
        style={{ width: "100%", backgroundColor: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border)", display: "flex", justifyContent: "center" }}
        onClick={() => setShowInviteModal(true)}
      >
        + Invite Players
      </button>

      {showInviteModal && (
        <InvitePlayersModal 
          meetupId={meetupId} 
          currentParticipants={currentParticipants}
          onClose={() => setShowInviteModal(false)} 
        />
      )}
    </>
  );
}
