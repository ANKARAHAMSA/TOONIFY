/**
 * GenerateButton.jsx
 * Gradient CTA button with shimmer animation while loading.
 */
export default function GenerateButton({ onClick, loading, disabled }) {
  return (
    <button
      id="generate-btn"
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative w-full rounded-xl py-4 px-8
        font-outfit font-bold text-base tracking-wide
        overflow-hidden transition-all duration-300
        ${disabled || loading
          ? 'opacity-50 cursor-not-allowed bg-white/10 text-white/40'
          : `
            bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600
            bg-[length:200%_100%] text-white
            hover:bg-right-top hover:shadow-[0_0_35px_rgba(139,92,246,0.55)]
            hover:scale-[1.01] active:scale-[0.99]
            animate-gradient
          `
        }
      `}
      style={
        (!disabled && !loading)
          ? { backgroundSize: '200% 100%', animation: 'gradientShift 3s ease infinite' }
          : {}
      }
    >
      {loading ? (
        <span className="flex items-center justify-center gap-3">
          <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Generating…
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <span>✨</span>
          Cartoonize
        </span>
      )}

      {/* Shimmer sweep while loading */}
      {loading && (
        <span
          className="absolute inset-0 -translate-x-full animate-shimmer"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      )}

      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </button>
  )
}
