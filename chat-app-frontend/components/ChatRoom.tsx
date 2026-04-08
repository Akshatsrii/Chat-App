"use client";
import { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import UserList from "./UserList";
import TypingIndicator from "./TypingIndicator";
import { initSocket, sendMessage } from "@/lib/socket";
import { Message, User } from "@/types";

const DEMO_MESSAGES: Message[] = [
  {
    id: "1",
    text: "Hey everyone! Welcome to NexChat 🎉",
    sender: { id: "2", username: "alex_dev", avatar: "A" },
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    isOwn: false,
  },
  {
    id: "2",
    text: "This interface looks incredible! Love the dark theme.",
    sender: { id: "1", username: "you", avatar: "Y" },
    timestamp: new Date(Date.now() - 1000 * 60 * 8),
    isOwn: true,
  },
  {
    id: "3",
    text: "Real-time messaging is working perfectly.",
    sender: { id: "3", username: "priya_k", avatar: "P" },
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    isOwn: false,
  },
];

const DEMO_USERS: User[] = [
  { id: "1", username: "you", avatar: "Y", online: true },
  { id: "2", username: "alex_dev", avatar: "A", online: true },
  { id: "3", username: "priya_k", avatar: "P", online: true },
  { id: "4", username: "marco_r", avatar: "M", online: false },
  { id: "5", username: "sarah_t", avatar: "S", online: false },
];

export default function ChatRoom() {
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Socket init would go here
    // const socket = initSocket();
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: { id: "1", username: "you", avatar: "Y" },
      timestamp: new Date(),
      isOwn: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    inputRef.current?.focus();

    // Simulate reply
    setTimeout(() => setTyping(true), 800);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: "Got it! Thanks for reaching out.",
          sender: { id: "2", username: "alex_dev", avatar: "A" },
          timestamp: new Date(),
          isOwn: false,
        },
      ]);
    }, 2500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "var(--bg-primary)",
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <UserList
        users={DEMO_USERS}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <header
          className="glass"
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-secondary)",
              fontSize: "20px",
              lineHeight: 1,
              padding: "4px",
              borderRadius: "6px",
              transition: "color 0.2s",
            }}
          >
            ☰
          </button>

          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              color: "var(--text-on-accent)",
              fontFamily: "var(--font-display)",
              fontWeight: "700",
            }}
          >
            #
          </div>

          <div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: "700",
                fontSize: "16px",
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
              }}
            >
              general
            </h2>
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              {DEMO_USERS.filter((u) => u.online).length} online
            </p>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
            {["⊕", "⊞", "⊛"].map((icon, i) => (
              <button
                key={i}
                style={{
                  background: "none",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  width: "34px",
                  height: "34px",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
              >
                {icon}
              </button>
            ))}
          </div>
        </header>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {messages.map((msg, i) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              showAvatar={
                i === 0 || messages[i - 1]?.sender.id !== msg.sender.id
              }
            />
          ))}
          {typing && <TypingIndicator username="alex_dev" />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          className="glass"
          style={{
            padding: "16px 20px",
            borderTop: "1px solid var(--border-subtle)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "var(--bg-input)",
              borderRadius: "14px",
              padding: "8px 8px 8px 16px",
              border: "1px solid var(--border-subtle)",
              transition: "border-color 0.2s",
            }}
            onFocus={() => {}}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                color: "var(--text-primary)",
                fontSize: "14px",
                fontFamily: "var(--font-body)",
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                border: "none",
                cursor: input.trim() ? "pointer" : "not-allowed",
                background: input.trim()
                  ? "linear-gradient(135deg, #22c55e, #16a34a)"
                  : "var(--border-subtle)",
                color: input.trim() ? "var(--text-on-accent)" : "var(--text-muted)",
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                boxShadow: input.trim()
                  ? "0 2px 12px rgba(34,197,94,0.3)"
                  : "none",
                flexShrink: 0,
              }}
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}