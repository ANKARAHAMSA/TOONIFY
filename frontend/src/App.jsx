/**
 * App.jsx — AI Cartoon Generator (Milestone 2 Redesign)
 */
import { useState, useEffect, useCallback } from 'react'
import { getHealth, getStyles, cartoonize } from './api'
import UploadZone from './components/UploadZone'
import StylePicker from './components/StylePicker'
import GenerateButton from './components/GenerateButton'
import ResultViewer from './components/ResultViewer'
import LoadingOverlay from './components/LoadingOverlay'
import FaceLock from './components/FaceLock'

// ─── Status Badge ─────────────────────────────────────────────────────────
function StatusBadge({ health }) {
  if (!health) return null
  const isMock = health.mock_mode
  const isOk = health.model_loaded
  const isIPAdapter = health.ip_adapter_loaded

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '7px',
        padding: '5px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        color: isMock ? '#fbbf24' : isOk ? '#4ade80' : '#fbbf24',
        border: `1px solid ${isMock ? 'rgba(251,191,36,0.2)' : isOk ? 'rgba(74,222,128,0.2)' : 'rgba(251,191,36,0.2)'}`,
        background: isMock ? 'rgba(251,191,36,0.06)' : isOk ? 'rgba(74,222,128,0.06)' : 'rgba(251,191,36,0.06)',
      }}>
        <span style={{
          width: '7px', height: '7px', borderRadius: '50%',
          background: isMock ? '#fbbf24' : isOk ? '#4ade80' : '#fbbf24',
          boxShadow: `0 0 6px ${isMock ? '#fbbf24' : isOk ? '#4ade80' : '#fbbf24'}`,
          animation: 'pulse-ring 2s ease-in-out infinite',
        }} />
        {isMock ? '⚡ Mock mode' : isOk ? `✓ ${health.device}` : 'Loading model…'}
      </div>

      {isIPAdapter && (
        <span style={{
          padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 600,
          background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
          color: '#c4b5fd',
        }}>
          🔒 IP-Adapter Active
        </span>
      )}
    </div>
  )
}

// ─── Step indicator ──────────────────────────────────────────────────────
function StepBadge({ number, label, active, done }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
    }}>
      <div style={{
        width: '26px', height: '26px', borderRadius: '50%',
        background: done
          ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
          : active
            ? 'rgba(139,92,246,0.2)'
            : 'rgba(255,255,255,0.06)',
        border: `1.5px solid ${done || active ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.1)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '12px', fontWeight: 700,
        color: done ? '#fff' : active ? '#a78bfa' : 'rgba(255,255,255,0.3)',
        flexShrink: 0,
        transition: 'all 0.3s ease',
      }}>
        {done ? '✓' : number}
      </div>
      <span style={{
        fontSize: '13px', fontWeight: 600, fontFamily: 'Inter, sans-serif',
        color: done ? '#a78bfa' : active ? '#e0dbff' : 'rgba(255,255,255,0.3)',
        transition: 'color 0.3s ease',
      }}>
        {label}
      </span>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────
export default function App() {
  const [health, setHealth] = useState(null)
  const [styles, setStyles] = useState([])
  const [selectedStyle, setSelectedStyle] = useState('disney')

  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  // Face lock state
  const [faceLockEnabled, setFaceLockEnabled] = useState(true)
  const [faceFile, setFaceFile] = useState(null)
  const [facePreviewUrl, setFacePreviewUrl] = useState(null)

  const [resultUrl, setResultUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getHealth()
      .then(setHealth)
      .catch(() => setHealth({ status: 'error', model_loaded: false, device: 'none', mock_mode: false }))
    getStyles()
      .then(setStyles)
      .catch(() => {})
  }, [])

  const handleImageSelect = useCallback((file, url) => {
    setImageFile(file); setPreviewUrl(url); setResultUrl(null); setError('')
  }, [])

  const handleFaceSelect = useCallback((file, url) => {
    setFaceFile(file); setFacePreviewUrl(url)
  }, [])

  const handleGenerate = async () => {
    if (!imageFile || !selectedStyle) return
    setLoading(true); setError(''); setResultUrl(null)

    // Use specific faceFile if uploaded, else fall back to main imageFile when faceLock is enabled
    const effectiveFaceFile = faceLockEnabled ? (faceFile || imageFile) : null

    try {
      const result = await cartoonize(imageFile, selectedStyle, {
        faceFile: effectiveFaceFile,
      })
      setResultUrl(result)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Generation failed. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setImageFile(null); setPreviewUrl(null); setResultUrl(null); setError('')
    setFaceFile(null); setFacePreviewUrl(null)
  }

  const selectedStyleLabel = styles.find(s => s.key === selectedStyle)?.label || selectedStyle
  const step1Done = !!imageFile
  const step2Done = step1Done
  const step3Active = step1Done
  const canGenerate = !!imageFile && !loading

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Ambient BG */}
      <div className="bg-ambient" />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(8,8,16,0.75)',
      }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          padding: '0 32px', height: '64px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.6), rgba(99,102,241,0.4))',
              border: '1px solid rgba(139,92,246,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px',
              boxShadow: '0 0 16px rgba(124,58,237,0.3)',
            }}>
              🎨
            </div>
            <div>
              <h1 style={{
                fontFamily: 'Outfit, sans-serif', fontWeight: 800,
                fontSize: '19px', color: '#f0eeff', lineHeight: 1.1,
                letterSpacing: '0.04em',
              }}>
                TOONIFY
              </h1>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '1px' }}>
                AI Cartoon & Avatar Generator
              </p>
            </div>
          </div>

          <StatusBadge health={health} />
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section style={{
        textAlign: 'center', padding: '72px 32px 48px',
        maxWidth: '800px', margin: '0 auto', width: '100%',
      }}>
        {/* Label pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '6px 18px', borderRadius: '99px',
          border: '1px solid rgba(139,92,246,0.3)',
          background: 'rgba(139,92,246,0.08)',
          fontSize: '12px', fontWeight: 600, color: '#a78bfa',
          marginBottom: '28px', letterSpacing: '0.05em',
        }}>
          <span style={{ fontSize: '14px' }}>✨</span>
          TOONIFY AI · PHOTO TO CARTOON
        </div>

        <h2 style={{
          fontFamily: 'Outfit, sans-serif', fontWeight: 900,
          fontSize: 'clamp(36px, 6vw, 64px)', lineHeight: 1.05,
          marginBottom: '20px',
        }}>
          <span style={{
            background: 'linear-gradient(135deg, #c4b5fd 0%, #818cf8 45%, #f472b6 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Turn your photo
          </span>
          <br />
          <span style={{ color: '#f0eeff' }}>
            into cartoon art
          </span>
        </h2>

        <p style={{
          color: 'rgba(255,255,255,0.45)', fontSize: '17px', lineHeight: 1.65,
          maxWidth: '520px', margin: '0 auto',
        }}>
          Upload any portrait, choose from 5 art styles, and keep your face identity consistent with Toonify AI.
        </p>
      </section>

      {/* ── Main workspace ──────────────────────────────────────────────── */}
      <main style={{
        flex: 1, maxWidth: '960px', width: '100%', margin: '0 auto',
        padding: '0 32px 80px',
        display: 'flex', flexDirection: 'column', gap: '0',
      }}>

        {/* Glass card */}
        <div style={{
          borderRadius: '28px',
          border: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.025)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)',
        }}>

          {/* Steps header bar */}
          <div style={{
            padding: '20px 32px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', gap: '32px', alignItems: 'center',
          }}>
            <StepBadge number="1" label="Upload photo" active={!step1Done} done={step1Done} />
            <div style={{ width: '24px', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <StepBadge number="2" label="Choose style" active={step1Done && !resultUrl} done={!!resultUrl} />
            <div style={{ width: '24px', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <StepBadge number="3" label="Generate" active={step3Active && !resultUrl} done={!!resultUrl} />
          </div>

          {/* Content area */}
          <div style={{ padding: '32px' }}>

            {/* ── If result: show full-width viewer ── */}
            {resultUrl && (
              <div style={{ animation: 'fadeUp 0.5s ease' }}>
                <ResultViewer
                  originalUrl={previewUrl}
                  resultUrl={resultUrl}
                  onReset={handleReset}
                />
              </div>
            )}

            {/* ── If loading ── */}
            {loading && <LoadingOverlay style={selectedStyleLabel} />}

            {/* ── Upload + style + generate ── */}
            {!resultUrl && !loading && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>

                {/* Left: upload + face lock */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <p style={{
                      fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em',
                      color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
                      marginBottom: '12px', fontFamily: 'Inter, sans-serif',
                    }}>
                      Your photo
                    </p>
                    <UploadZone onImageSelect={handleImageSelect} preview={previewUrl} />
                  </div>

                  {/* Face Lock control */}
                  {imageFile && (
                    <FaceLock
                      enabled={faceLockEnabled}
                      onToggle={setFaceLockEnabled}
                      faceFile={faceFile}
                      facePreview={facePreviewUrl}
                      onFaceSelect={handleFaceSelect}
                      disabled={loading}
                    />
                  )}
                </div>

                {/* Right: style + generate */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Style picker */}
                  {styles.length > 0 && (
                    <StylePicker
                      styles={styles}
                      selected={selectedStyle}
                      onSelect={setSelectedStyle}
                      disabled={loading}
                    />
                  )}

                  {/* Generate button */}
                  <div>
                    <GenerateButton
                      onClick={handleGenerate}
                      loading={loading}
                      disabled={!canGenerate}
                    />
                    {!imageFile && (
                      <p style={{
                        textAlign: 'center', marginTop: '10px',
                        fontSize: '12px', color: 'rgba(255,255,255,0.2)',
                      }}>
                        Upload a photo first to enable
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                marginTop: '20px', padding: '16px 20px', borderRadius: '14px',
                border: '1px solid rgba(248,113,113,0.2)',
                background: 'rgba(248,113,113,0.06)',
                display: 'flex', gap: '12px', alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: '18px', flexShrink: 0 }}>⚠️</span>
                <div>
                  <p style={{ fontWeight: 600, color: '#fca5a5', fontSize: '14px' }}>Generation failed</p>
                  <p style={{ color: 'rgba(252,165,165,0.6)', fontSize: '13px', marginTop: '3px' }}>{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Feature strip */}
        {!resultUrl && (
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '40px',
            marginTop: '36px', flexWrap: 'wrap',
          }}>
            {[
              { icon: '🎨', text: '5 Cartoon Styles' },
              { icon: '🔒', text: 'IP-Adapter Face Lock' },
              { icon: '⚡', text: 'AI-Powered' },
              { icon: '⬇️', text: 'Free Download' },
            ].map(({ icon, text }) => (
              <div key={text} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontWeight: 500,
              }}>
                <span style={{ fontSize: '16px' }}>{icon}</span>
                {text}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '24px 32px',
        textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '12px',
      }}>
        TOONIFY AI · FastAPI + React + Stable Diffusion + IP-Adapter
      </footer>
    </div>
  )
}
