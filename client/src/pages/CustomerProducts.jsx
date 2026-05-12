import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, ShoppingCart, Search, Filter, X, Plus, Minus } from 'lucide-react'
import { membershipAPI } from '../api/axios'

// Product Card Component
function ProductCard({ product, onAddToCart }) {
  const hasDiscount = product.original_price && product.original_price > product.price
  const discountPercent = hasDiscount ? Math.round((1 - product.price / product.original_price) * 100) : 0

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg overflow-hidden hover:shadow-xl transition-all">
      <div className="relative">
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
            -{discountPercent}%
          </div>
        )}
        <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <Package className="w-16 h-16 text-gray-400" />
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-500 uppercase mb-1">{product.category}</p>
        <h3 className="text-lg font-bold text-gray-800 mb-2">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mb-3">
          <div>
            {hasDiscount ? (
              <>
                <span className="text-xl font-bold text-primary-600">{product.price?.toLocaleString()}đ</span>
                <span className="text-sm text-gray-400 line-through ml-2">{product.original_price?.toLocaleString()}đ</span>
              </>
            ) : (
              <span className="text-xl font-bold text-primary-600">{product.price?.toLocaleString()}đ</span>
            )}
          </div>
          <span className="text-xs text-gray-400">Kho: {product.stock}</span>
        </div>
        <button
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
          className="w-full py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
        </button>
      </div>
    </div>
  )
}

// Cart Sidebar
function CartSidebar({ cart, setCart, onCheckout }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (cart.length === 0) return null

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform">
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Giỏ hàng ({cart.length})</h3>
          <button onClick={() => setCart([])} className="text-gray-400 hover:text-red-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3">
          {cart.map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
              <div className="flex-1">
                <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                <p className="text-primary-600 font-bold">{item.price?.toLocaleString()}đ</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => {
                  const newCart = [...cart]
                  if (newCart[i].quantity > 1) newCart[i].quantity--
                  else newCart.splice(i, 1)
                  setCart(newCart)
                }} className="p-1 bg-gray-200 rounded">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-medium">{item.quantity}</span>
                <button onClick={() => {
                  const newCart = [...cart]
                  newCart[i].quantity++
                  setCart(newCart)
                }} className="p-1 bg-gray-200 rounded">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">Tổng cộng:</span>
            <span className="text-2xl font-bold text-primary-600">{total.toLocaleString()}đ</span>
          </div>
          <button onClick={onCheckout} className="w-full py-3 bg-gradient-to-r from-primary-600 to-gymgreen-500 text-white rounded-xl font-semibold">
            Thanh toán
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CustomerProducts() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    membershipAPI.get('/products/').then(r => {
      if (Array.isArray(r.data)) setProducts(r.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const categories = [
    { id: 'all', name: 'Tất cả' },
    { id: 'supplement', name: 'Thực phẩm bổ sung' },
    { id: 'equipment', name: 'Thiết bị' },
    { id: 'accessory', name: 'Phụ kiện' },
    { id: 'wear', name: 'Quần áo' },
  ]

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch && p.is_active
  })

  const addToCart = (product) => {
    const existing = cart.find(i => i.id === product.id)
    if (existing) {
      setCart(cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigate('/')} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-gymgreen-500 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">Smart Gym</span>
            </button>
            <div className="flex items-center gap-4">
              {cart.length > 0 && (
                <button onClick={() => setCart([])} className="relative">
                  <ShoppingCart className="w-6 h-6 text-gray-600" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {cart.reduce((sum, i) => sum + i.quantity, 0)}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-gymgreen-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-2">Cửa hàng Smart Gym</h1>
          <p className="text-white/80">Thực phẩm bổ sung, thiết bị và phụ kiện gym chính hãng</p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl w-64 focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-4">Đang tải sản phẩm...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy sản phẩm</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <CartSidebar cart={cart} setCart={setCart} onCheckout={() => navigate('/customer/subscription', { state: { cart } })} />
    </div>
  )
}