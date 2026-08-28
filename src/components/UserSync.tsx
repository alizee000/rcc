"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
// @ts-ignore
import { api } from "../../convex/_generated/api";

export default function UserSync() {
  const { user, isLoaded } = useUser();
  const syncUser = useMutation(api.users.syncUser);
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (isLoaded && user && syncedRef.current !== user.id) {
      syncedRef.current = user.id;
      const name = user.fullName || user.firstName || "Racer";
      const email = user.emailAddresses[0]?.emailAddress || "";
      
      syncUser({ clerkId: user.id, name, email }).catch(console.error);
    }
  }, [user, isLoaded, syncUser]);

  return null;
}
