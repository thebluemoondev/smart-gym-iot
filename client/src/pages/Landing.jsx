import { Link, useNavigate } from 'react-router-dom'
import { Dumbbell, Users, Calendar, Award, ArrowRight, CheckCircle, Zap, Heart, TrendingUp, Shield, Clock, Star, Phone, Mail, MapPin, Play, Trophy, Target, Activity, Sparkles, ShoppingBag, Menu, X, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { membershipAPI } from '../api/axios'

export default function Landing() {
  const navigate = useNavigate()
  const [packages, setPackages] = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    membershipAPI.get('/packages/').then(r => {
      if (Array.isArray(r.data)) {
        setPackages(r.data.slice(0, 3))
      }
    }).catch(() => {})
  }, [])

  const features = [
    { icon: Zap, title: 'Smart Check-in', desc: 'Quét thẻ RFID tự động, vào cửa nhanh chóng trong 3 giây', color: 'from-yellow-500 to-orange-500' },
    { icon: Shield, title: 'Bảo mật cao', desc: 'Dữ liệu được mã hóa, an toàn tuyệt đối', color: 'from-blue-500 to-cyan-500' },
    { icon: Clock, title: 'Hoạt động 24/7', desc: 'Phòng tập mở cửa mọi lúc, linh hoạt thời gian', color: 'from-purple-500 to-pink-500' },
    { icon: Target, title: 'AI Cá nhân hóa', desc: 'Trợ lý AI gợi ý bài tập phù hợp với mục tiêu', color: 'from-gymgreen-500 to-emerald-500' },
    { icon: TrendingUp, title: 'Theo dõi tiến độ', desc: 'Biểu đồ chi tiết, đánh giá hiệu quả tập luyện', color: 'from-primary-500 to-red-500' },
    { icon: Award, title: 'HLV Chuyên nghiệp', desc: 'Đội ngũ huấn luyện viên giàu kinh nghiệm', color: 'from-orange-500 to-amber-500' }
  ]

  const testimonials = [
    { name: 'Nguyễn Văn A', role: 'Hội viên 6 tháng', avatar: 'A', content: 'Smart Gym giúp tôi theo dõi tiến độ tập luyện dễ dàng. AI chatbot rất hữu ích!', rating: 5 },
    { name: 'Trần Thị B', role: 'Hội viên 1 năm', avatar: 'B', content: 'Hệ thống thông minh, vào cửa nhanh chóng. Không phải chờ đợi!', rating: 5 },
    { name: 'Lê Văn C', role: 'Hội viên 3 tháng', avatar: 'C', content: 'Gói tập đa dạng, giá hợp lý. Đội ngũ hỗ trợ nhiệt tình!', rating: 5 },
  ]

  const stats = [
    { value: '500+', label: 'Hội viên', icon: Users },
    { value: '50+', label: 'Thiết bị', icon: Dumbbell },
    { value: '10+', label: 'HLV chuyên nghiệp', icon: Award },
    { value: '4.9', label: 'Đánh giá', icon: Star },
  ]

  const products = [
    { name: 'Protein Whey', price: '450.000', image: '💪', tag: 'Bán chạy' },
    { name: 'BCAA 3000mg', price: '320.000', image: '⚡', tag: 'Giảm giá' },
    { name: 'Creatine 5g', price: '280.000', image: '🔥', tag: 'Mới' },
    { name: 'Pre-Workout', price: '390.000', image: '🚀', tag: null },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-gymgreen-500 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">Smart Gym</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-primary-600 font-medium">Tính năng</a>
              <a href="#pricing" className="text-gray-600 hover:text-primary-600 font-medium">Bảng giá</a>
              <a href="#products" className="text-gray-600 hover:text-primary-600 font-medium">Sản phẩm</a>
              <a href="#testimonials" className="text-gray-600 hover:text-primary-600 font-medium">Đánh giá</a>
              <a href="#contact" className="text-gray-600 hover:text-primary-600 font-medium">Liên hệ</a>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-600 hover:text-primary-600">
                <ShoppingBag className="w-5 h-5" />
              </button>
              <Link to="/login" className="px-4 py-2 text-gray-600 hover:text-primary-600 font-medium hidden sm:block">Đăng nhập</Link>
              <Link to="/register" className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-600 transition-all shadow-lg">
                Đăng ký ngay
              </Link>
              <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t p-4 space-y-3">
            <a href="#features" className="block py-2 text-gray-600">Tính năng</a>
            <a href="#pricing" className="block py-2 text-gray-600">Bảng giá</a>
            <a href="#products" className="block py-2 text-gray-600">Sản phẩm</a>
            <a href="#testimonials" className="block py-2 text-gray-600">Đánh giá</a>
            <a href="#contact" className="block py-2 text-gray-600">Liên hệ</a>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white py-20">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gymgreen-500 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium">Công nghệ AI tiên tiến</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Phòng tập <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-gymgreen-400">thông minh</span><br />
                cho cuộc sống khỏe mạnh
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl">
                Trải nghiệm gym hiện đại với công nghệ AI, quản lý thông minh và không gian tập luyện chuyên nghiệp. Đăng ký ngay để nhận ưu đãi!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-2xl font-semibold hover:from-primary-700 hover:to-primary-600 transition-all shadow-xl hover:shadow-2xl">
                  <Play className="w-5 h-5" />
                  Bắt đầu ngay
                </Link>
                <Link to="/packages" className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white rounded-2xl font-semibold hover:bg-white/10 transition-all">
                  Xem gói tập
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
            <div className="flex-1 relative hidden lg:block">
              <div className="relative w-full max-w-lg mx-auto">
                <div className="aspect-square bg-gradient-to-br from-primary-500/20 to-gymgreen-500/20 rounded-3xl backdrop-blur flex items-center justify-center">
                  <div className="text-center">
                    <Dumbbell className="w-32 h-32 mx-auto text-white/50" />
                    <p className="text-white/70 mt-4">Smart Gym Dashboard</p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gymgreen-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">Check-in thành công</p>
                      <p className="text-xs text-gray-500">Chào mừng Nguyễn Văn A!</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">Tiến độ hôm nay</p>
                      <p className="text-xs text-gray-500">Đã tập 45 phút</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-primary-100 to-gymgreen-100 rounded-2xl mb-4">
                  <stat.icon className="w-7 h-7 text-primary-600" />
                </div>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">Tính năng nổi bật</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Trải nghiệm công nghệ hiện đại với các tính năng thông minh được thiết kế cho phòng tập của bạn</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all card-hover">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${f.color} flex items-center justify-center mb-6`}>
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{f.title}</h3>
                <p className="text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section (E-commerce style) */}
      <section id="products" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">Sản phẩm bổ sung</h2>
            <p className="text-gray-500 text-lg">Các sản phẩm hỗ trợ tập luyện hiệu quả</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((p, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center text-4xl mb-4">
                  {p.image}
                </div>
                {p.tag && (
                  <span className={`text-xs px-2 py-1 rounded-full ${p.tag === 'Bán chạy' ? 'bg-red-100 text-red-600' : p.tag === 'Giảm giá' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                    {p.tag}
                  </span>
                )}
                <h3 className="font-semibold text-gray-800 mt-2">{p.name}</h3>
                <p className="text-primary-600 font-bold">{p.price} VNĐ</p>
                <button className="w-full mt-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
                  Thêm vào giỏ
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">Gói tập linh hoạt</h2>
            <p className="text-gray-500 text-lg">Chọn gói tập phù hợp với nhu cầu của bạn</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {(packages.length > 0 ? packages : [
              { name: 'Gói Basic', price: 299000, duration_days: 30, description: 'Phù hợp cho người mới' },
              { name: 'Gói VIP', price: 499000, duration_days: 30, description: 'Phổ biến nhất', popular: true },
              { name: 'Gói Premium', price: 799000, duration_days: 30, description: 'Đầy đủ tiện ích' }
            ]).map((p, i) => (
              <div key={i} className={`relative bg-white rounded-2xl border-2 ${p.popular ? 'border-gymgreen-500 shadow-xl' : 'border-gray-200 shadow-lg'} p-8`}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gymgreen-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Phổ biến nhất
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-800 mb-2">{p.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{p.description}</p>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-primary-600">{p.price?.toLocaleString() || p.price}</span>
                  <span className="text-gray-500 ml-2">VNĐ/{p.duration_days} ngày</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {['Tập không giới hạn', 'Sử dụng thiết bị', 'AI hỗ trợ', 'Theo dõi tiến độ'].map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-gymgreen-500" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`block text-center py-3 rounded-xl font-semibold transition-all ${p.popular ? 'bg-gymgreen-500 text-white hover:bg-gymgreen-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  Đăng ký ngay
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">Khách hàng nói gì?</h2>
            <p className="text-gray-500 text-lg">Hơn 500+ hội viên đã tin tưởng Smart Gym</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-gray-600 mb-6">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-gymgreen-500 rounded-full flex items-center justify-center text-white font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-gymgreen-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Sẵn sàng bắt đầu?</h2>
          <p className="text-xl mb-8 text-white/90">Tham gia ngay hôm nay và nhận ưu đãi 20% cho tháng đầu tiên!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-2xl font-semibold hover:bg-gray-100 transition-all">
              Đăng ký ngay <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#contact" className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white rounded-2xl font-semibold hover:bg-white/10 transition-all">
              Liên hệ tư vấn
            </a>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Liên hệ với chúng tôi</h2>
              <p className="text-gray-500 mb-8">Đội ngũ Smart Gym luôn sẵn sàng hỗ trợ bạn 24/7</p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Hotline</p>
                    <p className="text-gray-500">1900 xxxx</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gymgreen-100 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-gymgreen-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Email</p>
                    <p className="text-gray-500">info@smartgym.vn</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Địa chỉ</p>
                    <p className="text-gray-500">123 Đường ABC, Quận XYZ, TP.HCM</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Gửi tin nhắn cho chúng tôi</h3>
              <form className="space-y-4">
                <input type="text" placeholder="Họ và tên" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <input type="email" placeholder="Email" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <input type="tel" placeholder="Số điện thoại" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <textarea placeholder="Nội dung" rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"></textarea>
                <button type="submit" className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-600 transition-all">
                  Gửi tin nhắn
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-gymgreen-500 rounded-xl flex items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Smart Gym</span>
              </div>
              <p className="text-gray-400">Phòng tập thông minh với công nghệ hiện đại</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Liên kết nhanh</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/packages" className="hover:text-gymgreen-500">Gói tập</Link></li>
                <li><Link to="/login" className="hover:text-gymgreen-500">Đăng nhập</Link></li>
                <li><Link to="/register" className="hover:text-gymgreen-500">Đăng ký</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Dịch vụ</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Tập gym</li>
                <li>Huấn luyện cá nhân</li>
                <li>Tư vấn dinh dưỡng</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Giờ mở cửa</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Thứ 2 - Thứ 6: 6h - 22h</li>
                <li>Thứ 7 - CN: 7h - 21h</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-dark-800 pt-8 text-center text-gray-400">
            © 2025 Smart Gym. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}