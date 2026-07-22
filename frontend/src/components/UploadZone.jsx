/**
 * UploadZone.jsx — Premium redesign
 */
import { useRef, useState, useCallback } from 'react'

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_MB = 10

export default function UploadZone({ onImageSelect, preview }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')

  const validate = (file) => {
    if (!ACCEPTED.includes(file.type)) { setError('Please upload a JPEG, PNG, or WebP image.'); return false }
    if (file.size > MAX_MB * 1024 * 1024) { setError(`Max ${MAX_MB} MB.`); return false }
    setError(''); return true
  }

  const handleFile = useCallback((file) => {
    if (!file || !validate(file)) return
    onImageSelect(file, URL.createObjectURL(file))
  }, [onImageSelect])

  const onDrop = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]) }
  const onInputChange = (e) => handleFile(e.target.files?.[0])

  return (
    <div className="w-full">
      <div
        id="upload-zone"
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          borderRadius: '20px',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          height: preview ? '320px' : '220px',
          border: dragging
            ? '2px solid rgba(139,92,246,0.8)'
            : '2px dashed rgba(255,255,255,0.1)',
          background: dragging
            ? 'rgba(139,92,246,0.08)'
            : preview ? 'transparent' : 'rgba(255,255,255,0.02)',
          boxShadow: dragging ? '0 0 40px rgba(139,92,246,0.25), inset 0 0 40px rgba(139,92,246,0.05)' : 'none',
        }}
      >
        {preview ? (
          <>
            <img src={preview} alt="Uploaded preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {/* Overlay on hover */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
              padding: '24px', opacity: 0, transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0}
            >
              <div style={{
                background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px',
                padding: '8px 20px', color: '#fff', fontSize: '13px', fontWeight: 600,
              }}>
                📂 Click to change photo
              </div>
            </div>
          </>
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '100%', gap: '12px', padding: '32px',
          }}>
            {/* Animated icon */}
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(244,114,182,0.15))',
              border: '1px solid rgba(139,92,246,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '30px',
              animation: 'pulse-ring 3s ease-in-out infinite',
            }}>
              📸
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#e2e0ff', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '17px' }}>
                Drop your photo here
              </p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginTop: '4px' }}>
                or click to browse — JPEG · PNG · WebP · max {MAX_MB} MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p style={{ color: '#f87171', fontSize: '13px', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          ⚠️ {error}
        </p>
      )}

      <input ref={inputRef} type="file" accept={ACCEPTED.join(',')} style={{ display: 'none' }} onChange={onInputChange} id="file-input" />
    </div>
  )
}
