"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ChatMessageItem } from "./ChatMessageItem";
import { ChatTypingIndicator } from "./ChatTypingIndicator";

interface ChatMessageListProps {
  conversationId: Id<"chatConversations">;
}

export function ChatMessageList({ conversationId }: ChatMessageListProps) {
  const messages = useQuery(api.chat.getMessages, { conversationId });
  const typingIndicators = useQuery(api.chat.getTypingIndicators, {
    conversationId,
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingIndicators]);

  if (!messages) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
      </div>
    );
  }

  const adminTyping = typingIndicators?.filter((i) => i.sender === "admin");

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
      {messages.length === 0 && (
        <p className="text-center text-sm text-gray-400">
          Send a message to start the conversation.
        </p>
      )}
      {messages.map((msg) => (
        <ChatMessageItem
          key={msg._id}
          sender={msg.sender}
          senderName={msg.senderName}
          body={msg.body}
          sentAt={msg.sentAt}
        />
      ))}
      {adminTyping?.map((indicator) => (
        <ChatTypingIndicator
          key={indicator._id}
          senderName={indicator.senderName}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
