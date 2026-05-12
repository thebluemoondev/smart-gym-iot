import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ArrowRight, Star, Zap, ShoppingCart, X, Heart, Shield, Clock, Award, Sparkles, Flame, Crown, ChevronRight, Building2, QrCode } from 'lucide-react'
import { membershipAPI, paymentAPI } from '../api/axios'
import { useAuth } from '../App'

// Shopping Cart Component
function Cart({ cart, setCart, onCheckout }) {
  const total = cart.reduce((sum, item) => sum + item.price, 0)

  if (cart.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-80 z-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary-600" />
          <span className="font-semibold text-gray-800">Giỏ hàng ({cart.length})</span>
        </div>
        <button onClick={() => setCart([])} className="text-gray-400 hover:text-red-500">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
        {cart.map((item, i) => (
          <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
            <span className="text-sm text-gray-700">{item.name}</span>
            <span className="font-medium text-primary-600">{item.price.toLocaleString()}đ</span>
          </div>
        ))}
      </div>
      <div className="border-t pt-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-600">Tổng cộng:</span>
          <span className="text-xl font-bold text-primary-600">{total.toLocaleString()}đ</span>
        </div>
        <button onClick={onCheckout} className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-600 transition-all">
          Tiến hành thanh toán
        </button>
      </div>
    </div>
  )
}

// Package Card Component
function PackageCard({ pkg, onAddToCart, isInCart, onBuyNow }) {
  const [isHovered, setIsHovered] = useState(false)

  const packageIcons = {
    'Basic': Shield,
    'VIP': Star,
    'Premium': Crown,
    'Standard': Award,
    'Pro': Zap,
    'Default': Sparkles
  }

  const packageColors = {
    'Basic': 'from-gray-500 to-slate-600',
    'VIP': 'from-yellow-500 to-amber-600',
    'Premium': 'from-purple-500 to-indigo-600',
    'Standard': 'from-blue-500 to-cyan-600',
    'Pro': 'from-red-500 to-orange-600',
    'Default': 'from-primary-500 to-gymgreen-500'
  }

  const Icon = packageIcons[pkg.name] || packageIcons['Default']
  const colorClass = packageColors[pkg.name] || packageColors['Default']

  const defaultFeatures = {
    'Basic': ['Tập không giới hạn', 'Sử dụng thiết bị cơ bản', 'Theo dõi tiến độ', 'App mobile'],
    'VIP': ['Tất cả tiện ích Basic', 'Sử dụng máy móc cao cấp', 'AI hỗ trợ', '1 buổi HLV/tuần', 'Khóa tủ riêng'],
    'Premium': ['Tất cả tiện ích VIP', 'Không giới hạn HLV', 'Sauna & Steam', 'Ưu tiên đặt lịch', 'Nước uống miễn phí', 'Khăn tắm miễn phí']
  }

  const features = pkg.features || defaultFeatures[pkg.name] || defaultFeatures['Basic']

  return (
    <div
      className={`relative bg-white rounded-3xl border-2 overflow-hidden transition-all duration-300 ${pkg.popular ? 'border-gymgreen-500 shadow-xl transform scale-[1.02]' : 'border-gray-100 shadow-lg hover:shadow-2xl'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {pkg.popular && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-gymgreen-500 to-gymgreen-600 text-white py-2 text-center text-sm font-semibold flex items-center justify-center gap-1">
          <Crown className="w-4 h-4" /> Phổ biến nhất
        </div>
      )}

      <div className="p-6 pt-8">
        {/* Package Icon */}
        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${colorClass} flex items-center justify-center mx-auto mb-6 shadow-lg`}>
          <Icon className="w-10 h-10 text-white" />
        </div>

        {/* Package Info */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{pkg.name}</h3>
          <p className="text-gray-500">{pkg.description || pkg.package_desc || 'Phù hợp nhu cầu của bạn'}</p>
        </div>

        {/* Price */}
        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-primary-600">{pkg.price?.toLocaleString()}</span>
            <span className="text-gray-500">VNĐ</span>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">{pkg.duration_days} ngày</span>
            <span className="text-xs text-gymgreen-500 bg-gymgreen-100 px-2 py-0.5 rounded-full">
              {(pkg.price / pkg.duration_days).toFixed(0)}k/ngày
            </span>
          </div>
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-8">
          {features.slice(0, 5).map((f, i) => (
            <li key={i} className="flex items-center gap-3 text-gray-600">
              <div className="w-6 h-6 rounded-full bg-gymgreen-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-gymgreen-600" />
              </div>
              <span className="text-sm">{f}</span>
            </li>
          ))}
          {features.length > 5 && (
            <li className="text-sm text-gray-400 pl-9">+ {features.length - 5} tiện ích khác</li>
          )}
        </ul>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart(pkg)}
          disabled={isInCart}
          className={`w-full py-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 ${
            isInCart
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : pkg.popular
                ? 'bg-gradient-to-r from-gymgreen-500 to-gymgreen-600 text-white hover:shadow-lg hover:scale-[1.02]'
                : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:shadow-lg hover:scale-[1.02]'
          }`}
        >
          {isInCart ? (
            <>
              <Check className="w-5 h-5" /> Đã thêm vào giỏ
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" /> Mua ngay
            </>
          )}
        </button>
      </div>

      {/* Hover decoration */}
      <div className={`absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-r ${colorClass} opacity-10 rounded-full transition-transform duration-300 ${isHovered ? 'scale-150' : 'scale-100'}`} />
    </div>
  )
}

export default function CustomerPackages({ user: propUser }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentResult, setPaymentResult] = useState(null)
  const [discountCode, setDiscountCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState('bank_transfer')

  useEffect(() => {
    membershipAPI.get('/packages/').then(r => {
      if (Array.isArray(r.data)) {
        const pkgs = r.data.map(p => ({
          ...p,
          popular: p.name?.toLowerCase().includes('vip') || p.popular
        }))
        setPackages(pkgs)
      }
    }).catch(() => {
      setPackages([
        { id: 1, name: 'Basic', price: 299000, duration_days: 30, description: 'Phù hợp cho người mới bắt đầu', popular: false },
        { id: 2, name: 'VIP', price: 499000, duration_days: 30, description: 'Phổ biến nhất - Best seller', popular: true },
        { id: 3, name: 'Premium', price: 799000, duration_days: 30, description: 'Trải nghiệm đẳng cấp', popular: false }
      ])
    }).finally(() => setLoading(false))
  }, [])

  const addToCart = (pkg) => {
    if (!cart.find(i => i.id === pkg.id)) {
      setCart([...cart, pkg])
    }
  }

  const isInCart = (pkgId) => cart.some(i => i.id === pkgId)

  const handleBuyNow = (pkg) => {
    if (!user) {
      navigate('/login', { state: { from: '/packages', package: pkg } })
      return
    }
    setSelectedPackage(pkg)
    setShowPaymentModal(true)
  }

  const handleCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: '/packages' } })
      return
    }
    if (cart.length > 0) {
      setSelectedPackage(cart[0])
      setShowPaymentModal(true)
    }
  }

  const benefits = [
    { icon: Zap, title: 'Smart Check-in', desc: 'Quét RFID tự động, vào cửa trong 3 giây', color: 'from-yellow-500 to-orange-500' },
    { icon: Shield, title: 'Bảo mật an toàn', desc: 'Dữ liệu được mã hóa, bảo vệ thông tin', color: 'from-blue-500 to-cyan-500' },
    { icon: Clock, title: 'Hoạt động 24/7', desc: 'Mở cửa mọi lúc, linh hoạt thời gian', color: 'from-purple-500 to-pink-500' },
    { icon: Flame, title: 'AI Cá nhân hóa', desc: 'Trợ lý AI gợi ý bài tập phù hợp', color: 'from-red-500 to-orange-500' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigate('/')} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-gymgreen-500 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">Smart Gym</span>
            </button>
            <div className="flex items-center gap-4">
              {cart.length > 0 && (
                <div className="relative">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                </div>
              )}
              <button onClick={() => navigate('/login')} className="px-4 py-2 text-gray-600 hover:text-primary-600 font-medium">Đăng nhập</button>
              <button onClick={() => navigate('/register')} className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-600 transition-all">Đăng ký</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 text-white py-16">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] animate-pulse"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Chọn gói tập <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-gymgreen-400">phù hợp</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Trải nghiệm gym hiện đại với công nghệ AI tiên tiến. Đăng ký ngay để nhận ưu đãi!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <Shield className="w-5 h-5 text-gymgreen-400" />
                <span className="text-sm">Bảo hành 100%</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <Clock className="w-5 h-5 text-primary-400" />
                <span className="text-sm">Hỗ trợ 24/7</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <Award className="w-5 h-5 text-yellow-400" />
                <span className="text-sm">HLV chuyên nghiệp</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {benefits.map((item, i) => (
              <div key={i} className="text-center p-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${item.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">Gói tập linh hoạt</h2>
            <p className="text-gray-500 text-lg">Chọn gói phù hợp với nhu cầu và ngân sách của bạn</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="text-gray-600 ml-2">4.9/5 (500+ đánh giá)</span>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-4">Đang tải gói tập...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {packages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  onAddToCart={addToCart}
                  isInCart={isInCart(pkg.id)}
                />
              ))}
            </div>
          )}

          {/* Trust badges */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm mb-4">Thanh toán an toàn qua</p>
            <div className="flex justify-center gap-6 opacity-60">
              <div className="px-4 py-2 bg-gray-200 rounded-lg text-gray-600 text-sm font-medium">Visa</div>
              <div className="px-4 py-2 bg-gray-200 rounded-lg text-gray-600 text-sm font-medium">Mastercard</div>
              <div className="px-4 py-2 bg-gray-200 rounded-lg text-gray-600 text-sm font-medium">MoMo</div>
              <div className="px-4 py-2 bg-gray-200 rounded-lg text-gray-600 text-sm font-medium">ZaloPay</div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Câu hỏi thường gặp</h2>
          <div className="space-y-4">
            {[
              { q: 'Tôi có thể hủy gói tập không?', a: 'Bạn có thể hủy bất kỳ lúc nào. Chúng tôi hoàn tiền theo tỷ lệ ngày còn lại.' },
              { q: 'Gói tập có thể gia hạn không?', a: 'Có, bạn có thể gia hạn trực tiếp trên app với giá ưu đãi.' },
              { q: 'Tôi có thể nâng cấp gói tập không?', a: 'Có, bạn có thể nâng cấp lên gói cao hơn và chỉ trả phí chênh lệch.' },
            ].map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <ChevronRight className="w-5 h-5 text-primary-500" />
                  {item.q}
                </h3>
                <p className="text-gray-600 text-sm pl-7">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-primary-600 to-gymgreen-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Sẵn sàng bắt đầu?</h2>
          <p className="text-xl mb-8 text-white/90">Đăng ký ngay hôm nay và nhận ưu đãi 20%!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/register')} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-2xl font-semibold hover:bg-gray-100 transition-all">
              Đăng ký ngay <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/login')} className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white rounded-2xl font-semibold hover:bg-white/10 transition-all">
              Đăng nhập
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-gymgreen-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Smart Gym</span>
              </div>
              <p className="text-gray-400">Phòng tập thông minh với công nghệ AI</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Liên kết</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => navigate('/packages')} className="hover:text-gymgreen-500">Gói tập</button></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-gymgreen-500">Đăng nhập</button></li>
                <li><button onClick={() => navigate('/register')} className="hover:text-gymgreen-500">Đăng ký</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Liên hệ</h4>
              <ul className="space-y-2 text-gray-400">
                <li>1900 xxxx</li>
                <li>info@smartgym.vn</li>
                <li>123 ABC, TP.HCM</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Giờ mở cửa</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Thứ 2 - CN: 24/7</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-dark-800 pt-8 text-center text-gray-400">
            © 2025 Smart Gym. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Cart */}
      <Cart cart={cart} setCart={setCart} onCheckout={handleCheckout} />
    </div>
  )
}