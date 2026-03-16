"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useAdminNotifications() {
  const unreadCount = useQuery(api.chatAdmin.getUnreadCount);
  const prevCountRef = useRef<number | undefined>(undefined);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Update document title
  useEffect(() => {
    if (unreadCount === undefined) return;

    const baseTitle = "Chat | Dealer Lifts Admin";
    document.title =
      unreadCount > 0 ? `(${unreadCount}) ${baseTitle}` : baseTitle;

    return () => {
      document.title = baseTitle;
    };
  }, [unreadCount]);

  // Notification + sound on new messages
  useEffect(() => {
    if (unreadCount === undefined) return;

    if (
      prevCountRef.current !== undefined &&
      unreadCount > prevCountRef.current
    ) {
      // Play sound
      if (!audioRef.current) {
        audioRef.current = new Audio("/sounds/notification.mp3");
        audioRef.current.volume = 0.5;
      }
      audioRef.current.play().catch(() => {});

      // Browser notification
      if (Notification.permission === "granted") {
        new Notification("New chat message", {
          body: `You have ${unreadCount} pending conversation${unreadCount > 1 ? "s" : ""}`,
          icon: "/favicon.ico",
        });
      } else if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }

    prevCountRef.current = unreadCount;
  }, [unreadCount]);

  return { unreadCount: unreadCount ?? 0 };
}
