"use client";

interface Props {
  username: string;
}

export default function TypingIndicator({ username }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "10px",
        marginTop: "12px",
        animation: "fadeIn 0.3s ease",
      }}
    >
      {/* Avatar placeholder */}
      <div style={{ width: "32px", flexShrink: 0 }} />

      <div>
        <span
          style={{
            fontSize: "11px",
            color: "var(--accent-primary)",
            fontFamily: "var(--font-display)",
            fontWeight: "600",
            letterSpacing: "0.05em",
            display: "block",
            marginBottom: "4px",
            paddingLeft: "4px",
          }}
        >
          {username} is typing
        </span>

        <div
          style={{
            padding: "12px 16px",
            borderRadius: "4px 16px 16px 16px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--accent-primary)",
                animation: `typing-dot 1.2s ease infinite`,
                animationDelay: `${i * 0.2}s`,
                boxShadow: "0 0 6px rgba(34,197,94,0.5)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}