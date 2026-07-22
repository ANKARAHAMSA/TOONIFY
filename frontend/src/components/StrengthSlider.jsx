/**
 * StrengthSlider.jsx — Phase D
 * Controls the style transformation strength (maps to SD `strength` param).
 * 0% = barely styled, 100% = full cartoon transformation.
 */
import { useId } from 'react'

const PRESETS = [
  { label: 'Subtle',    value: 30,  desc: 'Light tint, keeps original photo intact' },
  { label: 'Balanced',  value: 65,  desc: 'Best for most photos — recommended' },
  { label: 'Full',      value: 90,  desc: 'Maximum cartoon transformation' },
]

export default function StrengthSlider({ value, onChange }) {
  const sliderId = useId()

  // Map 0–100 slider → 0.40–0.90 strength
  const rawStrength = (0.40 + (value / 100) * 0.50).toFixed(2)

  const trackFill = `${value}%`

  return (
    <div className="strength-slider-wrapper">
      <div className="strength-header">
        <label className="strength-label" htmlFor={sliderId}>
          🎨 Style Strength
        </label>
        <span className="strength-value-badge">{value}%</span>
      </div>

      <div className="strength-track-container">
        <div
          className="strength-track-fill"
          style={{ width: trackFill }}
        />
        <input
          id={sliderId}
          type="range"
          min={0}
          max={100}
          step={5}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="strength-range"
          aria-label={`Style strength: ${value}%`}
        />
      </div>

      <div className="strength-presets">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className={`strength-preset-btn${value === preset.value ? ' active' : ''}`}
            onClick={() => onChange(preset.value)}
            title={preset.desc}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <p className="strength-hint">
        {value < 35 && 'Light cartoon tint — original photo mostly intact'}
        {value >= 35 && value < 70 && 'Balanced — best for most photos ✨'}
        {value >= 70 && 'Full transformation — strong cartoon effect'}
        <span className="strength-raw"> (strength={rawStrength})</span>
      </p>
    </div>
  )
}
