import { useState, useEffect } from 'react'
import { Plus, Dumbbell, CheckCircle, XCircle, Wrench } from 'lucide-react'
import { facilityAPI } from '../api/axios'

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', type: 'Cardio', status: 'available', location: '', purchase_date: '', notes: '' })

  useEffect(() => { fetchEquipment() }, [])

  const fetchEquipment = async () => {
    try { const res = await facilityAPI.get('/equipment'); setEquipment(res.data) }
    catch (error) { console.error('Error:', error) }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try { await facilityAPI.post('/equipment', formData); setShowModal(false); setFormData({ name: '', type: 'Cardio', status: 'available', location: '', purchase_date: '', notes: '' }); fetchEquipment() }
    catch (error) { alert(error.response?.data?.detail || 'Có lỗi xảy ra') }
  }

  const statusColors = { available: 'badge-success', in_use: 'badge-info', maintenance: 'badge-warning', broken: 'badge-error' }
  const statusLabels = { available: 'Sẵn sàng', in_use: 'Đang dùng', maintenance: 'Bảo trì', broken: 'Hỏng' }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-white">Quản lý thiết bị</h1><p className="text-gray-400">Quản lý tài sản thiết bị phòng tập</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-medium hover:from-orange-700 transition-all shadow-lg">
          <Plus className="w-5 h-5" /> Thêm thiết bị
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-orange-500 rounded-xl flex items-center justify-center"><Dumbbell className="w-6 h-6 text-white" /></div>
            <div><p className="text-2xl font-bold text-white">{equipment.length}</p><p className="text-gray-400 text-sm">Tổng thiết bị</p></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4"><div className="w-12 h-12 bg-gradient-to-r from-gymgreen-600 to-gymgreen-500 rounded-xl flex items-center justify-center"><CheckCircle className="w-6 h-6 text-white" /></div>
            <div><p className="text-2xl font-bold text-white">{equipment.filter(e => e.status === 'available').length}</p><p className="text-gray-400 text-sm">Sẵn sàng</p></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4"><div className="w-12 h-12 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-xl flex items-center justify-center"><Wrench className="w-6 h-6 text-white" /></div>
            <div><p className="text-2xl font-bold text-white">{equipment.filter(e => e.status === 'maintenance').length}</p><p className="text-gray-400 text-sm">Đang bảo trì</p></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4"><div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-500 rounded-xl flex items-center justify-center"><XCircle className="w-6 h-6 text-white" /></div>
            <div><p className="text-2xl font-bold text-white">{equipment.filter(e => e.status === 'broken').length}</p><p className="text-gray-400 text-sm">Hỏng</p></div>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="table-container">
          <table>
            <thead>
              <tr><th>ID</th><th>Tên thiết bị</th><th>Loại</th><th>Vị trí</th><th>Ngày mua</th><th>Trạng thái</th></tr>
            </thead>
            <tbody>
              {loading ? (<tr><td colSpan="6" className="text-center py-8 text-gray-500">Đang tải...</td></tr>) : equipment.length === 0 ? (<tr><td colSpan="6" className="text-center py-8 text-gray-500">Chưa có thiết bị nào</td></tr>) : (
                equipment.map((eq) => (
                  <tr key={eq.id}>
                    <td className="text-gray-400">#{eq.id}</td>
                    <td className="text-white font-medium">{eq.name}</td>
                    <td className="text-gray-300">{eq.type}</td>
                    <td className="text-gray-400">{eq.location || '-'}</td>
                    <td className="text-gray-400">{eq.purchase_date ? new Date(eq.purchase_date).toLocaleDateString('vi-VN') : '-'}</td>
                    <td><span className={`badge ${statusColors[eq.status] || statusColors.available}`}>{statusLabels[eq.status] || 'Sẵn sàng'}</span></td>
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
            <div className="p-6 border-b border-dark-600"><h2 className="text-xl font-bold text-white">Thêm thiết bị mới</h2></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-400 mb-2">Tên thiết bị *</label><input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-400 mb-2">Loại thiết bị</label><select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="input-field"><option value="Cardio">Cardio</option><option value="Strength">Strength</option><option value="Flexibility">Flexibility</option><option value="Other">Other</option></select></div>
                <div><label className="block text-sm font-medium text-gray-400 mb-2">Trạng thái</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="input-field"><option value="available">Sẵn sàng</option><option value="in_use">Đang dùng</option><option value="maintenance">Bảo trì</option><option value="broken">Hỏng</option></select></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-400 mb-2">Vị trí</label><input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="input-field" /></div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-dark-600 text-gray-400 rounded-xl hover:bg-dark-700">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700">Thêm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}