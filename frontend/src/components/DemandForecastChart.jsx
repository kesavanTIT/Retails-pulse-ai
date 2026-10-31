import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler,
)

export default function DemandForecastChart({ history, forecasts }) {
  // Build labels from history (show last 40 intervals max)
  const historySlice = (history || []).slice(-40)
  const forecastSlice = (forecasts || []).slice(0, 24)

  const histLabels = historySlice.map(r =>
    new Date(r.interval_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  )
  const forecastLabels = forecastSlice.map(r =>
    new Date(r.interval_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  )

  const allLabels = [...histLabels, ...forecastLabels.filter(l => !histLabels.includes(l))]

  const histData = historySlice.map(r => r.footfall)
  const txData = historySlice.map(r => r.transactions)
  const predData = forecastSlice.map(r => r.predicted_transactions ?? r.predicted_footfall ?? 0)

  const data = {
    labels: allLabels.length > 0 ? allLabels : ['No data yet'],
    datasets: [
      {
        label: 'Actual Footfall',
        data: histData,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
      {
        label: 'Actual Transactions',
        data: txData,
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124,58,237,0.05)',
        fill: false,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
        borderWidth: 1.5,
        borderDash: [4, 3],
      },
      {
        label: 'AI Predicted (Transactions)',
        data: [...Array(histLabels.length).fill(null), ...predData],
        borderColor: '#059669',
        backgroundColor: 'rgba(5,150,105,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 7,
        borderWidth: 2.5,
        pointStyle: 'diamond',
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { family: 'Inter', size: 12 }, boxWidth: 14, padding: 16 },
      },
      tooltip: {
        backgroundColor: '#1e3a8a',
        titleFont: { family: 'Inter', size: 12 },
        bodyFont: { family: 'Inter', size: 11 },
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(226,232,240,0.6)' },
        ticks: { font: { family: 'Inter', size: 10 }, maxTicksLimit: 16 },
      },
      y: {
        grid: { color: 'rgba(226,232,240,0.6)' },
        ticks: { font: { family: 'Inter', size: 11 } },
        beginAtZero: true,
      },
    },
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-fadeInUp">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">📈 15-Minute Demand Forecast</h2>
          <p className="text-xs text-slate-500 mt-0.5">Actual vs AI-Predicted retail traffic timeline</p>
        </div>
        <div className="flex gap-2">
          <span className="text-xs px-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg font-medium">
            {historySlice.length} history intervals
          </span>
          <span className="text-xs px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg font-medium">
            {forecastSlice.length} forecast intervals
          </span>
        </div>
      </div>
      <div style={{ height: 320 }}>
        <Line data={data} options={options} />
      </div>
    </div>
  )
}
