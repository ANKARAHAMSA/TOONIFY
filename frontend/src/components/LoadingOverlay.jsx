/**
 * LoadingOverlay.jsx
 * Full-panel loading state shown during SD inference.
 */
export default function LoadingOverlay({ style }) {
  const messages = [
    'Initializing neural networks…',
    'Applying style transfer…',
    'Adding cartoon magic…',
    'Polishing the details…',
    'Almost there…',
  ]

  return (
    <div className="w-full h-72 rounded-2xl border border-purple-500/20 bg-purple-500/5 flex flex-col items-center justify-center gap-6 animate-pulse-slow">
      {/* Animated spinner ring */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400 animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-indigo-300 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          🎨
        </div>
      </div>

      <div className="text-center">
        <p className="text-white font-semibold font-outfit">
          Generating {style ? `"${style}"` : ''} cartoon…
        </p>
        <p className="text-white/40 text-sm mt-1">
          This can take 15–60 seconds
        </p>
      </div>

      {/* Animated progress dots */}
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-purple-400/60"
            style={{
              animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40%            { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
