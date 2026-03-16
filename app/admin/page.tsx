"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import {
  IconMessageCircle,
  IconClock,
  IconCircleCheck,
  IconArrowRight,
  IconSettings,
} from "@tabler/icons-react";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  href,
}: {
  label: string;
  value: number | undefined;
  icon: React.ElementType;
  color: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-heading text-2xl font-bold text-gray-900">
          {value === undefined ? "–" : value}
        </p>
      </div>
      <IconArrowRight size={16} className="text-gray-300" />
    </Link>
  );
}

export default function AdminDashboardPage() {
  const { user } = useUser();
  const conversations = useQuery(api.chatAdmin.getAllConversations);

  const pendingCount = conversations?.pending?.length;
  const activeCount = conversations?.active?.length;
  const closedCount = conversations?.closed?.length;

  const firstName = user?.firstName || "Admin";

  return (
    <div className="mx-auto max-w-4xl p-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-gray-900">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's an overview of your chat support activity.
        </p>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Pending Chats"
          value={pendingCount}
          icon={IconClock}
          color="bg-yellow-500"
          href="/admin/chat"
        />
        <StatCard
          label="Active Chats"
          value={activeCount}
          icon={IconMessageCircle}
          color="bg-green-500"
          href="/admin/chat"
        />
        <StatCard
          label="Resolved"
          value={closedCount}
          icon={IconCircleCheck}
          color="bg-gray-400"
          href="/admin/chat"
        />
      </div>

      {/* Recent pending conversations */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="font-heading text-sm font-bold text-gray-900">
            Pending Conversations
          </h2>
          <Link
            href="/admin/chat"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View all
            <IconArrowRight size={12} />
          </Link>
        </div>

        {conversations === undefined ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
          </div>
        ) : conversations.pending.length === 0 ? (
          <div className="py-12 text-center">
            <IconCircleCheck size={32} className="mx-auto mb-2 text-green-400" />
            <p className="text-sm text-gray-500">No pending conversations</p>
            <p className="text-xs text-gray-400">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.pending.slice(0, 5).map((conv) => (
              <Link
                key={conv._id}
                href="/admin/chat"
                className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-100 text-xs font-bold text-yellow-700">
                  {conv.customerName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {conv.customerName}
                    </p>
                    <span className="text-[10px] text-gray-400">
                      {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="truncate text-xs text-gray-500">
                    {conv.lastMessagePreview || conv.customerEmail}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/admin/chat"
          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
        >
          <IconMessageCircle size={20} className="text-primary" />
          <div>
            <p className="text-sm font-medium text-gray-900">Open Chat Inbox</p>
            <p className="text-xs text-gray-500">View and reply to customer messages</p>
          </div>
        </Link>
        <Link
          href="/admin/settings"
          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
        >
          <IconSettings size={20} className="text-primary" />
          <div>
            <p className="text-sm font-medium text-gray-900">Chat Settings</p>
            <p className="text-xs text-gray-500">Configure support hours and availability</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
