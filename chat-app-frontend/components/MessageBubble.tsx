"use client";
import { Message } from "@/types";

interface Props {
  message: Message;
  showAvatar: boolean;
}

export default function MessageBubble({ message, showAvatar }: Props) {
  const { text, sender, timestamp, isOwn } = message;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "10px",
        flexDirection: isOwn ? "row-reverse" : "row",
        marginTop: showAvatar ? "16px" : "2px",
        animation: "slideInRight 0.3s ease",
      }}
      className={isOwn ? "animate-slide-right" : "animate-slide-left"}
    >
      {/* Avatar */}
      {!isOwn && (
        <div
          style={{
            width: showAvatar ? "32px" : "32px",
            height: showAvatar ? "32px" : "32px",
            borderRadius: "10px",
            background: showAvatar
              ? "linear-gradient(135deg, #22c55e22, #16a34a44)"
              : "transparent",
            border: showAvatar ? "1px solid var(--border-primary)" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: "700",
            color: "var(--accent-primary)",
            fontFamily: "var(--font-display)",
            flexShrink: 0,
            opacity: showAvatar ? 1 : 0,
          }}
        >
          {showAvatar ? sender.avatar : ""}
        </div>
      )}

      <div
        style={{
          maxWidth: "68%",
          display: "flex",
          flexDirection: "column",
          alignItems: isOwn ? "flex-end" : "flex-start",
          gap: "4px",
        }}
      >
        {/* Sender name */}
        {!isOwn && showAvatar && (
          <span
            style={{
              fontSize: "11px",
              fontWeight: "600",
              color: "var(--accent-primary)",
              fontFamily: "var(--font-display)",
              letterSpacing: "0.05em",
              paddingLeft: "4px",
            }}
          >
            {sender.username}
          </span>
        )}

        {/* Bubble */}
        <div
          style={{
            padding: "10px 14px",
            borderRadius: isOwn ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
            background: isOwn
              ? "linear-gradient(135deg, #22c55e, #16a34a)"
              : "var(--bg-card)",
            border: isOwn ? "none" : "1px solid var(--border-subtle)",
            color: isOwn ? "var(--text-on-accent)" : "var(--text-primary)",
            fontSize: "14px",
            lineHeight: "1.5",
            fontFamily: "var(--font-body)",
            boxShadow: isOwn
              ? "0 4px 16px rgba(34,197,94,0.2)"
              : "var(--shadow-card)",
            wordBreak: "break-word",
          }}
        >
          {text}
        </div>

        {/* Timestamp */}
        <span
          style={{
            fontSize: "10px",
            color: "var(--text-muted)",
            fontFamily: "var(--font-body)",
            paddingLeft: "4px",
            paddingRight: "4px",
          }}
        >
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );
}