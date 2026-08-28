"use client";

import { ReactNode } from "react";
import { useToast } from "./Toast";

interface Props {
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
  actionMessage: string;
}

export default function AdminActionButton({ className, style, children, actionMessage }: Props) {
  const { showToast } = useToast();

  return (
    <button className={className} style={style} onClick={() => showToast(actionMessage)}>
      {children}
    </button>
  );
}
