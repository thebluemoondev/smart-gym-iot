import { useState, useEffect } from 'react'
import { Plus, Calendar, Activity } from 'lucide-react'
import { workoutAPI, userAPI } from '../api/axios'

export default function WorkoutPlansPage() {
  const [plans, setPlans] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ user_id: '', name: '', description: '', start_date: '', end_date: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [plansRes, usersRes] = await Promise.all([
        workoutAPI.get('/plans/user/1').catch(() => ({ data: [] })),
        userAPI.get('/').catch(() => ({ data: [] }))
      ])
      setPlans(plansRes.data)
      setUsers(usersRes.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await workoutAPI.post('/plans', formData)
      setShowModal(false)
      setFormData({ user_id: '', name: '', description: '', start_date: '', end_date: '' })
      fetchData()
    } catch (error) {
      alert(error.response?.data?.detail || 'Có lỗi xảy ra')
    }
  }

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId)
    return user ? (user.full_name || user.username) : `User #${userId}`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Kế hoạch tập luyện</h1>
          <p className="text-gray-400">Lập và quản lý lộ trình tập cho hội viên</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium hover:from-blue-700 transition-all shadow-lg">
          <Plus className="w-5 h-5" />
          Tạo kế hoạch
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên kế hoạch</th>
                <th>Hội viên</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-500">Đang tải...</td></tr>
              ) : plans.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-500">Chưa có kế hoạch nào</td></tr>
              ) : (
                plans.map((plan) => {
                  const now = new Date()
                  const start = new Date(plan.start_date)
                  const end = new Date(plan.end_date)
                  let status = 'Chưa bắt đầu'
                  let badge = 'badge-info'
                  if (now >= start && now <= end) { status = 'Đang tập'; badge = 'badge-success' }
                  else if (now > end) { status = 'Đã hoàn thành'; badge = 'badge-warning' }
                  return (
                    <tr key={plan.id}>
                      <td className="text-gray-400">#{plan.id}</td>
                      <td className="text-white font-medium">{plan.name}</td>
                      <td className="text-gray-300">{getUserName(plan.user_id)}</td>
                      <td className="text-gray-400">{new Date(plan.start_date).toLocaleDateString('vi-VN')}</td>
                      <td className="text-gray-400">{new Date(plan.end_date).toLocaleDateString('vi-VN')}</td>
                      <td><span className={`badge ${badge}`}>{status}</span></td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="p-6 border-b border-dark-600">
              <h2 className="text-xl font-bold text-white">Tạo kế hoạch tập mới</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Chọn hội viên *</label>
                <select required value={formData.user_id} onChange={(e) => setFormData({ ...formData, user_id: e.target.value })} className="input-field">
                  <option value="">-- Chọn hội viên --</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.username} - {user.full_name || 'Chưa có tên'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Tên kế hoạch *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Ngày bắt đầu *</label>
                  <input type="date" required value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Ngày kết thúc *</label>
                  <input type="date" required value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Mô tả</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field" rows={3} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-dark-600 text-gray-400 rounded-xl hover:bg-dark-700">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Tạo kế hoạch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}