import { useState } from 'react'
import { ChevronDown, Search, MessageCircle, Phone, Mail } from 'lucide-react'
import { FAQS } from '../utils/constants'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

function AccordionItem({ item, isOpen, onToggle }) {
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <button onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-slate-50 transition-colors">
        <span className="font-semibold text-slate-800 text-sm pr-4">{item.q}</span>
        <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-0 bg-white border-t border-slate-100">
          <p className="text-sm text-slate-600 leading-relaxed pt-3">{item.a}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  const [search, setSearch] = useState('')
  const [openKey, setOpenKey] = useState(null)
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = ['All', ...FAQS.map(f => f.category)]

  const allItems = FAQS.flatMap(f => f.items.map(i => ({ ...i, category: f.category })))
  const filtered = allItems.filter(item => {
    const matchSearch = !search || item.q.toLowerCase().includes(search.toLowerCase()) || item.a.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === 'All' || item.category === activeCategory
    return matchSearch && matchCat
  })

  return (
    <>
      {/* Hero */}
      <section className="bg-hero-grad py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            ❓ Help Center
          </span>
          <h1 className="text-4xl font-black mb-4">How can we help you?</h1>
          <p className="text-white/70 mb-7">Find answers to frequently asked questions about booking, payments, tracking, and more.</p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search for answers…"
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-white/30 shadow-lg" />
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeCategory === cat ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-primary-400 hover:text-primary-600'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        {search && (
          <p className="text-sm text-slate-500 mb-4 text-center">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "<strong>{search}</strong>"
          </p>
        )}

        {/* FAQ List */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🤔</p>
            <p className="font-bold text-slate-700">No matching questions</p>
            <p className="text-slate-500 text-sm mt-1">Try a different search term or browse all categories</p>
          </div>
        ) : (
          <div>
            {activeCategory === 'All' && !search ? (
              FAQS.map(section => (
                <div key={section.category} className="mb-8">
                  <h2 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-primary-600 rounded-full" />
                    {section.category}
                  </h2>
                  <div className="space-y-3">
                    {section.items.map((item, i) => {
                      const key = `${section.category}-${i}`
                      return (
                        <AccordionItem key={key} item={item}
                          isOpen={openKey === key} onToggle={() => setOpenKey(openKey === key ? null : key)} />
                      )
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-3">
                {filtered.map((item, i) => (
                  <AccordionItem key={i} item={item}
                    isOpen={openKey === i} onToggle={() => setOpenKey(openKey === i ? null : i)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Support CTA */}
        <div className="mt-12 bg-slate-50 rounded-2xl p-8 text-center border border-slate-200">
          <h3 className="text-xl font-extrabold text-slate-900 mb-2">Still have questions?</h3>
          <p className="text-slate-500 text-sm mb-6">Our support team is ready to help you 7 days a week, 7 AM – 9 PM.</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { icon: MessageCircle, label: 'Live Chat', desc: 'Chat with us now', color: 'text-primary-600', href: '#' },
              { icon: Phone, label: 'Call Support', desc: '+91 0532 246 0000', color: 'text-emerald-600', href: 'tel:+915322460000' },
              { icon: Mail, label: 'Email Us', desc: 'support@prayagtravels.in', color: 'text-accent-600', href: 'mailto:support@prayagtravels.in' },
            ].map(c => (
              <a key={c.label} href={c.href}
                className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 border border-slate-100 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
                <div className={`w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center`}>
                  <c.icon className={`w-5 h-5 ${c.color}`} />
                </div>
                <p className="font-bold text-slate-900 text-sm">{c.label}</p>
                <p className="text-xs text-slate-500">{c.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
