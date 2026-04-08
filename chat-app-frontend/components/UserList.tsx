"use client";
import { User } from "@/types";

interface Props {
  users: User[];
  open: boolean;
  onClose: () => void;
}

export default function UserList({ users, open, onClose }: Props) {
  const online = users.filter((u) => u.online);
  const offline = users.filter((u) => !u.online);

  return (
    <div
      className="glass"
      style={{
        width: open ? "240px" : "0",
        overflow: "hidden",
        transition: "width 0.3s ease",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      <div style={{ padding: "20px 16px", minWidth: "240px" }}>
        {/* Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              color: "var(--text-on-accent)",
              boxShadow: "0 0 16px rgba(34,197,94,0.3)",
            }}
          >
            ⬡
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: "800",
              fontSize: "18px",
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
            }}
          >
            Nex<span style={{ color: "var(--accent-primary)" }}>Chat</span>
          </span>
        </div>

        {/* Channels */}
        <SectionLabel>Channels</SectionLabel>
        {["# general", "# design", "# dev-talk", "# random"].map((ch) => (
          <ChannelItem key={ch} name={ch} active={ch === "# general"} />
        ))}

        <div style={{ marginTop: "24px" }} />

        {/* Online users */}
        <SectionLabel>Online — {online.length}</SectionLabel>
        {online.map((u) => (
          <UserItem key={u.id} user={u} />
        ))}

        {/* Offline users */}
        {offline.length > 0 && (
          <>
            <div style={{ marginTop: "16px" }} />
            <SectionLabel>Offline — {offline.length}</SectionLabel>
            {offline.map((u) => (
              <UserItem key={u.id} user={u} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: "10px",
        fontWeight: "700",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--text-muted)",
        fontFamily: "var(--font-display)",
        marginBottom: "6px",
        padding: "0 4px",
      }}
    >
      {children}
    </p>
  );
}

function ChannelItem({ name, active }: { name: string; active: boolean }) {
  return (
    <div
      style={{
        padding: "8px 10px",
        borderRadius: "8px",
        cursor: "pointer",
        background: active ? "var(--accent-subtle)" : "transparent",
        border: active ? "1px solid var(--border-primary)" : "1px solid transparent",
        color: active ? "var(--accent-primary)" : "var(--text-secondary)",
        fontSize: "14px",
        fontFamily: "var(--font-body)",
        marginBottom: "2px",
        transition: "all 0.2s",
        fontWeight: active ? "500" : "400",
      }}
    >
      {name}
    </div>
  );
}

function UserItem({ user }: { user: User }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "6px 8px",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "background 0.2s",
        marginBottom: "2px",
      }}
    >
      <div style={{ position: "relative" }}>
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            background: user.online
              ? "linear-gradient(135deg, #22c55e22, #16a34a44)"
              : "var(--bg-hover)",
            border: `1px solid ${user.online ? "var(--border-primary)" : "var(--border-subtle)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: "700",
            color: user.online ? "var(--accent-primary)" : "var(--text-muted)",
            fontFamily: "var(--font-display)",
          }}
        >
          {user.avatar}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "-2px",
            right: "-2px",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: user.online ? "var(--accent-primary)" : "var(--text-muted)",
            border: "2px solid var(--bg-secondary)",
            boxShadow: user.online ? "0 0 6px rgba(34,197,94,0.6)" : "none",
          }}
        />
      </div>
      <span
        style={{
          fontSize: "13px",
          color: user.online ? "var(--text-primary)" : "var(--text-muted)",
          fontFamily: "var(--font-body)",
          fontWeight: user.online ? "400" : "300",
        }}
      >
        {user.username}
      </span>
    </div>
  );
}