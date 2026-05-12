import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, Sparkles, Bot, User, Dumbbell, Calculator, Leaf, X } from 'lucide-react'
import { chatbotAPI } from '../api/axios'
import { useAuth } from '../App'

export default function CustomerChatbot() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Xin chào! Tôi là trợ lý AI của Smart Gym. Tôi có thể giúp bạn về:\n\n🏋️ Chế độ tập luyện\n🥗 Dinh dưỡng & thực đơn\n📊 Tiến độ & mục tiêu\n💡 Mẹo sức khỏe\n\nBạn cần hỗ trợ gì?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEnd = useRef(null)

  const scrollToBottom = () => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [messages])

  const quickQuestions = [
    { icon: Dumbbell, label: 'Bài tập ngực', prompt: 'Gợi ý bài tập ngực hiệu quả' },
    { icon: Leaf, label: 'Dinh dưỡng', prompt: 'Chế độ ăn uống lành mạnh' },
    { icon: Calculator, label: 'Tính BMI', prompt: 'Cách tính chỉ số BMI' }
  ]

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await chatbotAPI.post('/chat', { message: userMsg, user_id: user?.id })
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response || 'Xin lỗi, tôi chưa hiểu. Bạn thử hỏi khác nhé!' }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Xin lỗi, đã có lỗi xảy ra. Bạn thử lại sau nhé!' }])
    } finally {
      setLoading(false)
    }
  }

  const handleQuickQuestion = (prompt) => {
    setInput(prompt)
    setTimeout(() => handleSend(), 100)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-primary-500 rounded-xl flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">AI Trợ lý</h1>
          <p className="text-gray-500 text-sm">Trò chuyện với AI để được hỗ trợ</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden h-[600px] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant' ? 'bg-purple-100' : 'bg-primary-100'}`}>
                  {msg.role === 'assistant' ? <Bot className="w-5 h-5 text-purple-600" /> : <User className="w-5 h-5 text-primary-600" />}
                </div>
                <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-purple-600" />
                </div>
                <div className="p-4 rounded-2xl bg-gray-100">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEnd} />
        </div>

        {/* Quick Questions */}
        <div className="px-4 py-2 border-t border-gray-100 flex gap-2 overflow-x-auto">
          {quickQuestions.map((q, i) => (
            <button key={i} onClick={() => handleQuickQuestion(q.prompt)} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-full text-sm text-gray-600 whitespace-nowrap transition-colors">
              <q.icon className="w-4 h-4" /> {q.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Nhập tin nhắn..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-500 text-white rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}