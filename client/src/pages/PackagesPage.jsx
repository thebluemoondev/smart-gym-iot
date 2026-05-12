import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Package, CheckCircle } from 'lucide-react'
import { membershipAPI } from '../api/axios'

export default function PackagesPage() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const [formData, setFormData] = useState({ name: '', duration_days: 30, price: 0, description: '', is_active: true })

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const res = await membershipAPI.get('/packages/')
      setPackages(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingPackage) {
        await membershipAPI.put(`/packages/${editingPackage.id}`, formData)
      } else {
        await membershipAPI.post('/packages', formData)
      }
      setShowModal(false)
      setEditingPackage(null)
      setFormData({ name: '', duration_days: 30, price: 0, description: '', is_active: true })
      fetchPackages()
    } catch (error) {
      alert(error.response?.data?.detail || 'Có lỗi xảy ra')
    }
  }

  const openEdit = (pkg) => {
    setEditingPackage(pkg)
    setFormData({ name: pkg.name, duration_days: pkg.duration_days, price: pkg.price, description: pkg.description || '', is_active: pkg.is_active })
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý gói tập</h1>
          <p className="text-gray-400">Cấu hình các gói dịch vụ của phòng tập</p>
        </div>
        <button onClick={() => { setEditingPackage(null); setFormData({ name: '', duration_days: 30, price: 0, description: '', is_active: true }); setShowModal(true) }} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gymgreen-600 to-gymgreen-500 text-white rounded-xl font-medium hover:from-gymgreen-700 transition-all shadow-lg">
          <Plus className="w-5 h-5" />
          Thêm gói tập
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="stat-card animate-pulse">
              <div className="h-6 bg-dark-700 rounded w-2/3 mb-4" />
              <div className="h-4 bg-dark-700 rounded w-1/2" />
            </div>
          ))
        ) : (
          packages.map((pkg) => (
            <div key={pkg.id} className="stat-card card-hover overflow-hidden">
              <div className="bg-gradient-to-r from-gymgreen-600 to-gymgreen-500 p-6 -mx-6 -mt-6 mb-4">
                <div className="flex items-center justify-between">
                  <Package className="w-8 h-8 text-white" />
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${pkg.is_active ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'}`}>
                    {pkg.is_active ? 'Hoạt động' : 'Ngừng'}
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{pkg.description || 'Không có mô tả'}</p>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-gymgreen-400">{pkg.price?.toLocaleString('vi-VN')}</span>
                <span className="text-gray-500">VNĐ</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <span>Thời hạn:</span>
                <span className="text-white">{pkg.duration_days} ngày</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(pkg)} className="flex-1 px-4 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600 transition-colors">Sửa</button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="p-6 border-b border-dark-600">
              <h2 className="text-xl font-bold text-white">{editingPackage ? 'Sửa gói tập' : 'Thêm gói tập mới'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Tên gói tập *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" placeholder="VD: Gói VIP 1 tháng" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Thời hạn (ngày) *</label>
                  <input type="number" required min="1" value={formData.duration_days} onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Giá (VNĐ) *</label>
                  <input type="number" required min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Mô tả</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field" rows={3} />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-5 h-5 rounded bg-dark-700 border-dark-600 text-gymgreen-600 focus:ring-gymgreen-500" />
                <label className="text-sm text-gray-400">Kích hoạt gói tập</label>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-dark-600 text-gray-400 rounded-xl hover:bg-dark-700">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-gymgreen-600 text-white rounded-xl hover:bg-gymgreen-700">{editingPackage ? 'Lưu' : 'Thêm'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}