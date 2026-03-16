"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { IconDeviceFloppy } from "@tabler/icons-react";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "US/Hawaii",
];

type DayConfig = { enabled: boolean; open: string; close: string };
type ChatHoursConfig = {
  timezone: string;
  days: Record<string, DayConfig>;
};

const DEFAULT_CONFIG: ChatHoursConfig = {
  timezone: "America/New_York",
  days: Object.fromEntries(
    DAYS.map((day) => [
      day,
      {
        enabled: ["saturday", "sunday"].includes(day) ? false : true,
        open: "09:00",
        close: "17:00",
      },
    ]),
  ),
};

export default function AdminSettingsPage() {
  const savedRaw = useQuery(api.chatAdmin.getChatSettings, {
    key: "chat_hours",
  });
  const updateSettings = useMutation(api.chatAdmin.updateChatSettings);

  const [config, setConfig] = useState<ChatHoursConfig>(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (savedRaw) {
      try {
        setConfig(JSON.parse(savedRaw));
      } catch {
        // invalid JSON, use defaults
      }
    }
  }, [savedRaw]);

  const handleSave = async () => {
    setSaving(true);
    await updateSettings({
      key: "chat_hours",
      value: JSON.stringify(config),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateDay = (day: string, updates: Partial<DayConfig>) => {
    setConfig((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: { ...prev.days[day], ...updates },
      },
    }));
  };

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="font-heading text-2xl font-bold text-gray-900">
        Chat Settings
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Configure when live chat support is available to customers.
      </p>

      <div className="mt-8 space-y-6">
        {/* Timezone */}
        <div>
          <label
            htmlFor="timezone"
            className="block text-sm font-medium text-gray-700"
          >
            Timezone
          </label>
          <select
            id="timezone"
            value={config.timezone}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, timezone: e.target.value }))
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        {/* Per-day schedule */}
        <div>
          <p className="mb-3 text-sm font-medium text-gray-700">
            Support Hours
          </p>
          <div className="space-y-2">
            {DAYS.map((day) => {
              const dayConfig = config.days[day] ?? {
                enabled: false,
                open: "09:00",
                close: "17:00",
              };
              return (
                <div
                  key={day}
                  className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-3"
                >
                  <label className="flex w-28 items-center gap-2">
                    <input
                      type="checkbox"
                      checked={dayConfig.enabled}
                      onChange={(e) =>
                        updateDay(day, { enabled: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium capitalize text-gray-700">
                      {day}
                    </span>
                  </label>
                  {dayConfig.enabled ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={dayConfig.open}
                        onChange={(e) =>
                          updateDay(day, { open: e.target.value })
                        }
                        className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                      <span className="text-sm text-gray-400">to</span>
                      <input
                        type="time"
                        value={dayConfig.close}
                        onChange={(e) =>
                          updateDay(day, { close: e.target.value })
                        }
                        className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Closed</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <IconDeviceFloppy size={16} />
          {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
