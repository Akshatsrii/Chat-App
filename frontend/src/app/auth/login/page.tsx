import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen grid md:grid-cols-2" style={{ background: '#0a0a0f', fontFamily: "'Inter', sans-serif" }}>

      {/* LEFT SIDE */}
      <div className="flex flex-col justify-center px-10 md:px-20 relative overflow-hidden">

        {/* Purple glow blobs */}
        <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-24 -right-16 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.10) 0%, transparent 70%)' }} />

        {/* Badge */}
        <div className="flex items-center gap-2 w-fit mb-6 px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#7c3aed' }} />
          Now in v2.0
        </div>

        <h1 className="text-5xl font-extrabold leading-tight tracking-tight" style={{ color: '#f3f0ff', letterSpacing: '-0.03em' }}>
          Real-time <br />
          <span style={{ color: '#a78bfa' }}>conversations.</span> <br />
          Redefined.
        </h1>

        <p className="mt-4 max-w-md text-sm leading-relaxed" style={{ color: '#6b6880' }}>
          Join chat rooms, connect with people, and experience messaging built for the modern web.
        </p>

        {/* Features */}
        <div className="mt-8 flex flex-col gap-3">
          {[
            { label: 'End-to-end encrypted messages' },
            { label: 'Private rooms & group channels' },
            { label: 'Sub-10ms real-time delivery' },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-3 text-sm" style={{ color: '#8b8699' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}>
                <div className="w-2 h-2 rounded-full" style={{ background: '#a78bfa' }} />
              </div>
              {f.label}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center justify-center p-8" style={{ background: '#0d0d14', borderLeft: '1px solid rgba(124,58,237,0.08)' }}>
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>

    </div>
  );
}