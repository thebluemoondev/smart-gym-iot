import { useState, useEffect } from 'react'
import { Plus, CreditCard, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { membershipAPI, userAPI } from '../api/axios'

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([])
  const [users, setUsers] = useState([])
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ user_id: '', package_id: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [subsRes, usersRes, packagesRes] = await Promise.all([
        membershipAPI.get('/subscriptions').catch(() => ({ data: [] })),
        userAPI.get('/').catch(() => ({ data: [] })),
        membershipAPI.get('/packages').catch(() => ({ data: [] }))
      ])
      setSubscriptions(subsRes.data)
      setUsers(usersRes.data)
      setPackages(packagesRes.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await membershipAPI.post('/subscriptions', formData)
      setShowModal(false)
      setFormData({ user_id: '', package_id: '' })
      fetchData()
    } catch (error) {
      alert(error.response?.data?.detail || 'Có lỗi xảy ra')
    }
  }

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId)
    return user ? (user.full_name || user.username) : `User #${userId}`
  }

  const getPackageName = (pkgId) => {
    const pkg = packages.find(p => p.id === pkgId)
    return pkg ? pkg.name : `Package #${pkgId}`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý đăng ký</h1>
          <p className="text-gray-400">Theo dõi và quản lý gói tập của hội viên</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-medium hover:from-primary-700 transition-all shadow-lg">
          <Plus className="w-5 h-5" />
          Đăng ký gói tập
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{subscriptions.length}</p>
              <p className="text-gray-400 text-sm">Tổng đăng ký</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-gymgreen-600 to-gymgreen-500 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{subscriptions.filter(s => s.is_active).length}</p>
              <p className="text-gray-400 text-sm">Đang hoạt động</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Hội viên</th>
                <th>Gói tập</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày hết hạn</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-500">Đang tải...</td></tr>
              ) : subscriptions.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-500">Chưa có đăng ký nào</td></tr>
              ) : (
                subscriptions.map((sub) => {
                  const isExpired = new Date(sub.end_date) < new Date()
                  return (
                    <tr key={sub.id}>
                      <td className="text-gray-400">#{sub.id}</td>
                      <td className="text-white font-medium">{getUserName(sub.user_id)}</td>
                      <td className="text-white">{getPackageName(sub.package_id)}</td>
                      <td className="text-gray-400">{new Date(sub.start_date).toLocaleDateString('vi-VN')}</td>
                      <td className="text-gray-400">{new Date(sub.end_date).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <span className={`badge ${sub.is_active && !isExpired ? 'badge-success' : 'badge-error'}`}>
                          {sub.is_active && !isExpired ? 'Hoạt động' : 'Hết hạn'}
                        </span>
                      </td>
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
              <h2 className="text-xl font-bold text-white">Đăng ký gói tập cho hội viên</h2>
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
                <label className="block text-sm font-medium text-gray-400 mb-2">Chọn gói tập *</label>
                <select required value={formData.package_id} onChange={(e) => setFormData({ ...formData, package_id: e.target.value })} className="input-field">
                  <option value="">-- Chọn gói tập --</option>
                  {packages.filter(p => p.is_active).map(pkg => (
                    <option key={pkg.id} value={pkg.id}>{pkg.name} - {pkg.duration_days} ngày ({pkg.price?.toLocaleString()} VNĐ)</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-dark-600 text-gray-400 rounded-xl hover:bg-dark-700">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700">Đăng ký</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}