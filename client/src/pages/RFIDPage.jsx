import { useState, useEffect } from 'react'
import { Plus, CreditCard, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { userAPI } from '../api/axios'

export default function RFIDPage() {
  const [rfids, setRfids] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ card_uid: '', user_id: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [usersRes] = await Promise.all([userAPI.get('/')])
      setUsers(usersRes.data)
      setRfids(usersRes.data.filter(u => u.rfid_card).map(u => ({ ...u.rfid_card, user_name: u.full_name || u.username })))
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await userAPI.post('/rfid', formData)
      setShowModal(false)
      setFormData({ card_uid: '', user_id: '' })
      alert('Gán thẻ RFID thành công!')
    } catch (error) {
      alert(error.response?.data?.detail || 'Có lỗi xảy ra')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý thẻ RFID</h1>
          <p className="text-gray-400">Gán và quản lý thẻ từ cho hội viên</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-medium hover:from-primary-700 transition-all shadow-lg">
          <Plus className="w-5 h-5" />
          Gán thẻ RFID
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{rfids.length}</p>
              <p className="text-gray-400 text-sm">Tổng thẻ RFID</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-gymgreen-600 to-gymgreen-500 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{rfids.filter(r => r.is_active).length}</p>
              <p className="text-gray-400 text-sm">Thẻ đang hoạt động</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-500 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{rfids.filter(r => !r.is_active).length}</p>
              <p className="text-gray-400 text-sm">Thẻ bị khóa</p>
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
                <th>Mã thẻ (UID)</th>
                <th>Hội viên</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8 text-gray-500">Đang tải...</td></tr>
              ) : rfids.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-gray-500">Chưa có thẻ RFID nào</td></tr>
              ) : (
                rfids.map((rfid) => (
                  <tr key={rfid.id}>
                    <td className="text-gray-400">#{rfid.id}</td>
                    <td className="font-mono text-white">{rfid.card_uid}</td>
                    <td className="text-white">{rfid.user_name}</td>
                    <td>
                      <span className={`badge ${rfid.is_active ? 'badge-success' : 'badge-error'}`}>
                        {rfid.is_active ? 'Hoạt động' : 'Khóa'}
                      </span>
                    </td>
                    <td className="text-gray-500">{rfid.created_at ? new Date(rfid.created_at).toLocaleDateString('vi-VN') : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="p-6 border-b border-dark-600">
              <h2 className="text-xl font-bold text-white">Gán thẻ RFID cho hội viên</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Mã thẻ (UID) *</label>
                <input type="text" required placeholder="Nhập mã UID của thẻ" value={formData.card_uid} onChange={(e) => setFormData({ ...formData, card_uid: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Chọn hội viên *</label>
                <select required value={formData.user_id} onChange={(e) => setFormData({ ...formData, user_id: e.target.value })} className="input-field">
                  <option value="">-- Chọn hội viên --</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.username} - {user.full_name || 'Chưa có tên'}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-dark-600 text-gray-400 rounded-xl hover:bg-dark-700">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700">Gán thẻ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}