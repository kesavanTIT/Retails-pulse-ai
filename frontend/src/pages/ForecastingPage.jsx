import { useState } from 'react'
import {
  TrendingUp, Calendar, ChevronDown, Sparkles,
  Zap, RefreshCw, CheckCircle2, ArrowUpRight
} from 'lucide-react'
import { Line } from 'react-chartjs-2'
import { predictDemand, calculateStaffing, generateRecommendations } from '../services/api'

export default function ForecastingPage({ stats, history, forecasts, onRefresh }) {
  const [selectedMetric, setSelectedMetric] = useState('Sales (₹)')
  const [selectedDate, setSelectedDate] = useState('06 Oct 2026')
  const [predicting, setPredicting] = useState(false)
  const [message, setMessage] = useState('')

  const handleRunPrediction = async () => {
    setPredicting(true)
    setMessage('Generating 24 intervals demand predictions with XGBoost...')
    try {
      const base = new Date()
      base.setMinutes(Math.ceil(base.getMinutes() / 15) * 15, 0, 0)
      const intervals = Array.from({ length: 24 }, (_, i) => ({
        interval_start: new Date(base.getTime() + i * 900000).toISOString(),
        is_holiday: false, promotion: false, temperature: 29,
      }))
      const predRes = await predictDemand(intervals, 'transactions')
      const preds = predRes.data.predictions

      // Auto staffing calculation
      const staffingIntervals = []
      for (const pred of preds) {
        const workload = pred.predicted_transactions * 2
        await calculateStaffing({
          predicted_workload: workload,
          minutes_per_unit: 2,
          interval_minutes: 15,
          productivity_factor: 1.0,
          scheduled_fte: 6,
          interval_start: pred.interval_start,
        })
        staffingIntervals.push({
          interval_start: pred.interval_start,
          required_fte: Math.round((workload / 15) * 10) / 10,
          scheduled_fte: 6,
        })
      }
      await generateRecommendations(staffingIntervals)

      setMessage(`Successfully generated ${preds.length} intervals forecasts!`)
      onRefresh?.()
    } catch (e) {
      setMessage(`Prediction error: ${e.response?.data?.detail || e.message}`)
    } finally {
      setPredicting(false)
    }
  }

  // Chart datasets matching reference image
  const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']
  const chartData = {
    labels: hours,
    datasets: [
      {
        label: 'Actual Sales',
        data: [11000, 22000, 30000, 21000, 46000, 60000, 39000, 14000],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        fill: true,
      },
      {
        label: 'Predicted Sales',
        data: [12500, 24500, 32000, 23000, 49000, 63500, 42000, 15500],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.08)',
        borderWidth: 2.5,
        tension: 0.4,
        pointRadius: 4,
        pointStyle: 'rectRot',
        fill: true,
      },
      {
        label: 'Customer Footfall',
        data: [45, 88, 125, 80, 170, 205, 145, 55],
        borderColor: '#10b981',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [4, 4],
        tension: 0.4,
        pointRadius: 3,
        yAxisID: 'yFootfall',
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        align: 'center',
        labels: { boxWidth: 12, font: { family: 'Inter', size: 11, weight: '500' } }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      x: { grid: { color: 'rgba(226, 232, 240, 0.5)' } },
      y: {
        grid: { color: 'rgba(226, 232, 240, 0.5)' },
        ticks: { callback: (v) => `₹${v / 1000}k` }
      },
      yFootfall: {
        position: 'right',
        grid: { display: false },
        ticks: { font: { size: 10 } }
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Demand Forecast</h2>
          <p className="text-xs text-slate-500 mt-0.5">Predicted sales, footfall and transactions for selected period</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Select Metric */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Select Metric:</span>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Sales (₹)</option>
              <option>Transactions</option>
              <option>Footfall</option>
            </select>
          </div>

          {/* Select Date */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Select Date:</span>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-xs cursor-pointer">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{selectedDate}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          <button
            onClick={handleRunPrediction}
            disabled={predicting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            {predicting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            <span>Run AI Prediction</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}

      {/* Main Grid: Chart on Left, Performance & Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Forecast Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Demand Curve (15-min Intervals)</h3>
            <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-semibold">
              XGBoost Regressor
            </span>
          </div>
          <div style={{ height: 320 }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Model Performance & Forecast Summary */}
        <div className="space-y-4">
          {/* Model Performance Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Model Performance</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[11px] text-slate-400 font-medium">MAPE</div>
                <div className="text-xl font-bold text-slate-800 mt-1">
                  {stats?.model_wape ? `${stats.model_wape}%` : '8.2%'}
                </div>
                <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Good
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[11px] text-slate-400 font-medium">Total Variance</div>
                <div className="text-xl font-bold text-slate-800 mt-1">-5.6%</div>
                <span className="inline-block mt-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  Below forecast
                </span>
              </div>
            </div>
          </div>

          {/* Forecast Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Forecast Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-xs text-slate-600 font-medium">Total Predicted Sales</span>
                <span className="text-xs font-bold text-slate-900">₹1,24,560</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-xs text-slate-600 font-medium">Total Footfall</span>
                <span className="text-xs font-bold text-slate-900">2,980</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-xs text-slate-600 font-medium">Total Transactions</span>
                <span className="text-xs font-bold text-slate-900">1,842</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
