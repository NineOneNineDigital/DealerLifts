"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "dl_wishlist";

function read(): Set<string> {
  if (typeof window === "undefined") {
    return new Set();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(Array.isArray(ids) ? ids : []);
  } catch {
    return new Set();
  }
}

// Module-level snapshot so every hook instance shares one referentially-stable
// value — required by useSyncExternalStore to avoid render loops.
let snapshot: Set<string> = read();
// Stable empty value for the server/hydration snapshot. The server renders with
// no saved items; returning this keeps the first client render identical (no
// hydration mismatch) before the store re-syncs to localStorage post-hydration.
const EMPTY: Set<string> = new Set();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function persist(next: Set<string>) {
  snapshot = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  }
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Sync changes made in other tabs.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      snapshot = read();
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useWishlist() {
  const ids = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => EMPTY
  );

  const toggle = (id: string) => {
    const next = new Set(snapshot);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    persist(next);
  };

  return {
    count: ids.size,
    ids,
    isSaved: (id: string) => ids.has(id),
    toggle,
  };
}
