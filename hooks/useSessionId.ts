"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "dl-session-id";

export function useSessionId(): string {
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, id);
    }
    setSessionId(id);
  }, []);

  return sessionId;
}
