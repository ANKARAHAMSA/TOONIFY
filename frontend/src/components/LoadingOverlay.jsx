/**
 * LoadingOverlay.jsx — Premium redesign
 */
export default function LoadingOverlay({ style: styleName }) {
  return (
    <div style={{
      width: '100%', minHeight: '260px', borderRadius: '20px',
      border: '1px solid rgba(139,92,246,0.2)',
      background: 'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(99,102,241,0.04) 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '24px', padding: '40px',
      animation: 'scaleIn 0.4s ease forwards',
    }}>
      {/* Nested spinner rings */}
      <div style={{ position: 'relative', width: '80px', height: '80px' }}>
        {/* Outer glow */}
        <div style={{
          position: 'absolute', inset: '-8px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          animation: 'pulse-ring 2s ease-in-out infinite',
        }} />
        {/* Ring 1 */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '3px solid rgba(139,92,246,0.15)',
        }} />
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '3px solid transparent',
          borderTopColor: '#a78bfa',
          animation: 'spin 1s linear infinite',
        }} />
        {/* Ring 2 — inner, reverse */}
        <div style={{
          position: 'absolute', inset: '12px', borderRadius: '50%',
          border: '3px solid transparent',
          borderTopColor: '#f472b6',
          animation: 'spin 0.7s linear infinite reverse',
        }} />
        {/* Center emoji */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: '22px',
        }}>
          🎨
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '18px',
          color: '#e0dbff',
        }}>
          Creating your {styleName && <span style={{ color: '#a78bfa' }}>{styleName}</span>} cartoon…
        </p>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginTop: '6px' }}>
          This takes 15–60 seconds · Please wait
        </p>
      </div>

      {/* Bouncing dots */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{
            width: i === 2 ? '10px' : '7px',
            height: i === 2 ? '10px' : '7px',
            borderRadius: '50%',
            background: i === 2 ? '#a78bfa' : 'rgba(167,139,250,0.5)',
            animation: `bounce-dot 1.4s ease-in-out ${i * 0.15}s infinite`,
          }} />
        ))}
      </div>
    </div>
  )
}
