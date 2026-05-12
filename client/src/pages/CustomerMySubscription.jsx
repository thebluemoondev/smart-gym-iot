import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CreditCard, Calendar, Clock, Check, AlertCircle, Sparkles, ArrowRight } from 'lucide-react'
import { membershipAPI } from '../api/axios'
import { useAuth } from '../App'

export default function CustomerMySubscription() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [packages, setPackages] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.id) {
          const res = await membershipAPI.get(`/subscriptions/active/${user.id}`)
          setSubscription(res.data)
        }
        const pkgRes = await membershipAPI.get('/packages')
        setPackages(pkgRes.data)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchData()
  }, [user?.id])

  const handleRenew = () => {
    navigate('/packages')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Gói tập của tôi</h1>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : subscription ? (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-gymgreen-500 to-primary-500 p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">Gói tập hiện tại</p>
                <h2 className="text-3xl font-bold">{subscription.package_name || 'Gói VIP'}</h2>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <CreditCard className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="p-8">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <span className="text-sm text-gray-500">Ngày bắt đầu</span>
                </div>
                <p className="font-semibold text-gray-800">
                  {subscription.start_date ? new Date(subscription.start_date).toLocaleDateString('vi-VN') : 'N/A'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-gray-500">Ngày hết hạn</span>
                </div>
                <p className="font-semibold text-gray-800">
                  {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString('vi-VN') : 'N/A'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-5 h-5 text-gymgreen-500" />
                  <span className="text-sm text-gray-500">Trạng thái</span>
                </div>
                <p className="font-semibold text-gymgreen-600">{subscription.status === 'active' ? 'Hoạt động' : subscription.status}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl border border-primary-100">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-primary-600" />
                <div>
                  <p className="font-medium text-gray-800">Còn {Math.max(0, Math.ceil((new Date(subscription.end_date) - new Date()) / (1000 * 60 * 60 * 24)))} ngày</p>
                  <p className="text-sm text-gray-500">Hãy tập chăm để đạt hiệu quả tốt nhất!</p>
                </div>
              </div>
              <button onClick={handleRenew} className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700">
                Gia hạn
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Bạn chưa có gói tập</h2>
          <p className="text-gray-500 mb-6">Đăng ký ngay để bắt đầu hành trình fitness của bạn!</p>
          <button onClick={() => navigate('/packages')} className="px-8 py-3 bg-gradient-to-r from-primary-600 to-gymgreen-500 text-white rounded-xl font-semibold hover:opacity-90 flex items-center gap-2 mx-auto">
            Xem gói tập <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}