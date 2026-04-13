'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AxiosError } from 'axios';

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!identifier.trim()) errs.identifier = 'Required';
    if (!password) errs.password = 'Required';
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await login({ identifier: identifier.trim(), password });
      toast.success('Welcome back! 👋');
      router.push('/chat');
    } catch (err) {
      const msg = (err as AxiosError<{ error: { message: string } }>).response?.data?.error?.message || 'Invalid credentials';
      toast.error(msg);
      setErrors({ form: msg });
    } finally { setIsLoading(false); }
  };

  return (
    <div className="w-full max-w-md">
      {/* Mobile logo */}
      <div className="flex lg:hidden items-center gap-3 mb-10 justify-center animate-fade-in-up">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00d4ff, #9966ff)' }}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 1L15 5v6l-7 4L1 11V5L8 1z" stroke="#060810" strokeWidth="1.5" strokeLinejoin="round" /></svg>
        </div>
        <span className="font-display font-extrabold text-2xl text-text-bright tracking-tight">NexusChat</span>
      </div>

      <div className="animate-fade-in-up glass-bright rounded-2xl p-8" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,212,255,0.06)' }}>
        <div className="mb-8">
          <div className="w-12 h-12 rounded-2xl mb-4 flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.15)' }}>
            <LogIn size={20} className="text-cyan" />
          </div>
          <h2 className="font-display text-3xl font-bold text-text-bright mb-1">Sign in</h2>
          <p className="text-text-dim text-sm">Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest mb-2" style={{ color: focusedField === 'id' ? 'var(--color-cyan)' : 'var(--color-subtle)' }}>
              Email or Username
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => { setIdentifier(e.target.value); setErrors((p) => ({ ...p, identifier: '' })); }}
              onFocus={() => setFocusedField('id')}
              onBlur={() => setFocusedField(null)}
              placeholder="you@example.com"
              autoComplete="username"
              className={`input-field ${errors.identifier ? 'error' : ''}`}
              disabled={isLoading}
            />
            {errors.identifier && <p className="mt-1.5 text-xs text-rose font-mono">{errors.identifier}</p>}
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest mb-2" style={{ color: focusedField === 'pw' ? 'var(--color-cyan)' : 'var(--color-subtle)' }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                onFocus={() => setFocusedField('pw')}
                onBlur={() => setFocusedField(null)}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`input-field pr-12 ${errors.password ? 'error' : ''}`}
                disabled={isLoading}
              />
              <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 btn-icon" tabIndex={-1}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="mt-1.5 text-xs text-rose font-mono">{errors.password}</p>}
          </div>

          {errors.form && (
            <div className="px-4 py-3 rounded-xl text-rose text-sm animate-fade-in-scale" style={{ background: 'rgba(255,51,102,0.08)', border: '1px solid rgba(255,51,102,0.2)' }}>
              {errors.form}
            </div>
          )}

          <button type="submit" disabled={isLoading} className="btn-primary w-full mt-1">
            {isLoading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : <><LogIn size={16} /> Sign In</>}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-text-dim text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="font-semibold transition-colors" style={{ color: 'var(--color-cyan)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-cyan-glow)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-cyan)')}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
