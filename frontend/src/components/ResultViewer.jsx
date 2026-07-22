/**
 * ResultViewer.jsx
 * Side-by-side before/after comparison with download button.
 * Uses a slider to reveal original vs cartoon.
 */
import { useState, useRef } from 'react'

export default function ResultViewer({ originalUrl, resultUrl, onReset }) {
  const [sliderX, setSliderX] = useState(50) // percent
  const containerRef = useRef(null)
  const dragging = useRef(false)

  const getPercent = (clientX) => {
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    return (x / rect.width) * 100
  }

  const onMouseMove = (e) => {
    if (!dragging.current) return
    setSliderX(getPercent(e.clientX))
  }

  const onTouchMove = (e) => {
    if (!dragging.current) return
    setSliderX(getPercent(e.touches[0].clientX))
  }

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = 'cartoon.jpg'
    a.click()
  }

  return (
    <div className="w-full flex flex-col gap-4 animate-[fadeInUp_0.5s_ease_forwards]">
      {/* Labels */}
      <div className="flex justify-between text-xs text-white/40 font-inter px-1">
        <span>Original</span>
        <span className="text-purple-400 font-semibold">← Drag to compare →</span>
        <span>Cartoon</span>
      </div>

      {/* Comparison slider */}
      <div
        id="result-viewer"
        ref={containerRef}
        className="relative w-full h-80 rounded-2xl overflow-hidden cursor-col-resize select-none border border-white/8 shadow-2xl"
        onMouseDown={() => (dragging.current = true)}
        onMouseUp={() => (dragging.current = false)}
        onMouseLeave={() => (dragging.current = false)}
        onMouseMove={onMouseMove}
        onTouchStart={() => (dragging.current = true)}
        onTouchEnd={() => (dragging.current = false)}
        onTouchMove={onTouchMove}
      >
        {/* Cartoon (bottom layer, full width) */}
        <img
          src={resultUrl}
          alt="Cartoon result"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Original (top layer, clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderX}%` }}
        >
          <img
            src={originalUrl}
            alt="Original photo"
            className="absolute inset-0 h-full object-cover"
            style={{ width: containerRef.current?.offsetWidth + 'px' }}
          />
        </div>

        {/* Slider handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]"
          style={{ left: `${sliderX}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center">
            <span className="text-xs text-gray-700 font-bold select-none">⇔</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          id="download-btn"
          onClick={handleDownload}
          className="
            flex-1 py-3 rounded-xl font-semibold text-sm
            bg-gradient-to-r from-purple-600 to-indigo-500
            text-white hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]
            hover:scale-[1.02] active:scale-[0.98]
            transition-all duration-200 flex items-center justify-center gap-2
          "
        >
          <span>⬇️</span> Download Cartoon
        </button>

        <button
          id="reset-btn"
          onClick={onReset}
          className="
            px-6 py-3 rounded-xl font-semibold text-sm
            border border-white/10 text-white/60
            hover:border-white/20 hover:text-white hover:bg-white/5
            transition-all duration-200
          "
        >
          Try Another
        </button>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
