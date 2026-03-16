"use client";

import { useState, useCallback, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useSessionId } from "@/hooks/useSessionId";
import { motion } from "framer-motion";
import { IconX } from "@tabler/icons-react";
import { ChatOfflineNotice } from "./ChatOfflineNotice";
import { ChatStartForm } from "./ChatStartForm";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";

const CONVERSATION_KEY = "dl-chat-conversation-id";
const CUSTOMER_NAME_KEY = "dl-chat-customer-name";

interface ChatWindowProps {
  onClose: () => void;
}

export function ChatWindow({ onClose }: ChatWindowProps) {
  const sessionId = useSessionId();
  const chatStatus = useQuery(api.chat.isChatOpen);
  const startConversation = useMutation(api.chat.startConversation);

  const [conversationId, setConversationId] =
    useState<Id<"chatConversations"> | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  // Restore conversation from localStorage
  useEffect(() => {
    const storedId = localStorage.getItem(CONVERSATION_KEY);
    const storedName = localStorage.getItem(CUSTOMER_NAME_KEY);
    if (storedId) {
      setConversationId(storedId as Id<"chatConversations">);
    }
    if (storedName) {
      setCustomerName(storedName);
    }
  }, []);

  const conversation = useQuery(
    api.chat.getConversation,
    conversationId ? { conversationId } : "skip",
  );

  // Clear stored conversation if it was closed
  useEffect(() => {
    if (conversation === null && conversationId) {
      localStorage.removeItem(CONVERSATION_KEY);
      setConversationId(null);
    }
  }, [conversation, conversationId]);

  const handleStart = useCallback(
    async (name: string, email: string) => {
      if (!sessionId) return;
      setIsStarting(true);
      try {
        const id = await startConversation({
          sessionId,
          customerName: name,
          customerEmail: email,
        });
        setConversationId(id);
        setCustomerName(name);
        localStorage.setItem(CONVERSATION_KEY, id);
        localStorage.setItem(CUSTOMER_NAME_KEY, name);
      } finally {
        setIsStarting(false);
      }
    },
    [sessionId, startConversation],
  );

  const isOffline = chatStatus && !chatStatus.isOpen;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[380px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center gap-3 bg-primary px-4 py-3 text-white">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
          DL
        </div>
        <div className="flex-1">
          <p className="font-heading text-sm font-semibold">Dealer Lifts</p>
          <p className="text-xs text-white/80">
            {isOffline ? "Offline" : "Online — we'll reply shortly"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-white/20"
          aria-label="Close chat"
        >
          <IconX size={16} />
        </button>
      </div>

      {/* Body */}
      {isOffline && !conversationId ? (
        <ChatOfflineNotice schedule={chatStatus?.schedule ?? null} />
      ) : !conversationId || conversation?.status === "closed" ? (
        <ChatStartForm onStart={handleStart} isLoading={isStarting} />
      ) : (
        <>
          <ChatMessageList conversationId={conversationId} />
          <ChatInput
            conversationId={conversationId}
            senderName={customerName}
          />
        </>
      )}
    </motion.div>
  );
}
