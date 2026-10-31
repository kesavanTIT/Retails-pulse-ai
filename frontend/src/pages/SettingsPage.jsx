import { useState } from 'react'
import { Settings, ShieldCheck, Database, Link, Save, CheckCircle2 } from 'lucide-react'

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)
  const [config, setConfig] = useState({
    storeId: 'STORE-001',
    deptId: 'CHECKOUT',
    boomiSecret: 'dev-boomi-secret-change-in-prod',
    ukgBaseUrl: 'https://demo-tenant.ukg.com',
    productivityFactor: '1.0',
    minutesPerTx: '2.0',
  })

  const handleSave = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-base font-bold text-slate-900">System Configuration & Integrations</h2>
        <p className="text-xs text-slate-500 mt-0.5">Manage Boomi Middleware connection, UKG Pro WFM sync, and ML parameters</p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store & Labor Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            Store & Department Setup
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Store ID</label>
              <input
                type="text"
                value={config.storeId}
                onChange={(e) => setConfig({ ...config, storeId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Department ID</label>
              <input
                type="text"
                value={config.deptId}
                onChange={(e) => setConfig({ ...config, deptId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Minutes per Transaction (Labor Unit)</label>
              <input
                type="number"
                step="0.1"
                value={config.minutesPerTx}
                onChange={(e) => setConfig({ ...config, minutesPerTx: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Productivity Factor</label>
              <input
                type="number"
                step="0.05"
                value={config.productivityFactor}
                onChange={(e) => setConfig({ ...config, productivityFactor: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Integration Credentials */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Link className="w-4 h-4 text-purple-600" />
            Middleware & Enterprise WFM
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Boomi Shared Secret</label>
              <input
                type="password"
                value={config.boomiSecret}
                onChange={(e) => setConfig({ ...config, boomiSecret: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">UKG Pro WFM Endpoint</label>
              <input
                type="text"
                value={config.ukgBaseUrl}
                onChange={(e) => setConfig({ ...config, ukgBaseUrl: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
