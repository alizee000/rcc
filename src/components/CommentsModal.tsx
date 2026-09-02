"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
// @ts-ignore
import { api } from "../../convex/_generated/api";
// @ts-ignore
import { Id } from "../../convex/_generated/dataModel";
import styles from "./CommentsModal.module.css";

interface CommentsModalProps {
  reelId: Id<"reels">;
  onClose: () => void;
}

export default function CommentsModal({ reelId, onClose }: CommentsModalProps) {
  const [text, setText] = useState("");
  const comments = useQuery(api.reels.getComments, { reelId });
  const addComment = useMutation(api.reels.addComment);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    await addComment({ reelId, text: text.trim() });
    setText("");
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Comments</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} color="var(--text-primary)" />
          </button>
        </div>

        <div className={styles.commentsList}>
          {comments === undefined ? (
            <div className={styles.loading}>Loading...</div>
          ) : comments.length === 0 ? (
            <div className={styles.empty}>Be the first to comment!</div>
          ) : (
            comments.map(comment => (
              <div key={comment._id} className={styles.commentItem}>
                <div className={styles.avatar}>
                  <img src={comment.user.imageUrl || undefined} alt={comment.user.name} />
                </div>
                <div className={styles.commentContent}>
                  <span className={styles.userName}>{comment.user.name}</span>
                  <p className={styles.commentText}>{comment.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <form className={styles.inputArea} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Add a comment..."
            value={text}
            onChange={e => setText(e.target.value)}
            className={styles.input}
          />
          <button type="submit" className={styles.sendBtn} disabled={!text.trim()}>
            <Send size={20} color={text.trim() ? "var(--accent-primary)" : "var(--text-secondary)"} />
          </button>
        </form>
      </div>
    </div>
  );
}
