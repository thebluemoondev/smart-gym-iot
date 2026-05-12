import { useState, useEffect } from 'react'
import { Plus, Dumbbell, CheckCircle } from 'lucide-react'
import { workoutAPI } from '../api/axios'

export default function ExercisesPage() {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '', muscle_group: '', difficulty: 'beginner', equipment_needed: '' })

  useEffect(() => {
    fetchExercises()
  }, [])

  const fetchExercises = async () => {
    try {
      const res = await workoutAPI.get('/exercises')
      setExercises(res.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await workoutAPI.post('/exercises', formData)
      setShowModal(false)
      setFormData({ name: '', description: '', muscle_group: '', difficulty: 'beginner', equipment_needed: '' })
      fetchExercises()
    } catch (error) {
      alert(error.response?.data?.detail || 'Có lỗi xảy ra')
    }
  }

  const difficultyColors = {
    beginner: 'badge-success',
    intermediate: 'badge-warning',
    advanced: 'badge-error'
  }

  const difficultyLabels = {
    beginner: 'Người mới',
    intermediate: 'Trung cấp',
    advanced: 'Nâng cao'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý bài tập</h1>
          <p className="text-gray-400">Thư viện bài tập của phòng tập</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl font-medium hover:from-purple-700 transition-all shadow-lg">
          <Plus className="w-5 h-5" />
          Thêm bài tập
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="stat-card animate-pulse">
              <div className="h-6 bg-dark-700 rounded w-2/3 mb-4" />
              <div className="h-4 bg-dark-700 rounded w-1/2" />
            </div>
          ))
        ) : (
          exercises.map((ex) => (
            <div key={ex.id} className="stat-card card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl flex items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-white" />
                </div>
                <span className={`badge ${difficultyColors[ex.difficulty] || difficultyColors.beginner}`}>
                  {difficultyLabels[ex.difficulty] || 'Người mới'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{ex.name}</h3>
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">{ex.description || 'Không có mô tả'}</p>
              <div className="flex flex-wrap gap-2">
                {ex.muscle_group && <span className="px-2 py-1 bg-dark-700 rounded-lg text-xs text-gray-400">{ex.muscle_group}</span>}
                {ex.equipment_needed && <span className="px-2 py-1 bg-dark-700 rounded-lg text-xs text-gray-400">{ex.equipment_needed}</span>}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="p-6 border-b border-dark-600">
              <h2 className="text-xl font-bold text-white">Thêm bài tập mới</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Tên bài tập *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Nhóm cơ</label>
                  <input type="text" value={formData.muscle_group} onChange={(e) => setFormData({ ...formData, muscle_group: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Cấp độ</label>
                  <select value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })} className="input-field">
                    <option value="beginner">Người mới</option>
                    <option value="intermediate">Trung cấp</option>
                    <option value="advanced">Nâng cao</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Thiết bị cần thiết</label>
                <input type="text" value={formData.equipment_needed} onChange={(e) => setFormData({ ...formData, equipment_needed: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Mô tả</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field" rows={3} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-dark-600 text-gray-400 rounded-xl hover:bg-dark-700">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700">Thêm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}