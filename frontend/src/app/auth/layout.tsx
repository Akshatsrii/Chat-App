export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex h-screen overflow-hidden"
      style={{ background: '#0a0a0f', fontFamily: "'Inter', sans-serif" }}
    >
      {/* Glow blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)', filter: 'blur(80px)' }} />

      {/* LEFT — Branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 p-12 relative overflow-hidden"
        style={{ borderRight: '1px solid rgba(124,58,237,0.1)' }}
      >
        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(124,58,237,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.04) 1px,transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#7c3aed' }}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L15 5v6l-7 4L1 11V5L8 1z" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '19px', color: '#f3f0ff', letterSpacing: '-0.02em' }}>
            NexusChat
          </span>
        </div>

        {/* Hero */}
        <div className="relative z-10">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.22)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#7c3aed' }} />
            <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: '#a78bfa', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Live — v2.0
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: '2.8rem',
            fontWeight: 700,
            lineHeight: 1.1,
            color: '#f3f0ff',
            letterSpacing: '-0.04em',
            marginBottom: '16px',
          }}>
            Where teams<br />
            <span style={{ color: '#a78bfa' }}>connect.</span><br />
            Instantly.
          </h1>
          <p style={{ fontSize: '15px', color: '#6b6880', lineHeight: 1.7, maxWidth: '300px' }}>
            Real-time messaging, secure rooms, and live presence — built for the modern web.
          </p>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-3">
          {[
            { num: '12k+', label: 'Active users' },
            { num: '<10ms', label: 'Latency' },
            { num: '99.9%', label: 'Uptime' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-3"
              style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.1)' }}>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '1.3rem', fontWeight: 700, color: '#c4b5fd' }}>
                {s.num}
              </div>
              <div style={{ fontSize: '11px', color: '#5c5870', marginTop: '2px', fontFamily: "'JetBrains Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-3">
          {[
            { label: 'End-to-end encrypted rooms' },
            { label: 'JWT-secured authentication' },
            { label: 'Multiple live chat rooms' },
            { label: 'Live user presence indicators' },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-3 text-sm" style={{ color: '#8b8699' }}>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.18)' }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#7c3aed' }} />
              </div>
              {f.label}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — Form */}
      <div className="flex-1 flex items-center justify-center p-6" style={{ background: '#0d0d14' }}>
        {children}
      </div>
    </div>
  );
}