/**
 * UploadZone.jsx
 * Drag-and-drop + click-to-browse image upload area.
 */
import { useRef, useState, useCallback } from 'react'

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_MB = 10

export default function UploadZone({ onImageSelect, preview }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')

  const validate = (file) => {
    if (!ACCEPTED.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image.')
      return false
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`File too large. Max ${MAX_MB} MB.`)
      return false
    }
    setError('')
    return true
  }

  const handleFile = useCallback((file) => {
    if (!file) return
    if (!validate(file)) return
    const url = URL.createObjectURL(file)
    onImageSelect(file, url)
  }, [onImageSelect])

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    handleFile(file)
  }

  const onInputChange = (e) => {
    const file = e.target.files?.[0]
    handleFile(file)
  }

  return (
    <div className="w-full">
      <div
        id="upload-zone"
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`
          relative w-full rounded-2xl border-2 border-dashed
          transition-all duration-300 cursor-pointer overflow-hidden
          flex flex-col items-center justify-center
          ${preview ? 'h-72' : 'h-64'}
          ${dragging
            ? 'border-purple-400 bg-purple-500/10 shadow-[0_0_30px_rgba(139,92,246,0.3)]'
            : 'border-white/10 bg-white/[0.02] hover:border-purple-500/50 hover:bg-purple-500/5'
          }
        `}
      >
        {preview ? (
          /* ---- Preview ---- */
          <>
            <img
              src={preview}
              alt="Uploaded preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-200">
              <div className="text-center">
                <p className="text-white font-semibold text-sm">Click to change</p>
                <p className="text-white/60 text-xs mt-1">or drag a new image</p>
              </div>
            </div>
          </>
        ) : (
          /* ---- Empty state ---- */
          <div className="text-center px-6 py-8 select-none">
            <div className="text-5xl mb-4 transition-transform duration-300 hover:scale-110">
              📸
            </div>
            <p className="text-white font-semibold text-base font-outfit">
              Drop your photo here
            </p>
            <p className="text-white/40 text-sm mt-1">
              or click to browse
            </p>
            <p className="text-white/25 text-xs mt-4">
              JPEG · PNG · WebP · max {MAX_MB} MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="hidden"
        onChange={onInputChange}
        id="file-input"
      />
    </div>
  )
}
