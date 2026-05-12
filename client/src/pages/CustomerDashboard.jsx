import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dumbbell, Calendar, Clock, TrendingUp, Activity, Award, Zap, MessageCircle, CreditCard } from 'lucide-react'
import { useAuth } from '../App'
import { userAPI, membershipAPI, workoutAPI } from '../api/axios'

export default function CustomerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ workouts: 0, hours: 0, streak: 0, rank: 'Bronze' })
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subsRes, historyRes] = await Promise.all([
          user?.id ? membershipAPI.get(`/subscriptions/active/${user.id}`).catch(() => ({ data: null })) : { data: null },
          user?.id ? workoutAPI.get(`/history/user/${user.id}`).catch(() => ({ data: [] })) : { data: [] }
        ])
        setSubscription(subsRes.data)
        const history = historyRes.data || []
        const totalMinutes = history.reduce((acc, h) => acc + (h.duration_minutes || 0), 0)
        setStats({
          workouts: history.length,
          hours: Math.round(totalMinutes / 60),
          streak: Math.floor(Math.random() * 7) + 1,
          rank: history.length > 20 ? 'Gold' : history.length > 10 ? 'Silver' : 'Bronze'
        })
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchData()
  }, [user?.id])

  const quickActions = [
    { icon: Calendar, label: 'Đặt lịch tập', path: '/customer/workout-plan', color: 'from-blue-500 to-blue-600' },
    { icon: Activity, label: 'Xem tiến độ', path: '/customer/workout-history', color: 'from-gymgreen-500 to-gymgreen-600' },
    { icon: MessageCircle, label: 'Chat AI', path: '/customer/chatbot', color: 'from-purple-500 to-purple-600' },
    { icon: CreditCard, label: 'Gói tập', path: '/customer/subscription', color: 'from-orange-500 to-orange-600' },
  ]

  const recentWorkouts = [
    { type: 'Ngực', duration: '45 phút', calories: 320, date: 'Hôm nay' },
    { type: 'Chân', duration: '60 phút', calories: 450, date: 'Hôm qua' },
    { type: 'Lưng', duration: '50 phút', calories: 380, date: '2 ngày trước' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary-600 to-gymgreen-600 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold mb-2">Xin chào, {user?.full_name || user?.username || 'bạn'}! 👋</h1>
        <p className="text-white/80">Hôm nay bạn có kế hoạch tập luyện gì?</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Dumbbell, label: 'Tổng buổi tập', value: stats.workouts, color: 'from-primary-500 to-primary-600' },
          { icon: Clock, label: 'Giờ tập', value: stats.hours, color: 'from-gymgreen-500 to-gymgreen-600' },
          { icon: Zap, label: 'Ngày liên tiếp', value: stats.streak, color: 'from-yellow-500 to-orange-500' },
          { icon: Award, label: 'Hạng thành viên', value: stats.rank, color: 'from-purple-500 to-purple-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-gray-500 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Truy cập nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <button key={i} onClick={() => navigate(action.path)} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all card-hover text-center">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${action.color} flex items-center justify-center mx-auto mb-3`}>
                <action.icon className="w-7 h-7 text-white" />
              </div>
              <p className="font-medium text-gray-800">{action.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Subscription & Recent Workouts */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Current Package */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Gói tập hiện tại</h3>
          {subscription ? (
            <div className="p-4 bg-gymgreen-50 rounded-xl border border-gymgreen-200">
              <p className="font-semibold text-gymgreen-700">{subscription.package_name || 'Gói tập'}</p>
              <p className="text-sm text-gymgreen-600 mt-1">Hết hạn: {new Date(subscription.end_date).toLocaleDateString('vi-VN')}</p>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">Bạn chưa có gói tập</p>
              <button onClick={() => navigate('/packages')} className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700">Đăng ký ngay</button>
            </div>
          )}
        </div>

        {/* Recent Workouts */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Hoạt động gần đây</h3>
          <div className="space-y-3">
            {recentWorkouts.map((w, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{w.type}</p>
                    <p className="text-sm text-gray-500">{w.duration} • {w.calories} calo</p>
                  </div>
                </div>
                <span className="text-sm text-gray-400">{w.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}