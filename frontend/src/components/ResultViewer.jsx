/**
 * ResultViewer.jsx — Premium redesign
 * Side-by-side before/after with draggable reveal slider
 */
import { useState, useRef } from 'react'

export default function ResultViewer({ originalUrl, resultUrl, onReset }) {
  const [sliderX, setSliderX] = useState(50)
  const containerRef = useRef(null)
  const dragging = useRef(false)

  const getPercent = (clientX) => {
    const rect = containerRef.current.getBoundingClientRect()
    return Math.max(2, Math.min(((clientX - rect.left) / rect.width) * 100, 98))
  }

  const onPointerMove = (e) => {
    if (!dragging.current) return
    setSliderX(getPercent(e.clientX))
  }

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = 'cartoon.jpg'
    a.click()
  }

  return (
    <div style={{ width: '100%', animation: 'fadeUp 0.5s ease forwards' }}>

      {/* Comparison viewer */}
      <div
        ref={containerRef}
        id="result-viewer"
        onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId) }}
        onPointerUp={() => (dragging.current = false)}
        onPointerMove={onPointerMove}
        style={{
          position: 'relative', width: '100%', height: '380px',
          borderRadius: '20px', overflow: 'hidden',
          cursor: 'col-resize', userSelect: 'none',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Cartoon — full background */}
        <img
          src={resultUrl}
          alt="Cartoon result"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Original — clipped to left side */}
        <div style={{ position: 'absolute', inset: 0, width: `${sliderX}%`, overflow: 'hidden' }}>
          <img
            src={originalUrl}
            alt="Original photo"
            style={{
              position: 'absolute', top: 0, left: 0, height: '100%', objectFit: 'cover',
              width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%',
            }}
          />
        </div>

        {/* Labels */}
        <div style={{
          position: 'absolute', top: '16px', left: '16px',
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '8px', padding: '4px 12px',
          fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.8)',
          pointerEvents: 'none',
        }}>
          Original
        </div>
        <div style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'rgba(124,58,237,0.55)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(167,139,250,0.3)',
          borderRadius: '8px', padding: '4px 12px',
          fontSize: '12px', fontWeight: 600, color: '#c4b5fd',
          pointerEvents: 'none',
        }}>
          Cartoon ✨
        </div>

        {/* Slider line */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0, left: `${sliderX}%`,
          width: '2px',
          background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.9) 20%, rgba(255,255,255,0.9) 80%, transparent)',
          boxShadow: '0 0 10px rgba(255,255,255,0.5)',
          pointerEvents: 'none',
        }}>
          {/* Handle */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.95)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', color: '#4c1d95', fontWeight: 800,
            pointerEvents: 'none',
          }}>
            ⇔
          </div>
        </div>

        {/* Bottom drag hint */}
        <div style={{
          position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '99px', padding: '4px 16px',
          fontSize: '11px', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}>
          ← Drag to compare →
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
        <button
          id="download-btn"
          onClick={handleDownload}
          style={{
            flex: 1, padding: '14px 24px',
            borderRadius: '14px', border: 'none',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            color: '#fff', fontSize: '15px', fontWeight: 700,
            fontFamily: 'Outfit, sans-serif',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: '0 4px 24px rgba(124,58,237,0.45)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.65)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(124,58,237,0.45)'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          ⬇️ Download Cartoon
        </button>

        <button
          id="reset-btn"
          onClick={onReset}
          style={{
            padding: '14px 24px', borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)',
            color: 'rgba(255,255,255,0.55)', fontSize: '14px', fontWeight: 600,
            fontFamily: 'Outfit, sans-serif',
            cursor: 'pointer', transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
        >
          Try Another
        </button>
      </div>
    </div>
  )
}
