import { Users, TrendingUp, DollarSign, ShieldCheck, Brain, AlertTriangle } from 'lucide-react'

const cards = [
  {
    key: 'total_history_rows',
    label: 'History Records',
    icon: TrendingUp,
    color: 'blue',
    suffix: 'rows',
    desc: '15-min interval data',
  },
  {
    key: 'latest_forecast_count',
    label: 'Forecasts Run',
    icon: Brain,
    color: 'indigo',
    suffix: 'predictions',
    desc: 'XGBoost ML predictions',
  },
  {
    key: 'total_recommendations',
    label: 'Recommendations',
    icon: Users,
    color: 'sky',
    suffix: 'total',
    desc: 'Shift adjustments',
  },
  {
    key: 'pending_approvals',
    label: 'Pending Approvals',
    icon: AlertTriangle,
    color: 'amber',
    suffix: 'actions',
    desc: 'Manager approval needed',
  },
]

const colorMap = {
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   icon: 'bg-blue-600',    text: 'text-blue-700',    num: 'text-blue-900' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'bg-indigo-600',  text: 'text-indigo-700',  num: 'text-indigo-900' },
  sky:    { bg: 'bg-sky-50',    border: 'border-sky-200',    icon: 'bg-sky-600',     text: 'text-sky-700',     num: 'text-sky-900' },
  amber:  { bg: 'bg-amber-50',  border: 'border-amber-200',  icon: 'bg-amber-500',   text: 'text-amber-700',   num: 'text-amber-900' },
}

export default function KPICards({ stats, loading }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const c = colorMap[card.color]
        const Icon = card.icon
        const value = stats?.[card.key] ?? 0

        return (
          <div
            key={card.key}
            className={`animate-fadeInUp rounded-2xl border ${c.bg} ${c.border} p-5 shadow-sm hover:shadow-md transition-shadow duration-200`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center shadow-sm`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              {loading ? (
                <div className="skeleton w-12 h-5 rounded" />
              ) : (
                <span className={`text-2xl font-extrabold ${c.num}`}>{value}</span>
              )}
            </div>
            <p className={`text-sm font-semibold ${c.text}`}>{card.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{card.desc}</p>
          </div>
        )
      })}

      {/* Model Status Card */}
      <div className="col-span-2 lg:col-span-4 animate-fadeInUp rounded-2xl border bg-gradient-to-r from-blue-700 to-blue-900 p-5 shadow-sm text-white">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-blue-200" />
            <div>
              <p className="font-bold text-lg">XGBoost AI Model</p>
              <p className="text-blue-200 text-sm">
                {stats?.model_trained
                  ? `✅ Model trained — MAE: ${stats.model_mae?.toFixed(2) ?? 'N/A'} | WAPE: ${stats.model_wape?.toFixed(2) ?? 'N/A'}%`
                  : '⚠️ No model trained yet — Use the Demo Controller below to train'}
              </p>
            </div>
          </div>
          {stats?.last_trained_at && (
            <span className="text-xs text-blue-300 bg-blue-800 px-3 py-1.5 rounded-lg">
              Last trained: {new Date(stats.last_trained_at).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
