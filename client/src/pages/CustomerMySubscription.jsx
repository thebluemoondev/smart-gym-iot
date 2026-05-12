import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CreditCard, Calendar, Clock, Check, AlertCircle, Sparkles, ArrowRight, X, Copy, CheckCircle, Building2, QrCode } from 'lucide-react'
import { membershipAPI, paymentAPI } from '../api/axios'
import { useAuth } from '../App'

// Payment Modal Component
function PaymentModal({ package: pkg, user, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [paymentResult, setPaymentResult] = useState(null)
  const [selectedMethod, setSelectedMethod] = useState('bank_transfer')
  const [copied, setCopied] = useState(false)
  const [discountCode, setDiscountCode] = useState('')
  const [discountApplied, setDiscountApplied] = useState(false)

  // Check if user is logged in
  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Yêu cầu đăng nhập</h3>
          <p className="text-gray-500 mb-4">Bạn cần đăng nhập để thanh toán</p>
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl mr-2">Đóng</button>
          <button onClick={() => window.location.href = '/login'} className="px-6 py-2 bg-primary-600 text-white rounded-xl">Đăng nhập</button>
        </div>
      </div>
    )
  }

  const createPayment = async () => {
    setLoading(true)
    try {
      const res = await paymentAPI.post('/create', null, {
        params: {
          user_id: user.id,
          subscription_id: pkg.id,
          amount: pkg.price,
          payment_method: selectedMethod,
          discount_code: discountCode || null
        }
      })
      setPaymentResult(res.data)
      // Nếu có mã giảm giá và thanh toán thành công
      if (res.data.discount_code && res.data.status === 'success') {
        setDiscountApplied(true)
      }
    } catch (e) {
      console.error('Payment error:', e)
      alert('Lỗi tạo thanh toán: ' + (e.response?.data?.detail || e.message))
    }
    setLoading(false)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    if (pkg && selectedMethod && user) {
      createPayment()
    }
  }, [pkg, selectedMethod, user])

  if (!pkg) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-bold text-gray-800">Thanh toán</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Package Info */}
        <div className="p-4 bg-gradient-to-r from-primary-50 to-gymgreen-50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Gói tập</p>
              <p className="text-lg font-bold text-gray-800">{pkg.name}</p>
            </div>
            <div className="text-right">
              {paymentResult?.discount_code ? (
                <>
                  <p className="text-xl font-bold text-gray-400 line-through">{paymentResult.original_amount?.toLocaleString()}đ</p>
                  <p className="text-2xl font-bold text-primary-600">{paymentResult.amount?.toLocaleString()}đ</p>
                  <span className="text-xs bg-gymgreen-100 text-gymgreen-600 px-2 py-1 rounded-full">Đã áp dụng: {paymentResult.discount_code}</span>
                </>
              ) : (
                <p className="text-2xl font-bold text-primary-600">{pkg.price?.toLocaleString()}đ</p>
              )}
              <p className="text-sm text-gray-500">{pkg.duration_days} ngày</p>
            </div>
          </div>
        </div>

        {/* Discount Code Input */}
        {!paymentResult && (
          <div className="p-4 border-b">
            <p className="font-medium text-gray-700 mb-2">Mã giảm giá</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                placeholder="Nhập mã giảm giá"
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-primary-500 focus:outline-none"
              />
              <button
                onClick={createPayment}
                disabled={loading}
                className="px-4 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                Áp dụng
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Ví dụ: THANHCHINH (Miễn phí), WELCOME50 (50%), GYM25 (25%)</p>
          </div>
        )}

        {/* Payment Method */}
        <div className="p-4">
          <p className="font-medium text-gray-700 mb-3">Phương thức thanh toán</p>
          <div className="space-y-2">
            <label className={`flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all ${selectedMethod === 'bank_transfer' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="radio" name="payment" value="bank_transfer" checked={selectedMethod === 'bank_transfer'} onChange={() => setSelectedMethod('bank_transfer')} className="hidden" />
              <Building2 className="w-6 h-6 text-primary-600 mr-3" />
              <div className="flex-1">
                <p className="font-medium text-gray-800">Chuyển khoản ngân hàng</p>
                <p className="text-sm text-gray-500">Quét QR code VPBank</p>
              </div>
              {selectedMethod === 'bank_transfer' && <CheckCircle className="w-5 h-5 text-primary-600" />}
            </label>
          </div>
        </div>

        {/* Payment Result */}
        {loading && (
          <div className="p-8 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tạo thanh toán...</p>
          </div>
        )}

        {paymentResult && !loading && (
          <div className="p-4">
            {paymentResult.qr_code_image && (
              <div className="text-center mb-4">
                <p className="font-medium text-gray-700 mb-2">Quét QR code</p>
                <div className="inline-block p-2 bg-white border-2 border-gray-200 rounded-xl">
                  <img src={paymentResult.qr_code_image} alt="QR Code" className="w-48 h-48" />
                </div>
              </div>
            )}

            {paymentResult.bank_info && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Building2 className="w-5 h-5" /> Thông tin chuyển khoản
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ngân hàng:</span>
                    <span className="font-medium text-gray-800">{paymentResult.bank_info.bank_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Số tài khoản:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-800 font-mono">{paymentResult.bank_info.account_number}</span>
                      <button onClick={() => copyToClipboard(paymentResult.bank_info.account_number)} className="p-1 hover:bg-gray-200 rounded">
                        {copied ? <CheckCircle className="w-4 h-4 text-gymgreen-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tên:</span>
                    <span className="font-medium text-gray-800">{paymentResult.bank_info.account_name}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2 mt-2">
                    <span className="text-gray-500">Nội dung CK:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-primary-600 font-mono">{paymentResult.order_id}</span>
                      <button onClick={() => copyToClipboard(paymentResult.order_id)} className="p-1 hover:bg-gray-200 rounded">
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-gray-500">Số tiền:</span>
                    <span className="font-bold text-primary-600">{paymentResult.amount?.toLocaleString()}đ</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Lưu ý:</strong> Vui lòng nhập đúng nội dung chuyển khoản để hệ thống tự động xác nhận.
              </p>
            </div>

            <button onClick={onClose} className="w-full py-3 bg-gradient-to-r from-primary-600 to-gymgreen-500 text-white rounded-xl font-semibold">
              Đã chuyển khoản - Xem kết quả
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CustomerMySubscription() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [packages, setPackages] = useState([])
  const [selectedPackage, setSelectedPackage] = useState(null)

  // Lấy package từ navigation state (khi chuyển từ trang packages)
  useEffect(() => {
    const pkg = location.state?.package
    if (pkg) {
      setSelectedPackage(pkg)
      // Clear state sau khi lấy
      window.history.replaceState(null, '')
    }
  }, [location.state])

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.id) {
          const res = await membershipAPI.get(`/subscriptions/active/${user.id}`)
          setSubscription(res.data)
        }
        const pkgRes = await membershipAPI.get('/packages')
        if (Array.isArray(pkgRes.data)) {
          setPackages(pkgRes.data)
        }
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchData()
  }, [user?.id])

  const handleRenew = () => {
    navigate('/packages')
  }

  const handleSelectPackage = (pkg) => {
    if (!user) {
      navigate('/login', { state: { from: '/customer/subscription', package: pkg } })
      return
    }
    setSelectedPackage(pkg)
  }

  const handleClosePayment = () => {
    setSelectedPackage(null)
    navigate('/customer/subscription', { replace: true })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Gói tập của tôi</h1>

      {/* Package Selection (when no active subscription) */}
      {!loading && !subscription && packages.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Đăng ký gói tập</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {packages.slice(0, 3).map((pkg) => (
              <div key={pkg.id} className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-primary-500 transition-all cursor-pointer" onClick={() => handleSelectPackage(pkg)}>
                <div className="text-center">
                  <p className="font-bold text-gray-800">{pkg.name}</p>
                  <p className="text-2xl font-bold text-primary-600">{pkg.price?.toLocaleString()}đ</p>
                  <p className="text-sm text-gray-500">{pkg.duration_days} ngày</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Payment Modal */}
      {selectedPackage && (
        <PaymentModal package={selectedPackage} user={user} onClose={handleClosePayment} />
      )}
    </div>
  )
}