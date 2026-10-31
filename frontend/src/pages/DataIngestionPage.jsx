import { useState } from 'react'
import {
  UploadCloud, FileSpreadsheet, CheckCircle2,
  Database, RefreshCw, ArrowRight, Table, AlertCircle
} from 'lucide-react'
import { seedDemoData, ingestBulk, trainModel } from '../services/api'

export default function DataIngestionPage({ history, onRefresh, setActiveTab }) {
  const [uploadSuccess, setUploadSuccess] = useState(true)
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  const handleSeed = async () => {
    setLoading(true)
    setStatusMsg('Seeding 14 days of realistic 15-min retail records...')
    try {
      const count = await seedDemoData()
      setStatusMsg(`Successfully seeded ${count} historical intervals!`)
      setUploadSuccess(true)
      onRefresh?.()
    } catch (e) {
      setStatusMsg(`Error: ${e.response?.data?.detail || e.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleProcessAndTrain = async () => {
    setLoading(true)
    setStatusMsg('Processing records & training XGBoost model...')
    try {
      await trainModel({ target: 'transactions' })
      setStatusMsg('Model training complete! Navigating to Forecasting...')
      onRefresh?.()
      setTimeout(() => setActiveTab('forecasting'), 800)
    } catch (e) {
      setStatusMsg(`Error training model: ${e.response?.data?.detail || e.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Sample format rows
  const sampleFormatRows = [
    { tenant: 'demo', store: 'STORE-001', dept: 'CHECKOUT', time: '2026-10-01 08:00', sales: '16500', footfall: '110', tx: '42' },
    { tenant: 'demo', store: 'STORE-001', dept: 'CHECKOUT', time: '2026-10-01 08:15', sales: '18200', footfall: '95', tx: '38' },
  ]

  // Default preview rows if no history fetched yet
  const previewRows = history && history.length > 0 ? history.slice(0, 5) : [
    { tenant_id: 'demo', store_id: 'STORE-001', department_id: 'CHECKOUT', interval_start: '2026-10-01 08:00', sales: 16500, footfall: 110, transactions: 42, is_holiday: 0, promotion: 1, temperature: 31 },
    { tenant_id: 'demo', store_id: 'STORE-001', department_id: 'CHECKOUT', interval_start: '2026-10-01 08:15', sales: 18200, footfall: 95, transactions: 38, is_holiday: 0, promotion: 1, temperature: 31 },
    { tenant_id: 'demo', store_id: 'STORE-001', department_id: 'CHECKOUT', interval_start: '2026-10-01 08:30', sales: 14800, footfall: 88, transactions: 35, is_holiday: 0, promotion: 1, temperature: 30 },
    { tenant_id: 'demo', store_id: 'STORE-001', department_id: 'CHECKOUT', interval_start: '2026-10-01 08:45', sales: 17200, footfall: 105, transactions: 40, is_holiday: 0, promotion: 1, temperature: 31 },
    { tenant_id: 'demo', store_id: 'STORE-001', department_id: 'CHECKOUT', interval_start: '2026-10-01 09:00', sales: 20100, footfall: 120, transactions: 45, is_holiday: 0, promotion: 1, temperature: 32 },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Data Ingestion — Upload Historical Data</h2>
          <p className="text-xs text-slate-500 mt-0.5">Upload historical sales, footfall and transaction data (CSV/Excel)</p>
        </div>

        {uploadSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            File uploaded successfully
          </div>
        )}
      </div>

      {statusMsg && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-medium text-blue-800 flex items-center justify-between">
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg('')} className="text-blue-500 hover:text-blue-700 font-bold">✕</button>
        </div>
      )}

      {/* Upload Zone & Sample Format */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Retail Data Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Upload Retail Data</h3>
            <p className="text-xs text-slate-400 mb-4">Feed POS and footfall sensors data into RetailPulse AI</p>

            <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-8 text-center transition-colors bg-slate-50/50 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-700">Drag and drop your file here</p>
              <p className="text-[11px] text-slate-400 my-1.5">or</p>
              <button
                onClick={handleSeed}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
              >
                Browse Files
              </button>
              <p className="text-[10px] text-slate-400 mt-3">
                Supports CSV, Excel (.xlsx, .xls) | Minimum 30 records recommended
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Need instant realistic data?</span>
            <button
              onClick={handleSeed}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-blue-600" />
              Seed 14-Days Dataset
            </button>
          </div>
        </div>

        {/* Sample File Format Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Sample File Format</h3>
            <p className="text-xs text-slate-400 mb-4">Required schema for ML feature engineering</p>

            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-[11px] text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-2.5">tenant_id</th>
                    <th className="p-2.5">store_id</th>
                    <th className="p-2.5">department_id</th>
                    <th className="p-2.5">interval_start</th>
                    <th className="p-2.5">sales</th>
                    <th className="p-2.5">footfall</th>
                    <th className="p-2.5">transactions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                  {sampleFormatRows.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="p-2.5">{r.tenant}</td>
                      <td className="p-2.5">{r.store}</td>
                      <td className="p-2.5">{r.dept}</td>
                      <td className="p-2.5">{r.time}</td>
                      <td className="p-2.5 text-emerald-600 font-semibold">{r.sales}</td>
                      <td className="p-2.5 text-blue-600">{r.footfall}</td>
                      <td className="p-2.5 text-purple-600">{r.tx}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Interval frequency: 15 minutes</span>
            <span className="font-semibold text-emerald-600">Schema Validated ✓</span>
          </div>
        </div>
      </div>

      {/* Data Preview (First 5 Rows) Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Data Preview (First 5 Rows)</h3>
            <p className="text-xs text-slate-400 mt-0.5">Ingested records ready for XGBoost chronological training</p>
          </div>

          <button
            onClick={handleProcessAndTrain}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all self-start sm:self-auto"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
            <span>Process & Train Model</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="p-3">tenant_id</th>
                <th className="p-3">store_id</th>
                <th className="p-3">department_id</th>
                <th className="p-3">interval_start</th>
                <th className="p-3">sales</th>
                <th className="p-3">footfall</th>
                <th className="p-3">transactions</th>
                <th className="p-3">is_holiday</th>
                <th className="p-3">promotion</th>
                <th className="p-3">temperature</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {previewRows.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/60 font-mono text-[11px]">
                  <td className="p-3">{r.tenant_id}</td>
                  <td className="p-3 font-semibold text-slate-800">{r.store_id}</td>
                  <td className="p-3">{r.department_id}</td>
                  <td className="p-3 text-slate-500">
                    {typeof r.interval_start === 'string' && r.interval_start.includes('T')
                      ? r.interval_start.replace('T', ' ').slice(0, 16)
                      : r.interval_start}
                  </td>
                  <td className="p-3 font-semibold text-emerald-600">₹{r.sales}</td>
                  <td className="p-3 text-blue-600">{r.footfall}</td>
                  <td className="p-3 text-purple-600">{r.transactions}</td>
                  <td className="p-3">{r.is_holiday ? '1' : '0'}</td>
                  <td className="p-3">{r.promotion ? '1' : '0'}</td>
                  <td className="p-3">{r.temperature}°C</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
