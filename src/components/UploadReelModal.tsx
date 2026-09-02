"use client";

import { useState, useRef } from "react";
import { X, Upload, Loader2, Video } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
// @ts-ignore
import { api } from "../../convex/_generated/api";
import styles from "./UploadReelModal.module.css";
import { useToast } from "./Toast";

interface Props {
  onClose: () => void;
}

export default function UploadReelModal({ onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const generateUploadUrl = useMutation(api.reels.generateUploadUrl);
  const createReel = useMutation(api.reels.createReel);
  const { showToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 50 * 1024 * 1024) {
        toast.error("File too large. Max 50MB.");
        return;
      }
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) return;
    
    try {
      setIsUploading(true);
      
      // 1. Get a short-lived upload URL
      const postUrl = await generateUploadUrl();
      
      // 2. POST the file to the URL
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      
      // 3. Save the newly allocated storage id to the database
      await createReel({
        title: title.trim(),
        description: description.trim(),
        storageId,
      });
      
      showToast("Reel uploaded successfully! 🔥");
      onClose();
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Upload Reel</h2>
          <button onClick={onClose} className={styles.closeBtn} disabled={isUploading}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {isUploading ? (
            <div className={styles.uploadingState}>
              <Loader2 size={40} className={styles.spinner} />
              <div style={{ fontWeight: 600 }}>Uploading video...</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>This might take a minute depending on your connection.</div>
            </div>
          ) : (
            <>
              {!previewUrl ? (
                <div 
                  className={styles.uploadBox} 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={40} className={styles.uploadIcon} />
                  <div className={styles.uploadText}>Select a video file</div>
                  <div className={styles.uploadSub}>MP4 or MOV, max 50MB</div>
                </div>
              ) : (
                <div className={styles.previewContainer}>
                  <video src={previewUrl} className={styles.videoPreview} controls loop muted />
                  <button 
                    className={styles.changeFileBtn}
                    onClick={() => {
                      setFile(null);
                      setPreviewUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    Change Video
                  </button>
                </div>
              )}

              <input 
                type="file" 
                accept="video/mp4,video/quicktime"
                className={styles.fileInput}
                ref={fileInputRef}
                onChange={handleFileChange}
              />

              <div className={styles.formGroup}>
                <label className={styles.label}>Title</label>
                <input 
                  type="text" 
                  className={styles.input}
                  placeholder="e.g., Epic Drift at Asphalt Arena 🔥"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={50}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Description & Tags (Optional)</label>
                <input 
                  type="text" 
                  className={styles.input}
                  placeholder="#rcdrift #bengaluru"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={100}
                />
              </div>
            </>
          )}
        </div>

        {!isUploading && (
          <div className={styles.footer}>
            <button 
              className={`btn-primary ${styles.submitBtn}`} 
              disabled={!file || !title.trim()}
              onClick={handleUpload}
            >
              Post Reel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
