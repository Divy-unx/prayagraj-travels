import { useRef } from 'react'

export default function OTPInput({ value = '', onChange, length = 6, disabled = false }) {
  const inputs = useRef([])

  const digits = [...value.split('').slice(0, length), ...Array(length).fill('')].slice(0, length)

  const focus = (i) => inputs.current[i]?.focus()

  const handleChange = (i, e) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1)
    const next = digits.map((d, idx) => idx === i ? char : d).join('').trim()
    onChange(next)
    if (char && i < length - 1) focus(i + 1)
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      if (digits[i]) {
        const next = digits.map((d, idx) => idx === i ? '' : d).join('')
        onChange(next)
      } else if (i > 0) {
        focus(i - 1)
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      focus(i - 1)
    } else if (e.key === 'ArrowRight' && i < length - 1) {
      focus(i + 1)
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    onChange(pasted)
    focus(Math.min(pasted.length, length - 1))
  }

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={el => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
          onFocus={e => e.target.select()}
          disabled={disabled}
          className={`w-11 h-12 text-center text-xl font-black rounded-xl border-2 transition-all
            focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100
            ${digit ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-slate-200 bg-white text-slate-900'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
      ))}
    </div>
  )
}
