import { useState, useEffect } from 'react'
import { MapPin, Plus } from 'lucide-react'
import { facilityAPI } from '../api/axios'

export default function AreasPage() {
  const [areas, setAreas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '', capacity: 0, zone: '' })

  useEffect(() => { fetchAreas() }, [])

  const fetchAreas = async () => {
    try { const res = await facilityAPI.get('/facility/areas'); setAreas(res.data) }
    catch (error) { console.error('Error:', error) }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try { await facilityAPI.post('/facility/areas', formData); setShowModal(false); setFormData({ name: '', description: '', capacity: 0, zone: '' }); fetchAreas() }
    catch (error) { alert(error.response?.data?.detail || 'Có lỗi xảy ra') }
  }

  const zoneColors = { 'Cardio Zone': 'from-red-600 to-red-500', 'Strength Zone': 'from-blue-600 to-blue-500', 'Free Weight': 'from-purple-600 to-purple-500', 'Yoga Studio': 'from-pink-600 to-pink-500', 'Locker Room': 'from-gray-600 to-gray-500', 'Reception': 'from-yellow-600 to-yellow-500' }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-white">Quản lý khu vực</h1><p className="text-gray-400">Các phân khu trong phòng tập</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-xl font-medium hover:from-cyan-700 transition-all shadow-lg">
          <Plus className="w-5 h-5" /> Thêm khu vực
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (Array(4).fill(0).map((_, i) => (<div key={i} className="stat-card animate-pulse"><div className="h-6 bg-dark-700 rounded w-2/3 mb-4" /></div>))) : (
          areas.map((area) => (
            <div key={area.id} className="stat-card card-hover overflow-hidden">
              <div className={`bg-gradient-to-r ${zoneColors[area.zone] || 'from-gray-600 to-gray-500'} p-6 -mx-6 -mt-6 mb-4`}>
                <div className="flex items-center justify-between">
                  <MapPin className="w-8 h-8 text-white" />
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">{area.zone || 'Khu vực'}</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{area.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{area.description || 'Không có mô tả'}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Sức chứa:</span>
                <span className="text-white font-medium">{area.capacity || 'Không giới hạn'}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="p-6 border-b border-dark-600"><h2 className="text-xl font-bold text-white">Thêm khu vực mới</h2></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-400 mb-2">Tên khu vực *</label><input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-gray-400 mb-2">Khu vực</label><select value={formData.zone} onChange={(e) => setFormData({ ...formData, zone: e.target.value })} className="input-field"><option value="">-- Chọn khu vực --</option><option value="Cardio Zone">Cardio Zone</option><option value="Strength Zone">Strength Zone</option><option value="Free Weight">Free Weight</option><option value="Yoga Studio">Yoga Studio</option><option value="Locker Room">Locker Room</option><option value="Reception">Reception</option></select></div>
              <div><label className="block text-sm font-medium text-gray-400 mb-2">Sức chứa</label><input type="number" min="0" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-gray-400 mb-2">Mô tả</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field" rows={3} /></div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-dark-600 text-gray-400 rounded-xl hover:bg-dark-700">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700">Thêm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}