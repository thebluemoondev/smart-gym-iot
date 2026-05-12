import { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, UserCheck, UserX, Mail, Phone, Calendar } from 'lucide-react'
import { userAPI } from '../api/axios'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: 'male',
    address: ''
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await userAPI.get('/')
      setUsers(res.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!search.trim()) {
      fetchUsers()
      return
    }
    setLoading(true)
    try {
      const res = await userAPI.get(`/user/search?q=${search}`)
      setUsers(res.data)
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingUser) {
        const { password, ...updateData } = formData
        await userAPI.put(`/user/${editingUser.id}`, password ? formData : updateData)
      } else {
        await userAPI.post('/user', formData)
      }
      setShowModal(false)
      setEditingUser(null)
      setFormData({ username: '', password: '', full_name: '', email: '', phone: '', date_of_birth: '', gender: 'male', address: '' })
      fetchUsers()
    } catch (error) {
      alert(error.response?.data?.detail || 'Có lỗi xảy ra')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa hội viên này?')) return
    try {
      await userAPI.delete(`/user/${id}`)
      fetchUsers()
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa')
    }
  }

  const openEdit = (user) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      password: '',
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      date_of_birth: user.date_of_birth || '',
      gender: user.gender || 'male',
      address: user.address || ''
    })
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý hội viên</h1>
          <p className="text-gray-400">Danh sách và quản lý hội viên</p>
        </div>
        <button
          onClick={() => { setEditingUser(null); setFormData({ username: '', password: '', full_name: '', email: '', phone: '', date_of_birth: '', gender: 'male', address: '' }); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-600 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Thêm hội viên
        </button>
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="input-field pl-10"
            />
          </div>
          <button onClick={handleSearch} className="btn-primary">
            Tìm
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên đăng nhập</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Ngày tạo</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-8 text-gray-500">Đang tải...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-8 text-gray-500">Không có dữ liệu</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="font-medium text-gray-400">#{user.id}</td>
                    <td className="font-medium text-white">{user.username}</td>
                    <td className="text-white">{user.full_name || '-'}</td>
                    <td className="text-gray-400">{user.email || '-'}</td>
                    <td className="text-gray-400">{user.phone || '-'}</td>
                    <td className="text-gray-500">{user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : '-'}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(user)} className="p-2 text-gymgreen-400 hover:bg-gymgreen-500/20 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="p-2 text-primary-400 hover:bg-primary-500/20 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
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
              <h2 className="text-xl font-bold text-white">{editingUser ? 'Sửa hội viên' : 'Thêm hội viên mới'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Tên đăng nhập *</label>
                <input type="text" required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="input-field" disabled={editingUser} />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Mật khẩu *</label>
                  <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-field" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Họ tên</label>
                <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Số điện thoại</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Ngày sinh</label>
                  <input type="date" value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Giới tính</label>
                  <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="input-field">
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Địa chỉ</label>
                <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="input-field" rows={2} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-dark-600 text-gray-400 rounded-xl hover:bg-dark-700 transition-colors">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">{editingUser ? 'Lưu' : 'Thêm'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}