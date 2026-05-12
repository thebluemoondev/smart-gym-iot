import { Users, CreditCard, Dumbbell, Package, Wrench, MapPin, Activity, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { userAPI, membershipAPI, workoutAPI, facilityAPI } from '../api/axios'

function StatCard({ icon: Icon, title, value, color, trend }) {
  const colorClasses = {
    red: 'from-primary-600 to-primary-500',
    green: 'from-gymgreen-600 to-gymgreen-500',
    blue: 'from-blue-600 to-blue-500',
    purple: 'from-purple-600 to-purple-500',
    orange: 'from-orange-600 to-orange-500',
  }

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <span className="flex items-center text-sm text-gymgreen-400 font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            {trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-gray-400 text-sm mt-1">{title}</p>
    </div>
  )
}

function ServiceStatus({ name, status }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-dark-700/50">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${status ? 'bg-gymgreen-500 animate-pulse' : 'bg-red-500'}`} />
        <span className="font-medium text-gray-300">{name}</span>
      </div>
      <span className={`text-sm font-medium ${status ? 'text-gymgreen-400' : 'text-red-400'}`}>
        {status ? 'Hoạt động' : 'Offline'}
      </span>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    packages: 0,
    exercises: 0,
    equipment: 0,
    activeSubscriptions: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, packagesRes, exercisesRes, equipmentRes, subsRes] = await Promise.all([
          userAPI.get('/').catch(() => ({ data: [] })),
          membershipAPI.get('/packages/').catch(() => ({ data: [] })),
          workoutAPI.get('/exercises/').catch(() => ({ data: [] })),
          facilityAPI.get('/equipment/').catch(() => ({ data: [] })),
          membershipAPI.get('/subscriptions/').catch(() => ({ data: [] }))
        ])
        setStats({
          users: Array.isArray(usersRes.data) ? usersRes.data.length : 0,
          packages: Array.isArray(packagesRes.data) ? packagesRes.data.length : 0,
          exercises: Array.isArray(exercisesRes.data) ? exercisesRes.data.length : 0,
          equipment: Array.isArray(equipmentRes.data) ? equipmentRes.data.length : 0,
          activeSubscriptions: Array.isArray(subsRes.data) ? subsRes.data.filter(s => s.is_active).length : 0
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const statCards = [
    { icon: Users, title: 'Tổng hội viên', value: stats.users, color: 'red', trend: '+12%' },
    { icon: Package, title: 'Gói tập', value: stats.packages, color: 'green', trend: '+5%' },
    { icon: CreditCard, title: 'Đăng ký hoạt động', value: stats.activeSubscriptions, color: 'blue', trend: '+8%' },
    { icon: Dumbbell, title: 'Bài tập', value: stats.exercises, color: 'purple', trend: null },
    { icon: Wrench, title: 'Thiết bị', value: stats.equipment, color: 'orange', trend: null },
  ]

  const services = [
    { name: 'User Service (6001)', status: true },
    { name: 'Membership Service (6002)', status: true },
    { name: 'Workout Service (6003)', status: true },
    { name: 'Facility Service (6004)', status: true },
    { name: 'Chatbot Service (6005)', status: true },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Tổng quan hệ thống Smart Gym</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-700/50">
          <Clock className="w-5 h-5 text-gray-400" />
          <span className="text-gray-300 text-sm">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="stat-card animate-pulse">
              <div className="w-12 h-12 bg-dark-700 rounded-xl mb-4" />
              <div className="h-8 bg-dark-700 rounded mb-2" />
              <div className="h-4 bg-dark-700 rounded w-2/3" />
            </div>
          ))
        ) : (
          statCards.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="stat-card">
          <h2 className="text-lg font-bold text-white mb-4">Trạng thái Services</h2>
          <div className="space-y-3">
            {services.map((service, index) => (
              <ServiceStatus key={index} {...service} />
            ))}
          </div>
        </div>

        <div className="stat-card">
          <h2 className="text-lg font-bold text-white mb-4">Hoạt động gần đây</h2>
          <div className="space-y-3">
            {[
              { icon: Users, title: 'Hội viên mới đăng ký', time: '2 phút trước', color: 'text-gymgreen-400' },
              { icon: CreditCard, title: 'Gói tập mới được kích hoạt', time: '15 phút trước', color: 'text-primary-400' },
              { icon: Wrench, title: 'Bảo trì thiết bị hoàn thành', time: '1 giờ trước', color: 'text-orange-400' },
              { icon: Activity, title: 'Cập nhật kế hoạch tập', time: '2 giờ trước', color: 'text-purple-400' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-dark-700/30">
                <div className={`w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center ${activity.color}`}>
                  <activity.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
                <CheckCircle className="w-5 h-5 text-gymgreen-500" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}