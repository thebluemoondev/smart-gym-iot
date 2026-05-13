const state = {
  user: loadUser(),
  token: localStorage.getItem('token') || '',
  packages: [],
  mobileMenuOpen: false,
  adminMenuOpen: false
}

function loadUser() {
  try {
    const raw = localStorage.getItem('gym_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveAuth(user, token) {
  state.user = user
  state.token = token
  localStorage.setItem('gym_user', JSON.stringify(user))
  localStorage.setItem('token', token)
}

function clearAuth() {
  state.user = null
  state.token = ''
  localStorage.removeItem('gym_user')
  localStorage.removeItem('token')
}

function decodeJwtPayload(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const normalized = payload + '='.repeat((4 - (payload.length % 4)) % 4)
    return JSON.parse(atob(normalized))
  } catch {
    return null
  }
}

function tokenExpired(token) {
  const payload = decodeJwtPayload(token)
  return payload?.exp ? Date.now() >= payload.exp * 1000 : false
}

function authHeaders() {
  if (!state.token || tokenExpired(state.token)) return {}
  return { Authorization: `Bearer ${state.token}` }
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...authHeaders()
    }
  })
  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!res.ok) throw new Error((data && data.detail) || data || `HTTP ${res.status}`)
  return data
}

const routes = {
  '/': renderLanding,
  '/login': renderLogin,
  '/register': renderRegister,
  '/packages': renderPackagesEntry,
  '/products': renderProducts,
  '/customer': renderCustomerDashboard,
  '/customer/profile': renderCustomerProfile,
  '/customer/subscription': renderCustomerSubscription,
  '/customer/workout-plan': renderCustomerPlaceholder('Kế hoạch tập'),
  '/customer/workout-history': renderCustomerPlaceholder('Lịch sử tập'),
  '/customer/chatbot': renderCustomerPlaceholder('AI hỗ trợ'),
  '/admin': renderAdminDashboard,
  '/admin/users': renderAdminPlaceholder('Hội viên'),
  '/admin/rfid': renderAdminPlaceholder('RFID'),
  '/admin/packages': renderAdminPlaceholder('Gói tập'),
  '/admin/subscriptions': renderAdminPlaceholder('Đăng ký'),
  '/admin/exercises': renderAdminPlaceholder('Bài tập'),
  '/admin/workout-plans': renderAdminPlaceholder('Kế hoạch'),
  '/admin/workout-history': renderAdminPlaceholder('Lịch sử'),
  '/admin/equipment': renderAdminPlaceholder('Thiết bị'),
  '/admin/maintenance': renderAdminPlaceholder('Bảo trì'),
  '/admin/areas': renderAdminPlaceholder('Khu vực'),
  '/admin/chatbot': renderAdminPlaceholder('AI Chatbot')
}

function navigate(path) {
  history.pushState({}, '', path)
  render()
}

window.addEventListener('popstate', render)
window.addEventListener('storage', () => {
  state.user = loadUser()
  state.token = localStorage.getItem('token') || ''
  render()
})

document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-nav]')
  if (link) {
    e.preventDefault()
    navigate(link.getAttribute('data-nav'))
  }
})

async function submitLogin(form) {
  const payload = {
    username: form.username.value.trim(),
    password: form.password.value.trim()
  }
  const res = await api('/api/users/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
  saveAuth(res.user, res.access_token)
  navigate(res.user?.role === 'admin' ? '/admin' : '/customer')
}

async function submitRegister(form) {
  const payload = {
    username: form.username.value.trim(),
    password: form.password.value.trim(),
    name: form.name.value.trim(),
    phone: form.phone.value.trim()
  }
  await api('/api/users/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
  navigate('/login')
}

function shellLayout(content, options = {}) {
  const user = state.user
  const title = options.title || 'Smart Gym'
  const isAdmin = user?.role === 'admin'
  const sideItems = isAdmin ? [
    ['Tổng quan', '/admin'],
    ['Hội viên', '/admin/users'],
    ['RFID', '/admin/rfid'],
    ['Gói tập', '/admin/packages'],
    ['Đăng ký', '/admin/subscriptions'],
    ['Bài tập', '/admin/exercises'],
    ['Kế hoạch', '/admin/workout-plans'],
    ['Lịch sử', '/admin/workout-history'],
    ['Thiết bị', '/admin/equipment'],
    ['Bảo trì', '/admin/maintenance'],
    ['Khu vực', '/admin/areas'],
    ['AI Chatbot', '/admin/chatbot']
  ] : [
    ['Trang chủ', '/customer'],
    ['Hồ sơ', '/customer/profile'],
    ['Gói tập', '/customer/subscription'],
    ['Kế hoạch', '/customer/workout-plan'],
    ['Lịch sử', '/customer/workout-history'],
    ['AI Hỗ trợ', '/customer/chatbot']
  ]

  return `
    <div class="${isAdmin ? 'app-bg' : ''}">
      ${isAdmin ? `
      <aside class="sidebar ${state.adminMenuOpen ? 'open' : ''}">
        <div style="padding:24px;border-bottom:1px solid rgba(148,163,184,.18)">
          <a href="/" data-nav="/" class="brand">
            <span class="brand-badge">D</span>
            <span>Smart Gym</span>
          </a>
          <div class="muted" style="margin-top:8px">Quản trị</div>
        </div>
        <div style="padding:16px">
          ${sideItems.map(([label, path]) => `<button class="side-link ${location.pathname === path ? 'active' : ''}" data-nav="${path}">${label}</button>`).join('')}
          <button class="side-link" id="logout-btn">Đăng xuất</button>
        </div>
      </aside>
      <div class="shell">
        <div class="shell-top">
          <button class="btn-ghost menu-toggle" id="toggle-admin">Menu</button>
          <div>${title}</div>
          <div>${avatar(user)}</div>
        </div>
        <main style="padding:24px">${content}</main>
      </div>` : `
      <div class="nav">
        <div class="container nav-row">
          <a href="/" data-nav="/" class="brand">
            <span class="brand-badge">D</span>
            <span>Smart Gym</span>
          </a>
          <div class="nav-links">
            <a href="#features">Tính năng</a>
            <a href="#pricing">Bảng giá</a>
            <a href="#contact">Liên hệ</a>
          </div>
          <div class="nav-links">
            ${user ? `<a data-nav="${user.role === 'admin' ? '/admin' : '/customer'}" href="${user.role === 'admin' ? '/admin' : '/customer'}">Trang quản lý</a>` : ''}
            ${user ? `<button id="logout-btn">Đăng xuất</button>` : `<a data-nav="/login" href="/login">Đăng nhập</a><a class="btn-primary" style="text-decoration:none" data-nav="/register" href="/register">Đăng ký ngay</a>`}
            <button class="btn-ghost menu-toggle" id="toggle-mobile">Menu</button>
          </div>
        </div>
        ${state.mobileMenuOpen ? `<div class="container" style="padding-bottom:16px"><div class="card" style="padding:16px;display:grid;gap:12px">${mobileMenuItems()}</div></div>` : ''}
      </div>
      <main>${content}</main>`}
    </div>
  `
}

function mobileMenuItems() {
  const user = state.user
  return user
    ? `
      <button class="btn-ghost" data-nav="${user.role === 'admin' ? '/admin' : '/customer'}">Trang quản lý</button>
      <button class="btn-ghost" id="logout-btn">Đăng xuất</button>
    `
    : `
      <button class="btn-ghost" data-nav="/login">Đăng nhập</button>
      <button class="btn-primary" data-nav="/register">Đăng ký ngay</button>
    `
}

function avatar(user) {
  const ch = (user?.full_name || user?.name || user?.username || 'U')[0]?.toUpperCase() || 'U'
  return `<span class="brand-badge" style="width:38px;height:38px;border-radius:999px">${ch}</span>`
}

function renderLanding() {
  return shellLayout(`
    <section class="hero">
      <div class="container" style="position:relative;z-index:1">
        <div class="grid two-col" style="align-items:center">
          <div>
            <div class="badge"><strong>AI</strong><span>Công nghệ tiên tiến</span></div>
            <h1 class="title" style="font-size:clamp(42px,6vw,72px);margin:20px 0 16px">Phòng tập <span style="background:linear-gradient(90deg,#f97316,#22c55e);-webkit-background-clip:text;background-clip:text;color:transparent">thông minh</span> cho cuộc sống khỏe mạnh</h1>
            <p class="muted" style="font-size:18px;max-width:640px;color:#475569">Trải nghiệm gym hiện đại với công nghệ AI, quản lý thông minh và không gian tập luyện chuyên nghiệp.</p>
            <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:28px">
              <a class="btn-primary" style="text-decoration:none" data-nav="/register" href="/register">Bắt đầu ngay</a>
              <a class="btn-ghost" style="text-decoration:none" data-nav="/packages" href="/packages">Xem gói tập</a>
            </div>
          </div>
          <div class="dark-card" style="padding:28px;min-height:340px;display:grid;place-items:center">
            <div class="center">
              <div style="font-size:84px">🏋️</div>
              <div style="margin-top:12px;color:#475569">Smart Gym Dashboard</div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container grid four-col">
        ${statCard('500+', 'Hội viên')}
        ${statCard('50+', 'Thiết bị')}
        ${statCard('10+', 'HLV chuyên nghiệp')}
        ${statCard('4.9', 'Đánh giá')}
      </div>
    </section>
    <section class="section" style="background:#f3f4f6;color:#111827">
      <div class="container">
        <div class="center" style="margin-bottom:28px">
          <h2 class="title" style="font-size:40px">Tính năng nổi bật</h2>
          <p class="muted">Thiết kế cho phòng tập hiện đại và dễ mở rộng</p>
        </div>
        <div class="grid three-col">
          ${featureCards().join('')}
        </div>
      </div>
    </section>
    ${pricingSection()}
    ${contactSection()}
    ${footerSection()}
  `)
}

function statCard(v, label) {
  return `<div class="stat center"><div style="font-size:34px;font-weight:800">${v}</div><div class="muted">${label}</div></div>`
}
function featureCards() {
  return [
    ['Smart Check-in', 'Quét RFID tự động, vào cửa nhanh chóng', 'linear-gradient(90deg,#f59e0b,#f97316)'],
    ['Bảo mật cao', 'Dữ liệu được mã hóa, an toàn', 'linear-gradient(90deg,#3b82f6,#06b6d4)'],
    ['AI cá nhân hóa', 'Gợi ý bài tập phù hợp mục tiêu', 'linear-gradient(90deg,#22c55e,#10b981)'],
    ['Theo dõi tiến độ', 'Biểu đồ chi tiết, đánh giá hiệu quả', 'linear-gradient(90deg,#dc2626,#ef4444)'],
    ['Hoạt động 24/7', 'Linh hoạt thời gian tập luyện', 'linear-gradient(90deg,#8b5cf6,#ec4899)'],
    ['HLV chuyên nghiệp', 'Đội ngũ hỗ trợ giàu kinh nghiệm', 'linear-gradient(90deg,#f97316,#f59e0b)']
  ].map(([t, d, bg]) => `<div class="card" style="padding:24px"><div style="width:56px;height:56px;border-radius:18px;background:${bg};margin-bottom:18px"></div><h3 style="margin:0 0 10px">${t}</h3><p class="muted">${d}</p></div>`)
}

function pricingSection() {
  return `
  <section class="section" id="pricing" style="background:#fff;color:#111827">
    <div class="container">
      <div class="center" style="margin-bottom:28px">
        <h2 class="title" style="font-size:40px">Gói tập linh hoạt</h2>
        <p class="muted">Chọn gói phù hợp với nhu cầu của bạn</p>
      </div>
      <div id="landing-packages" class="grid three-col"></div>
    </div>
  </section>`
}

function contactSection() {
  return `
  <section class="section" id="contact" style="background:#f3f4f6;color:#111827">
    <div class="container grid two-col">
      <div>
        <h2 class="title" style="font-size:34px">Liên hệ với chúng tôi</h2>
        <p class="muted">Đội ngũ Smart Gym luôn sẵn sàng hỗ trợ 24/7</p>
      </div>
      <div class="card" style="padding:24px">
        <form id="contact-form" class="grid" style="gap:14px">
          <input class="input" placeholder="Họ và tên" />
          <input class="input" placeholder="Email" />
          <input class="input" placeholder="Số điện thoại" />
          <textarea class="textarea" rows="4" placeholder="Nội dung"></textarea>
          <button class="btn-primary" type="submit">Gửi tin nhắn</button>
        </form>
      </div>
    </div>
  </section>`
}

function footerSection() {
  return `
  <footer class="footer">
    <div class="container grid four-col">
      <div><h3>Smart Gym</h3><p class="muted" style="color:#94a3b8">Phòng tập thông minh với công nghệ hiện đại</p></div>
      <div><h4>Liên kết</h4><p class="muted" style="color:#94a3b8">Gói tập<br/>Đăng nhập<br/>Đăng ký</p></div>
      <div><h4>Dịch vụ</h4><p class="muted" style="color:#94a3b8">Tập gym<br/>HLV cá nhân<br/>Tư vấn dinh dưỡng</p></div>
      <div><h4>Giờ mở cửa</h4><p class="muted" style="color:#94a3b8">Thứ 2 - CN: 24/7</p></div>
    </div>
  </footer>`
}

function renderLogin() {
  return shellLayout(`
    <section class="section">
      <div class="container grid two-col" style="align-items:stretch">
        <div class="dark-card" style="padding:42px;display:grid;place-items:center;text-align:center">
          <div>
            <div style="font-size:72px">🏋️</div>
            <h2>Chào mừng trở lại</h2>
            <p class="muted" style="color:#475569">Đăng nhập để trải nghiệm phòng tập thông minh</p>
          </div>
        </div>
        <div class="card" style="padding:34px">
          <h1 style="margin-top:0">Đăng nhập</h1>
          <p class="muted">Nhập thông tin để tiếp tục</p>
          <form id="login-form" class="grid" style="gap:16px;margin-top:20px">
            <input class="input" name="username" placeholder="Tên đăng nhập" required autocomplete="username" />
            <input class="input" name="password" type="password" placeholder="Mật khẩu" required autocomplete="current-password" minlength="6" />
            <button class="btn-primary" type="submit">Đăng nhập</button>
          </form>
          <p class="muted" style="margin-top:20px">Chưa có tài khoản? <a data-nav="/register" href="/register">Đăng ký ngay</a></p>
        </div>
      </div>
    </section>
  `)
}

function renderRegister() {
  return shellLayout(`
    <section class="section">
      <div class="container grid two-col" style="align-items:stretch">
        <div class="dark-card" style="padding:42px">
          <h2>Tham gia Smart Gym</h2>
          <p class="muted" style="color:#475569">Trở thành hội viên để trải nghiệm các tính năng thông minh</p>
        </div>
        <div class="card" style="padding:34px">
          <h1 style="margin-top:0">Đăng ký</h1>
          <form id="register-form" class="grid" style="gap:14px;margin-top:20px">
            <input class="input" name="username" placeholder="Tên đăng nhập" required autocomplete="username" />
            <input class="input" name="password" type="password" placeholder="Mật khẩu" required autocomplete="new-password" minlength="6" />
            <input class="input" name="name" placeholder="Họ và tên" />
            <input class="input" name="phone" placeholder="Số điện thoại" />
            <button class="btn-primary" type="submit">Tạo tài khoản</button>
          </form>
          <p class="muted" style="margin-top:20px">Đã có tài khoản? <a data-nav="/login" href="/login">Đăng nhập</a></p>
        </div>
      </div>
    </section>
  `)
}

function renderPackagesEntry() {
  if (state.user) {
    navigate('/customer/subscription')
    return ''
  }
  return renderPackagesPage(false)
}

function renderProducts() {
  return shellLayout(`<section class="section"><div class="container"><div class="card" style="padding:28px"><h1>Cửa hàng</h1><p class="muted">Chức năng đang được giữ nguyên luồng backend, có thể mở rộng tiếp khi cần.</p></div></div></section>`)
}

function renderCustomerDashboard() {
  const user = state.user
  return shellLayout(`
    <section class="section" style="padding-top:24px">
      <div class="container">
        <div class="card" style="padding:28px;background:linear-gradient(90deg,rgba(220,38,38,.12),rgba(34,197,94,.12));color:#0f172a;margin-bottom:24px">
          <h1 style="margin:0 0 8px">Xin chào, ${escapeHtml(user?.full_name || user?.username || 'bạn')}!</h1>
          <p style="margin:0;color:#475569">Hôm nay bạn có kế hoạch tập luyện gì?</p>
        </div>
        <div class="grid four-col" style="margin-bottom:24px">
          ${statCard('0', 'Tổng buổi tập')}
          ${statCard('0', 'Giờ tập')}
          ${statCard('0', 'Ngày liên tiếp')}
          ${statCard(user?.role === 'admin' ? 'Admin' : 'Bronze', 'Hạng thành viên')}
        </div>
        <div class="grid two-col">
          <div class="card" style="padding:24px"><h3>Gói tập hiện tại</h3><p class="muted">Chưa có gói tập hoặc dữ liệu đang được tải.</p><button class="btn-primary" data-nav="/customer/subscription">Đăng ký ngay</button></div>
          <div class="card" style="padding:24px"><h3>Hoạt động gần đây</h3><p class="muted">Dữ liệu lịch sử sẽ hiển thị ở đây.</p></div>
        </div>
      </div>
    </section>
  `)
}

function renderCustomerProfile() {
  const user = state.user || {}
  return shellLayout(`
    <section class="section" style="padding-top:24px">
      <div class="container">
        <div class="card" style="padding:28px">
          <h1>Hồ sơ cá nhân</h1>
          <form id="profile-form" class="grid two-col" style="margin-top:20px">
            <input class="input" name="full_name" placeholder="Họ và tên" value="${escapeAttr(user.full_name || user.name || '')}" />
            <input class="input" name="email" placeholder="Email" value="${escapeAttr(user.email || '')}" />
            <input class="input" name="phone" placeholder="Số điện thoại" value="${escapeAttr(user.phone || '')}" />
            <input class="input" name="date_of_birth" type="date" value="${escapeAttr(user.date_of_birth || '')}" />
            <select class="select" name="gender">
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
            <div class="card" style="padding:16px;background:#f9fafb"><strong>Vai trò:</strong> ${escapeHtml(user.role || 'user')}</div>
            <div style="grid-column:1/-1"><button class="btn-primary" type="submit">Lưu thay đổi</button></div>
          </form>
        </div>
      </div>
    </section>
  `)
}

function renderCustomerSubscription() {
  return renderPackagesPage(true)
}

async function renderPackagesPage(customerMode) {
  const user = state.user
  const packages = await loadPackages()
  const content = `
    <section class="section" style="padding-top:24px">
      <div class="container">
        <div class="card" style="padding:28px;background:linear-gradient(90deg,rgba(220,38,38,.1),rgba(34,197,94,.1));color:#0f172a;margin-bottom:24px">
          <h1 style="margin-top:0">${customerMode ? 'Đăng ký gói tập' : 'Chọn gói tập phù hợp'}</h1>
          <p style="color:#475569">Chọn gói phù hợp với nhu cầu và ngân sách của bạn</p>
        </div>
        <div class="grid three-col">
          ${packages.map(pkg => packageCard(pkg, !!user, customerMode)).join('')}
        </div>
      </div>
    </section>
  `
  return shellLayout(content)
}

function packageCard(pkg, loggedIn, customerMode) {
  const price = Number(pkg.price || 0)
  return `
    <div class="card" style="padding:24px">
      <div class="pill ${pkg.popular ? 'green' : 'red'}">${pkg.popular ? 'Phổ biến' : 'Gói tập'}</div>
      <h3>${escapeHtml(pkg.name || 'Package')}</h3>
      <p class="muted">${escapeHtml(pkg.package_desc || pkg.description || 'Phù hợp nhu cầu của bạn')}</p>
      <div style="font-size:34px;font-weight:800;color:#dc2626;margin:16px 0">${price.toLocaleString()}đ</div>
      <button class="btn-primary" data-package-id="${pkg.id}" data-package-name="${escapeAttr(pkg.name || '')}" ${loggedIn ? '' : 'data-nav="/register"'}>${loggedIn || customerMode ? 'Đăng ký ngay' : 'Đăng ký / tạo tài khoản'}</button>
    </div>
  `
}

function renderAdminDashboard() {
  return shellLayout(`<div class="card" style="padding:28px"><h1>Tổng quan</h1><p class="muted">Bản admin thuần JS đã sẵn sàng, có thể mở rộng từng module tiếp theo.</p></div>`, { title: 'Tổng quan quản trị' })
}
function renderAdminPlaceholder(label) {
  return shellLayout(`<div class="card" style="padding:28px"><h1>${label}</h1><p class="muted">Màn này đang chạy bằng JS thuần để dễ bảo trì và mở rộng.</p></div>`, { title: label })
}
function renderCustomerPlaceholder(label) {
  return function () {
    return shellLayout(`<div class="container section"><div class="card" style="padding:28px"><h1>${label}</h1><p class="muted">Màn này đang ở bản thuần JS, giữ API và giao diện chung.</p></div></div>`)
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]))
}
function escapeAttr(s) { return escapeHtml(s).replace(/`/g, '&#96;') }

async function loadPackages() {
  if (state.packages.length) return state.packages
  try {
    const data = await api('/api/membership/packages/')
    state.packages = Array.isArray(data) ? data.map(p => ({ ...p, popular: /vip/i.test(p.name || '') || p.popular })) : []
  } catch {
    state.packages = [
      { id: 1, name: 'Basic', price: 299000, duration_days: 30, description: 'Phù hợp cho người mới', popular: false },
      { id: 2, name: 'VIP', price: 499000, duration_days: 30, description: 'Phổ biến nhất', popular: true },
      { id: 3, name: 'Premium', price: 799000, duration_days: 30, description: 'Đầy đủ tiện ích', popular: false }
    ]
  }
  return state.packages
}

function bindGlobalActions() {
  const logoutBtn = document.getElementById('logout-btn')
  if (logoutBtn) {
    logoutBtn.onclick = () => { clearAuth(); navigate('/') }
  }
  const toggleMobile = document.getElementById('toggle-mobile')
  if (toggleMobile) toggleMobile.onclick = () => { state.mobileMenuOpen = !state.mobileMenuOpen; render() }
  const toggleAdmin = document.getElementById('toggle-admin')
  if (toggleAdmin) toggleAdmin.onclick = () => { state.adminMenuOpen = !state.adminMenuOpen; render() }

  const loginForm = document.getElementById('login-form')
  if (loginForm) loginForm.onsubmit = async (e) => {
    e.preventDefault()
    try { await submitLogin(loginForm) } catch (err) { alert(err.message) }
  }
  const registerForm = document.getElementById('register-form')
  if (registerForm) registerForm.onsubmit = async (e) => {
    e.preventDefault()
    try { await submitRegister(registerForm); alert('Đăng ký thành công, vui lòng đăng nhập.') } catch (err) { alert(err.message) }
  }
  const contactForm = document.getElementById('contact-form')
  if (contactForm) contactForm.onsubmit = (e) => { e.preventDefault(); alert('Đã ghi nhận liên hệ.') }
  const profileForm = document.getElementById('profile-form')
  if (profileForm) profileForm.onsubmit = async (e) => {
    e.preventDefault()
    try {
      await api(`/api/users/user/profile/${state.user?.id}`, { method: 'PUT', body: JSON.stringify(Object.fromEntries(new FormData(profileForm).entries())) })
      alert('Đã lưu hồ sơ.')
    } catch (err) {
      alert(err.message)
    }
  }
  document.querySelectorAll('[data-package-id]').forEach(btn => {
    btn.onclick = async () => {
      if (!state.user) return navigate('/login')
      navigate('/customer/subscription')
    }
  })
}

async function render() {
  const path = location.pathname.replace(/\/+$/, '') || '/'
  if (state.token && tokenExpired(state.token)) clearAuth()
  const view = routes[path] || (() => shellLayout(`<div class="container section"><div class="card" style="padding:28px"><h1>404</h1><p class="muted">Trang không tồn tại.</p></div></div>`))
  const html = await view()
  document.getElementById('app').innerHTML = html
  bindGlobalActions()
}

render()
