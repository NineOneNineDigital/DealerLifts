"use client";

import { IconMessageCircle, IconX } from "@tabler/icons-react";

interface ChatBubbleProps {
  isOpen: boolean;
  onClick: () => void;
  unread?: boolean;
}

export function ChatBubble({ isOpen, onClick, unread }: ChatBubbleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      aria-label={isOpen ? "Close chat" : "Open chat"}
    >
      {isOpen ? (
        <IconX size={24} />
      ) : (
        <>
          <IconMessageCircle size={24} />
          {unread && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 border-2 border-white" />
          )}
        </>
      )}
    </button>
  );
}
