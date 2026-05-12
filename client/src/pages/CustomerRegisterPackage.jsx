import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Calendar, Clock, Check, AlertCircle, Sparkles, ArrowRight, X, Copy, CheckCircle, Building2, Package, ChevronRight, CheckCircle2 } from 'lucide-react'
import { membershipAPI, paymentAPI } from '../api/axios'
import { useAuth } from '../App'

// Payment Modal Component
function PaymentModal({ package: pkg, user, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [paymentResult, setPaymentResult] = useState(null)
  const [selectedMethod, setSelectedMethod] = useState('bank_transfer')
  const [copied, setCopied] = useState(false)
  const [discountCode, setDiscountCode] = useState('')

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
          <button onClick={() => navigate('/login')} className="px-6 py-2 bg-primary-600 text-white rounded-xl">Đăng nhập</button>
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

  if (!pkg) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-bold text-gray-800">Thanh toán</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-gradient-to-r from-primary-50 to-gymgreen-50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Gói tập</p>
              <p className="text-lg font-bold text-gray-800">{pkg.name}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-600">{pkg.price?.toLocaleString()}đ</p>
              <p className="text-sm text-gray-500">{pkg.duration_days} ngày</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-b">
          <p className="font-medium text-gray-700 mb-2">Mã giảm giá (nếu có)</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              placeholder="Nhập mã giảm giá"
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-primary-500 focus:outline-none"
            />
            <button onClick={createPayment} disabled={loading} className="px-4 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50">
              Áp dụng
            </button>
          </div>
        </div>

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
                <strong>Lưu ý:</strong> Sau khi chuyển khoản, admin sẽ xác nhận và kích hoạt gói tập cho bạn.
              </p>
            </div>

            <button onClick={onClose} className="w-full py-3 bg-gradient-to-r from-primary-600 to-gymgreen-500 text-white rounded-xl font-semibold">
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CustomerRegisterPackage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [packages, setPackages] = useState([])
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [step, setStep] = useState(1) // 1: select package, 2: confirm

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
      } catch (e) {
        console.error(e)
      }
      finally { setLoading(false) }
    }
    fetchData()
  }, [user?.id])

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg)
    setStep(2)
  }

  const handleBack = () => {
    setStep(1)
    setSelectedPackage(null)
  }

  const handlePaymentSuccess = () => {
    if (user?.id) {
      membershipAPI.get(`/subscriptions/active/${user.id}`).then(res => {
        setSubscription(res.data)
      })
    }
    navigate('/customer/subscription')
  }

  // If user has active subscription - show current package info and button to renew
  if (subscription && subscription.status === 'active') {
    const daysRemaining = subscription?.end_date
      ? Math.max(0, Math.ceil((new Date(subscription.end_date) - new Date()) / (1000 * 60 * 60 * 24)))
      : 0

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gymgreen-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-gymgreen-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Bạn đã có gói tập</h1>
          <p className="text-gray-500">Gói tập hiện tại của bạn</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-gymgreen-500 to-primary-500 p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">Gói tập hiện tại</p>
                <h2 className="text-3xl font-bold">{subscription.package_name || 'Gói tập'}</h2>
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
                <p className="font-semibold text-gymgreen-600">Hoạt động</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl border border-primary-100">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-primary-600" />
                <div>
                  <p className="font-medium text-gray-800">Còn {daysRemaining} ngày</p>
                  <p className="text-sm text-gray-500">Hãy tập chăm để đạt hiệu quả tốt nhất!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => setStep(1)}
            className="px-8 py-3 bg-gradient-to-r from-primary-600 to-gymgreen-500 text-white rounded-xl font-semibold inline-flex items-center gap-2"
          >
            <Package className="w-5 h-5" />
            Gia hạn / Đổi gói tập
          </button>
        </div>

        {step === 1 && packages.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Chọn gói tập mới</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-primary-500 transition-all cursor-pointer"
                  onClick={() => handleSelectPackage(pkg)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{pkg.name}</h3>
                    <Package className="w-6 h-6 text-primary-600" />
                  </div>
                  <p className="text-gray-500 text-sm mb-4">{pkg.package_desc}</p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-2xl font-bold text-primary-600">{pkg.price?.toLocaleString()}đ</span>
                    <span className="text-gray-400 text-sm">/{pkg.duration_days} ngày</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {(pkg.price / pkg.duration_days).toFixed(0)}k/ngày
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && selectedPackage && (
          <PaymentModal
            package={selectedPackage}
            user={user}
            onClose={handleBack}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    )
  }

  // If no active subscription - show registration form
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  // Step 1: Select Package
  if (step === 1) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Đăng ký gói tập</h1>
          <p className="text-gray-500">Chọn gói tập phù hợp với bạn</p>
        </div>

        {packages.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-primary-500 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => handleSelectPackage(pkg)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">{pkg.name}</h3>
                  <Package className="w-6 h-6 text-primary-600 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-gray-500 text-sm mb-4">{pkg.package_desc}</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-bold text-primary-600">{pkg.price?.toLocaleString()}đ</span>
                  <span className="text-gray-400 text-sm">/{pkg.duration_days} ngày</span>
                </div>
                <div className="text-xs text-gray-400 mb-4">
                  {(pkg.price / pkg.duration_days).toFixed(0)}k/ngày
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-gray-500">Chọn gói</span>
                  <ChevronRight className="w-5 h-5 text-primary-600" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Hiện không có gói tập nào</p>
          </div>
        )}
      </div>
    )
  }

  // Step 2: Payment
  if (step === 2 && selectedPackage) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6">
          <ChevronRight className="w-5 h-5 rotate-180" />
          Quay lại
        </button>

        <div className="bg-white rounded-2xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Xác nhận đăng ký</h2>

          <div className="bg-primary-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Gói tập</p>
                <p className="text-2xl font-bold text-gray-800">{selectedPackage.name}</p>
                <p className="text-gray-500">{selectedPackage.duration_days} ngày</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary-600">{selectedPackage.price?.toLocaleString()}đ</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              // Open payment modal by setting up state
              const modal = document.getElementById('payment-modal')
              if (modal) modal.showModal()
            }}
            className="w-full py-4 bg-gradient-to-r from-primary-600 to-gymgreen-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            Tiến hành thanh toán
          </button>
        </div>

        <PaymentModal
          package={selectedPackage}
          user={user}
          onClose={handleBack}
          onSuccess={handlePaymentSuccess}
        />
      </div>
    )
  }

  return null
}