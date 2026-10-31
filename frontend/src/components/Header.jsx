import { TrendingUp, Activity } from 'lucide-react'

export default function Header({ stats }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-none">RetailPulse AI</h1>
            <p className="text-xs text-slate-500 leading-none mt-0.5">Demand Forecasting & Labour Optimization</p>
          </div>
        </div>

        {/* Store / Dept Info */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-xs font-medium text-blue-700">Store:</span>
            <span className="text-xs font-bold text-blue-900">STORE-001</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-xs font-medium text-blue-700">Dept:</span>
            <span className="text-xs font-bold text-blue-900">CHECKOUT</span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3">
          <StatusBadge label="Boomi" active={true} />
          <StatusBadge label="UKG WFM" active={true} />
          <StatusBadge
            label={stats?.model_trained ? 'Model Ready' : 'No Model'}
            active={stats?.model_trained}
          />
          {stats?.pending_approvals > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-300 rounded-full">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-semibold text-amber-700">
                {stats.pending_approvals} Pending
              </span>
            </span>
          )}
        </div>
      </div>
    </header>
  )
}

function StatusBadge({ label, active }) {
  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${
      active
        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
        : 'bg-slate-100 border-slate-300 text-slate-500'
    }`}>
      <span className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {label}
    </span>
  )
}
