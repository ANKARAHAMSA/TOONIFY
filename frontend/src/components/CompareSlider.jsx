/**
 * CompareSlider.jsx — Phase D
 * Side-by-side drag-divider comparison between original photo and cartoon result.
 * Pure CSS + pointer events — no external library.
 */
import { useRef, useEffect, useState, useCallback } from 'react'

export default function CompareSlider({ originalSrc, cartoonSrc, onDownload }) {
  const containerRef = useRef(null)
  const [dividerX, setDividerX] = useState(50)   // percentage
  const [dragging, setDragging] = useState(false)
  const [loaded, setLoaded] = useState({ original: false, cartoon: false })

  const updateDivider = useCallback((clientX) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    setDividerX(pct)
  }, [])

  // Pointer events (works for mouse + touch)
  const onPointerDown = (e) => {
    e.preventDefault()
    containerRef.current?.setPointerCapture(e.pointerId)
    setDragging(true)
    updateDivider(e.clientX)
  }
  const onPointerMove = (e) => {
    if (!dragging) return
    updateDivider(e.clientX)
  }
  const onPointerUp = () => setDragging(false)

  // Keyboard accessibility
  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') setDividerX((x) => Math.max(0, x - 5))
    if (e.key === 'ArrowRight') setDividerX((x) => Math.min(100, x + 5))
  }

  const allLoaded = loaded.original && loaded.cartoon

  return (
    <div className="compare-wrapper">
      <div
        ref={containerRef}
        className={`compare-container${dragging ? ' dragging' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ '--divider': `${dividerX}%` }}
      >
        {/* Original photo (right side) */}
        <div className="compare-panel compare-panel--original">
          <img
            src={originalSrc}
            alt="Original photo"
            className="compare-img"
            onLoad={() => setLoaded((l) => ({ ...l, original: true }))}
          />
          <span className="compare-label compare-label--left">Original</span>
        </div>

        {/* Cartoon result (left side, clipped by divider) */}
        <div
          className="compare-panel compare-panel--cartoon"
          style={{ clipPath: `inset(0 ${100 - dividerX}% 0 0)` }}
        >
          <img
            src={cartoonSrc}
            alt="Cartoon result"
            className="compare-img"
            onLoad={() => setLoaded((l) => ({ ...l, cartoon: true }))}
          />
          <span className="compare-label compare-label--right">Cartoon</span>
        </div>

        {/* Divider handle */}
        <div
          className="compare-divider"
          style={{ left: `${dividerX}%` }}
          role="slider"
          aria-label="Before/After comparison divider"
          aria-valuenow={Math.round(dividerX)}
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={0}
          onKeyDown={onKeyDown}
        >
          <div className="compare-handle">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M6 10L2 6M6 10L2 14M14 10L18 6M14 10L18 14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Loading overlay */}
        {!allLoaded && (
          <div className="compare-loading">
            <div className="compare-spinner" />
          </div>
        )}
      </div>

      {/* Download row */}
      <div className="compare-actions">
        <button
          type="button"
          className="compare-dl-btn"
          onClick={() => onDownload?.('original')}
        >
          ⬇ Original
        </button>
        <button
          type="button"
          className="compare-dl-btn compare-dl-btn--primary"
          onClick={() => onDownload?.('cartoon')}
        >
          ⬇ Cartoon
        </button>
        <button
          type="button"
          className="compare-dl-btn"
          onClick={() => onDownload?.('both')}
        >
          ⬇ Both
        </button>
      </div>
    </div>
  )
}
