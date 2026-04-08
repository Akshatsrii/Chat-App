"use client";
import { useState } from "react";

import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await api.login(email, password);
      } else {
        await api.register(username, email, password);
      }
      router.push("/chat");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="animate-fade-up"
      style={{
        width: "100%",
        maxWidth: "420px",
        position: "relative",
        zIndex: 2,
      }}
    >
      {/* Logo & Branding */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "0 0 30px rgba(34,197,94,0.3), 0 0 60px rgba(34,197,94,0.1)",
            fontSize: "24px",
          }}
        >
          ⬡
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "32px",
            fontWeight: "800",
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            marginBottom: "8px",
          }}
        >
          Nex<span style={{ color: "var(--accent-primary)" }}>Chat</span>
        </h1>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: "var(--text-muted)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          Connect · Chat · Collaborate
        </p>
      </div>

      {/* Card */}
      <div
        className="glow-border"
        style={{
          background: "var(--bg-card)",
          borderRadius: "20px",
          padding: "32px",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* Tab Switch */}
        <div
          style={{
            display: "flex",
            background: "var(--bg-input)",
            borderRadius: "10px",
            padding: "4px",
            marginBottom: "28px",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {["Login", "Register"].map((tab) => {
            const active = (tab === "Login") === isLogin;
            return (
              <button
                key={tab}
                onClick={() => {
                  setIsLogin(tab === "Login");
                  setError("");
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontFamily: "var(--font-display)",
                  fontWeight: "600",
                  fontSize: "14px",
                  letterSpacing: "0.02em",
                  transition: "all 0.25s ease",
                  background: active
                    ? "linear-gradient(135deg, #22c55e, #16a34a)"
                    : "transparent",
                  color: active ? "var(--text-on-accent)" : "var(--text-muted)",
                  boxShadow: active
                    ? "0 2px 12px rgba(34,197,94,0.3)"
                    : "none",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {!isLogin && (
              <InputField
                label="Username"
                type="text"
                value={username}
                onChange={setUsername}
                placeholder="your_username"
                icon="◈"
              />
            )}

            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              icon="◉"
            />

            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••••"
              icon="◆"
            />
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px 14px",
                borderRadius: "10px",
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                color: "#f87171",
                fontSize: "13px",
                fontFamily: "var(--font-body)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "16px" }}>⚠</span>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "22px",
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              background: loading
                ? "rgba(34,197,94,0.3)"
                : "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
              color: loading ? "rgba(3,26,9,0.6)" : "var(--text-on-accent)",
              fontFamily: "var(--font-display)",
              fontWeight: "700",
              fontSize: "15px",
              letterSpacing: "0.03em",
              boxShadow: loading ? "none" : "0 4px 20px rgba(34,197,94,0.35)",
              transition: "all 0.25s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid rgba(3,26,9,0.3)",
                    borderTop: "2px solid var(--text-on-accent)",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    display: "inline-block",
                  }}
                />
                {isLogin ? "Signing in..." : "Creating account..."}
              </>
            ) : (
              <>{isLogin ? "Sign In →" : "Create Account →"}</>
            )}
          </button>
        </form>

        {/* Footer */}
        <p
          style={{
            marginTop: "20px",
            textAlign: "center",
            fontSize: "12px",
            color: "var(--text-muted)",
            fontFamily: "var(--font-body)",
          }}
        >
          By continuing, you agree to our{" "}
          <a
            href="#"
            style={{
              color: "var(--accent-primary)",
              textDecoration: "none",
            }}
          >
            Terms of Service
          </a>
        </p>
      </div>

      {/* Bottom badge */}
      <p
        style={{
          textAlign: "center",
          marginTop: "24px",
          fontSize: "11px",
          color: "var(--text-muted)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontFamily: "var(--font-body)",
        }}
      >
        Encrypted · Realtime · Secure
      </p>
    </div>
  );
}

function InputField({
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "11px",
          fontWeight: "600",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: focused ? "var(--accent-primary)" : "var(--text-muted)",
          marginBottom: "8px",
          fontFamily: "var(--font-display)",
          transition: "color 0.2s",
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <span
          style={{
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "14px",
            color: focused ? "var(--accent-primary)" : "var(--text-muted)",
            transition: "color 0.2s",
            pointerEvents: "none",
          }}
        >
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          required
          style={{
            width: "100%",
            padding: "13px 14px 13px 38px",
            borderRadius: "10px",
            border: `1px solid ${focused ? "var(--border-hover)" : "var(--border-subtle)"}`,
            background: "var(--bg-input)",
            color: "var(--text-primary)",
            fontSize: "14px",
            fontFamily: "var(--font-body)",
            outline: "none",
            boxShadow: focused ? "0 0 0 3px var(--accent-glow)" : "none",
            transition: "all 0.2s ease",
          }}
        />
      </div>
    </div>
  );
}