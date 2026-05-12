import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import { chatbotAPI } from '../api/axios'

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: 'Xin chào! Tôi là trợ lý AI của Smart Gym. Tôi có thể giúp bạn về các vấn đề về tập luyện, dinh dưỡng, và lịch tập. Bạn cần hỗ trợ gì?', timestamp: new Date() }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg = { id: Date.now(), role: 'user', content: input, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await chatbotAPI.post('/chat', { message: input })
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: res.data.response, timestamp: new Date() }])
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: 'Xin lỗi, tôi đang gặp sự cố. Bạn vui lòng thử lại sau nhé!', timestamp: new Date() }])
    } finally { setLoading(false) }
  }

  const suggestions = ['Tập gym bao lâu thì có cơ?', 'Chế độ ăn uống cho người giảm cân?', 'Các bài tập ngực hiệu quả?', 'Lịch tập gym cho người mới?']

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">AI Chatbot</h1>
            <p className="text-gray-400">Trợ lý AI hỗ trợ hội viên</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-purple-400">AI đang hoạt động</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="stat-card h-[600px] flex flex-col overflow-hidden p-0">
            <div className="p-4 bg-gradient-to-r from-purple-600 to-purple-500 -mx-6 -mt-6 mb-0 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><Bot className="w-6 h-6 text-white" /></div>
                <div><h3 className="font-bold text-white">Smart Gym AI</h3><p className="text-sm text-purple-200">Trợ lý ảo</p></div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-end gap-2 max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-primary-500' : 'bg-purple-500'}`}>
                      {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                    </div>
                    <div className={`px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary-500 text-white rounded-br-md' : 'bg-dark-700 text-gray-200 rounded-bl-md'}`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-end gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
                    <div className="px-4 py-3 bg-dark-700 rounded-2xl rounded-bl-md">
                      <div className="flex gap-1"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" /><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} /><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} /></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-dark-600">
              <div className="flex gap-2">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())} placeholder="Nhập tin nhắn..." className="input-field" disabled={loading} />
                <button onClick={handleSend} disabled={loading || !input.trim()} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-700 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="stat-card">
            <h3 className="font-bold text-white mb-4">Câu hỏi gợi ý</h3>
            <div className="space-y-2">
              {suggestions.map((suggestion, i) => (
                <button key={i} onClick={() => { setInput(suggestion); handleSend() }} className="w-full text-left px-4 py-2 bg-dark-700 hover:bg-purple-500/20 text-gray-400 hover:text-purple-400 rounded-lg text-sm transition-colors">
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="stat-card">
            <h3 className="font-bold text-white mb-4">Thống kê</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between"><span className="text-gray-400">Tin nhắn của bạn</span><span className="font-bold text-primary-400">{messages.filter(m => m.role === 'user').length}</span></div>
              <div className="flex items-center justify-between"><span className="text-gray-400">Phản hồi AI</span><span className="font-bold text-purple-400">{messages.filter(m => m.role === 'assistant').length}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}