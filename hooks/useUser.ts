"use client";

import { useEffect, useState } from "react";

export interface UserProfile {
  displayName: string;
  email: string | null;
  firstName: string | null;
  id: string;
  lastName: string | null;
}

interface UseUserReturn {
  isLoaded: boolean;
  user: UserProfile | null;
}

/**
 * Client-side hook that fetches the current Shopify customer session from
 * /api/auth/me. Returns `user: null` when not signed in.
 */
export function useUser(): UseUserReturn {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/me", { credentials: "same-origin" })
      .then((res) => res.json())
      .then((data: { user: UserProfile | null }) => {
        if (!cancelled) {
          setUser(data.user ?? null);
          setIsLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setIsLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { isLoaded, user };
}
