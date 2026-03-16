"use client";

import { IconClockHour4 } from "@tabler/icons-react";

interface ChatOfflineNoticeProps {
  schedule: {
    timezone: string;
    days: Record<string, { enabled: boolean; open: string; close: string }>;
  } | null;
}

const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export function ChatOfflineNotice({ schedule }: ChatOfflineNoticeProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <IconClockHour4 size={32} className="text-gray-400" />
      </div>
      <div>
        <h3 className="font-heading text-lg font-semibold text-gray-900">
          We're currently offline
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Leave us a message and we'll get back to you!
        </p>
      </div>
      {schedule && (
        <div className="mt-2 w-full rounded-lg bg-gray-50 p-3 text-left text-xs">
          <p className="mb-2 font-semibold text-gray-700">Support hours ({schedule.timezone}):</p>
          {DAY_ORDER.map((day) => {
            const config = schedule.days[day];
            return (
              <div key={day} className="flex justify-between py-0.5">
                <span className="capitalize text-gray-600">{day}</span>
                <span className="text-gray-500">
                  {config?.enabled
                    ? `${config.open} - ${config.close}`
                    : "Closed"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
