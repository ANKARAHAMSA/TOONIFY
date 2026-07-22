/**
 * FaceLock.jsx — Milestone 2 Face Identity Lock Component
 * Allows users to enable IP-Adapter face consistency.
 */
import { useRef, useState } from 'react'

export default function FaceLock({ enabled, onToggle, faceFile, facePreview, onFaceSelect, disabled }) {
  const fileInputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onFaceSelect(file, URL.createObjectURL(file))
  }

  return (
    <div style={{
      borderRadius: '16px',
      border: `1.5px solid ${enabled ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.06)'}`,
      background: enabled ? 'rgba(139,92,246,0.04)' : 'rgba(255,255,255,0.02)',
      padding: '16px 20px',
      transition: 'all 0.25s ease',
      boxShadow: enabled ? '0 0 20px rgba(139,92,246,0.12)' : 'none',
    }}>
      {/* Header & Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🔒</span>
          <div>
            <p style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '14px',
              color: enabled ? '#c4b5fd' : 'rgba(255,255,255,0.85)',
            }}>
              Lock Face Identity <span style={{ fontSize: '10px', background: 'rgba(139,92,246,0.2)', padding: '2px 8px', borderRadius: '99px', color: '#a78bfa', marginLeft: '6px' }}>IP-Adapter</span>
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
              Preserve your exact face shape & features in the cartoon
            </p>
          </div>
        </div>

        {/* Toggle Pill */}
        <button
          type="button"
          onClick={() => !disabled && onToggle(!enabled)}
          disabled={disabled}
          style={{
            width: '46px', height: '26px', borderRadius: '99px',
            background: enabled ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'rgba(255,255,255,0.1)',
            border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
            position: 'relative', transition: 'all 0.25s ease', flexShrink: 0,
            padding: '3px',
          }}
        >
          <div style={{
            width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
            transform: enabled ? 'translateX(20px)' : 'translateX(0)',
            transition: 'transform 0.25s ease',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }} />
        </button>
      </div>

      {/* Expanded sub-zone if face lock enabled */}
      {enabled && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '10px' }}>
            Reference headshot: <span style={{ color: 'rgba(255,255,255,0.3)' }}>(Defaults to uploaded photo if empty)</span>
          </p>

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            style={{
              height: '80px', borderRadius: '12px',
              border: `1.5px dashed ${dragging ? '#a78bfa' : 'rgba(255,255,255,0.12)'}`,
              background: dragging ? 'rgba(139,92,246,0.1)' : 'rgba(0,0,0,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              cursor: 'pointer', overflow: 'hidden', padding: '8px 16px',
            }}
          >
            {facePreview ? (
              <>
                <img src={facePreview} alt="Face reference" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#e0dbff' }}>Custom headshot attached</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Click to change face reference</p>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                  👤 Drop a distinct face photo (optional)
                </p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                  If left blank, main uploaded photo will be used for face identity
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onFaceSelect(file, URL.createObjectURL(file))
            }}
          />
        </div>
      )}
    </div>
  )
}
