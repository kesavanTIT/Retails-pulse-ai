import { useState } from 'react'
import { Database, Brain, Zap, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import {
  seedDemoData, trainModel, predictDemand,
  calculateStaffing, generateRecommendations
} from '../services/api'

const steps = [
  { id: 'seed',    icon: Database, label: 'Seed 14 Days Data',     color: 'blue',    desc: 'Load realistic 15-min historical retail records' },
  { id: 'train',   icon: Brain,    label: 'Train XGBoost Model',    color: 'indigo',  desc: 'Chronological train/test split — real AI training' },
  { id: 'predict', icon: Zap,      label: 'Run AI Predictions',     color: 'violet',  desc: 'Generate demand forecasts for next 24 intervals' },
]

const colorMap = {
  blue:   { btn: 'bg-blue-600 hover:bg-blue-700',   ring: 'ring-blue-300',   icon: 'bg-blue-100 text-blue-700' },
  indigo: { btn: 'bg-indigo-600 hover:bg-indigo-700', ring: 'ring-indigo-300', icon: 'bg-indigo-100 text-indigo-700' },
  violet: { btn: 'bg-violet-600 hover:bg-violet-700', ring: 'ring-violet-300', icon: 'bg-violet-100 text-violet-700' },
}

export default function DemoController({ onRefresh }) {
  const [status, setStatus] = useState({})
  const [logs, setLogs] = useState([])

  const addLog = (msg, type = 'info') => {
    const ts = new Date().toLocaleTimeString()
    setLogs(l => [{ msg, type, ts }, ...l].slice(0, 20))
  }

  const run = async (id) => {
    setStatus(s => ({ ...s, [id]: 'running' }))
    try {
      if (id === 'seed') {
        addLog('🌱 Seeding 14 days of demo data...')
        const count = await seedDemoData()
        addLog(`✅ Seeded ${count} records successfully!`, 'success')

      } else if (id === 'train') {
        addLog('🧠 Training XGBoost model (transactions)...')
        const res = await trainModel({})
        addLog(`✅ Model trained! MAE=${res.data.mae} | WAPE=${res.data.wape}% | Rows=${res.data.training_rows}`, 'success')

      } else if (id === 'predict') {
        addLog('🔮 Generating AI predictions for next 24 intervals...')
        const base = new Date()
        base.setMinutes(Math.ceil(base.getMinutes() / 15) * 15, 0, 0)
        const intervals = Array.from({ length: 24 }, (_, i) => ({
          interval_start: new Date(base.getTime() + i * 900000).toISOString(),
          is_holiday: false, promotion: false, temperature: 29,
        }))
        const predRes = await predictDemand(intervals, 'transactions')
        const preds = predRes.data.predictions

        addLog(`✅ Generated ${preds.length} predictions!`, 'success')

        // Auto-calculate staffing for each predicted interval
        addLog('👷 Auto-calculating staffing requirements...')
        const staffingIntervals = []
        for (const pred of preds) {
          const workload = pred.predicted_transactions * 2  // 2 min/transaction
          await calculateStaffing({
            predicted_workload: workload,
            minutes_per_unit: 2,
            interval_minutes: 15,
            productivity_factor: 1.0,
            scheduled_fte: 6,   // Default schedule of 6 FTE
            interval_start: pred.interval_start,
          })
          staffingIntervals.push({
            interval_start: pred.interval_start,
            required_fte: Math.round((workload / 15) * 10) / 10,
            scheduled_fte: 6,
          })
        }

        // Generate recommendations
        addLog('🎯 Generating manager recommendations...')
        await generateRecommendations(staffingIntervals)
        addLog('✅ All done! Dashboard refreshing...', 'success')
      }

      setStatus(s => ({ ...s, [id]: 'done' }))
      onRefresh?.()
    } catch (err) {
      const msg = err.response?.data?.detail || err.message
      addLog(`❌ Error in ${id}: ${msg}`, 'error')
      setStatus(s => ({ ...s, [id]: 'error' }))
    }
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl border border-blue-900 shadow-xl p-6 animate-fadeInUp">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-white">⚡ POC Demo Controller</h2>
          <p className="text-xs text-blue-300 mt-0.5">One-click end-to-end AI demo — no Postman needed</p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-800 hover:bg-blue-700 text-blue-200 text-xs font-medium rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        {steps.map((step) => {
          const c = colorMap[step.color]
          const Icon = step.icon
          const s = status[step.id]

          return (
            <button
              key={step.id}
              onClick={() => run(step.id)}
              disabled={s === 'running'}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${c.btn}`}
            >
              {s === 'running' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : s === 'done' ? (
                <CheckCircle className="w-4 h-4 text-green-300" />
              ) : s === 'error' ? (
                <XCircle className="w-4 h-4 text-red-300" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
              <span>{step.label}</span>
            </button>
          )
        })}
      </div>

      {/* Live log console */}
      {logs.length > 0 && (
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 max-h-40 overflow-y-auto font-mono">
          {logs.map((log, i) => (
            <div key={i} className={`text-xs leading-relaxed ${
              log.type === 'success' ? 'text-emerald-400' :
              log.type === 'error' ? 'text-red-400' : 'text-slate-300'
            }`}>
              <span className="text-slate-600">[{log.ts}]</span> {log.msg}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
