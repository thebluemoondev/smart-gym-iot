import { useState, useEffect } from 'react'
import { Activity, Calendar, Clock, Dumbbell } from 'lucide-react'
import { workoutAPI, userAPI } from '../api/axios'

export default function WorkoutHistoryPage() {
  const [history, setHistory] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [usersRes] = await Promise.all([userAPI.get('/').catch(() => ({ data: [] }))])
      setUsers(usersRes.data)
      const historyRes = await workoutAPI.get('/history/user/1').catch(() => ({ data: [] }))
      setHistory(historyRes.data)
    } catch (error) { console.error('Error:', error) }
    finally { setLoading(false) }
  }

  const handleUserChange = async (userId) => {
    setSelectedUser(userId)
    if (!userId) { const res = await workoutAPI.get('/history/user/1').catch(() => ({ data: [] })); setHistory(res.data); return }
    try { const res = await workoutAPI.get(`/history/user/${userId}`); setHistory(res.data) } catch (error) { console.error('Error:', error) }
  }

  const getUserName = (userId) => { const user = users.find(u => u.id === userId); return user ? (user.full_name || user.username) : `User #${userId}` }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Lịch sử tập luyện</h1>
          <p className="text-gray-400">Theo dõi quá trình tập luyện của hội viên</p>
        </div>
        <select value={selectedUser} onChange={(e) => handleUserChange(e.target.value)} className="input-field w-auto">
          <option value="">-- Tất cả hội viên --</option>
          {users.map(user => (<option key={user.id} value={user.id}>{user.username} - {user.full_name || 'Chưa có tên'}</option>))}
        </select>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="table-container">
          <table>
            <thead>
              <tr><th>ID</th><th>Hội viên</th><th>Bài tập</th><th>Số hiệp/Số lần</th><th>Mức tạ</th><th>Ngày tập</th><th>Thời lượng</th></tr>
            </thead>
            <tbody>
              {loading ? (<tr><td colSpan="7" className="text-center py-8 text-gray-500">Đang tải...</td></tr>) : history.length === 0 ? (<tr><td colSpan="7" className="text-center py-8 text-gray-500">Chưa có lịch sử tập nào</td></tr>) : (
                history.map((h) => (
                  <tr key={h.id}>
                    <td className="text-gray-400">#{h.id}</td>
                    <td className="text-white font-medium">{getUserName(h.user_id)}</td>
                    <td className="text-white">{h.exercise_name || `Bài tập #${h.exercise_id}`}</td>
                    <td className="text-gray-400">{h.sets} hiệp x {h.reps} lần</td>
                    <td className="text-gray-400">{h.weight ? `${h.weight} kg` : '-'}</td>
                    <td className="text-gray-400">{new Date(h.workout_date).toLocaleDateString('vi-VN')}</td>
                    <td className="text-gray-400">{h.duration_minutes ? `${h.duration_minutes} phút` : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}