"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ArrowLeft, Send } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
// @ts-ignore
import { api } from "../../../../../convex/_generated/api";
// @ts-ignore
import { Id } from "../../../../../convex/_generated/dataModel";

import styles from "./page.module.css";

export default function MeetupChat() {
  const params = useParams();
  const { user } = useUser();
  const router = useRouter();
  
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const meetupId = params.id as Id<"meetups">;
  
  const meetup = useQuery(api.meetups.getMeetupById, { id: meetupId });
  const messages = useQuery(api.meetups.getMessages, { meetupId });
  const sendMessage = useMutation(api.meetups.sendMessage);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user || meetup === undefined || messages === undefined) {
    return <div className={styles.loading}>Loading chat...</div>;
  }

  if (meetup === null) {
    return <div className={styles.loading}>Meetup not found</div>;
  }

  // Check auth
  const currentUserData = { id: user.id };
  const isHost = meetup.host.id === currentUserData.id;
  const userParticipant = meetup.participants.find((p: any) => p.user.id === currentUserData.id);
  const isJoined = userParticipant?.status === "JOINED";

  if (!isHost && !isJoined) {
    return (
      <div className={styles.unauthorized}>
        <div style={{ marginBottom: 16 }}>You must join this meetup to view the chat.</div>
        <button className="btn-primary" onClick={() => router.back()}>Go Back</button>
      </div>
    );
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText;
    setInputText(""); // optimistic clear
    
    try {
      await sendMessage({
        meetupId,
        userId: user.id,
        text: text.trim()
      });
    } catch (e) {
      console.error(e);
      alert("Failed to send message");
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className={styles.title}>{meetup.title} Chat</h1>
          <div className={styles.subtitle}>{meetup.venue.name}</div>
        </div>
      </header>

      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            No messages yet. Say hi! 👋
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.user.id === user.id;
            return (
              <div key={idx} className={`${styles.messageWrapper} ${isMe ? styles.messageMe : styles.messageOther}`}>
                {!isMe && <div className={styles.avatar}>{msg.user.name.substring(0,2).toUpperCase()}</div>}
                
                <div className={styles.messageContent}>
                  {!isMe && <div className={styles.messageName}>{msg.user.name}</div>}
                  <div className={styles.messageBubble}>
                    {msg.text}
                  </div>
                  <div className={styles.messageTime}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className={styles.inputForm} onSubmit={handleSend}>
        <input
          type="text"
          className={styles.inputField}
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit" className={styles.sendBtn} disabled={!inputText.trim()}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
