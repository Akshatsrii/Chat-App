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
const STRENGTH_COLORS = ['', '#ff3366', '#ffb800', '#00d4ff', '#00e5a0'];

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

  return (
    <div className="w-full max-w-md">
      <div className="flex lg:hidden items-center gap-3 mb-10 justify-center animate-fade-in-up">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00d4ff, #9966ff)' }}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 1L15 5v6l-7 4L1 11V5L8 1z" stroke="#060810" strokeWidth="1.5" strokeLinejoin="round" /></svg>
        </div>
        <span className="font-display font-extrabold text-2xl text-text-bright">NexusChat</span>
      </div>

      <div className="animate-fade-in-up glass-bright rounded-2xl p-8" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,212,255,0.06)' }}>
        <div className="mb-7">
          <div className="w-12 h-12 rounded-2xl mb-4 flex items-center justify-center" style={{ background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.15)' }}>
            <UserPlus size={20} style={{ color: 'var(--color-emerald)' }} />
          </div>
          <h2 className="font-display text-3xl font-bold text-text-bright mb-1">Create account</h2>
          <p className="text-text-dim text-sm">Join the conversation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(['username', 'email'] as const).map((field) => (
            <div key={field}>
              <label className="block text-xs font-mono uppercase tracking-widest mb-2" style={{ color: focused === field ? 'var(--color-cyan)' : 'var(--color-subtle)' }}>
                {field === 'username' ? 'Username' : 'Email'}
              </label>
              <input
                type={field === 'email' ? 'email' : 'text'}
                value={form[field]}
                onChange={update(field)}
                onFocus={() => setFocused(field)}
                onBlur={() => setFocused(null)}
                placeholder={field === 'username' ? 'cooluser_42' : 'you@example.com'}
                autoComplete={field}
                className={`input-field ${errors[field] ? 'error' : ''}`}
                disabled={isLoading}
              />
              {errors[field] && <p className="mt-1.5 text-xs text-rose font-mono">{errors[field]}</p>}
            </div>
          ))}

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest mb-2" style={{ color: focused === 'password' ? 'var(--color-cyan)' : 'var(--color-subtle)' }}>
              Password
            </label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={form.password} onChange={update('password')}
                onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                placeholder="••••••••" autoComplete="new-password"
                className={`input-field pr-12 ${errors.password ? 'error' : ''}`} disabled={isLoading} />
              <button type="button" onClick={() => setShowPw((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 btn-icon" tabIndex={-1}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.password && (
              <div className="mt-2 space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-1 flex-1 rounded-full transition-all duration-400"
                      style={{ background: i <= strength ? STRENGTH_COLORS[strength] : 'var(--color-border)' }} />
                  ))}
                </div>
                {strength > 0 && <p className="text-xs font-mono" style={{ color: STRENGTH_COLORS[strength] }}>{STRENGTH_LABELS[strength]} password</p>}
                <div className="space-y-1 pt-1">
                  {rules.map((r) => (
                    <div key={r.label} className="flex items-center gap-2 text-xs">
                      {r.met ? <Check size={11} style={{ color: 'var(--color-emerald)' }} /> : <X size={11} style={{ color: 'var(--color-muted)' }} />}
                      <span style={{ color: r.met ? 'var(--color-text-dim)' : 'var(--color-muted)' }}>{r.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {errors.password && <p className="mt-1.5 text-xs text-rose font-mono">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest mb-2" style={{ color: focused === 'confirm' ? 'var(--color-cyan)' : 'var(--color-subtle)' }}>
              Confirm Password
            </label>
            <input type="password" value={form.confirm} onChange={update('confirm')}
              onFocus={() => setFocused('confirm')} onBlur={() => setFocused(null)}
              placeholder="••••••••" autoComplete="new-password"
              className={`input-field ${errors.confirm ? 'error' : ''}`} disabled={isLoading} />
            {errors.confirm && <p className="mt-1.5 text-xs text-rose font-mono">{errors.confirm}</p>}
          </div>

          {errors.form && (
            <div className="px-4 py-3 rounded-xl text-rose text-sm animate-fade-in-scale" style={{ background: 'rgba(255,51,102,0.08)', border: '1px solid rgba(255,51,102,0.2)' }}>
              {errors.form}
            </div>
          )}

          <button type="submit" disabled={isLoading} className="btn-primary w-full" style={{ background: 'linear-gradient(135deg, #00b87e, #00e5a0)' }}>
            {isLoading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : <><UserPlus size={16} /> Create Account</>}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-text-dim text-sm">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold" style={{ color: 'var(--color-cyan)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
