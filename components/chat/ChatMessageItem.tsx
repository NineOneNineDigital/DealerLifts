"use client";

interface ChatMessageItemProps {
  sender: "customer" | "admin";
  senderName: string;
  body: string;
  sentAt: number;
}

export function ChatMessageItem({
  sender,
  senderName,
  body,
  sentAt,
}: ChatMessageItemProps) {
  const isCustomer = sender === "customer";
  const time = new Date(sentAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex flex-col gap-1 ${isCustomer ? "items-end" : "items-start"}`}
    >
      <span className="px-1 text-[10px] text-gray-400">
        {senderName} &middot; {time}
      </span>
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
          isCustomer
            ? "rounded-br-md bg-primary text-white"
            : "rounded-bl-md bg-gray-100 text-gray-900"
        }`}
      >
        {body}
      </div>
    </div>
  );
}
