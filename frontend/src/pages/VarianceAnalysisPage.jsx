import { useState } from 'react'
import {
  GitCompare, Calendar, ChevronDown, ArrowDownRight,
  ArrowUpRight, BarChart3, CheckCircle2
} from 'lucide-react'
import { Chart } from 'react-chartjs-2'

export default function VarianceAnalysisPage() {
  const [metric, setMetric] = useState('Sales (₹)')
  const [dateRange, setDateRange] = useState('01 Oct 2026 - 07 Oct 2026')

  const days = ['01 Oct', '02 Oct', '03 Oct', '04 Oct', '05 Oct', '06 Oct', '07 Oct']
  const chartData = {
    labels: days,
    datasets: [
      {
        type: 'bar',
        label: 'Actual',
        data: [120, 140, 115, 135, 150, 165, 155],
        backgroundColor: '#60a5fa',
        borderRadius: 4,
        barThickness: 16,
      },
      {
        type: 'bar',
        label: 'Predicted',
        data: [118, 145, 118, 132, 152, 168, 150],
        backgroundColor: '#c084fc',
        borderRadius: 4,
        barThickness: 16,
      },
      {
        type: 'line',
        label: 'Variance',
        data: [2, -5, -3, 3, -2, -3, 5],
        borderColor: '#f43f5e',
        backgroundColor: '#f43f5e',
        borderWidth: 2,
        pointRadius: 4,
        yAxisID: 'yDelta',
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
        align: 'start',
        labels: { boxWidth: 12, font: { family: 'Inter', size: 11, weight: '500' } }
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        grid: { color: 'rgba(226, 232, 240, 0.6)' },
        ticks: { callback: (v) => `₹${v}k`, font: { size: 10 } }
      },
      yDelta: {
        position: 'right',
        grid: { display: false },
        ticks: { font: { size: 10 }, callback: (v) => `${v}%` }
      }
    }
  }

  const tableRows = [
    { date: '01 Oct', actual: '₹1,20,000', pred: '₹1,18,000', delta: '+₹2,000', pct: '+1.7%', positive: true },
    { date: '02 Oct', actual: '₹1,40,000', pred: '₹1,45,000', delta: '-₹5,000', pct: '-3.4%', positive: false },
    { date: '03 Oct', actual: '₹1,15,000', pred: '₹1,18,000', delta: '-₹3,000', pct: '-2.5%', positive: false },
    { date: '04 Oct', actual: '₹1,35,000', pred: '₹1,32,000', delta: '+₹3,000', pct: '+2.3%', positive: true },
    { date: '05 Oct', actual: '₹1,50,000', pred: '₹1,52,000', delta: '-₹2,000', pct: '-1.3%', positive: false },
    { date: '06 Oct', actual: '₹1,65,000', pred: '₹1,68,000', delta: '-₹3,000', pct: '-1.8%', positive: false },
    { date: '07 Oct', actual: '₹1,55,000', pred: '₹1,50,000', delta: '+₹5,000', pct: '+3.3%', positive: true },
  ]

  return (
    <div className="space-y-6">
      {/* Page Title & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Forecast vs Actual Analysis</h2>
          <p className="text-xs text-slate-500 mt-0.5">Compare predicted and actual values</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Metric:</span>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-xs"
            >
              <option>Sales (₹)</option>
              <option>Transactions</option>
              <option>Footfall</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Date Range:</span>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-xs cursor-pointer">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{dateRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart on Left, Summary Cards on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Actual vs Predicted with Variance Delta</h3>
          <div style={{ height: 280 }}>
            <Chart type="bar" data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Variance Metrics</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[11px] text-slate-400 font-medium">MAPE</div>
                <div className="text-xl font-bold text-slate-800 mt-1">8.2%</div>
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

          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xs">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">AI Accuracy Assessment</h4>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Model accuracy is consistently within the acceptable ±10% threshold. Peak evening variances are driven by Friday promotional campaigns.
            </p>
          </div>
        </div>
      </div>

      {/* Variance by Day Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Variance by Day</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Actual Sales</th>
                <th className="p-3">Predicted Sales</th>
                <th className="p-3">Variance</th>
                <th className="p-3 text-right">% Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {tableRows.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/60">
                  <td className="p-3 font-semibold text-slate-800 font-sans">{r.date}</td>
                  <td className="p-3 text-slate-700">{r.actual}</td>
                  <td className="p-3 text-slate-700">{r.pred}</td>
                  <td className={`p-3 font-semibold ${r.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                    {r.delta}
                  </td>
                  <td className="p-3 text-right">
                    <span className={`inline-flex items-center gap-1 font-semibold ${r.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                      {r.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {r.pct}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
