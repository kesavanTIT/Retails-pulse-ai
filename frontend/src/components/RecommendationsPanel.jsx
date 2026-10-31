import { useState } from 'react'
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { approveRecommendation } from '../services/api'

export default function RecommendationsPanel({ recommendations, onApproved }) {
  const [loading, setLoading] = useState({})
  const [approved, setApproved] = useState({})

  const handleApprove = async (id) => {
    setLoading(l => ({ ...l, [id]: true }))
    try {
      await approveRecommendation(id)
      setApproved(a => ({ ...a, [id]: true }))
      onApproved?.()
    } catch (e) {
      alert('Failed to approve: ' + (e.response?.data?.detail || e.message))
    } finally {
      setLoading(l => ({ ...l, [id]: false }))
    }
  }

  const items = recommendations || []

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-fadeInUp">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">🎯 AI Recommendations</h2>
          <p className="text-xs text-slate-500 mt-0.5">Shift adjustments requiring manager approval</p>
        </div>
        <span className="text-xs px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full font-semibold">
          {items.filter(r => !r.approved && r.manager_approval_required).length} pending
        </span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No recommendations yet.</p>
          <p className="text-xs mt-1">Run a forecast and generate recommendations.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {items.map((rec) => {
            const isApproved = approved[rec.id] || rec.approved
            const isLoading = loading[rec.id]
            const isUnderstaffed = rec.variance_fte > 0.5
            const isOverstaffed = rec.variance_fte < -0.5

            return (
              <div
                key={rec.id}
                className={`rounded-xl border p-4 transition-all ${
                  isApproved
                    ? 'bg-emerald-50 border-emerald-200'
                    : isUnderstaffed
                    ? 'bg-red-50 border-red-200'
                    : isOverstaffed
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isApproved ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className={`w-4 h-4 shrink-0 ${isUnderstaffed ? 'text-red-500' : 'text-amber-500'}`} />
                      )}
                      <span className="text-xs font-bold text-slate-700">
                        {new Date(rec.interval_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : isUnderstaffed
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isApproved ? 'Approved' : isUnderstaffed ? `+${rec.variance_fte.toFixed(1)} FTE needed` : `${rec.variance_fte.toFixed(1)} FTE excess`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rec.recommendation}</p>
                  </div>

                  {!isApproved && rec.manager_approval_required && (
                    <button
                      onClick={() => handleApprove(rec.id)}
                      disabled={isLoading}
                      className="shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isLoading ? '...' : '✅ Approve'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
