export default function StaffingGrid({ records }) {
  if (!records || records.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-fadeInUp">
        <h2 className="text-base font-bold text-slate-900 mb-1">👥 Staffing Schedule Grid</h2>
        <p className="text-sm text-slate-400 mt-4 text-center py-8">
          No staffing records yet. Run a prediction to auto-calculate FTE requirements.
        </p>
      </div>
    )
  }

  const statusConfig = {
    understaffed: { label: 'Understaffed', bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-800 border-red-300', dot: 'bg-red-500' },
    overstaffed:  { label: 'Overstaffed',  bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-500' },
    optimal:      { label: 'Optimal',      bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
    unknown:      { label: 'No Schedule',  bg: 'bg-slate-50', text: 'text-slate-500', badge: 'bg-slate-100 text-slate-600 border-slate-300', dot: 'bg-slate-400' },
  }

  const getStatus = (req, sched) => {
    if (!sched) return 'unknown'
    const diff = req - sched
    if (Math.abs(diff) <= 0.5) return 'optimal'
    return diff > 0 ? 'understaffed' : 'overstaffed'
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-fadeInUp">
      <h2 className="text-base font-bold text-slate-900 mb-1">👥 Staffing Schedule Grid</h2>
      <p className="text-xs text-slate-500 mb-4">Required FTE vs Scheduled FTE per 15-minute interval</p>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-blue-50 border-b border-blue-200">
              <th className="text-left px-4 py-3 text-xs font-bold text-blue-800">Time Interval</th>
              <th className="text-right px-4 py-3 text-xs font-bold text-blue-800">Workload (min)</th>
              <th className="text-right px-4 py-3 text-xs font-bold text-blue-800">Required FTE</th>
              <th className="text-right px-4 py-3 text-xs font-bold text-blue-800">Scheduled FTE</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-blue-800">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.slice(0, 20).map((rec, i) => {
              const status = getStatus(rec.required_fte, rec.scheduled_fte)
              const cfg = statusConfig[status]
              return (
                <tr key={rec.id || i} className={`border-b border-slate-100 hover:${cfg.bg} transition-colors`}>
                  <td className="px-4 py-3 font-medium text-slate-700">
                    {new Date(rec.interval_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {rec.predicted_workload?.toFixed(0) ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-blue-800">
                    {rec.required_fte?.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {rec.scheduled_fte?.toFixed(1) ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${cfg.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
