/**
 * StylePicker.jsx
 * Grid of style cards. Each card shows emoji, name, description.
 * Selected card gets a glowing purple border.
 */
export default function StylePicker({ styles, selected, onSelect, disabled }) {
  return (
    <div className="w-full">
      <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-3 font-inter">
        Choose a style
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {styles.map((style) => {
          const isSelected = selected === style.key
          return (
            <button
              key={style.key}
              id={`style-${style.key}`}
              onClick={() => !disabled && onSelect(style.key)}
              disabled={disabled}
              className={`
                relative group flex flex-col items-center gap-2
                rounded-xl border p-4 text-center
                transition-all duration-300 cursor-pointer
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.03]'}
                ${isSelected
                  ? 'border-purple-500 bg-purple-500/15 shadow-[0_0_20px_rgba(139,92,246,0.4)]'
                  : 'border-white/8 bg-white/[0.03] hover:border-purple-500/40 hover:bg-purple-500/5'
                }
              `}
            >
              {/* Selected indicator ring */}
              {isSelected && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(139,92,246,0.9)]" />
              )}

              <span className="text-3xl leading-none">{style.emoji}</span>

              <div>
                <p className={`text-sm font-semibold transition-colors ${isSelected ? 'text-purple-300' : 'text-white/90'}`}>
                  {style.label}
                </p>
                <p className="text-white/35 text-xs mt-0.5 leading-tight">
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
