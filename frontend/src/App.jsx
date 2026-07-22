/**
 * App.jsx — AI Cartoon Generator
 * Main application shell.
 */
import { useState, useEffect, useCallback } from 'react'
import { getHealth, getStyles, cartoonize } from './api'
import UploadZone from './components/UploadZone'
import StylePicker from './components/StylePicker'
import GenerateButton from './components/GenerateButton'
import ResultViewer from './components/ResultViewer'
import LoadingOverlay from './components/LoadingOverlay'

// ─── Status badge ──────────────────────────────────────────────────────────
function StatusBadge({ health }) {
  if (!health) return null
  const ok = health.model_loaded
  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border
      ${ok
        ? 'text-green-400 border-green-400/20 bg-green-400/5'
        : 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
      {health.mock_mode ? 'Mock mode' : ok ? `Ready · ${health.device}` : 'Loading model…'}
    </div>
  )
}

// ─── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const [health, setHealth] = useState(null)
  const [styles, setStyles] = useState([])
  const [selectedStyle, setSelectedStyle] = useState('disney')

  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [resultUrl, setResultUrl] = useState(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ── Startup: fetch health + styles ──────────────────────────────────────
  useEffect(() => {
    getHealth()
      .then(setHealth)
      .catch(() => setHealth({ status: 'error', model_loaded: false, device: 'none', mock_mode: false }))

    getStyles()
      .then(setStyles)
      .catch(() => console.warn('Could not fetch styles from API — using fallback'))
  }, [])

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleImageSelect = useCallback((file, url) => {
    setImageFile(file)
    setPreviewUrl(url)
    setResultUrl(null)
    setError('')
  }, [])

  const handleGenerate = async () => {
    if (!imageFile || !selectedStyle) return
    setLoading(true)
    setError('')
    setResultUrl(null)

    try {
      const url = await cartoonize(imageFile, selectedStyle)
      setResultUrl(url)
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Generation failed. Is the backend running?'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setImageFile(null)
    setPreviewUrl(null)
    setResultUrl(null)
    setError('')
  }

  const selectedStyleLabel = styles.find(s => s.key === selectedStyle)?.label || selectedStyle
  const canGenerate = !!imageFile && !loading

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-[#0d0d14]/80 border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎨</span>
            <div>
              <h1 className="text-lg font-bold text-white font-outfit leading-tight">
                AI Cartoon Generator
              </h1>
              <p className="text-white/35 text-xs">Powered by Stable Diffusion</p>
            </div>
          </div>
          <StatusBadge health={health} />
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="pt-14 pb-8 text-center px-6">
        <h2 className="text-4xl sm:text-5xl font-extrabold font-outfit bg-gradient-to-r from-purple-300 via-indigo-300 to-pink-300 bg-clip-text text-transparent leading-tight">
          Turn your photo into<br />a cartoon masterpiece
        </h2>
        <p className="text-white/45 text-base mt-4 max-w-xl mx-auto">
          Upload a photo, choose an art style, and watch AI transform it in seconds.
          Built with Stable Diffusion img2img.
        </p>
      </section>

      {/* ── Main card ─────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 pb-16 flex flex-col gap-8">
        {/* Upload */}
        <section>
          <UploadZone
            onImageSelect={handleImageSelect}
            preview={previewUrl}
          />
        </section>

        {/* Style picker */}
        {styles.length > 0 && (
          <section>
            <StylePicker
              styles={styles}
              selected={selectedStyle}
              onSelect={setSelectedStyle}
              disabled={loading}
            />
          </section>
        )}

        {/* Generate / Loading / Result */}
        <section className="flex flex-col gap-4">
          {!resultUrl && !loading && (
            <GenerateButton
              onClick={handleGenerate}
              loading={loading}
              disabled={!canGenerate}
            />
          )}

          {loading && <LoadingOverlay style={selectedStyleLabel} />}

          {resultUrl && (
            <ResultViewer
              originalUrl={previewUrl}
              resultUrl={resultUrl}
              onReset={handleReset}
            />
          )}

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-red-300 text-sm flex gap-2">
              <span className="text-red-400 text-base">⚠️</span>
              <div>
                <p className="font-semibold">Generation failed</p>
                <p className="text-red-300/70 mt-0.5">{error}</p>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-6 text-center text-white/25 text-xs">
        AI Cartoon Generator · Milestone 1 · Built with FastAPI + React + Stable Diffusion
      </footer>
    </div>
  )
}
