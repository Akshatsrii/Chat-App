'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Eye, EyeOff, UserPlus, Loader2, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AxiosError } from 'axios';

function getStrength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', '#f87171', '#fbbf24', '#a78bfa', '#86efac'];

export default function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focused, setFocused] = useState<string | null>(null);

  const strength = getStrength(form.password);
  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    setErrors((p) => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.username.length < 3) e.username = 'Min 3 characters';
    if (!/^[a-zA-Z0-9_-]+$/.test(form.username)) e.username = 'Letters, numbers, _ and - only';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    if (form.password.length < 8) e.password = 'Min 8 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await register({ username: form.username.trim(), email: form.email.trim(), password: form.password });
      toast.success('Welcome to NexusChat! 🚀');
      router.push('/chat');
    } catch (err) {
      const msg = (err as AxiosError<{ error: { message: string } }>).response?.data?.error?.message || 'Registration failed';
      toast.error(msg);
      setErrors({ form: msg });
    } finally { setIsLoading(false); }
  };

  const rules = [
    { label: 'At least 8 characters', met: form.password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(form.password) },
    { label: 'One number', met: /[0-9]/.test(form.password) },
  ];

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%',
    background: '#07070d',
    border: `1px solid ${
      errors[field]
        ? 'rgba(239,68,68,0.5)'
        : focused === field
        ? 'rgba(124,58,237,0.7)'
        : 'rgba(124,58,237,0.15)'
    }`,
    borderRadius: '12px',
    padding: '12px 16px',
    fontSize: '14px',
    color: '#e9e6f4',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxShadow: focused === field ? '0 0 0 3px rgba(124,58,237,0.1)' : 'none',
  });

  const labelStyle = (field: string): React.CSSProperties => ({
    display: 'block',
    fontSize: '11px',
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: focused === field ? '#a78bfa' : '#6b5fa0',
    marginBottom: '7px',
    transition: 'color 0.2s',
  });

  return (
    <div className="w-full max-w-[400px]" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Mobile logo */}
      <div className="flex lg:hidden items-center gap-3 mb-10 justify-center">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#7c3aed' }}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <path d="M8 1L15 5v6l-7 4L1 11V5L8 1z" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '20px', color: '#f3f0ff', letterSpacing: '-0.02em' }}>
          NexusChat
        </span>
      </div>

      {/* Card */}
      <div
        className="rounded-2xl p-8"
        style={{
          background: '#0f0f18',
          border: '1px solid rgba(124,58,237,0.14)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.05)',
        }}
      >
        {/* Header */}
        <div className="mb-7">
          <div
            className="w-12 h-12 rounded-2xl mb-5 flex items-center justify-center"
            style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}
          >
            <UserPlus size={20} style={{ color: '#a78bfa' }} />
          </div>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#f3f0ff',
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
          }}>
            Create account
          </h2>
          <p style={{ fontSize: '13.5px', color: '#5c5870', marginTop: '6px' }}>
            Join the conversation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Username */}
          <div>
            <label style={labelStyle('username')}>Username</label>
            <input
              type="text"
              value={form.username}
              onChange={update('username')}
              onFocus={() => setFocused('username')}
              onBlur={() => setFocused(null)}
              placeholder="cooluser_42"
              autoComplete="username"
              disabled={isLoading}
              style={inputStyle('username')}
            />
            {errors.username && (
              <p style={{ marginTop: '5px', fontSize: '11px', color: '#f87171', fontFamily: "'JetBrains Mono', monospace" }}>
                ✕ {errors.username}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle('email')}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={update('email')}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isLoading}
              style={inputStyle('email')}
            />
            {errors.email && (
              <p style={{ marginTop: '5px', fontSize: '11px', color: '#f87171', fontFamily: "'JetBrains Mono', monospace" }}>
                ✕ {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle('password')}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={update('password')}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
                style={{ ...inputStyle('password'), paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                tabIndex={-1}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: '#4a4060',
                  padding: '4px', display: 'flex',
                }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Strength meter */}
            {form.password && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        height: '3px',
                        flex: 1,
                        borderRadius: '999px',
                        background: i <= strength ? STRENGTH_COLORS[strength] : 'rgba(124,58,237,0.1)',
                        transition: 'background 0.3s',
                      }}
                    />
                  ))}
                </div>
                {strength > 0 && (
                  <p style={{
                    fontSize: '11px',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: STRENGTH_COLORS[strength],
                    marginBottom: '8px',
                  }}>
                    {STRENGTH_LABELS[strength]} password
                  </p>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {rules.map((r) => (
                    <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px' }}>
                      {r.met
                        ? <Check size={11} style={{ color: '#86efac', flexShrink: 0 }} />
                        : <X size={11} style={{ color: '#3a3750', flexShrink: 0 }} />
                      }
                      <span style={{
                        color: r.met ? '#8b8699' : '#3a3750',
                        fontFamily: "'JetBrains Mono', monospace",
                        transition: 'color 0.2s',
                      }}>
                        {r.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {errors.password && (
              <p style={{ marginTop: '5px', fontSize: '11px', color: '#f87171', fontFamily: "'JetBrains Mono', monospace" }}>
                ✕ {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label style={labelStyle('confirm')}>Confirm Password</label>
            <input
              type="password"
              value={form.confirm}
              onChange={update('confirm')}
              onFocus={() => setFocused('confirm')}
              onBlur={() => setFocused(null)}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isLoading}
              style={inputStyle('confirm')}
            />
            {form.confirm && form.confirm === form.password && (
              <p style={{ marginTop: '5px', fontSize: '11px', color: '#86efac', fontFamily: "'JetBrains Mono', monospace", display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Check size={11} /> Passwords match
              </p>
            )}
            {errors.confirm && (
              <p style={{ marginTop: '5px', fontSize: '11px', color: '#f87171', fontFamily: "'JetBrains Mono', monospace" }}>
                ✕ {errors.confirm}
              </p>
            )}
          </div>

          {/* Form error */}
          {errors.form && (
            <div style={{
              padding: '12px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              color: '#fca5a5',
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.18)',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              ✕ {errors.form}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '13px',
              background: isLoading ? 'rgba(124,58,237,0.45)' : '#7c3aed',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: "'Space Grotesk', sans-serif",
              border: 'none',
              borderRadius: '12px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              letterSpacing: '0.01em',
              transition: 'background 0.2s, transform 0.1s',
              marginTop: '4px',
            }}
            onMouseEnter={(e) => { if (!isLoading) (e.currentTarget.style.background = '#6d28d9'); }}
            onMouseLeave={(e) => { if (!isLoading) (e.currentTarget.style.background = '#7c3aed'); }}
            onMouseDown={(e) => { if (!isLoading) (e.currentTarget.style.transform = 'scale(0.98)'); }}
            onMouseUp={(e) => { (e.currentTarget.style.transform = 'scale(1)'); }}
          >
            {isLoading
              ? <><Loader2 size={15} className="animate-spin" /> Creating account...</>
              : <><UserPlus size={15} /> Create Account</>
            }
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(124,58,237,0.08)' }} />
          <span style={{ fontSize: '11px', color: '#3a3750', fontFamily: "'JetBrains Mono', monospace" }}>
            or continue with
          </span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(124,58,237,0.08)' }} />
        </div>

        {/* Google */}
        <button
          type="button"
          style={{
            width: '100%',
            padding: '11px',
            background: 'transparent',
            border: '1px solid rgba(124,58,237,0.14)',
            borderRadius: '12px',
            color: '#8b84a3',
            fontSize: '13.5px',
            fontFamily: "'Inter', sans-serif",
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '9px',
            transition: 'border-color 0.2s, color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)';
            e.currentTarget.style.color = '#c4b5fd';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(124,58,237,0.14)';
            e.currentTarget.style.color = '#8b84a3';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#a78bfa"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#7c3aed"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#6d28d9"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#5b21b6"/>
          </svg>
          Continue with Google
        </button>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#4a475e' }}>
          Already have an account?{' '}
          <Link
            href="/auth/login"
            style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#c4b5fd')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#a78bfa')}
          >
            Sign in
          </Link>
        </p>

        <p style={{
          textAlign: 'center',
          marginTop: '10px',
          fontSize: '11px',
          color: '#2e2b3d',
          fontFamily: "'JetBrains Mono', monospace",
          lineHeight: 1.6,
        }}>
          By creating an account you agree to our{' '}
          <Link href="/terms" style={{ color: '#5c4fa0', textDecoration: 'none' }}>Terms</Link>
          {' '}&amp;{' '}
          <Link href="/privacy" style={{ color: '#5c4fa0', textDecoration: 'none' }}>Privacy</Link>
        </p>
      </div>
    </div>
  );
}