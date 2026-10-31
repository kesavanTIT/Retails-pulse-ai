import { useState } from 'react'
import {
  Bot, Send, Sparkles, User, CheckCircle2,
  TrendingUp, Users, ShoppingBag, ArrowRight
} from 'lucide-react'

export default function MCPAssistantPage({ onNavigateToApproval }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'user',
      text: 'Show me the forecast for tomorrow evening (18:00 - 20:00)',
      time: '18:14',
    },
    {
      id: 2,
      sender: 'assistant',
      time: '18:14',
      content: {
        intro: 'Here is the forecast and staffing recommendation for tomorrow evening:',
        stats: [
          { label: 'Predicted Sales', val: '₹42,600', icon: ShoppingBag, color: 'text-emerald-600' },
          { label: 'Predicted Footfall', val: '660 customers', icon: Users, color: 'text-blue-600' },
          { label: 'Required Staff', val: '9 staff', icon: Users, color: 'text-purple-600' },
          { label: 'Currently Scheduled Staff', val: '5 staff', icon: Users, color: 'text-slate-600' },
          { label: 'Additional Staff Needed', val: '+4 staff', icon: TrendingUp, color: 'text-red-600', bold: true },
        ],
        actionText: 'Review in Manager Approvals →',
      },
    },
  ])

  const [input, setInput] = useState('')

  const handleSend = (textToSend) => {
    const text = textToSend || input
    if (!text.trim()) return

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')

    // Generate intelligent AI assistant response
    setTimeout(() => {
      let aiResponse
      const lower = text.toLowerCase()

      if (lower.includes('staff') || lower.includes('friday') || lower.includes('peak')) {
        aiResponse = {
          id: Date.now() + 1,
          sender: 'assistant',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: {
            intro: 'Based on XGBoost demand predictions, here is the staffing advisory:',
            stats: [
              { label: 'Peak Hour', val: '17:00 - 18:00', icon: TrendingUp, color: 'text-blue-600' },
              { label: 'Expected Footfall', val: '180 customers', icon: Users, color: 'text-purple-600' },
              { label: 'Required Checkout Staff', val: '10', icon: Users, color: 'text-emerald-600' },
              { label: 'Labor Gap', val: '+3 staff needed', icon: TrendingUp, color: 'text-red-600', bold: true },
            ],
            actionText: 'Update UKG Schedule →',
          },
        }
      } else {
        aiResponse = {
          id: Date.now() + 1,
          sender: 'assistant',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: {
            intro: `Analysis for "${text}":`,
            stats: [
              { label: 'Forecast Accuracy (MAPE)', val: '8.2% (Good)', icon: TrendingUp, color: 'text-emerald-600' },
              { label: 'Total Expected Sales', val: '₹1,24,560', icon: ShoppingBag, color: 'text-blue-600' },
              { label: 'Active Department', val: 'CHECKOUT', icon: Users, color: 'text-purple-600' },
            ],
            actionText: 'View Variance Analysis →',
          },
        }
      }

      setMessages(prev => [...prev, aiResponse])
    }, 600)
  }

  const quickPrompts = [
    'Show me the forecast for tomorrow evening (18:00 - 20:00)',
    'Who should we schedule for Friday peak hours?',
    'Explain the sales variance for STORE-001',
  ]

  return (
    <div className="card flex flex-col overflow-hidden fade-up" style={{ height: 'calc(100vh - 140px)', minHeight: '620px' }}>
      {/* Assistant Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">RetailPulse AI Assistant</h2>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Online
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Ask about demand, staffing, schedules and recommendations</p>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-medium">Model: Claude 3.5 / XGBoost Agent</div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
        {messages.map((msg) => {
          if (msg.sender === 'user') {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-md bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-tr-xs text-xs font-medium shadow-xs">
                  <p>{msg.text}</p>
                  <span className="text-[9px] text-blue-200 block text-right mt-1">{msg.time}</span>
                </div>
              </div>
            )
          }

          return (
            <div key={msg.id} className="flex items-start gap-3 max-w-xl">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-4 shadow-xs text-xs text-slate-800">
                <p className="font-semibold text-slate-900 mb-3">{msg.content.intro}</p>

                <div className="space-y-2 mb-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {msg.content.stats.map((st, i) => {
                    const Icon = st.icon
                    return (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium flex items-center gap-1.5">
                          <span className="text-slate-300">•</span> {st.label}:
                        </span>
                        <span className={`font-bold ${st.color} ${st.bold ? 'text-sm' : ''}`}>
                          {st.val}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {msg.content.actionText && (
                  <button
                    onClick={onNavigateToApproval}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    {msg.content.actionText}
                  </button>
                )}
                <span className="text-[9px] text-slate-400 block text-right mt-2">{msg.time}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Suggested Prompts */}
      <div className="px-6 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span className="text-[11px] font-semibold text-slate-400 shrink-0">Suggestions:</span>
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSend(qp)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition-colors"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask anything about demand, staffing or recommendations..."
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => handleSend()}
          className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xs transition-colors shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
