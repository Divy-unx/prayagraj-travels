import { Check, X } from 'lucide-react'

const rules = [
  { id: 'length',  label: 'At least 8 characters',        test: p => p.length >= 8 },
  { id: 'upper',   label: 'One uppercase letter',          test: p => /[A-Z]/.test(p) },
  { id: 'lower',   label: 'One lowercase letter',          test: p => /[a-z]/.test(p) },
  { id: 'digit',   label: 'One number',                    test: p => /\d/.test(p) },
  { id: 'special', label: 'One special character (!@#$…)', test: p => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p) },
]

function getStrength(password) {
  if (!password) return 0
  return rules.filter(r => r.test(password)).length
}

const LEVELS = [
  { label: 'Very weak', color: 'bg-red-500' },
  { label: 'Weak',      color: 'bg-orange-500' },
  { label: 'Fair',      color: 'bg-yellow-500' },
  { label: 'Good',      color: 'bg-blue-500' },
  { label: 'Strong',    color: 'bg-emerald-500' },
  { label: 'Strong',    color: 'bg-emerald-500' },
]

export default function PasswordStrength({ password }) {
  if (!password) return null
  const strength = getStrength(password)
  const level = LEVELS[strength]

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bars */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
            i <= strength ? level.color : 'bg-slate-200'
          }`} />
        ))}
      </div>
      <p className={`text-xs font-semibold ${
        strength <= 1 ? 'text-red-500' : strength <= 2 ? 'text-orange-500' :
        strength <= 3 ? 'text-yellow-600' : 'text-emerald-600'
      }`}>{level.label}</p>

      {/* Rule checklist */}
      <ul className="grid grid-cols-1 gap-0.5">
        {rules.map(rule => {
          const passed = rule.test(password)
          return (
            <li key={rule.id} className="flex items-center gap-1.5 text-xs">
              {passed
                ? <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                : <X className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />}
              <span className={passed ? 'text-slate-600' : 'text-slate-400'}>{rule.label}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
