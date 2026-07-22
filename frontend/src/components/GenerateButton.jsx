/**
 * GenerateButton.jsx — Premium redesign
 */
export default function GenerateButton({ onClick, loading, disabled }) {
  return (
    <button
      id="generate-btn"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        width: '100%', padding: '16px 32px',
        borderRadius: '16px',
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 800, fontSize: '16px',
        letterSpacing: '0.02em',
        border: 'none', cursor: disabled || loading ? 'not-allowed' : 'pointer',
        position: 'relative', overflow: 'hidden',
        transition: 'all 0.3s ease',
        background: disabled || loading
          ? 'rgba(255,255,255,0.06)'
          : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 30%, #4f46e5 70%, #7c3aed 100%)',
        backgroundSize: disabled || loading ? 'auto' : '300% 100%',
        animation: (!disabled && !loading) ? 'gradientShift 4s ease infinite' : 'none',
        color: disabled || loading ? 'rgba(255,255,255,0.25)' : '#fff',
        boxShadow: disabled || loading
          ? 'none'
          : '0 4px 30px rgba(124,58,237,0.5), 0 1px 0 rgba(255,255,255,0.1) inset',
        transform: 'translateY(0)',
      }}
      onMouseEnter={e => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 8px 40px rgba(124,58,237,0.65), 0 1px 0 rgba(255,255,255,0.15) inset'
        }
      }}
      onMouseLeave={e => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 30px rgba(124,58,237,0.5), 0 1px 0 rgba(255,255,255,0.1) inset'
        }
      }}
      onMouseDown={e => { if (!disabled && !loading) e.currentTarget.style.transform = 'translateY(1px)' }}
      onMouseUp={e => { if (!disabled && !loading) e.currentTarget.style.transform = 'translateY(-2px)' }}
    >
      {loading ? (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <span style={{
            width: '20px', height: '20px',
            border: '2.5px solid rgba(255,255,255,0.2)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.8s linear infinite',
          }} />
          Generating your cartoon…
        </span>
      ) : (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>✨</span>
          Cartoonize My Photo
        </span>
      )}

      {/* Shimmer sweep */}
      {!disabled && !loading && (
        <span style={{
          position: 'absolute', top: 0, left: 0, bottom: 0, width: '60px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
          animation: 'shimmer 3s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </button>
  )
}
