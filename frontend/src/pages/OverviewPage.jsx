import { useState } from 'react'
import {
  TrendingUp, Users, ShoppingBag, ArrowUpRight,
  Clock, Sparkles, Lightbulb, AlertTriangle, ArrowRight, CheckCircle2
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Chart } from 'react-chartjs-2'
import DemoController from '../components/DemoController'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler
)

export default function OverviewPage({ stats, history, forecasts, staffing, onRefresh, setActiveTab }) {
  // Format numbers nicely or provide fallback realistic numbers
  const totalSales = stats?.total_history_rows ? `₹${(stats.total_history_rows * 165).toLocaleString('en-IN')}` : '₹1,24,560'
  const totalTx = stats?.total_history_rows ? (stats.total_history_rows * 2.3).toFixed(0) : '1,842'
  const avgFootfall = stats?.total_history_rows ? (stats.total_history_rows * 3.8).toFixed(0) : '2,980'
  const recommendedStaff = '25'

  // Chart data matching reference image: Sales & Footfall Trend (Today)
  const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']
  const chartData = {
    labels: hours,
    datasets: [
      {
        type: 'bar',
        label: 'Sales (₹)',
        data: [12000, 24000, 31000, 22000, 48000, 62000, 41000, 15000],
        backgroundColor: 'rgba(99, 102, 241, 0.4)',
        borderColor: 'rgba(99, 102, 241, 0.8)',
        borderRadius: 6,
        yAxisID: 'ySales',
        barThickness: 28,
      },
      {
        type: 'line',
        label: 'Transactions',
        data: [25, 45, 60, 40, 95, 120, 85, 30],
        borderColor: '#8b5cf6',
        backgroundColor: '#8b5cf6',
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 3,
        yAxisID: 'yCount',
      },
      {
        type: 'line',
        label: 'Footfall',
        data: [50, 90, 130, 85, 175, 210, 150, 60],
        borderColor: '#10b981',
        backgroundColor: '#10b981',
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 4,
        yAxisID: 'yCount',
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
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      x: { grid: { display: false } },
      ySales: {
        type: 'linear',
        position: 'left',
        grid: { color: 'rgba(226, 232, 240, 0.6)' },
        ticks: {
          callback: (v) => `${v / 1000}k`,
          font: { size: 10 }
        }
      },
      yCount: {
        type: 'linear',
        position: 'right',
        grid: { display: false },
        ticks: { font: { size: 10 } }
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Sales */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Sales</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{totalSales}</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +12%
            </span>
            <span className="text-slate-400">vs last week</span>
          </div>
        </div>

        {/* Card 2: Total Transactions */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Transactions</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{totalTx}</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +8%
            </span>
            <span className="text-slate-400">vs last week</span>
          </div>
        </div>

        {/* Card 3: Avg. Footfall */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg. Footfall</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{avgFootfall}</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center text-purple-600 font-semibold bg-purple-50 px-1.5 py-0.5 rounded">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +15%
            </span>
            <span className="text-slate-400">vs last week</span>
          </div>
        </div>

        {/* Card 4: Recommended Staff */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recommended Staff</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{recommendedStaff}</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              Currently Scheduled: +5
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart + Peak Hours & AI Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Sales & Footfall Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Sales & Footfall Trend (Today)</h2>
              <p className="text-xs text-slate-400 mt-0.5">Dual-axis correlation of hourly demand metrics</p>
            </div>
            <button
              onClick={() => setActiveTab('forecasting')}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Detailed Forecast <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div style={{ height: 290 }}>
            <Chart type="bar" data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Right: Peak Hours & AI Insight */}
        <div className="space-y-4">
          {/* Top Peak Hours (Predicted) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Top Peak Hours (Predicted)
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                  <span className="text-xs font-bold text-slate-800">17:00 - 18:00</span>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                  High Demand
                </span>
                <span className="text-xs font-medium text-slate-600">180 customers</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                  <span className="text-xs font-bold text-slate-800">16:00 - 17:00</span>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                  High Demand
                </span>
                <span className="text-xs font-medium text-slate-600">165 customers</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                  <span className="text-xs font-bold text-slate-800">12:00 - 13:00</span>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Medium
                </span>
                <span className="text-xs font-medium text-slate-600">120 customers</span>
              </div>
            </div>
          </div>

          {/* AI Insight Card */}
          <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/80 rounded-2xl border border-amber-200/80 p-5 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">AI Insight</h4>
                <p className="text-xs font-medium text-amber-800 mt-1 leading-relaxed">
                  Evening demand is expected to be 18% higher than last week. Recommend adding 4 more checkout staff between 16:00 - 20:00.
                </p>
                <button
                  onClick={() => setActiveTab('approval')}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:text-amber-950 underline"
                >
                  Review Schedule Adjustment <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Controller Widget */}
      <DemoController onRefresh={onRefresh} />
    </div>
  )
}
