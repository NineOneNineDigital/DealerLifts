"use client";

import { useState, useCallback, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { IconSend } from "@tabler/icons-react";

interface ChatInputProps {
  conversationId: Id<"chatConversations">;
  senderName: string;
}

export function ChatInput({ conversationId, senderName }: ChatInputProps) {
  const [text, setText] = useState("");
  const sendMessage = useMutation(api.chat.sendMessage);
  const setTyping = useMutation(api.chat.setTyping);
  const lastTypingRef = useRef(0);

  const handleTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastTypingRef.current > 3000) {
      lastTypingRef.current = now;
      setTyping({
        conversationId,
        sender: "customer",
        senderName,
      });
    }
  }, [conversationId, senderName, setTyping]);

  const handleSend = async () => {
    const body = text.trim();
    if (!body) return;
    setText("");
    await sendMessage({
      conversationId,
      body,
      senderName,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2 border-t border-gray-200 p-3">
      <input
        type="text"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          handleTyping();
        }}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={!text.trim()}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
        aria-label="Send message"
      >
        <IconSend size={16} />
      </button>
    </div>
  );
}
