import React from "react";
import { motion } from "framer-motion";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ 
  width = "100%", 
  height = "20px", 
  borderRadius = "8px", 
  className = "",
  style 
}: SkeletonProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0.3 }}
      animate={{ opacity: 0.7 }}
      transition={{ 
        repeat: Infinity, 
        repeatType: "reverse", 
        duration: 1, 
        ease: "easeInOut" 
      }}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        ...style
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div style={{ 
      padding: 16, 
      backgroundColor: "var(--bg-card)", 
      borderRadius: "var(--radius-lg)",
      border: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      gap: 12
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Skeleton width={48} height={48} borderRadius="50%" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={12} />
        </div>
      </div>
      <Skeleton width="100%" height={80} />
      <div style={{ display: "flex", gap: 8 }}>
        <Skeleton width="50%" height={32} />
        <Skeleton width="50%" height={32} />
      </div>
    </div>
  );
}

export function SkeletonListItem() {
  return (
    <div style={{ 
      padding: 12, 
      backgroundColor: "var(--bg-card)", 
      borderRadius: "var(--radius-md)",
      border: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      gap: 12
    }}>
      <Skeleton width={40} height={40} borderRadius="50%" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <Skeleton width="70%" height={14} />
        <Skeleton width="30%" height={10} />
      </div>
      <Skeleton width={30} height={30} borderRadius="50%" />
    </div>
  );
}
