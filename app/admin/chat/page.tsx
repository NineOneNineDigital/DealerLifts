"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  IconSend,
  IconCircleCheck,
  IconClock,
  IconMessageCircle,
  IconX,
} from "@tabler/icons-react";

type ConversationStatus = "pending" | "active" | "closed";

const STATUS_TABS: { value: ConversationStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
];

function formatTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function StatusBadge({ status }: { status: ConversationStatus }) {
  const config = {
    pending: { bg: "bg-yellow-100 text-yellow-800", icon: IconClock },
    active: { bg: "bg-green-100 text-green-800", icon: IconMessageCircle },
    closed: { bg: "bg-gray-100 text-gray-600", icon: IconCircleCheck },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.bg}`}
    >
      <config.icon size={10} />
      {status}
    </span>
  );
}

export default function AdminChatPage() {
  const [activeTab, setActiveTab] = useState<ConversationStatus>("pending");
  const [selectedId, setSelectedId] = useState<Id<"chatConversations"> | null>(
    null,
  );

  const conversations = useQuery(api.chatAdmin.listConversations, {
    status: activeTab,
  });

  const selected = useQuery(
    api.chatAdmin.getConversationWithMessages,
    selectedId ? { conversationId: selectedId } : "skip",
  );

  const typingIndicators = useQuery(
    api.chat.getTypingIndicators,
    selectedId ? { conversationId: selectedId } : "skip",
  );

  const sendMessage = useMutation(api.chatAdmin.sendAdminMessage);
  const closeConversation = useMutation(api.chatAdmin.closeConversation);
  const setTyping = useMutation(api.chat.setTyping);

  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastTypingRef = useRef(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages]);

  const handleSend = async () => {
    if (!replyText.trim() || !selectedId) return;
    const body = replyText.trim();
    setReplyText("");
    await sendMessage({ conversationId: selectedId, body });
  };

  const handleTyping = () => {
    if (!selectedId) return;
    const now = Date.now();
    if (now - lastTypingRef.current > 3000) {
      lastTypingRef.current = now;
      setTyping({
        conversationId: selectedId,
        sender: "admin",
        senderName: "Admin",
      });
    }
  };

  const customerTyping = typingIndicators?.filter(
    (i) => i.sender === "customer",
  );

  return (
    <div className="flex h-full">
      {/* Left: Conversation list */}
      <div className="flex w-80 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-4">
          <h1 className="font-heading text-lg font-bold">Chat Inbox</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setActiveTab(tab.value);
                setSelectedId(null);
              }}
              className={`flex-1 py-2 text-center text-xs font-semibold transition-colors ${
                activeTab === tab.value
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {conversations === undefined && (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
            </div>
          )}
          {conversations?.length === 0 && (
            <p className="p-4 text-center text-sm text-gray-400">
              No {activeTab} conversations
            </p>
          )}
          {conversations?.map((conv) => (
            <button
              key={conv._id}
              type="button"
              onClick={() => setSelectedId(conv._id)}
              className={`w-full border-b border-gray-100 p-3 text-left transition-colors hover:bg-gray-50 ${
                selectedId === conv._id ? "bg-primary/5" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">
                  {conv.customerName}
                </span>
                <span className="text-[10px] text-gray-400">
                  {formatTime(conv.lastMessageAt)}
                </span>
              </div>
              <p className="text-xs text-gray-500">{conv.customerEmail}</p>
              {conv.lastMessagePreview && (
                <p className="mt-1 truncate text-xs text-gray-400">
                  {conv.lastMessagePreview}
                </p>
              )}
              <div className="mt-1">
                <StatusBadge status={conv.status} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Messages */}
      <div className="flex flex-1 flex-col bg-gray-50">
        {!selectedId ? (
          <div className="flex flex-1 items-center justify-center text-gray-400">
            <div className="text-center">
              <IconMessageCircle size={48} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Select a conversation</p>
            </div>
          </div>
        ) : !selected ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {selected.conversation.customerName}
                </p>
                <p className="text-xs text-gray-500">
                  {selected.conversation.customerEmail}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={selected.conversation.status} />
                {selected.conversation.status !== "closed" && (
                  <button
                    type="button"
                    onClick={() => closeConversation({ conversationId: selectedId })}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50"
                  >
                    <IconX size={12} />
                    Close
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {selected.messages.map((msg) => {
                const isAdmin = msg.sender === "admin";
                return (
                  <div
                    key={msg._id}
                    className={`flex flex-col gap-1 ${isAdmin ? "items-end" : "items-start"}`}
                  >
                    <span className="px-1 text-[10px] text-gray-400">
                      {msg.senderName} &middot;{" "}
                      {new Date(msg.sentAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <div
                      className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                        isAdmin
                          ? "rounded-br-md bg-primary text-white"
                          : "rounded-bl-md bg-white text-gray-900 shadow-sm"
                      }`}
                    >
                      {msg.body}
                    </div>
                  </div>
                );
              })}
              {customerTyping?.map((indicator) => (
                <div key={indicator._id} className="flex items-center gap-2 px-1">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
                  </div>
                  <span className="text-xs text-gray-400">
                    {indicator.senderName} is typing...
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply input */}
            {selected.conversation.status !== "closed" && (
              <div className="flex items-center gap-2 border-t border-gray-200 bg-white p-3">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => {
                    setReplyText(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a reply..."
                  className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!replyText.trim()}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
                  aria-label="Send reply"
                >
                  <IconSend size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
