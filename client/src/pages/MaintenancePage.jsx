import { useState, useEffect } from 'react'
import { Plus, Wrench, Calendar } from 'lucide-react'
import { facilityAPI } from '../api/axios'

export default function MaintenancePage() {
  const [maintenance, setMaintenance] = useState([])
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ equipment_id: '', maintenance_type: 'preventive', description: '', cost: 0, performed_by: '', next_maintenance_date: '' })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [eqRes] = await Promise.all([facilityAPI.get('/facility/equipment').catch(() => ({ data: [] }))])
      setEquipment(eqRes.data)
      setMaintenance(eqRes.data.flatMap(e => (e.maintenance_logs || []).map(log => ({ ...log, equipment_name: e.name }))))
    } catch (error) { console.error('Error:', error) }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try { await facilityAPI.post('/facility/maintenance', formData); setShowModal(false); setFormData({ equipment_id: '', maintenance_type: 'preventive', description: '', cost: 0, performed_by: '', next_maintenance_date: '' }); fetchData() }
    catch (error) { alert(error.response?.data?.detail || 'Có lỗi xảy ra') }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-white">Quản lý bảo trì</h1><p className="text-gray-400">Theo dõi lịch sử bảo trì thiết bị</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl font-medium hover:from-teal-700 transition-all shadow-lg">
          <Plus className="w-5 h-5" /> Ghi nhận bảo trì
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="table-container">
          <table>
            <thead><tr><th>ID</th><th>Thiết bị</th><th>Loại bảo trì</th><th>Mô tả</th><th>Chi phí</th><th>Ngày thực hiện</th><th>Người thực hiện</th></tr></thead>
            <tbody>
              {loading ? (<tr><td colSpan="7" className="text-center py-8 text-gray-500">Đang tải...</td></tr>) : maintenance.length === 0 ? (<tr><td colSpan="7" className="text-center py-8 text-gray-500">Chưa có lịch sử bảo trì</td></tr>) : (
                maintenance.map((log) => (
                  <tr key={log.id}>
                    <td className="text-gray-400">#{log.id}</td>
                    <td className="text-white font-medium">{log.equipment_name}</td>
                    <td className="text-gray-300">{log.maintenance_type === 'preventive' ? 'Bảo trì định kỳ' : log.maintenance_type === 'corrective' ? 'Sửa chữa' : 'Khác'}</td>
                    <td className="text-gray-400">{log.description || '-'}</td>
                    <td className="text-gray-400">{log.cost ? `${log.cost.toLocaleString()} VNĐ` : '-'}</td>
                    <td className="text-gray-400">{log.maintenance_date ? new Date(log.maintenance_date).toLocaleDateString('vi-VN') : '-'}</td>
                    <td className="text-gray-400">{log.performed_by || '-'}</td>
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
            <div className="p-6 border-b border-dark-600"><h2 className="text-xl font-bold text-white">Ghi nhận bảo trì</h2></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-400 mb-2">Chọn thiết bị *</label><select required value={formData.equipment_id} onChange={(e) => setFormData({ ...formData, equipment_id: e.target.value })} className="input-field"><option value="">-- Chọn thiết bị --</option>{equipment.map(eq => (<option key={eq.id} value={eq.id}>{eq.name}</option>))}</select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-400 mb-2">Loại bảo trì</label><select value={formData.maintenance_type} onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })} className="input-field"><option value="preventive">Bảo trì định kỳ</option><option value="corrective">Sửa chữa</option><option value="emergency">Khẩn cấp</option></select></div>
                <div><label className="block text-sm font-medium text-gray-400 mb-2">Chi phí (VNĐ)</label><input type="number" min="0" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })} className="input-field" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-400 mb-2">Mô tả</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field" rows={3} /></div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-dark-600 text-gray-400 rounded-xl hover:bg-dark-700">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700">Ghi nhận</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}