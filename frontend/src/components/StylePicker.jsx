/**
 * StylePicker.jsx — Milestone 3 Redesign
 * Supports custom LoRA styles (Arcane & Claymation) + 5 core styles
 */

const STYLE_THEMES = {
  disney: {
    gradient: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(249,115,22,0.1) 100%)',
    glow: 'rgba(251,191,36,0.35)',
    border: 'rgba(251,191,36,0.25)',
    selectedBorder: 'rgba(251,191,36,0.7)',
    accent: '#fbbf24',
    bg: 'rgba(251,191,36,0.08)',
  },
  anime: {
    gradient: 'linear-gradient(135deg, rgba(56,189,248,0.15) 0%, rgba(99,102,241,0.1) 100%)',
    glow: 'rgba(56,189,248,0.35)',
    border: 'rgba(56,189,248,0.25)',
    selectedBorder: 'rgba(56,189,248,0.7)',
    accent: '#38bdf8',
    bg: 'rgba(56,189,248,0.08)',
  },
  arcane: {
    gradient: 'linear-gradient(135deg, rgba(168,85,247,0.25) 0%, rgba(236,72,153,0.15) 100%)',
    glow: 'rgba(168,85,247,0.45)',
    border: 'rgba(168,85,247,0.35)',
    selectedBorder: 'rgba(168,85,247,0.85)',
    accent: '#c084fc',
    bg: 'rgba(168,85,247,0.12)',
    badge: 'Custom LoRA',
  },
  claymation: {
    gradient: 'linear-gradient(135deg, rgba(249,115,22,0.25) 0%, rgba(217,119,6,0.15) 100%)',
    glow: 'rgba(249,115,22,0.45)',
    border: 'rgba(249,115,22,0.35)',
    selectedBorder: 'rgba(249,115,22,0.85)',
    accent: '#fb923c',
    bg: 'rgba(249,115,22,0.12)',
    badge: 'Custom LoRA',
  },
  ghibli: {
    gradient: 'linear-gradient(135deg, rgba(52,211,153,0.15) 0%, rgba(16,185,129,0.08) 100%)',
    glow: 'rgba(52,211,153,0.35)',
    border: 'rgba(52,211,153,0.25)',
    selectedBorder: 'rgba(52,211,153,0.7)',
    accent: '#34d399',
    bg: 'rgba(52,211,153,0.08)',
  },
  comic: {
    gradient: 'linear-gradient(135deg, rgba(251,113,133,0.15) 0%, rgba(244,63,94,0.1) 100%)',
    glow: 'rgba(251,113,133,0.35)',
    border: 'rgba(251,113,133,0.25)',
    selectedBorder: 'rgba(251,113,133,0.7)',
    accent: '#fb7185',
    bg: 'rgba(251,113,133,0.08)',
  },
  pixar: {
    gradient: 'linear-gradient(135deg, rgba(167,139,250,0.2) 0%, rgba(236,72,153,0.1) 100%)',
    glow: 'rgba(167,139,250,0.4)',
    border: 'rgba(167,139,250,0.3)',
    selectedBorder: 'rgba(167,139,250,0.8)',
    accent: '#a78bfa',
    bg: 'rgba(167,139,250,0.1)',
  },
}

export default function StylePicker({ styles, selected, onSelect, disabled }) {
  return (
    <div style={{ width: '100%' }}>
      <p style={{
        fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em',
        color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
        marginBottom: '14px', fontFamily: 'Inter, sans-serif',
      }}>
        Choose your art style ({styles.length} styles available)
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
        gap: '10px',
      }}>
        {styles.map((style) => {
          const theme = STYLE_THEMES[style.key] || STYLE_THEMES.pixar
          const isSelected = selected === style.key

          return (
            <button
              key={style.key}
              id={`style-${style.key}`}
              onClick={() => !disabled && onSelect(style.key)}
              disabled={disabled}
              style={{
                position: 'relative',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '10px', padding: '16px 8px',
                borderRadius: '16px',
                border: `1.5px solid ${isSelected ? theme.selectedBorder : theme.border}`,
                background: isSelected ? theme.bg : 'rgba(255,255,255,0.02)',
                backgroundImage: isSelected ? theme.gradient : 'none',
                boxShadow: isSelected ? `0 0 24px ${theme.glow}, inset 0 0 20px ${theme.bg}` : 'none',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                transition: 'all 0.25s ease',
                outline: 'none',
              }}
              onMouseEnter={e => {
                if (!disabled && !isSelected) {
                  e.currentTarget.style.background = theme.bg
                  e.currentTarget.style.borderColor = theme.border
                  e.currentTarget.style.boxShadow = `0 0 16px ${theme.glow.replace('0.35', '0.2')}`
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }
              }}
              onMouseLeave={e => {
                if (!disabled && !isSelected) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                  e.currentTarget.style.borderColor = theme.border
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              {/* Custom LoRA badge */}
              {theme.badge && (
                <span style={{
                  position: 'absolute', top: '6px', left: '50%', transform: 'translateX(-50%)',
                  background: theme.accent, color: '#000', fontSize: '8px', fontWeight: 800,
                  padding: '1px 6px', borderRadius: '99px', textTransform: 'uppercase',
                  letterSpacing: '0.05em', whiteSpace: 'nowrap',
                }}>
                  {theme.badge}
                </span>
              )}

              {/* Selected dot */}
              {isSelected && (
                <span style={{
                  position: 'absolute', top: '8px', right: '8px',
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: theme.accent,
                  boxShadow: `0 0 8px ${theme.accent}`,
                }} />
              )}

              {/* Emoji with colored backdrop */}
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                marginTop: theme.badge ? '8px' : '0',
                background: isSelected ? `${theme.bg}` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isSelected ? theme.border : 'rgba(255,255,255,0.06)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px',
              }}>
                {style.emoji}
              </div>

              <div style={{ textAlign: 'center' }}>
                <p style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 700, fontSize: '12.5px',
                  color: isSelected ? theme.accent : 'rgba(255,255,255,0.85)',
                  transition: 'color 0.2s',
                  lineHeight: 1.2,
                }}>
                  {style.label}
                </p>
                <p style={{
                  fontSize: '10px', color: 'rgba(255,255,255,0.3)',
                  marginTop: '3px', lineHeight: 1.3,
                }}>
                  {style.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
