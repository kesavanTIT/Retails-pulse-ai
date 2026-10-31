import { useState } from 'react'
import {
  Users, Calendar, Clock, Plus,
  CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck
} from 'lucide-react'
import { Bar } from 'react-chartjs-2'

export default function StaffingSchedulePage({ staffing, onRefresh, setActiveTab }) {
  const [selectedDate, setSelectedDate] = useState('06 Oct 2026')
  const [addedSlots, setAddedSlots] = useState({})

  const handleAddStaff = (timeSlot) => {
    setAddedSlots(prev => ({ ...prev, [timeSlot]: true }))
  }

  // Chart datasets matching reference image
  const timeLabels = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']
  const chartData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Required Staff',
        data: [2, 3, 5, 7, 6, 9, 10, 7, 3],
        backgroundColor: '#8b5cf6',
        borderRadius: 4,
        barThickness: 16,
      },
      {
        label: 'Scheduled Staff',
        data: [2, 3, 4, 7, 6, 7, 7, 6, 3],
        backgroundColor: '#60a5fa',
        borderRadius: 4,
        barThickness: 16,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'start',
        labels: { boxWidth: 12, font: { family: 'Inter', size: 11, weight: '500' } },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        grid: { color: 'rgba(226, 232, 240, 0.6)' },
        ticks: { stepSize: 2, font: { size: 10 } },
        beginAtZero: true,
        title: { display: true, text: 'Number of Staff', font: { size: 10, weight: 'bold' } }
      },
    },
  }

  // Table rows matching reference image
  const initialTableRows = [
    { time: '08:00 - 09:00', workload: 120, minsPerUnit: 2, req: 3, sched: 3, gap: 0 },
    { time: '09:00 - 10:00', workload: 180, minsPerUnit: 2, req: 4, sched: 4, gap: 0 },
    { time: '10:00 - 11:00', workload: 260, minsPerUnit: 2, req: 5, sched: 4, gap: 1 },
    { time: '11:00 - 12:00', workload: 320, minsPerUnit: 2, req: 6, sched: 5, gap: 1 },
    { time: '12:00 - 13:00', workload: 280, minsPerUnit: 2, req: 7, sched: 7, gap: 0 },
    { time: '16:00 - 17:00', workload: 380, minsPerUnit: 2, req: 9, sched: 7, gap: 2 },
    { time: '17:00 - 18:00', workload: 410, minsPerUnit: 2, req: 10, sched: 7, gap: 3 },
  ]

  return (
    <div className="space-y-6">
      {/* Header & Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Staffing Requirement</h2>
          <p className="text-xs text-slate-500 mt-0.5">Compare required staff with currently scheduled staff</p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{selectedDate}</span>
        </div>
      </div>

      {/* Staffing Requirement Dual Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Hourly Staffing Distribution</h3>
          <span className="text-xs text-slate-500">Checkout Department • Shift Hours 06:00 - 22:00</span>
        </div>
        <div style={{ height: 260 }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Interactive Staffing Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Interval Workload & FTE Gaps</h3>
            <p className="text-xs text-slate-400 mt-0.5">FTE Formula: (Predicted Workload × Minutes/Unit) / Interval Minutes</p>
          </div>
          <button
            onClick={() => setActiveTab('approval')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Review in Manager Approval <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Predicted Workload</th>
                <th className="p-3">Minutes/Unit</th>
                <th className="p-3">Required Staff</th>
                <th className="p-3">Scheduled Staff</th>
                <th className="p-3">Gap</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {initialTableRows.map((r, i) => {
                const isAdded = addedSlots[r.time]
                const currentGap = isAdded ? 0 : r.gap
                const currentSched = isAdded ? r.req : r.sched

                return (
                  <tr key={i} className="hover:bg-slate-50/60 font-mono text-[11px]">
                    <td className="p-3 font-semibold text-slate-800 flex items-center gap-1.5 font-sans">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {r.time}
                    </td>
                    <td className="p-3 text-slate-600">{r.workload}</td>
                    <td className="p-3 text-slate-500">{r.minsPerUnit}</td>
                    <td className="p-3 font-bold text-purple-700">{r.req}</td>
                    <td className="p-3 font-semibold text-blue-600">{currentSched}</td>
                    <td className="p-3">
                      {currentGap > 0 ? (
                        <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          +{currentGap}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">0</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-sans">
                      {currentGap > 0 ? (
                        <button
                          onClick={() => handleAddStaff(r.time)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-[11px] font-semibold transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Add Staff
                        </button>
                      ) : (
                        <span className="text-emerald-600 text-[11px] font-medium inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Optimal
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
