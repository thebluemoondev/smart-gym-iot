import React, { useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, Users, CreditCard, Dumbbell, Package, Wrench, MapPin,
  Activity, MessageSquare, Settings, Menu, X, LogOut, Bell, Search, TrendingUp,
  Home, User, Calendar, History, MessageCircle, Heart, Award, ArrowRight,
  Zap, Shield, Clock, Star, Phone, Mail, MapPin as Location
} from 'lucide-react'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import CustomerProducts from './pages/CustomerProducts'
import Dashboard from './pages/Dashboard'
import UsersPage from './pages/UsersPage'
import RFIDPage from './pages/RFIDPage'
import PackagesPage from './pages/PackagesPage'
import SubscriptionsPage from './pages/SubscriptionsPage'
import ExercisesPage from './pages/ExercisesPage'
import WorkoutPlansPage from './pages/WorkoutPlansPage'
import WorkoutHistoryPage from './pages/WorkoutHistoryPage'
import EquipmentPage from './pages/EquipmentPage'
import MaintenancePage from './pages/MaintenancePage'
import AreasPage from './pages/AreasPage'
import ChatbotPage from './pages/ChatbotPage'
import CustomerDashboard from './pages/CustomerDashboard'
import CustomerProfile from './pages/CustomerProfile'
import CustomerPackages from './pages/CustomerPackages'
import CustomerMySubscription from './pages/CustomerMySubscription'
import CustomerWorkoutPlan from './pages/CustomerWorkoutPlan'
import CustomerWorkoutHistory from './pages/CustomerWorkoutHistory'
import CustomerChatbot from './pages/CustomerChatbot'
import CustomerRegisterPackage from './pages/CustomerRegisterPackage'

// Auth Context
const AuthContext = React.createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

// Protected Route Component
function ProtectedRoute({ children, user, requiredRole }) {
  if (!user) return <Navigate to="/login" />
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/customer'} />
  }
  return children
}

// Main App Layout
function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('gym_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const login = (userData, token) => {
    localStorage.setItem('gym_user', JSON.stringify(userData))
    localStorage.setItem('token', token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('gym_user')
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/packages" element={<CustomerPackages user={user} />} />
          <Route path="/products" element={<CustomerProducts />} />

          {/* Customer Routes */}
          <Route path="/customer" element={
            <ProtectedRoute user={user}>
              <CustomerLayout><CustomerDashboard /></CustomerLayout>
            </ProtectedRoute>
          } />
          <Route path="/customer/profile" element={
            <ProtectedRoute user={user}><CustomerProfile /></ProtectedRoute>
          } />
          <Route path="/customer/subscription" element={
            <ProtectedRoute user={user}><CustomerRegisterPackage /></ProtectedRoute>
          } />
          <Route path="/customer/workout-plan" element={
            <ProtectedRoute user={user}><CustomerWorkoutPlan /></ProtectedRoute>
          } />
          <Route path="/customer/workout-history" element={
            <ProtectedRoute user={user}><CustomerWorkoutHistory /></ProtectedRoute>
          } />
          <Route path="/customer/chatbot" element={
            <ProtectedRoute user={user}><CustomerChatbot /></ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute user={user} requiredRole="admin">
              <AdminLayout><Dashboard /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute user={user} requiredRole="admin">
              <AdminLayout><UsersPage /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/rfid" element={
            <ProtectedRoute user={user} requiredRole="admin">
              <AdminLayout><RFIDPage /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/packages" element={
            <ProtectedRoute user={user} requiredRole="admin">
              <AdminLayout><PackagesPage /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/subscriptions" element={
            <ProtectedRoute user={user} requiredRole="admin">
              <AdminLayout><SubscriptionsPage /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/exercises" element={
            <ProtectedRoute user={user} requiredRole="admin">
              <AdminLayout><ExercisesPage /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/workout-plans" element={
            <ProtectedRoute user={user} requiredRole="admin">
              <AdminLayout><WorkoutPlansPage /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/workout-history" element={
            <ProtectedRoute user={user} requiredRole="admin">
              <AdminLayout><WorkoutHistoryPage /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/equipment" element={
            <ProtectedRoute user={user} requiredRole="admin">
              <AdminLayout><EquipmentPage /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/maintenance" element={
            <ProtectedRoute user={user} requiredRole="admin">
              <AdminLayout><MaintenancePage /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/areas" element={
            <ProtectedRoute user={user} requiredRole="admin">
              <AdminLayout><AreasPage /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/chatbot" element={
            <ProtectedRoute user={user} requiredRole="admin">
              <AdminLayout><ChatbotPage /></AdminLayout>
            </ProtectedRoute>
          } />

          {/* Redirect based on role */}
          <Route path="/dashboard" element={
            user?.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/customer" />
          } />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}

// Admin Layout
function AdminLayout({ children }) {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Tổng quan' },
    { path: '/admin/users', icon: Users, label: 'Hội viên' },
    { path: '/admin/rfid', icon: CreditCard, label: 'RFID' },
    { path: '/admin/packages', icon: Package, label: 'Gói tập' },
    { path: '/admin/subscriptions', icon: CreditCard, label: 'Đăng ký' },
    { path: '/admin/exercises', icon: Dumbbell, label: 'Bài tập' },
    { path: '/admin/workout-plans', icon: Activity, label: 'Kế hoạch' },
    { path: '/admin/workout-history', icon: Activity, label: 'Lịch sử' },
    { path: '/admin/equipment', icon: Dumbbell, label: 'Thiết bị' },
    { path: '/admin/maintenance', icon: Wrench, label: 'Bảo trì' },
    { path: '/admin/areas', icon: MapPin, label: 'Khu vực' },
    { path: '/admin/chatbot', icon: MessageSquare, label: 'AI Chatbot' },
  ]

  return (
    <div className="min-h-screen animated-bg">
      <aside className="fixed top-0 left-0 h-full w-72 bg-dark-900 border-r border-dark-700 z-50">
        <div className="p-6 border-b border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-gymgreen-500 rounded-xl flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Smart Gym</h1>
              <p className="text-xs text-gray-500">Quản trị</p>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map(item => (
            <button key={item.path} onClick={() => navigate(item.path)} className="sidebar-item w-full">
              <item.icon className="w-5 h-5" /><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-700">
          <button onClick={() => { logout(); navigate('/') }} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-dark-800 text-gray-400">
            <LogOut className="w-5 h-5" /><span>Đăng xuất</span>
          </button>
        </div>
      </aside>
      <div className="lg:ml-72 min-h-screen flex flex-col">
        <header className="h-16 bg-dark-800/50 backdrop-blur border-b border-dark-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="text" placeholder="Tìm kiếm..." className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-dark-700 text-gray-400"><Bell className="w-5 h-5" /></button>
            <div className="w-9 h-9 bg-gradient-to-r from-primary-500 to-gymgreen-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.[0] || user?.full_name?.[0] || 'A'}
            </div>
            <button
              onClick={() => { logout(); navigate('/') }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-dark-700 text-gray-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm">Đăng xuất</span>
            </button>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

// Customer Layout
function CustomerLayout({ children }) {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const navItems = [
    { path: '/customer', icon: Home, label: 'Trang chủ' },
    { path: '/customer/profile', icon: User, label: 'Hồ sơ' },
    { path: '/customer/subscription', icon: CreditCard, label: 'Gói tập' },
    { path: '/customer/workout-plan', icon: Calendar, label: 'Kế hoạch' },
    { path: '/customer/workout-history', icon: History, label: 'Lịch sử' },
    { path: '/customer/chatbot', icon: MessageCircle, label: 'AI Hỗ trợ' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigate('/')} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-gymgreen-500 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">Smart Gym</span>
            </button>
            <div className="hidden md:flex items-center gap-6">
              {navItems.map(item => (
                <button key={item.path} onClick={() => navigate(item.path)} className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-r from-primary-500 to-gymgreen-500 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.[0] || user?.full_name?.[0] || user?.username?.[0] || 'U'}
              </div>
              <button onClick={() => { logout(); navigate('/') }} className="text-gray-500 hover:text-red-500">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  )
}

export default App