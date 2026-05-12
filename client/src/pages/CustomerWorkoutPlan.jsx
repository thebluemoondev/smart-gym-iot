import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, Dumbbell, Play, Check, ChevronRight, Plus } from 'lucide-react'
import { workoutAPI } from '../api/axios'
import { useAuth } from '../App'

export default function CustomerWorkoutPlan() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [todayPlan, setTodayPlan] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.id) {
          const res = await workoutAPI.get(`/plans/user/${user.id}`)
          setPlans(res.data)
          const today = res.data.find(p => {
            const day = new Date().getDay()
            return p.days?.includes(day.toString())
          })
          setTodayPlan(today || res.data[0])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user?.id])

  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Kế hoạch tập luyện</h1>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 flex items-center gap-2">
          <Plus className="w-5 h-5" /> Tạo kế hoạch
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : plans.length > 0 ? (
        <div className="space-y-6">
          {/* Today */}
          <div className="bg-gradient-to-r from-primary-600 to-gymgreen-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 mb-1">Hôm nay</p>
                <h2 className="text-2xl font-bold">{todayPlan?.name || 'Chưa có kế hoạch'}</h2>
                <p className="text-white/80 mt-2">{todayPlan?.exercises?.length || 0} bài tập</p>
              </div>
              <button className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
                <Play className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Week Schedule */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Lịch tuần này</h3>
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, i) => {
                const dayPlan = plans.find(p => p.days?.includes(i.toString()))
                const isToday = i === new Date().getDay()
                const bgClass = isToday ? 'bg-primary-100' : (dayPlan ? 'bg-gymgreen-50' : 'bg-gray-50')
                const textClass = isToday ? 'text-primary-600' : 'text-gray-600'
                return (
                  <div key={i} className={`text-center p-3 rounded-xl ${bgClass}`}>
                    <p className={`text-sm font-medium ${textClass}`}>{day}</p>
                    {dayPlan && <p className="text-xs text-gray-500 mt-1 truncate">{dayPlan.name}</p>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Plan Details */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Chi tiết kế hoạch</h3>
            <div className="space-y-4">
              {plans.map((plan, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4 hover:border-primary-300 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                        <Dumbbell className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{plan.name}</h4>
                        <p className="text-sm text-gray-500">{plan.exercises?.length || 0} bài tập - {plan.duration_minutes || 60} phút</p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Chưa có kế hoạch</h2>
          <p className="text-gray-500 mb-6">Liên hệ HLV để được tạo kế hoạch phù hợp!</p>
          <button onClick={() => navigate('/customer/chatbot')} className="px-8 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700">
            Nhờ AI hỗ trợ
          </button>
        </div>
      )}
    </div>
  )
}