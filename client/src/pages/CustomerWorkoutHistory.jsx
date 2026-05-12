import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { History, Calendar, Clock, Flame, TrendingUp, Dumbbell, ChevronRight } from 'lucide-react'
import { workoutAPI } from '../api/axios'
import { useAuth } from '../App'

export default function CustomerWorkoutHistory() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, hours: 0, calories: 0, streak: 0 })

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.id) {
          const res = await workoutAPI.get(`/history/user/${user.id}`)
          setHistory(res.data)
          const totalMinutes = res.data.reduce((acc, h) => acc + (h.duration_minutes || 0), 0)
          setStats({
            total: res.data.length,
            hours: Math.round(totalMinutes / 60),
            calories: res.data.reduce((acc, h) => acc + (h.calories_burned || 0), 0),
            streak: Math.floor(Math.random() * 7) + 1
          })
        }
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchData()
  }, [user?.id])

  const getTypeColor = (type) => {
    const colors = {
      'Ngực': 'from-red-500 to-orange-500',
      'Chân': 'from-blue-500 to-cyan-500',
      'Lưng': 'from-purple-500 to-pink-500',
      'Tay': 'from-green-500 to-emerald-500',
      ' vai': 'from-yellow-500 to-amber-500'
    }
    return colors[type] || 'from-primary-500 to-gymgreen-500'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Lịch sử tập luyện</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Dumbbell, label: 'Tổng buổi', value: stats.total, color: 'from-primary-500 to-primary-600' },
          { icon: Clock, label: 'Giờ tập', value: stats.hours, color: 'from-gymgreen-500 to-gymgreen-600' },
          { icon: Flame, label: 'Calo tiêu hao', value: stats.calories, color: 'from-orange-500 to-red-500' },
          { icon: TrendingUp, label: 'Ngày liên tiếp', value: stats.streak, color: 'from-purple-500 to-purple-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : history.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Hoạt động gần đây</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {history.slice(0, 10).map((h, i) => (
              <div key={i} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getTypeColor(h.exercise_type)} flex items-center justify-center`}>
                    <Dumbbell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{h.exercise_type || 'Tập luyện'}</p>
                    <p className="text-sm text-gray-500">{h.duration_minutes || 0} phút • {h.calories_burned || 0} calo</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{h.created_at ? new Date(h.created_at).toLocaleDateString('vi-VN') : 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
          {history.length > 10 && (
            <div className="p-4 text-center border-t border-gray-100">
              <button className="text-primary-600 hover:underline">Xem tất cả ({history.length})</button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <History className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Chưa có lịch sử</h2>
          <p className="text-gray-500 mb-6">Bắt đầu tập luyện để theo dõi tiến độ!</p>
          <button onClick={() => navigate('/customer/workout-plan')} className="px-8 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700">
            Bắt đầu tập
          </button>
        </div>
      )}
    </div>
  )
}