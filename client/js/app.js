const state = {
  user: loadUser(),
  token: localStorage.getItem('token') || '',
  packages: [],
  pendingPayment: null,
  lastWorkoutPlan: loadLastWorkoutPlan(),
  customerChatHistory: [],
  adminChatHistory: [],
  customerChatKey: '',
  adminChatKey: '',
  customerChatContext: {},
  mobileMenuOpen: false,
  adminMenuOpen: false
}

const fallbackExercises = [
  { id: 1, name: 'Nâng tạ đôi', description: 'Bài tập vai', muscle_group: 'shoulders' },
  { id: 2, name: 'Ngồi xổm', description: 'Bài tập chân', muscle_group: 'legs' },
  { id: 3, name: 'Đẩy người', description: 'Bài tập ngực', muscle_group: 'chest' },
  { id: 4, name: 'Kéo xà', description: 'Bài tập lưng', muscle_group: 'back' },
  { id: 5, name: 'Gập bụng', description: 'Bài tập bụng', muscle_group: 'abs' },
  { id: 6, name: 'Plank', description: 'Bài tập core', muscle_group: 'core' },
  { id: 7, name: 'Deadlift', description: 'Bài tập toàn thân', muscle_group: 'full_body' },
  { id: 8, name: 'Bench Press', description: 'Bài tập ngực', muscle_group: 'chest' },
  { id: 9, name: 'Bicep Curl', description: 'Bài tập tay trước', muscle_group: 'arms' },
  { id: 10, name: 'Tricep Extension', description: 'Bài tập tay sau', muscle_group: 'arms' },
  { id: 11, name: 'Lat Pulldown', description: 'Bài tập xô và lưng trên', muscle_group: 'back' },
  { id: 12, name: 'Shoulder Press', description: 'Bài tập vai', muscle_group: 'shoulders' }
]

function loadUser() {
  try {
    const raw = localStorage.getItem('gym_user')
    return raw ? normalizeUser(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

function normalizeUser(user) {
  if (!user) return null
  return {
    ...user,
    phone: user.phone || user.phonenumber || '',
    phonenumber: user.phonenumber || user.phone || ''
  }
}

function loadLastWorkoutPlan() {
  try {
    const raw = localStorage.getItem('last_workout_plan')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveLastWorkoutPlan(plan) {
  state.lastWorkoutPlan = plan || null
  if (plan) localStorage.setItem('last_workout_plan', JSON.stringify(plan))
  else localStorage.removeItem('last_workout_plan')
}

function chatStorageKey(scope, userId) {
  const normalizedScope = scope === 'admin' ? 'admin' : 'customer'
  return `${normalizedScope}_chat_history_${userId || 'guest'}`
}

function loadChatHistory(key = 'chat_history') {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveChatHistory(history, key = 'chat_history') {
  const normalized = Array.isArray(history) ? history : []
  if (key.startsWith('customer_chat_history')) state.customerChatHistory = normalized
  else if (key.startsWith('admin_chat_history')) state.adminChatHistory = normalized
  localStorage.setItem(key, JSON.stringify(normalized))
}

function renderChatMessages(targetId, history = []) {
  const el = document.getElementById(targetId)
  if (!el) return
  const messages = Array.isArray(history) ? history : []
  el.innerHTML = messages.length ? messages.map((msg) => {
    const isUser = msg.role === 'user'
    return `
      <div class="card" style="padding:14px;background:${isUser ? '#fff' : '#f8fafc'};border:1px solid rgba(148,163,184,.14);max-width:92%;margin-left:${isUser ? 'auto' : '0'}">
        <div class="pill ${isUser ? 'red' : 'green'}" style="margin-bottom:8px">${isUser ? 'Bạn' : 'AI Coach'}</div>
        <div style="white-space:pre-wrap;line-height:1.7">${escapeHtml(msg.text || '')}</div>
      </div>
    `
  }).join('') : '<div class="muted">Chưa có câu hỏi nào. Hãy bắt đầu cuộc trò chuyện để được tư vấn.</div>'
  el.scrollTop = el.scrollHeight
}

function chatContextPills(context = {}) {
  const pills = []
  if (context.packageName) pills.push(`<span class="pill red">Gói: ${escapeHtml(context.packageName)}</span>`)
  if (context.planName) pills.push(`<span class="pill green">Plan: ${escapeHtml(context.planName)}</span>`)
  if (context.daysLeft !== null && context.daysLeft !== undefined) pills.push(`<span class="pill blue">${escapeHtml(String(context.daysLeft))} ngày còn lại</span>`)
  if (context.activePlanCount !== undefined) pills.push(`<span class="pill gold">${escapeHtml(String(context.activePlanCount))} plan</span>`)
  if (context.smartScore !== undefined) pills.push(`<span class="pill green">Smart ${escapeHtml(String(context.smartScore))}/100</span>`)
  return pills.join('')
}

function buildChatPrompt(baseMessage, context = {}) {
  const parts = []
  if (context.packageName) parts.push(`Gói hiện tại: ${context.packageName}`)
  if (context.planName) parts.push(`Kế hoạch gần nhất: ${context.planName}`)
  if (context.daysLeft !== null && context.daysLeft !== undefined) parts.push(`Số ngày còn lại: ${context.daysLeft}`)
  if (context.activePlanCount !== undefined) parts.push(`Số plan hiện có: ${context.activePlanCount}`)
  if (context.smartScore !== undefined) parts.push(`Điểm thông minh: ${context.smartScore}/100`)
  if (context.priorityNotice) parts.push(`Cảnh báo ưu tiên: ${context.priorityNotice}`)
  const contextLine = parts.length ? `Ngữ cảnh hệ thống: ${parts.join(' | ')}.` : ''
  return [contextLine, baseMessage].filter(Boolean).join('\n')
}

function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast')
  if (existing) existing.remove()
  const toast = document.createElement('div')
  toast.className = `toast ${type}`
  toast.textContent = message
  document.body.appendChild(toast)
  requestAnimationFrame(() => toast.classList.add('show'))
  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => toast.remove(), 220)
  }, 2200)
}

function normalizePlans(plans) {
  return (Array.isArray(plans) ? plans : [])
    .slice()
    .sort((a, b) => Number(b.id || 0) - Number(a.id || 0))
}

function groupPlansByYearMonth(plans) {
  const years = {}
  for (const plan of plans || []) {
    const dt = plan?.created_at ? new Date(plan.created_at) : null
    const year = dt ? String(dt.getFullYear()) : 'unknown'
    const month = dt ? `${String(dt.getMonth() + 1).padStart(2, '0')}` : 'unknown'
    if (!years[year]) years[year] = {}
    if (!years[year][month]) years[year][month] = []
    years[year][month].push(plan)
  }
  return years
}

function buildExerciseLookup(exercises) {
  return new Map((Array.isArray(exercises) && exercises.length ? exercises : fallbackExercises).map((ex) => [Number(ex.id), ex]))
}

function renderPlanDetails(plan, exerciseLookup) {
  const details = Array.isArray(plan?.details) ? plan.details : []
  if (!details.length) return '<div class="muted">Kế hoạch chưa có chi tiết bài tập.</div>'
  const limited = details.slice(0, 3)
  const remainder = details.length - limited.length
  return `
    <div class="grid">
      ${limited.map((detail) => {
    const ex = exerciseLookup.get(Number(detail.exercise_id))
    const label = ex ? ex.name : `Exercise #${detail.exercise_id}`
    const meta = [detail.sets ? `${detail.sets} set` : null, detail.reps ? `${detail.reps} reps` : null, detail.weight ? `${detail.weight}kg` : null].filter(Boolean).join(' • ')
    return `
      <div class="card" style="padding:14px;background:#f8fafc;border:1px solid rgba(148,163,184,.12)">
        <strong>${escapeHtml(label)}</strong>
        <div class="muted" style="margin-top:6px">${escapeHtml(meta || 'Thông số chưa có')}</div>
        ${detail.notes ? `<div class="muted" style="margin-top:6px">${escapeHtml(detail.notes)}</div>` : ''}
      </div>
    `
  }).join('')}
      ${remainder > 0 ? `<button class="btn-ghost" type="button" data-open-full-plan="1">Mở full kế hoạch (${details.length} bài)</button>` : ''}
    </div>
  `
}

function renderPlanPreviewCard(plan, exerciseLookup, options = {}) {
  if (!plan) {
    return `<div class="card plan-rail" style="padding:18px;background:#f8fafc">
      <div class="muted">${escapeHtml(options.emptyText || 'Chưa có kế hoạch nào.')}</div>
    </div>`
  }
  const details = Array.isArray(plan.details) ? plan.details : []
  const previewDetails = details.slice(0, 3)
  const remainder = details.length - previewDetails.length
  return `
    <div class="card plan-highlight plan-rail" style="padding:18px;background:linear-gradient(180deg,#ffffff,#f8fafc)">
      <div class="plan-title">
        <div>
          <div class="plan-chip-row">
            <div class="pill green">${options.label || 'Kế hoạch mới nhất'}</div>
            <div class="pill gold">Smart plan</div>
          </div>
          <strong style="font-size:18px">${escapeHtml(plan.name || 'Kế hoạch')}</strong>
          ${plan.created_at ? `<div class="muted" style="margin-top:6px">Tạo lúc: ${escapeHtml(String(plan.created_at).slice(0, 19).replace('T', ' '))}</div>` : ''}
        </div>
        ${details.length ? `<span class="pill blue">${details.length} bài tập</span>` : ''}
      </div>
      <div class="plan-caption">
        ${previewDetails.length ? previewDetails.map((detail) => {
    const ex = exerciseLookup.get(Number(detail.exercise_id))
    const label = ex ? ex.name : `Exercise #${detail.exercise_id}`
    const meta = [detail.sets ? `${detail.sets} set` : null, detail.reps ? `${detail.reps} reps` : null, detail.weight ? `${detail.weight}kg` : null].filter(Boolean).join(' • ')
    return `
            <div class="card" style="padding:14px;background:#f8fafc;border:1px solid rgba(148,163,184,.12)">
              <strong>${escapeHtml(label)}</strong>
              <div class="muted" style="margin-top:6px">${escapeHtml(meta || 'Thông số chưa có')}</div>
            </div>
          `
  }).join('') : '<div class="muted">Kế hoạch chưa có chi tiết bài tập.</div>'}
        ${remainder > 0 ? `<button class="btn-ghost" type="button" data-open-full-plan="1">Mở full kế hoạch (${details.length} bài)</button>` : ''}
      </div>
    </div>
  `
}

function severityPillClass(severity) {
  const value = String(severity || '').toLowerCase()
  if (value === 'critical') return 'red'
  if (value === 'warning') return 'gold'
  if (value === 'success') return 'green'
  return 'blue'
}

function renderNotificationCards(items = [], emptyText = 'Chưa có cảnh báo nào.') {
  const list = Array.isArray(items) ? items : []
  if (!list.length) return `<div class="card" style="padding:16px;background:#f8fafc">${escapeHtml(emptyText)}</div>`
  return list.map((item) => `
    <div class="card" style="padding:16px;background:#fff;border:1px solid rgba(148,163,184,.14)">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
        <strong>${escapeHtml(item.title || 'Thông báo')}</strong>
        <span class="pill ${severityPillClass(item.severity)}">${escapeHtml(item.severity || 'info')}</span>
      </div>
      <div class="muted" style="margin-top:8px">${escapeHtml(item.message || '')}</div>
      ${item.action_path ? `<button class="btn-ghost" data-nav="${escapeAttr(item.action_path)}" style="margin-top:12px">${escapeHtml(item.action_label || 'Xem chi tiết')}</button>` : ''}
    </div>
  `).join('')
}

function renderCustomerSmartCenter(summary) {
  if (!summary) {
    return `
      <div class="card plan-highlight" style="padding:22px;margin-bottom:24px">
        <div class="pill blue">Smart Center</div>
        <h3 style="margin-bottom:8px">Trung tâm thông minh</h3>
        <p class="muted">Service phân tích chưa phản hồi. Dashboard vẫn dùng dữ liệu trực tiếp từ các service còn lại.</p>
      </div>
    `
  }
  const notifications = Array.isArray(summary.notifications) ? summary.notifications : []
  const nextWorkout = Array.isArray(summary.workout?.next_workout) ? summary.workout.next_workout : []
  const membership = summary.membership || {}
  return `
    <div class="card plan-highlight" style="padding:24px;margin-bottom:24px;background:linear-gradient(135deg,rgba(220,38,38,.08),rgba(34,197,94,.10))">
      <div style="display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap">
        <div>
          <div class="pill green">Smart Center</div>
          <h3 style="margin:10px 0 6px">Điểm thông minh: ${Number(summary.smart_score || 0)}/100</h3>
          <p class="muted" style="margin:0">${escapeHtml(summary.smart_level || 'Đang phân tích')} • ${membership.active ? `Gói còn ${membership.days_left ?? 0} ngày` : 'Chưa có gói active'}</p>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn-secondary" data-nav="/customer/notifications">Xem thông báo</button>
          <button class="btn-ghost" data-nav="/customer/chatbot">Hỏi AI Coach</button>
        </div>
      </div>
      <div class="grid two-col" style="margin-top:18px">
        <div>
          <strong>Cảnh báo ưu tiên</strong>
          <div class="grid" style="margin-top:12px">
            ${renderNotificationCards(notifications.slice(0, 3), 'Hồ sơ và gói tập đang ổn.')}
          </div>
        </div>
        <div>
          <strong>Bài nên tập tiếp theo</strong>
          <div class="grid" style="margin-top:12px">
            ${nextWorkout.slice(0, 3).map((item) => `
              <div class="card" style="padding:14px;background:#f8fafc;border:1px solid rgba(148,163,184,.12)">
                <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap">
                  <strong>${escapeHtml(item.exercise_name || `Exercise #${item.exercise_id || ''}`)}</strong>
                  <span class="pill blue">${escapeHtml(item.muscle_group || 'smart')}</span>
                </div>
                <div class="muted" style="margin-top:6px">${escapeHtml([item.sets ? `${item.sets} set` : null, item.reps ? `${item.reps} reps` : null, item.weight ? `${item.weight}kg` : null].filter(Boolean).join(' • ') || item.description || 'Gợi ý từ service phân tích')}</div>
              </div>
            `).join('') || '<div class="card" style="padding:16px;background:#f8fafc">Chưa đủ dữ liệu để đề xuất bài tập.</div>'}
          </div>
        </div>
      </div>
    </div>
  `
}

function renderAdminOverviewPanel(overview, expanded = false) {
  if (!overview) {
    return `
      <div class="card plan-highlight" style="padding:22px;margin-top:24px">
        <div class="pill blue">Business Intelligence</div>
        <h3 style="margin-bottom:8px">Phân tích nghiệp vụ</h3>
        <p class="muted">Intelligence Service chưa phản hồi. Kiểm tra container gym_intelligence_app nếu cần.</p>
      </div>
    `
  }
  const metrics = overview.metrics || {}
  const insights = Array.isArray(overview.insights) ? overview.insights : []
  const riskUsers = Array.isArray(overview.risk_users) ? overview.risk_users : []
  const packageSales = Array.isArray(overview.package_sales) ? overview.package_sales : []
  return `
    <div class="card plan-highlight" style="padding:24px;margin-top:24px;background:linear-gradient(135deg,rgba(220,38,38,.08),rgba(34,197,94,.10))">
      <div style="display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap">
        <div>
          <div class="pill green">Business Intelligence</div>
          <h3 style="margin:10px 0 6px">Phân tích vận hành phòng gym</h3>
          <p class="muted" style="margin:0">Tự tổng hợp hội viên, gói active, rủi ro hết hạn và thiếu kế hoạch.</p>
        </div>
        ${expanded ? '' : '<button class="btn-secondary" data-nav="/admin/intelligence">Mở trang phân tích</button>'}
      </div>
      <div class="grid four-col" style="margin-top:18px">
        ${statCard(String(metrics.users ?? 0), 'Hội viên')}
        ${statCard(String(metrics.active_members ?? 0), 'Đang active')}
        ${statCard(String(metrics.expiring_soon ?? 0), 'Sắp hết hạn')}
        ${statCard(`${Number(metrics.estimated_active_revenue || 0).toLocaleString()}đ`, 'Doanh thu active')}
      </div>
      <div class="grid ${expanded ? 'two-col' : 'three-col'}" style="margin-top:18px">
        <div class="card" style="padding:18px;background:#fff">
          <h3 style="margin-top:0">Insight</h3>
          <div class="grid">
            ${insights.map((item) => `
              <div class="card" style="padding:14px;background:#f8fafc">
                <span class="pill ${severityPillClass(item.severity)}">${escapeHtml(item.severity || 'info')}</span>
                <strong style="display:block;margin-top:8px">${escapeHtml(item.title || '')}</strong>
                <div class="muted" style="margin-top:6px">${escapeHtml(item.message || '')}</div>
              </div>
            `).join('') || '<div class="muted">Chưa có insight.</div>'}
          </div>
        </div>
        <div class="card" style="padding:18px;background:#fff">
          <h3 style="margin-top:0">User cần chăm sóc</h3>
          <div class="grid">
            ${riskUsers.slice(0, expanded ? 12 : 5).map((item) => `
              <div class="card" style="padding:14px;background:#f8fafc">
                <strong>${escapeHtml(item.name || `User #${item.user_id}`)}</strong>
                <div class="muted" style="margin-top:6px">${escapeHtml(item.reason || '')}</div>
                <button class="btn-ghost" data-nav="/admin/workout-plans?user_id=${escapeAttr(item.user_id || '')}" style="margin-top:10px">${escapeHtml(item.action || 'Xem')}</button>
              </div>
            `).join('') || '<div class="muted">Không có user rủi ro cao.</div>'}
          </div>
        </div>
        <div class="card" style="padding:18px;background:#fff">
          <h3 style="margin-top:0">Gói bán chạy</h3>
          <div class="grid">
            ${packageSales.slice(0, expanded ? 8 : 4).map((item) => `
              <div class="card" style="padding:14px;background:#f8fafc">
                <strong>${escapeHtml(item.name || `Gói #${item.package_id}`)}</strong>
                <div class="muted" style="margin-top:6px">${Number(item.total_sales || 0)} lượt đăng ký • ${Number(item.active_sales || 0)} active</div>
              </div>
            `).join('') || '<div class="muted">Chưa có dữ liệu bán gói.</div>'}
          </div>
        </div>
      </div>
    </div>
  `
}

function buildSuggestedRoutine(activePackage, exerciseLookup, plans) {
  const allExercises = Array.from(exerciseLookup.values())
  const sortedPlans = normalizePlans(plans)
  const currentNames = new Set()
  for (const plan of sortedPlans.slice(0, 3)) {
    for (const detail of (plan.details || [])) {
      const ex = exerciseLookup.get(Number(detail.exercise_id))
      if (ex?.name) currentNames.add(ex.name)
    }
  }
  const pushIfMatch = (keywords, limit) => allExercises.filter((ex) => {
    const text = `${ex.name || ''} ${ex.description || ''} ${ex.muscle_group || ''}`.toLowerCase()
    return keywords.some((k) => text.includes(k))
  }).filter((ex) => !currentNames.has(ex.name)).slice(0, limit)

  const baseName = String(activePackage?.name || '').toLowerCase()
  const isVip = /vip/.test(baseName)
  const isPremium = /premium/.test(baseName)
  const isBasic = !isVip && !isPremium

  const picks = [
    ...pushIfMatch(isPremium ? ['bench', 'press', 'deadlift', 'row', 'pulldown'] : isVip ? ['press', 'row', 'lunge', 'curl', 'plank'] : ['plank', 'squat', 'curl', 'push', 'walk'], 3),
    ...pushIfMatch(['core', 'abs', 'shoulder', 'back', 'legs'], 2)
  ].slice(0, isBasic ? 4 : isVip ? 5 : 6)

  return picks.length ? picks : allExercises.slice(0, isBasic ? 4 : isVip ? 5 : 6)
}

function smartPlanTemplates(exerciseSource = [], activePackage = null) {
  const lookup = new Map((exerciseSource || []).map((ex) => [Number(ex.id), ex]))
  const pick = (ids) => ids.map((id) => lookup.get(Number(id))).filter(Boolean)
  const base = {
    warmup: pick([17, 6, 5]),
    push: pick([3, 8, 12, 20]),
    pull: pick([4, 11, 15, 21]),
    legs: pick([2, 13, 14]),
    core: pick([5, 6, 16, 19]),
    full: pick([7, 18])
  }
  const level = String(activePackage?.name || '').toLowerCase()
  if (/premium/.test(level)) return [...base.full, ...base.push, ...base.pull, ...base.legs, ...base.core]
  if (/vip/.test(level)) return [...base.warmup, ...base.push, ...base.pull, ...base.legs]
  return [...base.warmup, ...base.legs, ...base.core]
}

function collectPlanRows() {
  return Array.from(document.querySelectorAll('#workout-plan-rows .plan-row')).map((row) => {
    const fields = row.querySelectorAll('input, select, textarea')
    const [exercise, workoutDate, sets, reps, weight, notes] = fields
    return {
      exercise_id: Number(exercise?.value || 0),
      workout_date: workoutDate?.value || null,
      sets: Number(sets?.value || 1),
      reps: Number(reps?.value || 1),
      weight: weight?.value ? Number(weight.value) : null,
      notes: notes?.value || ''
    }
  }).filter((item) => item.exercise_id)
}

function setPlanRows(items, exerciseSource = []) {
  const container = document.getElementById('workout-plan-rows')
  if (!container) return
  const exerciseOptions = exerciseSource.map((ex) => `<option value="${escapeAttr(ex.id)}">${escapeHtml(ex.name || `Exercise #${ex.id}`)}</option>`).join('')
  const values = Array.isArray(items) && items.length ? items : [{}]
  container.innerHTML = values.map((item, index) => {
    const template = renderPlanRowTemplate(exerciseOptions, index + 1)
    const holder = document.createElement('div')
    holder.innerHTML = template
    const row = holder.firstElementChild
    if (!row) return template
    const selects = row.querySelectorAll('select')
    const inputs = row.querySelectorAll('input')
    const textarea = row.querySelector('textarea')
    if (selects[0] && item.exercise_id) selects[0].value = String(item.exercise_id)
    if (inputs[0] && item.workout_date) inputs[0].value = item.workout_date
    if (inputs[1] && item.sets) inputs[1].value = item.sets
    if (inputs[2] && item.reps) inputs[2].value = item.reps
    if (inputs[3] && item.weight !== undefined && item.weight !== null) inputs[3].value = item.weight
    if (textarea && item.notes) textarea.value = item.notes
    return row.outerHTML
  }).join('')
}

function renderPlanRowTemplate(exerciseOptions, index = 1, prefill = {}) {
  return `
    <div class="card plan-row" style="padding:16px;background:#fff;border:1px solid rgba(148,163,184,.14)">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:12px">
        <strong>Buổi ${index}</strong>
        <button class="btn-ghost" type="button" data-remove-plan-row>Xóa dòng</button>
      </div>
      <div class="grid two-col">
        <select class="select" name="exercise_id" required>
          <option value="">Chọn bài tập</option>
          ${exerciseOptions}
        </select>
        <input class="input" name="workout_date" type="date" />
      </div>
      <div class="grid three-col" style="margin-top:12px">
        <input class="input" name="sets" type="number" min="1" placeholder="Số set" />
        <input class="input" name="reps" type="number" min="1" placeholder="Số reps" />
        <input class="input" name="weight" type="number" min="0" step="0.1" placeholder="Tạ (kg)" />
      </div>
      <textarea class="textarea" name="notes" rows="3" style="margin-top:12px" placeholder="Ghi chú"></textarea>
    </div>
  `
}

function saveAuth(user, token) {
  state.user = normalizeUser(user)
  state.token = token
  localStorage.setItem('gym_user', JSON.stringify(state.user))
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
  '/customer/workout-plan': renderCustomerWorkoutPlan,
  '/customer/workout-plan/full': renderCustomerWorkoutPlanFull,
  '/customer/workout-history': renderCustomerWorkoutHistory,
  '/customer/notifications': renderCustomerNotifications,
  '/customer/chatbot': renderCustomerChatbot,
  '/admin': renderAdminDashboard,
  '/admin/intelligence': renderAdminIntelligence,
  '/admin/users': renderAdminUsers,
  '/admin/rfid': renderAdminRFID,
  '/admin/packages': renderAdminPackages,
  '/admin/subscriptions': renderAdminSubscriptions,
  '/admin/exercises': renderAdminExercises,
  '/admin/workout-plans': renderAdminWorkoutPlans,
  '/admin/workout-history': renderAdminWorkoutHistory,
  '/admin/equipment': renderAdminEquipment,
  '/admin/maintenance': renderAdminMaintenance,
  '/admin/areas': renderAdminAreas,
  '/admin/chatbot': renderAdminChatbot
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
    ['Phân tích', '/admin/intelligence'],
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
    ['Thông báo', '/customer/notifications'],
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
              <div style="margin-top:12px;color:#475569;font-weight:700;letter-spacing:.06em;text-transform:uppercase;font-size:12px">Trung tâm luyện tập thông minh</div>
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
          <div class="card plan-highlight" style="margin-top:18px;padding:18px">
            <strong>Hoàn thiện hồ sơ sau đăng ký</strong>
            <div class="muted" style="margin-top:6px">
              Sau khi tạo tài khoản, vào Hồ sơ cá nhân để kiểm tra tên, số điện thoại, email và ngày sinh. Ảnh đại diện sẽ dùng mặc định của hệ thống.
            </div>
            <div class="grid" style="margin-top:12px">
              <div class="pill green">1. Tạo tài khoản</div>
              <div class="pill blue">2. Cập nhật hồ sơ</div>
              <div class="pill gold">3. Chọn gói tập</div>
            </div>
          </div>
        </div>
        <div class="card" style="padding:34px">
          <h1 style="margin-top:0">Đăng ký</h1>
          <form id="register-form" class="grid" style="gap:14px;margin-top:20px">
            <input class="input" name="username" placeholder="Tên đăng nhập" required autocomplete="username" />
            <input class="input" name="password" type="password" placeholder="Mật khẩu" required autocomplete="new-password" minlength="6" />
            <input class="input" name="name" placeholder="Họ và tên" />
            <input class="input" name="phone" placeholder="Số điện thoại" autocomplete="tel" />
            <button class="btn-primary" type="submit">Tạo tài khoản</button>
          </form>
          <p class="muted" style="margin-top:20px">Đã có tài khoản? <a data-nav="/login" href="/login">Đăng nhập</a></p>
        </div>
      </div>
    </section>
  `)
}

function renderPackagesEntry() {
  return renderPackagesPage(false)
}

function renderProducts() {
  return shellLayout(`
    <section class="section" style="padding-top:24px">
      <div class="container">
        <div class="card" style="padding:28px;background:linear-gradient(90deg,rgba(220,38,38,.1),rgba(34,197,94,.1));margin-bottom:24px">
          <h1 style="margin:0 0 8px">Cửa hàng</h1>
          <p class="muted">Sản phẩm nổi bật và danh mục hỗ trợ tập luyện</p>
        </div>
        <div id="products-list" class="grid three-col"></div>
      </div>
    </section>
  `)
}

async function renderCustomerDashboard() {
  const user = state.user
  const [activeSub, packages] = await Promise.all([
    user?.id ? api(`/api/membership/subscriptions/user/${user.id}`).catch(() => []) : Promise.resolve([]),
    loadPackages()
  ])
  const [plans, exercises] = await Promise.all([
    user?.id ? api(`/api/workout/plans/user/${user.id}`).catch(() => []) : Promise.resolve([]),
    api('/api/workout/exercises').catch(() => [])
  ])
  const intelligence = user?.id ? await api(`/api/intelligence/user/${user.id}/summary`).catch(() => null) : null
  const latestActive = Array.isArray(activeSub)
    ? [...activeSub].sort((a, b) => Number(b.id || 0) - Number(a.id || 0)).find((item) => String(item.status || '').toLowerCase() === 'active')
    : activeSub
  const activePackage = latestActive
    ? packages.find((p) => Number(p.id) === Number(latestActive.package_id))
    : null
  const today = new Date()
  const startDate = latestActive?.start_date ? new Date(`${latestActive.start_date}T00:00:00`) : null
  const endDate = latestActive?.end_date ? new Date(`${latestActive.end_date}T23:59:59`) : null
  const totalDays = activePackage?.duration_days ? Number(activePackage.duration_days) : null
  const daysLeft = endDate ? Math.max(0, Math.ceil((endDate - today) / 86400000)) : null
  const usedDays = startDate ? Math.max(0, Math.ceil((today - startDate) / 86400000)) : null
  const progress = totalDays ? Math.max(0, Math.min(100, Math.round(((totalDays - (daysLeft ?? totalDays)) / totalDays) * 100))) : 0
  const statusLabel = !latestActive
    ? 'Chưa có gói'
    : daysLeft !== null && daysLeft <= 7
      ? 'Sắp hết hạn'
      : 'Đang hoạt động'
  const exerciseLookup = buildExerciseLookup(exercises)
  const latestPlan = normalizePlans([
    ...(Array.isArray(plans) ? plans : []),
    ...((state.lastWorkoutPlan && Number(state.lastWorkoutPlan.user_id) === Number(user?.id)) ? [state.lastWorkoutPlan] : [])
  ])[0] || null
  const quickActions = [
    { label: 'Xem gói tập', path: '/packages', tone: 'primary' },
    { label: 'Kế hoạch hôm nay', path: '/customer/workout-plan', tone: 'secondary' },
    { label: 'Lịch sử đã tập', path: '/customer/workout-history', tone: 'ghost' },
    { label: 'AI Coach', path: '/customer/chatbot', tone: 'ghost' },
    { label: 'Thông tin cá nhân', path: '/customer/profile', tone: 'ghost' }
  ]
  const tips = latestActive && activePackage ? [
    `Gói ${activePackage.name} còn ${daysLeft ?? 0} ngày.`,
    daysLeft !== null && daysLeft <= 7 ? 'Nên gia hạn sớm để không bị gián đoạn.' : 'Giữ nhịp tập đều để đạt hiệu quả tốt hơn.',
    `Hôm nay ưu tiên các bài phù hợp với ${activePackage.name}.`
  ] : [
    'Chọn một gói phù hợp để mở Smart Coach.',
    'Sau khi đăng ký, hệ thống sẽ tự gợi ý bài tập.',
    'Dùng AI Coach để nhận tư vấn cá nhân hóa.'
  ]
  const latestPlanDetails = Array.isArray(latestPlan?.details) ? latestPlan.details : []
  const suggestedRoutine = buildSuggestedRoutine(activePackage, exerciseLookup, plans)
  return shellLayout(`
    <section class="section" style="padding-top:24px">
      <div class="container">
        <div class="card" style="padding:28px;background:linear-gradient(90deg,rgba(220,38,38,.12),rgba(34,197,94,.12));color:#0f172a;margin-bottom:24px">
          <h1 style="margin:0 0 8px">Xin chào, ${escapeHtml(user?.full_name || user?.username || 'bạn')}!</h1>
          <p style="margin:0;color:#475569">Hôm nay bạn có kế hoạch tập luyện gì?</p>
        </div>
        <div class="grid four-col" style="margin-bottom:24px">
          ${statCard(String(usedDays ?? 0), 'Ngày theo gói')}
          ${statCard(String(daysLeft ?? 0), 'Ngày còn lại')}
          ${statCard(`${progress}%`, 'Tiến độ gói')}
          ${statCard(statusLabel, 'Trạng thái')}
        </div>
        ${renderCustomerSmartCenter(intelligence)}
        <div class="grid two-col">
              <div class="card plan-highlight" style="padding:24px">
            <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
              <h3 style="margin:0">Kế hoạch hôm nay</h3>
              <span class="pill ${latestPlan ? 'gold' : 'blue'}">${latestPlan ? 'Smart plan' : 'Chưa có kế hoạch'}</span>
            </div>
            <p class="muted" style="margin-top:8px">Kế hoạch mới nhất của bạn sẽ hiện ở đây và đồng bộ với trang Kế hoạch tập luyện.</p>
            <div style="margin-top:16px">
              ${latestPlan ? renderPlanPreviewCard(latestPlan, exerciseLookup, { label: 'Kế hoạch mới nhất', emptyText: 'Chưa có kế hoạch.' }) : `
                <div class="card" style="padding:18px;background:#f8fafc;border:1px solid rgba(148,163,184,.12)">
                  <div class="muted">Chưa có kế hoạch nào. Hãy tạo trong menu Kế hoạch tập luyện.</div>
                </div>
              `}
            </div>
          <div style="margin-top:16px;display:flex;gap:12px;flex-wrap:wrap">
            <button class="btn-primary" data-nav="/customer/workout-plan">Tạo kế hoạch</button>
            <button class="btn-secondary" data-nav="/customer/workout-plan/full">Xem full kế hoạch</button>
            <button class="btn-ghost" data-nav="/customer/chatbot">Nhờ AI Coach gợi ý</button>
          </div>
        </div>
          <div class="card" style="padding:24px">
            <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
              <h3 style="margin:0">Gói tập hiện tại</h3>
              <span class="pill ${latestActive ? 'green' : 'blue'}">${statusLabel}</span>
            </div>
            ${latestActive && activePackage ? `
              <div style="margin-top:14px">
                <div style="font-size:22px;font-weight:800">${escapeHtml(activePackage.name || 'Gói tập')}</div>
                <div class="muted" style="margin-top:6px">${escapeHtml(activePackage.package_desc || activePackage.description || '')}</div>
                <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap">
                  <span class="pill red">${Number(activePackage.price || 0).toLocaleString()}đ</span>
                  <span class="pill blue">${Number(activePackage.duration_days || 0)} ngày</span>
                  <span class="pill green">${daysLeft ?? 0} ngày còn lại</span>
                </div>
                <div style="margin-top:16px">
                  <div style="display:flex;justify-content:space-between;gap:12px;margin-bottom:8px">
                    <strong>Tiến độ sử dụng</strong>
                    <span class="muted">${progress}%</span>
                  </div>
                  <div style="height:14px;border-radius:999px;background:#eef2f7;overflow:hidden">
                    <div style="width:${progress}%;height:100%;border-radius:999px;background:linear-gradient(90deg,#e11d48,#22c55e)"></div>
                  </div>
                </div>
                <div class="muted" style="margin-top:10px">Từ ${escapeHtml(latestActive.start_date || '')} đến ${escapeHtml(latestActive.end_date || '')}</div>
              </div>
            ` : `
              <p class="muted">Chưa có gói tập hoặc dữ liệu đang được tải.</p>
              <button class="btn-primary" data-nav="/packages">Đăng ký ngay</button>
            `}
          </div>
          <div class="card" style="padding:24px">
            <h3>Smart Coach</h3>
            <p class="muted" style="margin-top:8px">Gợi ý hành động nhanh dựa trên trạng thái hiện tại.</p>
            <div class="grid" style="margin-top:16px">
              ${quickActions.map((action) => `<button class="btn-${action.tone}" data-nav="${action.path}" style="width:100%;text-align:left">${escapeHtml(action.label)}</button>`).join('')}
            </div>
          </div>
        </div>
        <div class="grid two-col" style="margin-top:24px">
          <div class="card" style="padding:24px">
            <h3>Gợi ý hôm nay</h3>
            <div class="grid" style="margin-top:16px">
              ${tips.map((tip) => `<div class="card" style="padding:14px;background:#f8fafc">${escapeHtml(tip)}</div>`).join('')}
            </div>
          </div>
          <div class="card" style="padding:24px">
            <h3>Lộ trình gợi ý</h3>
            <p class="muted">Hệ thống đề xuất bài tập dựa trên gói hiện tại và kế hoạch gần nhất.</p>
            <div class="grid" style="margin-top:16px">
              ${suggestedRoutine.slice(0, 3).map((ex, index) => `
                <div class="card" style="padding:14px;background:#f8fafc;border:1px solid rgba(148,163,184,.12)">
                  <div style="display:flex;justify-content:space-between;gap:12px;align-items:center">
                    <strong>${index + 1}. ${escapeHtml(ex.name || `Exercise #${ex.id}`)}</strong>
                    <span class="pill blue">${escapeHtml(ex.muscle_group || 'smart')}</span>
                  </div>
                  <div class="muted" style="margin-top:6px">${escapeHtml(ex.description || 'Được gợi ý từ AI Coach')}</div>
                </div>
              `).join('')}
              ${suggestedRoutine.length > 3 ? `<button class="btn-ghost" type="button" data-nav="/customer/workout-plan/full">Xem toàn bộ kế hoạch</button>` : ''}
            </div>
          </div>
        </div>
      </div>
    </section>
  `)
}

function renderCustomerProfile() {
  const user = state.user || {}
  const phone = user.phone || user.phonenumber || ''
  const avatarChar = (user.full_name || user.name || user.username || 'U')[0]?.toUpperCase() || 'U'
  const avatarName = user.avatar_url || user.avatar || '/avatar-default.svg'
  return shellLayout(`
    <section class="section" style="padding-top:24px">
      <div class="container">
        <div class="card" style="padding:28px">
          <h1>Hồ sơ cá nhân</h1>
          <div class="card plan-highlight" style="margin-top:14px;padding:18px;display:flex;gap:16px;align-items:center;flex-wrap:wrap">
            <div class="profile-avatar-shell">
              <img class="profile-avatar" src="${escapeAttr(avatarName)}" alt="Avatar" onerror="this.src='/avatar-default.svg';this.onerror=null;" />
            </div>
            <div>
              <strong style="font-size:18px">${escapeHtml(user.full_name || user.name || user.username || 'User')}</strong>
              <div class="muted" style="margin-top:4px">${escapeHtml(user.role || 'user')} • ${escapeHtml(user.email || 'Chưa có email')}</div>
              <div class="muted" style="margin-top:4px">Username: ${escapeHtml(user.username || 'Chưa có')}</div>
            </div>
          </div>
          <div class="card plan-highlight" style="margin-top:12px;padding:16px">
            <strong>Cập nhật thông tin</strong>
            <div class="muted" style="margin-top:6px">Hãy sửa tên, email, số điện thoại và ngày sinh. Hệ thống sẽ lưu ngay khi bấm Lưu thay đổi.</div>
          </div>
          <form id="profile-form" class="grid two-col" style="margin-top:20px">
            <input class="input" name="name" placeholder="Họ và tên" value="${escapeAttr(user.name || user.full_name || '')}" />
            <input class="input" name="email" placeholder="Email" value="${escapeAttr(user.email || '')}" />
            <input class="input" name="phone" placeholder="Số điện thoại" value="${escapeAttr(phone)}" />
            <input class="input" name="date_of_birth" type="date" value="${escapeAttr(user.date_of_birth || '')}" />
            <select class="select" name="gender">
              <option value="male" ${String(user.gender || '').toLowerCase() === 'male' ? 'selected' : ''}>Nam</option>
              <option value="female" ${String(user.gender || '').toLowerCase() === 'female' ? 'selected' : ''}>Nữ</option>
              <option value="other" ${String(user.gender || '').toLowerCase() === 'other' ? 'selected' : ''}>Khác</option>
            </select>
            <div class="card profile-summary" style="grid-column:1/-1;padding:16px;background:#f9fafb">
              <strong>Thông tin đã đăng ký</strong>
              <div class="grid three-col" style="margin-top:12px;gap:14px">
                <div><div class="muted">Tên đăng nhập</div><strong>${escapeHtml(user.username || 'Chưa có')}</strong></div>
                <div><div class="muted">Số điện thoại</div><strong>${escapeHtml(phone || 'Chưa có')}</strong></div>
                <div><div class="muted">Ngày sinh</div><strong>${escapeHtml(user.date_of_birth || 'Chưa có')}</strong></div>
              </div>
            </div>
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

async function renderCustomerWorkoutPlan() {
  const user = state.user || {}
  const [plans, exercises] = await Promise.all([
    user.id ? api(`/api/workout/plans/user/${user.id}`).catch(() => []) : Promise.resolve([]),
    api('/api/workout/exercises').catch(() => [])
  ])
  const exerciseSource = Array.isArray(exercises) && exercises.length ? exercises : fallbackExercises
  state.exerciseSourceForPlan = exerciseSource
  const visiblePlans = normalizePlans([
    ...((state.lastWorkoutPlan && Number(state.lastWorkoutPlan.user_id) === Number(user.id)) ? [state.lastWorkoutPlan] : []),
    ...(Array.isArray(plans) ? plans : [])
  ])
  const latestPlan = visiblePlans[0] || null
  const exerciseLookup = buildExerciseLookup(exerciseSource)
  const exerciseOptions = exerciseSource.map((ex) =>
    `<option value="${escapeAttr(ex.id)}">${escapeHtml(ex.name || `Exercise #${ex.id}`)}</option>`
  ).join('')
  const templatePlan = smartPlanTemplates(exerciseSource, state.user?.activePackage)
  return shellLayout(`
    <section class="section" style="padding-top:24px">
      <div class="container grid two-col">
        <div class="card" style="padding:28px">
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
            <h1 style="margin:0">Kế hoạch tập luyện</h1>
            <span class="pill green">Form thông minh</span>
          </div>
          <p class="muted" style="margin-top:10px">Nhập các trường cơ bản, hệ thống sẽ tạo cấu trúc kế hoạch cho bạn.</p>
          <div class="card plan-highlight" style="margin-top:16px;padding:16px">
            <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
              <strong>Gợi ý khung kế hoạch</strong>
              <span class="pill gold">AI Draft</span>
            </div>
            <div class="muted" style="margin-top:8px">Dùng nhóm bài gợi ý bên dưới để lên kế hoạch nhanh hơn. Bạn có thể thêm/xóa từng dòng.</div>
            <div class="grid" style="margin-top:14px">
              ${templatePlan.slice(0, 4).map((ex, idx) => `
                <div class="card" style="padding:12px;background:#fff;border:1px solid rgba(148,163,184,.12)">
                  <strong>${idx + 1}. ${escapeHtml(ex.name || '')}</strong>
                  <div class="muted" style="margin-top:4px">${escapeHtml(ex.description || '')}</div>
                </div>
              `).join('')}
            </div>
          </div>
          ${latestPlan ? `
            <div style="margin-top:16px">${renderPlanPreviewCard(latestPlan, exerciseLookup, { label: 'Kế hoạch vừa tạo' })}</div>
          ` : ''}
          <form id="workout-plan-form" class="grid" style="margin-top:18px">
            <input class="input" name="name" placeholder="Tên kế hoạch" required />
            <div id="workout-plan-rows" class="grid" style="gap:16px">
              ${renderPlanRowTemplate(exerciseOptions, 1)}
            </div>
            <div style="display:flex;gap:12px;flex-wrap:wrap">
              <button class="btn-secondary" type="button" id="add-plan-row-btn">Thêm bài tập</button>
              <button class="btn-ghost" type="button" id="smart-plan-fill-btn">Điền mẫu thông minh</button>
            </div>
            <textarea class="textarea" name="notes" rows="4" placeholder="Ghi chú: mục tiêu, mức độ khó, lưu ý..."></textarea>
            <button class="btn-primary" type="submit">Tạo kế hoạch</button>
          </form>
        </div>
        <div class="card" style="padding:28px">
          <h3>Kế hoạch hiện có</h3>
          <div class="pill blue" style="margin-top:8px;margin-bottom:12px">${visiblePlans.length} kế hoạch</div>
          <div class="card" style="padding:16px;background:linear-gradient(90deg,rgba(220,38,38,.08),rgba(34,197,94,.08));margin-bottom:16px">
            <strong>Trợ lý lập kế hoạch</strong>
            <div class="muted" style="margin-top:6px">
              Hãy chọn 1 bài chính, 1 bài phụ, 1 bài core. Sau đó nhập set/reps/tạ để hệ thống sinh kế hoạch rõ ràng hơn.
            </div>
          </div>
          <div class="grid" style="margin-top:16px">
            ${visiblePlans.length ? visiblePlans.map(plan => `
              <div class="card" style="padding:16px;background:#f8fafc;border:1px solid rgba(148,163,184,.12)" data-plan-card>
                <strong>${escapeHtml(plan.name || 'Kế hoạch')}</strong>
                <div class="muted">ID: ${plan.id}</div>
                <div style="margin-top:10px">${renderPlanDetails(plan, exerciseLookup)}</div>
              </div>`).join('') : '<div class="muted">Chưa có kế hoạch nào.</div>'}
          </div>
          <h3 style="margin-top:24px">Bài tập sẵn có</h3>
          <div class="grid" style="margin-top:16px;max-height:300px;overflow:auto">
            ${exerciseSource.map(ex => `
              <div class="card" style="padding:14px;background:#f8fafc">
                <strong>${escapeHtml(ex.name || 'Exercise')}</strong>
                <div class="muted">${escapeHtml(ex.muscle_group || '')}</div>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </section>
  `)
}

async function renderCustomerWorkoutPlanFull() {
  const user = state.user || {}
  const [plans, exercises] = await Promise.all([
    user.id ? api(`/api/workout/plans/user/${user.id}`).catch(() => []) : Promise.resolve([]),
    api('/api/workout/exercises').catch(() => [])
  ])
  const exerciseSource = Array.isArray(exercises) && exercises.length ? exercises : fallbackExercises
  const visiblePlans = normalizePlans([
    ...((state.lastWorkoutPlan && Number(state.lastWorkoutPlan.user_id) === Number(user.id)) ? [state.lastWorkoutPlan] : []),
    ...(Array.isArray(plans) ? plans : [])
  ])
  const exerciseLookup = buildExerciseLookup(exerciseSource)
  const allDetailsCount = visiblePlans.reduce((sum, plan) => sum + ((Array.isArray(plan.details) ? plan.details.length : 0)), 0)
  const earliestDate = visiblePlans.reduce((min, plan) => {
    const d = plan.created_at ? new Date(plan.created_at) : null
    return d && (!min || d < min) ? d : min
  }, null)
  const yearGroups = groupPlansByYearMonth(visiblePlans)
  const yearSections = Object.entries(yearGroups).sort((a, b) => b[0].localeCompare(a[0]))
  const yearOverview = yearSections.map(([yearKey, months]) => {
    const monthEntries = Object.entries(months).sort((a, b) => b[0].localeCompare(a[0]))
    const plansCount = monthEntries.reduce((sum, [, monthPlans]) => sum + monthPlans.length, 0)
    const detailsCount = monthEntries.reduce((sum, [, monthPlans]) => sum + monthPlans.reduce((inner, plan) => inner + ((Array.isArray(plan.details) ? plan.details.length : 0)), 0), 0)
    return { yearKey, plansCount, detailsCount, monthEntries }
  })
  return shellLayout(`
    <section class="section" style="padding-top:24px">
      <div class="container">
        <div class="card plan-highlight" style="padding:28px">
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
            <div>
              <h1 style="margin:0">Toàn bộ kế hoạch tập luyện</h1>
              <p class="muted" style="margin-top:8px">Xem đầy đủ từng bài trong tất cả kế hoạch của bạn, theo năm và tháng.</p>
            </div>
            <div style="display:flex;gap:12px;flex-wrap:wrap">
              <button class="btn-ghost" data-nav="/customer/workout-plan">Quay lại form</button>
              <button class="btn-secondary" type="button" id="print-plan-btn">In kế hoạch</button>
              <button class="btn-ghost" type="button" id="export-plan-btn">Xuất text</button>
            </div>
          </div>
        </div>
        <div class="card" style="padding:20px;margin-top:20px">
          <div class="grid two-col">
            <input class="input" id="plan-search-input" placeholder="Tìm theo tên kế hoạch hoặc bài tập..." />
            <select class="select" id="plan-sort-select">
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name">Theo tên</option>
            </select>
          </div>
          <div class="grid three-col" style="margin-top:12px">
            <input class="input" id="plan-date-input" type="date" />
            <select class="select" id="plan-year-filter">
              <option value="">Tất cả năm</option>
            </select>
            <select class="select" id="plan-month-filter">
              <option value="">Tất cả tháng</option>
              <option value="01">Tháng 01</option>
              <option value="02">Tháng 02</option>
              <option value="03">Tháng 03</option>
              <option value="04">Tháng 04</option>
              <option value="05">Tháng 05</option>
              <option value="06">Tháng 06</option>
              <option value="07">Tháng 07</option>
              <option value="08">Tháng 08</option>
              <option value="09">Tháng 09</option>
              <option value="10">Tháng 10</option>
              <option value="11">Tháng 11</option>
              <option value="12">Tháng 12</option>
            </select>
          </div>
          <div class="grid two-col" style="margin-top:12px">
            <button class="btn-ghost" type="button" id="plan-clear-filter-btn">Xóa lọc</button>
            <div class="card" style="padding:14px;background:#f8fafc">
              <div class="muted">Mốc kế hoạch</div>
              <strong>${earliestDate ? escapeHtml(earliestDate.toISOString().slice(0, 10)) : 'Chưa có'}</strong>
            </div>
          </div>
          <div class="plan-chip-row" style="margin-top:14px">
            <span class="pill green">${visiblePlans.length} kế hoạch</span>
            <span class="pill blue">${allDetailsCount} bài tập</span>
            <span class="pill gold">Trang full</span>
          </div>
          <div class="grid three-col" style="margin-top:14px">
            ${yearOverview.slice(0, 3).map((y) => `
              <div class="card" style="padding:14px;background:#f8fafc">
                <div class="muted">Năm ${y.yearKey === 'unknown' ? 'không rõ' : y.yearKey}</div>
                <strong style="font-size:20px">${y.plansCount}</strong>
                <div class="muted">${y.detailsCount} bài tập</div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="grid" style="margin-top:24px">
          ${visiblePlans.length ? yearSections.map(([yearKey, months]) => `
            <div class="card" style="padding:22px">
              <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
                <div>
                  <h3 style="margin:0">Năm ${yearKey === 'unknown' ? 'không rõ' : yearKey}</h3>
                  <div class="muted" style="margin-top:4px">${Object.values(months).reduce((sum, monthPlans) => sum + monthPlans.length, 0)} kế hoạch</div>
                </div>
                <span class="pill gold">${Object.values(months).reduce((sum, monthPlans) => sum + monthPlans.reduce((inner, plan) => inner + ((Array.isArray(plan.details) ? plan.details.length : 0)), 0), 0)} bài tập</span>
              </div>
              <div class="grid" style="margin-top:16px">
                ${Object.entries(months).sort((a, b) => b[0].localeCompare(a[0])).map(([monthKey, monthPlans]) => `
                  <div class="card" style="padding:18px;background:#fbfdff;border:1px solid rgba(148,163,184,.12)">
                    <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
                      <div>
                        <h4 style="margin:0">Tháng ${monthKey === 'unknown' ? 'không rõ' : monthKey}</h4>
                        <div class="muted" style="margin-top:4px">${monthPlans.length} kế hoạch</div>
                      </div>
                      <span class="pill blue">${monthPlans.reduce((sum, plan) => sum + ((Array.isArray(plan.details) ? plan.details.length : 0)), 0)} bài tập</span>
                    </div>
                    <div class="grid" style="margin-top:16px">
                      ${monthPlans.map(plan => `
                        <div class="card plan-highlight" style="padding:22px" data-full-plan-item data-plan-date="${escapeAttr((plan.created_at || '').slice(0, 10))}" data-plan-year="${escapeAttr(yearKey)}" data-plan-month="${escapeAttr(monthKey)}">
                          <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
                            <div>
                              <h4 style="margin:0">${escapeHtml(plan.name || 'Kế hoạch')}</h4>
                              <div class="muted" style="margin-top:4px">ID: ${plan.id} • ${escapeHtml((plan.created_at || '').slice(0, 10))}</div>
                            </div>
                            <span class="pill green">${Array.isArray(plan.details) ? plan.details.length : 0} bài tập</span>
                          </div>
                          <div class="grid" style="margin-top:16px">
                            ${renderPlanDetails(plan, exerciseLookup)}
                          </div>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('') : '<div class="card" style="padding:22px"><div class="muted">Chưa có kế hoạch nào.</div></div>'}
        </div>
      </div>
    </section>
  `)
}

async function renderCustomerWorkoutHistory() {
  const user = state.user || {}
  const [history, exercises] = await Promise.all([
    user.id ? api(`/api/workout/history/user/${user.id}`).catch(() => []) : Promise.resolve([]),
    api('/api/workout/exercises').catch(() => [])
  ])
  const exerciseSource = Array.isArray(exercises) && exercises.length ? exercises : fallbackExercises
  return shellLayout(`
    <section class="section" style="padding-top:24px">
      <div class="container grid two-col">
        <div class="card" style="padding:28px">
          <h1>Lịch sử tập luyện</h1>
          <form id="workout-history-form" class="grid" style="margin-top:18px">
            <input class="input" name="exercise_id" type="number" placeholder="Exercise ID" required />
            <input class="input" name="sets" type="number" placeholder="Số set" required />
            <input class="input" name="reps" type="number" placeholder="Số reps" required />
            <input class="input" name="weight" type="number" step="0.1" placeholder="Tạ (kg)" />
            <button class="btn-primary" type="submit">Ghi nhận buổi tập</button>
          </form>
          <div class="card" style="margin-top:20px;padding:16px;background:#f8fafc">
            <strong>Bài tập gợi ý</strong>
            <div class="muted">Chọn từ danh sách exercise ở cột bên phải.</div>
          </div>
        </div>
        <div class="card" style="padding:28px">
          <h3>Lịch sử gần đây</h3>
          <div class="grid" style="margin-top:16px">
            ${(Array.isArray(history) ? history : []).map(item => `
              <div class="card" style="padding:14px;background:#f8fafc">
                <strong>Exercise #${item.exercise_id}</strong>
                <div class="muted">${item.sets} set x ${item.reps} reps${item.weight ? ` - ${item.weight}kg` : ''}</div>
              </div>`).join('') || '<div class="muted">Chưa có lịch sử.</div>'}
          </div>
          <h3 style="margin-top:24px">Exercises</h3>
          <div class="grid" style="margin-top:16px;max-height:300px;overflow:auto">
            ${exerciseSource.map(ex => `
              <div class="card" style="padding:14px;background:#f8fafc">
                <strong>#${ex.id} ${escapeHtml(ex.name || '')}</strong>
                <div class="muted">${escapeHtml(ex.description || '')}</div>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </section>
  `)
}

async function renderCustomerNotifications() {
  const user = state.user || {}
  const summary = user.id ? await api(`/api/intelligence/user/${user.id}/summary`).catch(() => null) : null
  const notifications = Array.isArray(summary?.notifications) ? summary.notifications : []
  const recommendations = Array.isArray(summary?.recommendations) ? summary.recommendations : []
  const nextWorkout = Array.isArray(summary?.workout?.next_workout) ? summary.workout.next_workout : []
  return shellLayout(`
    <section class="section" style="padding-top:24px">
      <div class="container">
        <div class="card plan-highlight" style="padding:28px;background:linear-gradient(135deg,rgba(220,38,38,.08),rgba(34,197,94,.10))">
          <div class="pill green">Smart Notification</div>
          <h1 style="margin-bottom:8px">Thông báo thông minh</h1>
          <p class="muted" style="margin:0">Các cảnh báo và gợi ý được tạo từ Intelligence Service theo dữ liệu thật của bạn.</p>
        </div>
        <div class="grid four-col" style="margin-top:24px">
          ${statCard(String(summary?.smart_score ?? 0), 'Điểm thông minh')}
          ${statCard(String(summary?.membership?.days_left ?? 0), 'Ngày còn gói')}
          ${statCard(String(summary?.workout?.plan_count ?? 0), 'Kế hoạch')}
          ${statCard(String(summary?.workout?.history_count ?? 0), 'Lịch sử tập')}
        </div>
        <div class="grid two-col" style="margin-top:24px">
          <div class="card" style="padding:24px">
            <h3>Cảnh báo ưu tiên</h3>
            <div class="grid" style="margin-top:16px">${renderNotificationCards(notifications, 'Không có cảnh báo mới.')}</div>
          </div>
          <div class="card" style="padding:24px">
            <h3>Đề xuất hành động</h3>
            <div class="grid" style="margin-top:16px">
              ${recommendations.map((item) => `
                <div class="card" style="padding:16px;background:#f8fafc">
                  <strong>${escapeHtml(item.title || 'Gợi ý')}</strong>
                  <div class="muted" style="margin-top:8px">${escapeHtml(item.message || '')}</div>
                  ${item.action_path ? `<button class="btn-ghost" data-nav="${escapeAttr(item.action_path)}" style="margin-top:12px">${escapeHtml(item.action_label || 'Thực hiện')}</button>` : ''}
                </div>
              `).join('') || '<div class="muted">Chưa có đề xuất.</div>'}
            </div>
          </div>
        </div>
        <div class="card" style="padding:24px;margin-top:24px">
          <h3>Bài tập nên thực hiện tiếp theo</h3>
          <div class="grid three-col" style="margin-top:16px">
            ${nextWorkout.map((item) => `
              <div class="card" style="padding:16px;background:#f8fafc">
                <span class="pill blue">${escapeHtml(item.muscle_group || 'smart')}</span>
                <strong style="display:block;margin-top:10px">${escapeHtml(item.exercise_name || `Exercise #${item.exercise_id || ''}`)}</strong>
                <div class="muted" style="margin-top:8px">${escapeHtml([item.sets ? `${item.sets} set` : null, item.reps ? `${item.reps} reps` : null, item.weight ? `${item.weight}kg` : null].filter(Boolean).join(' • ') || item.description || 'Đề xuất từ hệ thống')}</div>
              </div>
            `).join('') || '<div class="muted">Chưa đủ dữ liệu để đề xuất bài tập.</div>'}
          </div>
        </div>
      </div>
    </section>
  `)
}

async function renderCustomerChatbot() {
  const user = state.user || {}
  const [subscriptions, plans, packages] = await Promise.all([
    user.id ? api(`/api/membership/subscriptions/user/${user.id}`).catch(() => []) : Promise.resolve([]),
    user.id ? api(`/api/workout/plans/user/${user.id}`).catch(() => []) : Promise.resolve([]),
    loadPackages()
  ])
  const intelligence = user.id ? await api(`/api/intelligence/user/${user.id}/summary`).catch(() => null) : null
  const activeSub = Array.isArray(subscriptions)
    ? [...subscriptions].sort((a, b) => Number(b.id || 0) - Number(a.id || 0)).find((item) => String(item.status || '').toLowerCase() === 'active')
    : null
  const activePackage = activeSub ? packages.find((p) => Number(p.id) === Number(activeSub.package_id)) : null
  const latestPlan = normalizePlans([
    ...(Array.isArray(plans) ? plans : []),
    ...((state.lastWorkoutPlan && Number(state.lastWorkoutPlan.user_id) === Number(user.id)) ? [state.lastWorkoutPlan] : [])
  ])[0] || null
  const today = new Date()
  const endDate = activeSub?.end_date ? new Date(`${activeSub.end_date}T23:59:59`) : null
  const daysLeft = endDate ? Math.max(0, Math.ceil((endDate - today) / 86400000)) : null
  const chatContext = {
    packageName: activePackage?.name || '',
    planName: latestPlan?.name || '',
    daysLeft,
    activePlanCount: Array.isArray(plans) ? plans.length : 0,
    smartScore: intelligence?.smart_score,
    priorityNotice: Array.isArray(intelligence?.notifications) && intelligence.notifications[0]
      ? intelligence.notifications[0].message
      : ''
  }
  state.customerChatContext = chatContext
  state.customerChatKey = chatStorageKey('customer', user.id)
  state.customerChatHistory = loadChatHistory(state.customerChatKey)
  return shellLayout(`
    <section class="section" style="padding-top:24px">
      <div class="container">
        <div class="card" style="padding:28px">
          <h1>AI Hỗ trợ</h1>
          <p class="muted">Hỏi về tập luyện, gói tập, thiết bị hoặc tư vấn cơ bản.</p>
          <div class="plan-chip-row" style="margin-top:14px">${chatContextPills(chatContext)}</div>
          <div class="card plan-highlight" style="margin-top:16px;padding:16px">
            <strong>Hỗ trợ thông minh</strong>
            <div class="muted" style="margin-top:6px">
              ${activePackage ? `Bạn đang ở gói ${escapeHtml(activePackage.name)}.` : 'Bạn chưa có gói active.'}
              ${latestPlan ? ` Kế hoạch gần nhất là ${escapeHtml(latestPlan.name || '')}.` : ' Chưa có kế hoạch tập nào.'}
            </div>
          </div>
          <div id="chat-thread" class="grid" style="margin-top:18px;max-height:520px;overflow:auto;padding-right:4px"></div>
          <form id="chat-form" class="grid" style="margin-top:18px">
            <textarea class="textarea" name="message" rows="4" placeholder="Nhập câu hỏi của bạn..." required></textarea>
            <div style="display:flex;gap:12px;flex-wrap:wrap">
              <button class="btn-primary" type="submit">Gửi câu hỏi</button>
              <button class="btn-ghost" type="button" id="clear-chat-btn">Xóa cuộc trò chuyện</button>
            </div>
          </form>
          <div class="grid" style="margin-top:18px">
            <button class="btn-secondary" type="button" data-chat-quick="Hôm nay nên tập gì theo gói hiện tại?">Hôm nay nên tập gì?</button>
            <button class="btn-ghost" type="button" data-chat-quick="Hãy đề xuất kế hoạch cho tôi dựa trên gói tập hiện tại và bài tập sẵn có.">Đề xuất kế hoạch thông minh</button>
            <button class="btn-ghost" type="button" data-chat-quick="Gói của tôi còn bao nhiêu ngày và có nên gia hạn không?">Gia hạn gói?</button>
          </div>
        </div>
      </div>
    </section>
  `)
}

function customerChatGreeting() {
  return [
    { role: 'assistant', text: 'Chào bạn, tôi có thể tư vấn kế hoạch tập, gói tập hoặc lịch tập cho hôm nay. Hãy hỏi ngắn gọn và tôi sẽ trả lời theo từng bước.' }
  ]
}

function adminChatGreeting() {
  return [
    { role: 'assistant', text: 'Chế độ quản trị. Hãy hỏi về gói tập, hội viên, đăng ký hoặc tình trạng hệ thống.' }
  ]
}

async function renderAdminUsers() {
  const [users] = await Promise.all([api('/api/users/').catch(() => [])])
  return shellLayout(`
    <section class="section" style="padding-top:24px">
      <div class="container grid two-col">
        <div class="card" style="padding:28px">
          <h1>Quản lý hội viên</h1>
          <form id="admin-user-form" class="grid" style="margin-top:18px">
            <input class="input" name="username" placeholder="username" required />
            <input class="input" name="password" type="password" placeholder="password" minlength="6" />
            <input class="input" name="name" placeholder="name" />
            <input class="input" name="phone" placeholder="phone" />
            <button class="btn-primary" type="submit">Tạo user</button>
          </form>
        </div>
        <div class="card" style="padding:28px">
          <h3>Danh sách user</h3>
          <div class="grid" style="margin-top:16px;max-height:520px;overflow:auto">
            ${(Array.isArray(users) ? users : []).map(u => `
              <div class="card" style="padding:14px;background:#f8fafc">
                <strong>#${u.id} ${escapeHtml(u.username)}</strong>
                <div class="muted">${escapeHtml(u.name || '')} - ${escapeHtml(u.phone || u.phonenumber || '')} - ${escapeHtml(u.role || '')}</div>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </section>
  `, { title: 'Hội viên' })
}

async function renderAdminRFID() {
  const [users] = await Promise.all([api('/api/users/').catch(() => [])])
  return shellLayout(`
    <section class="section" style="padding-top:24px">
      <div class="container">
        <div class="card" style="padding:28px">
          <h1>RFID</h1>
          <p class="muted">Màn này hiện gắn với user_service access-check. Có thể mở rộng gán card UID khi API POST RFID được map.</p>
          <div class="grid two-col" style="margin-top:18px">
            ${(Array.isArray(users) ? users.slice(0, 6) : []).map(u => `
              <div class="card" style="padding:14px;background:#f8fafc">
                <strong>${escapeHtml(u.username)}</strong>
                <div class="muted">User ID: ${u.id}</div>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </section>
  `, { title: 'RFID' })
}

async function renderAdminPackages() {
  const packages = await api('/api/membership/packages/').catch(() => [])
  return shellLayout(`
    <section class="section" style="padding-top:24px">
      <div class="container grid two-col">
        <div class="card" style="padding:28px">
          <h1>Gói tập</h1>
          <form id="admin-package-form" class="grid" style="margin-top:18px">
            <input class="input" name="name" placeholder="Tên gói" required />
            <input class="input" name="price" type="number" placeholder="Giá" required />
            <input class="input" name="duration_days" type="number" placeholder="Số ngày" required />
            <textarea class="textarea" name="package_desc" rows="4" placeholder="Mô tả"></textarea>
            <button class="btn-primary" type="submit">Tạo gói</button>
          </form>
        </div>
        <div class="card" style="padding:28px">
          <h3>Danh sách gói</h3>
          <div class="grid" style="margin-top:16px;max-height:520px;overflow:auto">
            ${(Array.isArray(packages) ? packages : []).map(p => `
              <div class="card" style="padding:14px;background:#f8fafc">
                <strong>${escapeHtml(p.name)}</strong>
                <div class="muted">${Number(p.price).toLocaleString()}đ / ${p.duration_days} ngày</div>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </section>
  `, { title: 'Gói tập' })
}

async function renderAdminSubscriptions() {
  const subs = await api('/api/membership/subscriptions/').catch(() => [])
  const sortedSubs = normalizePlans(subs)
  const latestPerUser = new Map()
  for (const sub of sortedSubs) {
    if (!latestPerUser.has(Number(sub.user_id))) latestPerUser.set(Number(sub.user_id), sub)
  }
  const activeSubs = sortedSubs.filter((s) => String(s.status || '').toLowerCase() === 'active')
  const groupedByUser = Array.from(new Set(sortedSubs.map((s) => Number(s.user_id)))).sort((a, b) => b - a).map((userId) => {
    const userSubs = sortedSubs.filter((s) => Number(s.user_id) === userId)
    const active = userSubs.find((s) => String(s.status || '').toLowerCase() === 'active') || null
    const expired = userSubs.filter((s) => String(s.status || '').toLowerCase() !== 'active')
    return { userId, active, expired, count: userSubs.length }
  })
  return shellLayout(`
    <section class="section" style="padding-top:24px">
      <div class="container">
        <div class="card" style="padding:28px">
          <h1>Đăng ký gói</h1>
          <div class="plan-chip-row" style="margin-top:12px">
            <span class="pill green">Active: ${activeSubs.length}</span>
            <span class="pill blue">Tổng: ${sortedSubs.length}</span>
            <span class="pill gold">Người dùng: ${latestPerUser.size}</span>
          </div>
          <div class="grid" style="margin-top:16px">
            ${groupedByUser.map((group) => `
              <div class="card ${group.active ? 'plan-highlight' : ''}" style="padding:18px;background:#f8fafc">
                <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
                  <div>
                    <strong>User #${group.userId}</strong>
                    <div class="muted" style="margin-top:4px">${group.count} subscription</div>
                  </div>
                  ${group.active ? `<span class="pill green">Active hiện tại</span>` : `<span class="pill blue">Chưa có active</span>`}
                </div>
                ${group.active ? `
                  <div class="card" style="margin-top:14px;padding:14px;background:#ffffff;border:1px solid rgba(148,163,184,.12)">
                    <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
                      <strong>Gói hiện tại</strong>
                      <span class="pill green">active</span>
                    </div>
                    <div class="muted" style="margin-top:6px">Package #${group.active.package_id}</div>
                    <div class="muted">Từ ${escapeHtml(group.active.start_date || '')} đến ${escapeHtml(group.active.end_date || '')}</div>
                  </div>
                ` : ''}
                ${group.expired.length ? `
                  <div style="margin-top:14px">
                    <strong>Gói cũ</strong>
                    <div class="grid" style="margin-top:10px">
                      ${group.expired.map((s) => `
                        <div class="card" style="padding:12px;background:#fff;border:1px solid rgba(148,163,184,.12)">
                          <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
                            <span>Package #${s.package_id}</span>
                            <span class="pill blue">${escapeHtml(s.status || '')}</span>
                          </div>
                          <div class="muted" style="margin-top:6px">Từ ${escapeHtml(s.start_date || '')} đến ${escapeHtml(s.end_date || '')}</div>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>`).join('') || '<div class="muted">Chưa có đăng ký nào.</div>'}
          </div>
          <div class="card" style="margin-top:18px;padding:16px;background:#f8fafc">
            <strong>Quy tắc hệ thống</strong>
            <div class="muted" style="margin-top:6px">Mỗi user chỉ giữ 1 subscription active mới nhất. Các gói cũ sẽ tự chuyển sang expired khi có gói mới.</div>
          </div>
        </div>
      </div>
    </section>
  `, { title: 'Đăng ký' })
}

async function renderAdminExercises() {
  const exercises = await api('/api/workout/exercises').catch(() => [])
  return shellLayout(`
    <section class="section" style="padding-top:24px">
      <div class="container grid two-col">
        <div class="card" style="padding:28px">
          <h1>Bài tập</h1>
          <form id="admin-exercise-form" class="grid" style="margin-top:18px">
            <input class="input" name="name" placeholder="Tên bài tập" required />
            <input class="input" name="muscle_group" placeholder="Nhóm cơ" />
            <textarea class="textarea" name="description" rows="4" placeholder="Mô tả"></textarea>
            <button class="btn-primary" type="submit">Tạo bài tập</button>
          </form>
        </div>
        <div class="card" style="padding:28px">
          <h3>Danh sách bài tập</h3>
          <div class="grid" style="margin-top:16px;max-height:520px;overflow:auto">
            ${(Array.isArray(exercises) ? exercises : []).map(ex => `
              <div class="card" style="padding:14px;background:#f8fafc">
                <strong>#${ex.id} ${escapeHtml(ex.name)}</strong>
                <div class="muted">${escapeHtml(ex.muscle_group || '')}</div>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </section>
  `, { title: 'Bài tập' })
}

async function renderAdminWorkoutPlans() {
  const query = new URLSearchParams(location.search)
  const selectedUserId = query.get('user_id') || state.user?.id || ''
  const plans = selectedUserId ? await api('/api/workout/plans/user/' + selectedUserId).catch(() => []) : []
  return shellLayout(`
    <section class="section" style="padding-top:24px">
      <div class="container">
        <div class="card" style="padding:28px">
          <h1>Kế hoạch tập</h1>
          <form class="grid two-col" style="margin-top:16px" id="admin-plan-filter-form">
            <input class="input" name="user_id" type="number" placeholder="Nhập user_id để xem kế hoạch" value="${escapeAttr(selectedUserId)}" />
            <button class="btn-secondary" type="submit">Xem kế hoạch</button>
          </form>
          <div class="card plan-highlight" style="margin-top:16px;padding:14px">
            <strong>Chế độ quản trị</strong>
            <div class="muted" style="margin-top:6px">Nhập "user_id" để xem toàn bộ kế hoạch của hội viên tương ứng.</div>
          </div>
          <div class="grid" style="margin-top:16px">
            ${(Array.isArray(plans) ? plans : []).map(plan => `
              <div class="card" style="padding:14px;background:#f8fafc">
                <strong>${escapeHtml(plan.name || 'Plan')}</strong>
                <div class="muted">ID: ${plan.id}</div>
                <div class="muted">${escapeHtml((plan.created_at || '').slice(0, 10))}</div>
              </div>`).join('') || '<div class="muted">Chưa có dữ liệu.</div>'}
          </div>
        </div>
      </div>
    </section>`, { title: 'Kế hoạch' })
}
async function renderAdminWorkoutHistory() {
  const query = new URLSearchParams(location.search)
  const selectedUserId = query.get('user_id') || state.user?.id || ''
  const history = selectedUserId ? await api('/api/workout/history/user/' + selectedUserId).catch(() => []) : []
  return shellLayout(`
    <section class="section" style="padding-top:24px">
      <div class="container">
        <div class="card" style="padding:28px">
          <h1>Lịch sử tập</h1>
          <form class="grid two-col" style="margin-top:16px" id="admin-history-filter-form">
            <input class="input" name="user_id" type="number" placeholder="Nhập user_id để xem lịch sử" value="${escapeAttr(selectedUserId)}" />
            <button class="btn-secondary" type="submit">Xem lịch sử</button>
          </form>
          <div class="card plan-highlight" style="margin-top:16px;padding:14px">
            <strong>Chế độ quản trị</strong>
            <div class="muted" style="margin-top:6px">Nhập "user_id" để xem lịch sử tập của hội viên tương ứng.</div>
          </div>
          <div class="grid" style="margin-top:16px">
            ${(Array.isArray(history) ? history : []).map(item => `
              <div class="card" style="padding:14px;background:#f8fafc">
                <strong>Exercise #${item.exercise_id}</strong>
                <div class="muted">${item.sets} x ${item.reps}${item.weight ? ` - ${item.weight}kg` : ''}</div>
              </div>`).join('') || '<div class="muted">Chưa có dữ liệu.</div>'}
          </div>
        </div>
      </div>
    </section>`, { title: 'Lịch sử' })
}

async function renderAdminEquipment() {
  const equipment = await api('/api/facility/equipment').catch(() => [])
  return shellLayout(`
    <section class="section" style="padding-top:24px">
      <div class="container grid two-col">
        <div class="card" style="padding:28px">
          <h1>Thiết bị</h1>
          <form id="admin-equipment-form" class="grid" style="margin-top:18px">
            <input class="input" name="name" placeholder="Tên thiết bị" required />
            <input class="input" name="category" placeholder="Danh mục" />
            <input class="input" name="status" placeholder="Trạng thái" value="operational" />
            <button class="btn-primary" type="submit">Thêm thiết bị</button>
          </form>
        </div>
        <div class="card" style="padding:28px">
          <h3>Danh sách thiết bị</h3>
          <div class="grid" style="margin-top:16px;max-height:520px;overflow:auto">
            ${(Array.isArray(equipment) ? equipment : []).map(eq => `
              <div class="card" style="padding:14px;background:#f8fafc">
                <strong>${escapeHtml(eq.name)}</strong>
                <div class="muted">${escapeHtml(eq.category || '')} - ${escapeHtml(eq.status || '')}</div>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </section>
  `, { title: 'Thiết bị' })
}

async function renderAdminMaintenance() {
  return shellLayout(`
    <section class="section" style="padding-top:24px">
      <div class="container">
        <div class="card" style="padding:28px">
          <h1>Bảo trì</h1>
          <form id="maintenance-form" class="grid two-col" style="margin-top:18px">
            <input class="input" name="equipment_id" type="number" placeholder="Equipment ID" required />
            <input class="input" name="performed_by" placeholder="Người thực hiện" required />
            <input class="input" name="cost" type="number" placeholder="Chi phí" value="0" />
            <textarea class="textarea" name="description" rows="4" placeholder="Mô tả bảo trì" required></textarea>
            <div style="grid-column:1/-1"><button class="btn-primary" type="submit">Ghi nhận bảo trì</button></div>
          </form>
        </div>
      </div>
    </section>
  `, { title: 'Bảo trì' })
}

async function renderAdminAreas() {
  const areas = await api('/api/facility/areas').catch(() => [])
  return shellLayout(`
    <section class="section" style="padding-top:24px">
      <div class="container">
        <div class="card" style="padding:28px">
          <h1>Khu vực</h1>
          <div class="grid three-col" style="margin-top:16px">
            ${(Array.isArray(areas) ? areas : []).map(a => `
              <div class="card" style="padding:14px;background:#f8fafc">
                <strong>${escapeHtml(a.name || a.area_name || 'Area')}</strong>
                <div class="muted">${escapeHtml(a.description || '')}</div>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </section>
  `, { title: 'Khu vực' })
}

async function renderAdminChatbot() {
  state.adminChatKey = chatStorageKey('admin', state.user?.id)
  state.adminChatHistory = loadChatHistory(state.adminChatKey)
  return shellLayout(`
    <section class="section" style="padding-top:24px">
      <div class="container">
        <div class="card" style="padding:28px">
          <h1>AI Chatbot Admin</h1>
          <div class="plan-chip-row" style="margin-top:12px">
            <span class="pill red">Quản trị</span>
            <span class="pill green">Hội viên</span>
            <span class="pill blue">Gói tập</span>
            <span class="pill gold">Dữ liệu hệ thống</span>
          </div>
          <div class="card plan-highlight" style="margin-top:16px;padding:16px">
            <strong>Quản trị</strong>
            <div class="muted" style="margin-top:6px">Dùng để hỏi về subscription, kế hoạch tập, trạng thái gói, user và các service liên quan.</div>
          </div>
          <div id="admin-chat-thread" class="grid" style="margin-top:18px;max-height:360px;overflow:auto;padding-right:4px"></div>
          <form id="admin-chat-form" class="grid" style="margin-top:18px">
            <textarea class="textarea" name="message" rows="4" placeholder="Nhập câu hỏi quản trị..." required></textarea>
            <button class="btn-primary" type="submit">Gửi</button>
          </form>
          <div id="admin-chat-answer" class="card" style="margin-top:20px;padding:18px;background:#f8fafc">Chưa có câu hỏi nào.</div>
          <div class="grid" style="margin-top:18px">
            <button class="btn-secondary" type="button" data-admin-chat-quick="Cho tôi biết các gói active và subscription gần nhất của user 7.">Kiểm tra gói active</button>
            <button class="btn-ghost" type="button" data-admin-chat-quick="Danh sách bài tập hiện có và gợi ý workflow tạo plan mới là gì?">Xem gợi ý plan</button>
          </div>
        </div>
      </div>
    </section>
  `, { title: 'AI Chatbot' })
}

async function renderPackagesPage(customerMode) {
  const user = state.user
  const packages = await loadPackages()
  const query = new URLSearchParams(location.search)
  const selectedPackageId = query.get('package')
  const orderId = query.get('order')
  const selectedPackage = selectedPackageId
    ? packages.find((p) => String(p.id) === String(selectedPackageId))
    : null
  let paymentInfo = null
  if (customerMode && orderId) {
    const pending = (() => {
      try {
        const raw = sessionStorage.getItem('pending_payment_payload')
        return raw ? JSON.parse(raw) : null
      } catch {
        return null
      }
    })()
    const orderData = await api(`/api/payment/order/${encodeURIComponent(orderId)}`).catch(() => null)
    paymentInfo = state.pendingPayment || pending || orderData || null
    if (!paymentInfo.order_id) paymentInfo.order_id = orderId
  }
  const content = `
    <section class="section" style="padding-top:24px">
      <div class="container">
        <div class="card" style="padding:28px;background:linear-gradient(90deg,rgba(220,38,38,.1),rgba(34,197,94,.1));color:#0f172a;margin-bottom:24px">
          <h1 style="margin-top:0">${customerMode ? 'Đăng ký gói tập' : 'Chọn gói tập phù hợp'}</h1>
          <p style="color:#475569">Chọn gói phù hợp với nhu cầu và ngân sách của bạn</p>
        </div>
        ${selectedPackage ? `
          <div class="card" style="padding:24px;margin-bottom:24px;border:1px solid rgba(225,29,72,.12);background:linear-gradient(180deg,#ffffff,#f8fafc)">
            <div style="display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap">
              <div>
                <div class="pill green" style="margin-bottom:12px">Gói đã chọn</div>
                <h2 style="margin:0 0 8px">${escapeHtml(selectedPackage.name)}</h2>
                <p class="muted" style="margin:0 0 14px">${escapeHtml(selectedPackage.package_desc || selectedPackage.description || '')}</p>
                <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">
                  <span class="pill red">AI hỗ trợ</span>
                  <span class="pill green">Check-in RFID</span>
                  <span class="pill blue">${Number(selectedPackage.duration_days || 0)} ngày</span>
                </div>
              </div>
              <div style="text-align:right;min-width:220px">
                <div style="font-size:14px;color:#64748b;margin-bottom:4px">Tổng thanh toán</div>
                <div style="font-size:34px;font-weight:800;color:#e11d48">${Number(selectedPackage.price || 0).toLocaleString()}đ</div>
                <div class="muted">/ ${Number(selectedPackage.duration_days || 0)} ngày</div>
              </div>
            </div>
            ${customerMode ? `
              <div class="card" style="margin-top:18px;padding:18px;background:#ffffff;border:1px solid rgba(148,163,184,.16)">
                <h3 style="margin-top:0">Xác nhận đăng ký và thanh toán</h3>
                <p class="muted" style="margin-top:0">Bạn đang chuẩn bị đăng ký gói <strong>${escapeHtml(selectedPackage.name)}</strong>. Bấm nút bên dưới để tạo đăng ký và mở thanh toán.</p>
                <button
                  class="btn-primary"
                  style="width:100%"
                  data-subscribe-package-id="${selectedPackage.id}"
                >
                  Xác nhận đăng ký & thanh toán
                </button>
              </div>
            ` : ''}
          </div>
        ` : ''}
        ${customerMode && paymentInfo ? `
          <div class="card" style="padding:24px;margin-bottom:24px;border:1px solid rgba(34,197,94,.18);background:#fff">
            <div class="pill green" style="margin-bottom:12px">Thanh toán sẵn sàng</div>
            <h2 style="margin:0 0 10px">Mã QR thanh toán</h2>
            <p class="muted" style="margin-top:0">Quét mã QR hoặc dùng thông tin bên dưới để hoàn tất thanh toán.</p>
            <div class="grid two-col" style="align-items:center">
              <div class="card" style="padding:16px;background:#f8fafc">
                <div class="muted">Mã đơn</div>
                <div style="font-weight:800;margin-top:4px">${escapeHtml(paymentInfo.order_id || orderId || '')}</div>
                <div class="muted" style="margin-top:12px">Số tiền</div>
                <div style="font-size:28px;font-weight:800;color:#e11d48">${Number(paymentInfo.amount || selectedPackage?.price || 0).toLocaleString()}đ</div>
                ${paymentInfo.bank_info ? `<div class="muted" style="margin-top:12px">${escapeHtml(typeof paymentInfo.bank_info === 'string' ? paymentInfo.bank_info : JSON.stringify(paymentInfo.bank_info))}</div>` : ''}
              </div>
              <div class="card" style="padding:18px;background:#ffffff;display:grid;place-items:center;min-height:280px">
                ${paymentInfo.qr_code_image || paymentInfo.qr_code ? `<img src="${escapeAttr(paymentInfo.qr_code_image || paymentInfo.qr_code)}" alt="QR thanh toán" style="max-width:260px;width:100%;height:auto" />` : (paymentInfo.payment_url ? `<a class="btn-primary" href="${escapeAttr(paymentInfo.payment_url)}" target="_blank" rel="noreferrer">Mở link thanh toán</a>` : `<div class="muted">Không tạo được QR tự động.</div>`)}
              </div>
            </div>
            <div style="margin-top:18px;display:flex;gap:12px;flex-wrap:wrap">
              <button class="btn-secondary" id="confirm-paid-btn" type="button">Xác nhận đã thanh toán</button>
              <button class="btn-ghost" id="back-customer-btn" type="button">Quay lại giao diện</button>
            </div>
          </div>
        ` : ''}
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
  const accent = pkg.popular
    ? 'linear-gradient(135deg, rgba(225,29,72,.10), rgba(34,197,94,.12))'
    : 'linear-gradient(135deg, rgba(59,130,246,.10), rgba(34,197,94,.10))'
  const glow = pkg.popular
    ? '0 18px 36px rgba(225,29,72,.10)'
    : '0 18px 36px rgba(34,197,94,.10)'
  const badgeClass = pkg.popular ? 'green' : 'blue'
  return `
    <div class="card" style="padding:24px;background:${accent};box-shadow:${glow};border:1px solid rgba(148,163,184,.16);transform:translateY(0);transition:transform .2s ease, box-shadow .2s ease">
      <div class="pill ${badgeClass}">${pkg.popular ? 'Phổ biến' : 'Gói tập'}</div>
      <h3 style="margin-bottom:10px;font-size:22px">${escapeHtml(pkg.name || 'Package')}</h3>
      <p class="muted" style="min-height:52px">${escapeHtml(pkg.package_desc || pkg.description || 'Phù hợp nhu cầu của bạn')}</p>
      <div style="margin:18px 0 8px;display:flex;align-items:end;gap:8px">
        <div style="font-size:34px;font-weight:800;color:#e11d48">${price.toLocaleString()}đ</div>
        <div class="muted" style="padding-bottom:6px">/ ${pkg.duration_days || 0} ngày</div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin:16px 0 20px">
        <span class="pill red">AI hỗ trợ</span>
        <span class="pill green">Check-in RFID</span>
      </div>
      <button class="btn-primary" data-package-id="${pkg.id}" data-package-name="${escapeAttr(pkg.name || '')}" data-package-action="${customerMode ? 'select' : 'view'}" ${loggedIn ? '' : 'data-nav="/register"'} style="width:100%">
        ${loggedIn || customerMode ? 'Chọn gói này' : 'Đăng ký / tạo tài khoản'}
      </button>
    </div>
  `
}

async function renderAdminDashboard() {
  const overview = await api('/api/intelligence/admin/overview').catch(() => null)
  return shellLayout(`
    <div class="grid two-col">
      <div class="card" style="padding:28px">
        <h1>Tổng quan</h1>
        <p class="muted">Smart Gym hoạt động theo kiến trúc tách service, giao diện tĩnh và session JWT.</p>
        <div class="grid three-col" style="margin-top:20px">
          ${miniStat('Users', 'Quản lý hội viên')}
          ${miniStat('Gym AI', 'Chatbot hỗ trợ')}
          ${miniStat('RFID', 'Check-in thông minh')}
        </div>
      </div>
      <div class="card" style="padding:28px">
        <h3>Tác vụ nhanh</h3>
        <div class="grid two-col" style="margin-top:16px">
          <button class="btn-primary" data-nav="/admin/users">Hội viên</button>
          <button class="btn-secondary" data-nav="/admin/subscriptions">Đăng ký</button>
          <button class="btn-ghost" data-nav="/admin/packages">Gói tập</button>
          <button class="btn-ghost" data-nav="/admin/exercises">Bài tập</button>
          <button class="btn-ghost" data-nav="/admin/equipment">Thiết bị</button>
          <button class="btn-ghost" data-nav="/admin/maintenance">Bảo trì</button>
          <button class="btn-ghost" data-nav="/admin/areas">Khu vực</button>
          <button class="btn-ghost" data-nav="/admin/workout-plans">Kế hoạch</button>
          <button class="btn-ghost" data-nav="/admin/intelligence">Phân tích</button>
          <button class="btn-ghost" data-nav="/admin/workout-history">Lịch sử</button>
          <button class="btn-ghost" data-nav="/admin/chatbot">AI Chatbot</button>
        </div>
        <div class="card plan-highlight" style="margin-top:18px;padding:16px">
          <strong>Hướng dẫn quản trị nhanh</strong>
          <div class="muted" style="margin-top:6px">Vào Kế hoạch hoặc Lịch sử rồi nhập "user_id" để tra cứu hội viên cụ thể.</div>
        </div>
      </div>
    </div>
    ${renderAdminOverviewPanel(overview)}
    `, { title: 'Tổng quan quản trị' })
}

async function renderAdminIntelligence() {
  const overview = await api('/api/intelligence/admin/overview').catch(() => null)
  return shellLayout(`
    <div class="card" style="padding:28px">
      <div class="pill green">Smart Business</div>
      <h1 style="margin-bottom:8px">Phân tích nghiệp vụ</h1>
      <p class="muted" style="margin:0">Service này đọc dữ liệu từ hội viên, đăng ký gói và kế hoạch tập để tạo insight cho admin.</p>
    </div>
    ${renderAdminOverviewPanel(overview, true)}
  `, { title: 'Phân tích thông minh' })
}

function miniStat(title, desc) {
  return `<div class="card" style="padding:16px;background:#f8fafc"><strong>${title}</strong><div class="muted">${desc}</div></div>`
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
      const payload = Object.fromEntries(new FormData(profileForm).entries())
      Object.keys(payload).forEach((key) => {
        if (payload[key] === '') delete payload[key]
      })
      await api(`/api/users/${state.user?.id}`, { method: 'PUT', body: JSON.stringify(payload) })
      state.user = normalizeUser({ ...state.user, ...payload })
      localStorage.setItem('gym_user', JSON.stringify(state.user))
      showToast('Đã lưu hồ sơ.', 'success')
      render()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }
  const workoutPlanForm = document.getElementById('workout-plan-form')
  const addPlanRowBtn = document.getElementById('add-plan-row-btn')
  const smartPlanFillBtn = document.getElementById('smart-plan-fill-btn')
  const planRowsContainer = document.getElementById('workout-plan-rows')
  if (addPlanRowBtn && planRowsContainer) {
    addPlanRowBtn.onclick = () => {
      const rows = planRowsContainer.querySelectorAll('.plan-row').length
      const exerciseSource = state.exerciseSourceForPlan || fallbackExercises
      const exerciseOptions = exerciseSource.map((ex) => `<option value="${escapeAttr(ex.id)}">${escapeHtml(ex.name || `Exercise #${ex.id}`)}</option>`).join('')
      const wrapper = document.createElement('div')
      wrapper.innerHTML = renderPlanRowTemplate(exerciseOptions, rows + 1)
      planRowsContainer.appendChild(wrapper.firstElementChild)
    }
  }
  if (smartPlanFillBtn && planRowsContainer) {
    smartPlanFillBtn.onclick = () => {
      const exerciseSource = state.exerciseSourceForPlan || fallbackExercises
      const latestPackage = (state.packages || []).find((p) => /vip|premium/i.test(String(p.name || ''))) || null
      const suggestions = smartPlanTemplates(exerciseSource, latestPackage)
      const rows = Array.from(planRowsContainer.querySelectorAll('.plan-row'))
      if (rows.length < Math.max(3, suggestions.length)) {
        while (rows.length < Math.max(3, suggestions.length)) {
          addPlanRowBtn?.click()
          rows.push(planRowsContainer.querySelector('.plan-row:last-child'))
        }
      }
      Array.from(planRowsContainer.querySelectorAll('.plan-row')).forEach((row, index) => {
        const ex = suggestions[index]
        if (!ex) return
        const selects = row.querySelectorAll('select')
        const inputs = row.querySelectorAll('input')
        if (selects[0]) selects[0].value = String(ex.id)
        if (inputs[0] && !inputs[0].value) inputs[0].value = new Date().toISOString().slice(0, 10)
        if (inputs[1] && !inputs[1].value) inputs[1].value = index === 0 ? 4 : 3
        if (inputs[2] && !inputs[2].value) inputs[2].value = index === 0 ? 12 : 10
        if (inputs[3] && !inputs[3].value) inputs[3].value = index === 0 ? 20 : 15
      })
    }
  }
  if (planRowsContainer) {
    planRowsContainer.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('[data-remove-plan-row]')
      if (!removeBtn) return
      const rows = planRowsContainer.querySelectorAll('.plan-row')
      if (rows.length <= 1) return
      removeBtn.closest('.plan-row')?.remove()
    })
  }
  document.querySelectorAll('[data-open-full-plan]').forEach((btn) => {
    btn.onclick = () => navigate('/customer/workout-plan/full')
  })
  const planSearchInput = document.getElementById('plan-search-input')
  const planSortSelect = document.getElementById('plan-sort-select')
  const planDateInput = document.getElementById('plan-date-input')
  const planYearFilter = document.getElementById('plan-year-filter')
  const planMonthFilter = document.getElementById('plan-month-filter')
  const planClearFilterBtn = document.getElementById('plan-clear-filter-btn')
  const fullPlanItems = Array.from(document.querySelectorAll('[data-full-plan-item]'))
  if (planYearFilter) {
    const years = Array.from(new Set(fullPlanItems.map((item) => item.getAttribute('data-plan-year') || '').filter(Boolean))).sort((a, b) => b.localeCompare(a))
    years.forEach((year) => {
      const opt = document.createElement('option')
      opt.value = year
      opt.textContent = `Năm ${year === 'unknown' ? 'không rõ' : year}`
      planYearFilter.appendChild(opt)
    })
  }
  const applyPlanFilters = () => {
    const query = String(planSearchInput?.value || '').toLowerCase().trim()
    const sortMode = planSortSelect?.value || 'newest'
    const dateFilter = String(planDateInput?.value || '').trim()
    const yearFilter = String(planYearFilter?.value || '').trim()
    const monthFilter = String(planMonthFilter?.value || '').trim()
    const items = fullPlanItems
    items.forEach((item) => {
      const text = item.textContent.toLowerCase()
      const planDate = item.getAttribute('data-plan-date') || ''
      const planYear = item.getAttribute('data-plan-year') || ''
      const planMonth = item.getAttribute('data-plan-month') || ''
      const matchQuery = !query || text.includes(query)
      const matchDate = !dateFilter || planDate === dateFilter
      const matchYear = !yearFilter || planYear === yearFilter
      const matchMonth = !monthFilter || planMonth === monthFilter
      item.style.display = (matchQuery && matchDate && matchYear && matchMonth) ? 'block' : 'none'
    })
    const visibleItems = items.filter((item) => item.style.display !== 'none')
    visibleItems.sort((a, b) => {
      const nameA = a.querySelector('h3')?.textContent?.trim() || ''
      const nameB = b.querySelector('h3')?.textContent?.trim() || ''
      const idA = Number(a.querySelector('.muted')?.textContent?.replace(/[^0-9]/g, '') || 0)
      const idB = Number(b.querySelector('.muted')?.textContent?.replace(/[^0-9]/g, '') || 0)
      if (sortMode === 'name') return nameA.localeCompare(nameB)
      if (sortMode === 'oldest') return idA - idB
      return idB - idA
    })
    const parent = visibleItems[0]?.parentElement
    if (parent) visibleItems.forEach((item) => parent.appendChild(item))
  }
  if (planSearchInput) planSearchInput.oninput = applyPlanFilters
  if (planSortSelect) planSortSelect.onchange = applyPlanFilters
  if (planDateInput) planDateInput.onchange = applyPlanFilters
  if (planYearFilter) planYearFilter.onchange = applyPlanFilters
  if (planMonthFilter) planMonthFilter.onchange = applyPlanFilters
  if (planClearFilterBtn) planClearFilterBtn.onclick = () => {
    if (planSearchInput) planSearchInput.value = ''
    if (planSortSelect) planSortSelect.value = 'newest'
    if (planDateInput) planDateInput.value = ''
    if (planYearFilter) planYearFilter.value = ''
    if (planMonthFilter) planMonthFilter.value = ''
    applyPlanFilters()
  }
  const printPlanBtn = document.getElementById('print-plan-btn')
  if (printPlanBtn) printPlanBtn.onclick = () => window.print()
  const exportPlanBtn = document.getElementById('export-plan-btn')
  if (exportPlanBtn) {
    exportPlanBtn.onclick = () => {
      const cards = Array.from(document.querySelectorAll('[data-full-plan-item]')).filter((card) => card.style.display !== 'none')
      const text = cards.map((card) => {
        const year = card.getAttribute('data-plan-year') || 'không rõ'
        const month = card.getAttribute('data-plan-month') || 'không rõ'
        const title = card.querySelector('h4')?.innerText?.trim() || card.querySelector('h3')?.innerText?.trim() || 'Kế hoạch'
        const id = card.querySelector('.muted')?.innerText?.trim() || ''
        const details = Array.from(card.querySelectorAll(':scope > .grid > .card, .plan-caption > .card')).map((n) => n.innerText.trim()).join('\n')
        return [`Năm ${year} - Tháng ${month}`, title, id, details].filter(Boolean).join('\n')
      }).join('\n\n')
      const blob = new Blob([text || 'Không có dữ liệu để xuất.'], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'smart-gym-workout-plans.txt'
      a.click()
      URL.revokeObjectURL(url)
      showToast('Đã xuất kế hoạch.', 'success')
    }
  }
  applyPlanFilters()
  if (workoutPlanForm) workoutPlanForm.onsubmit = async (e) => {
    e.preventDefault()
    try {
      const form = Object.fromEntries(new FormData(workoutPlanForm).entries())
      const details = collectPlanRows()
      if (!details.length) throw new Error('Hãy chọn ít nhất một bài tập.')
      const createdPlan = await api('/api/workout/plans', {
        method: 'POST',
        body: JSON.stringify({
          user_id: state.user?.id,
          name: form.name,
          details
        })
      })
      state.lastWorkoutPlan = createdPlan || { id: `tmp-${Date.now()}`, name: form.name }
      if (state.lastWorkoutPlan) state.lastWorkoutPlan.user_id = state.user?.id
      saveLastWorkoutPlan(state.lastWorkoutPlan)
      showToast('Đã tạo kế hoạch tập.', 'success')
      navigate('/customer')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }
  const workoutHistoryForm = document.getElementById('workout-history-form')
  if (workoutHistoryForm) workoutHistoryForm.onsubmit = async (e) => {
    e.preventDefault()
    try {
      const form = Object.fromEntries(new FormData(workoutHistoryForm).entries())
      await api('/api/workout/history', {
        method: 'POST',
        body: JSON.stringify({
          user_id: state.user?.id,
          exercise_id: Number(form.exercise_id),
          sets: Number(form.sets),
          reps: Number(form.reps),
          weight: form.weight ? Number(form.weight) : null
        })
      })
      showToast('Đã ghi nhận lịch sử tập.', 'success')
      render()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }
  const chatForm = document.getElementById('chat-form')
  const customerThread = document.getElementById('chat-thread')
  if (customerThread) {
    if ((state.customerChatHistory || []).length === 0) {
      state.customerChatHistory = customerChatGreeting()
      saveChatHistory(state.customerChatHistory, state.customerChatKey || chatStorageKey('customer', state.user?.id))
    }
    renderChatMessages('chat-thread', state.customerChatHistory)
  }
  if (chatForm) chatForm.onsubmit = async (e) => {
    e.preventDefault()
    try {
      const form = Object.fromEntries(new FormData(chatForm).entries())
      const userText = form.message.trim()
      if (!userText) throw new Error('Vui lòng nhập câu hỏi.')
      state.customerChatHistory = [...(state.customerChatHistory || []), { role: 'user', text: userText }]
      saveChatHistory(state.customerChatHistory, state.customerChatKey || chatStorageKey('customer', state.user?.id))
      renderChatMessages('chat-thread', state.customerChatHistory)
      const res = await api('/api/chatbot/chat/message', {
        method: 'POST',
        body: JSON.stringify({ user_id: state.user?.id, message: buildChatPrompt(form.message, state.customerChatContext || {}) })
      })
      state.customerChatHistory = [...(state.customerChatHistory || []), { role: 'assistant', text: res.answer || 'Không có phản hồi.' }]
      saveChatHistory(state.customerChatHistory, state.customerChatKey || chatStorageKey('customer', state.user?.id))
      renderChatMessages('chat-thread', state.customerChatHistory)
      chatForm.reset()
    } catch (err) {
      state.customerChatHistory = [...(state.customerChatHistory || []), { role: 'assistant', text: `Lỗi: ${err.message}` }]
      saveChatHistory(state.customerChatHistory, state.customerChatKey || chatStorageKey('customer', state.user?.id))
      renderChatMessages('chat-thread', state.customerChatHistory)
    }
  }
  const clearChatBtn = document.getElementById('clear-chat-btn')
  if (clearChatBtn) {
    clearChatBtn.onclick = () => {
      saveChatHistory([], state.customerChatKey || chatStorageKey('customer', state.user?.id))
      renderChatMessages('chat-thread', [])
    }
  }
  document.querySelectorAll('[data-chat-quick]').forEach((btn) => {
    btn.onclick = async () => {
      const chatFormEl = document.getElementById('chat-form')
      const messageField = chatFormEl?.querySelector('textarea[name="message"]')
      if (!messageField) return
      messageField.value = btn.getAttribute('data-chat-quick') || ''
      chatFormEl.requestSubmit()
    }
  })
  const adminChatForm = document.getElementById('admin-chat-form')
  const adminChatThread = document.getElementById('admin-chat-thread')
  if (adminChatThread) {
    if ((state.adminChatHistory || []).length === 0) {
      state.adminChatHistory = adminChatGreeting()
      saveChatHistory(state.adminChatHistory, state.adminChatKey || chatStorageKey('admin', state.user?.id))
    }
    renderChatMessages('admin-chat-thread', state.adminChatHistory)
  }
  if (adminChatForm) adminChatForm.onsubmit = async (e) => {
    e.preventDefault()
    try {
      const form = Object.fromEntries(new FormData(adminChatForm).entries())
      const userText = form.message.trim()
      if (!userText) throw new Error('Vui lòng nhập câu hỏi.')
      const res = await api('/api/chatbot/chat/message', {
        method: 'POST',
        body: JSON.stringify({
          user_id: state.user?.id,
          message: buildChatPrompt(form.message, {
            packageName: 'ADMIN',
            planName: 'SYSTEM',
            daysLeft: null,
            activePlanCount: undefined
          })
        })
      })
      const answerBox = document.getElementById('admin-chat-answer')
      if (answerBox) answerBox.innerHTML = `<strong>AI:</strong> ${escapeHtml(res.answer || 'Không có phản hồi.')}`
      state.adminChatHistory = [...(state.adminChatHistory || []), { role: 'user', text: userText }, { role: 'assistant', text: res.answer || 'Không có phản hồi.' }]
      saveChatHistory(state.adminChatHistory, state.adminChatKey || chatStorageKey('admin', state.user?.id))
      renderChatMessages('admin-chat-thread', state.adminChatHistory)
    } catch (err) {
      const answerBox = document.getElementById('admin-chat-answer')
      if (answerBox) answerBox.textContent = err.message
    }
  }
  document.querySelectorAll('[data-admin-chat-quick]').forEach((btn) => {
    btn.onclick = async () => {
      const adminFormEl = document.getElementById('admin-chat-form')
      const messageField = adminFormEl?.querySelector('textarea[name="message"]')
      if (!messageField) return
      messageField.value = btn.getAttribute('data-admin-chat-quick') || ''
      adminFormEl.requestSubmit()
    }
  })
  const adminUserForm = document.getElementById('admin-user-form')
  if (adminUserForm) adminUserForm.onsubmit = async (e) => {
    e.preventDefault()
    try {
      const form = Object.fromEntries(new FormData(adminUserForm).entries())
      await api('/api/users/', { method: 'POST', body: JSON.stringify(form) })
      showToast('Đã tạo user.', 'success')
      render()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }
  const adminPackageForm = document.getElementById('admin-package-form')
  if (adminPackageForm) adminPackageForm.onsubmit = async (e) => {
    e.preventDefault()
    try {
      const form = Object.fromEntries(new FormData(adminPackageForm).entries())
      await api('/api/membership/packages/', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          price: Number(form.price),
          duration_days: Number(form.duration_days),
          package_desc: form.package_desc
        })
      })
      showToast('Đã tạo gói.', 'success')
      render()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }
  const adminExerciseForm = document.getElementById('admin-exercise-form')
  if (adminExerciseForm) adminExerciseForm.onsubmit = async (e) => {
    e.preventDefault()
    try {
      const form = Object.fromEntries(new FormData(adminExerciseForm).entries())
      await api('/api/workout/exercises', { method: 'POST', body: JSON.stringify(form) })
      showToast('Đã tạo bài tập.', 'success')
      render()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }
  const adminEquipmentForm = document.getElementById('admin-equipment-form')
  if (adminEquipmentForm) adminEquipmentForm.onsubmit = async (e) => {
    e.preventDefault()
    try {
      const form = Object.fromEntries(new FormData(adminEquipmentForm).entries())
      await api('/api/facility/equipment', { method: 'POST', body: JSON.stringify(form) })
      showToast('Đã thêm thiết bị.', 'success')
      render()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }
  const maintenanceForm = document.getElementById('maintenance-form')
  if (maintenanceForm) maintenanceForm.onsubmit = async (e) => {
    e.preventDefault()
    try {
      const form = Object.fromEntries(new FormData(maintenanceForm).entries())
      await api('/api/facility/maintenance', {
        method: 'POST',
        body: JSON.stringify({
          equipment_id: Number(form.equipment_id),
          description: form.description,
          cost: Number(form.cost || 0),
          performed_by: form.performed_by
        })
      })
      showToast('Đã ghi nhận bảo trì.', 'success')
      render()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }
  const adminPlanFilterForm = document.getElementById('admin-plan-filter-form')
  if (adminPlanFilterForm) adminPlanFilterForm.onsubmit = (e) => {
    e.preventDefault()
    const form = Object.fromEntries(new FormData(adminPlanFilterForm).entries())
    const userId = String(form.user_id || '').trim()
    navigate(userId ? `/admin/workout-plans?user_id=${encodeURIComponent(userId)}` : '/admin/workout-plans')
  }
  const adminHistoryFilterForm = document.getElementById('admin-history-filter-form')
  if (adminHistoryFilterForm) adminHistoryFilterForm.onsubmit = (e) => {
    e.preventDefault()
    const form = Object.fromEntries(new FormData(adminHistoryFilterForm).entries())
    const userId = String(form.user_id || '').trim()
    navigate(userId ? `/admin/workout-history?user_id=${encodeURIComponent(userId)}` : '/admin/workout-history')
  }
  const subscribeConfirmBtn = document.querySelector('[data-subscribe-package-id]')
  if (subscribeConfirmBtn) {
    subscribeConfirmBtn.onclick = async () => {
      if (!state.user) return navigate('/login')
      try {
        const packageId = Number(subscribeConfirmBtn.getAttribute('data-subscribe-package-id'))
        const pkg = (state.packages || []).find(p => Number(p.id) === packageId)
        if (!pkg) throw new Error('Không tìm thấy gói tập')

        const start = new Date()
        const end = new Date(start)
        end.setDate(end.getDate() + Number(pkg.duration_days || 30))
        const toDate = (d) => d.toISOString().slice(0, 10)

        const subscription = await api('/api/membership/subscriptions/', {
          method: 'POST',
          body: JSON.stringify({
            user_id: state.user.id,
            package_id: pkg.id,
            start_date: toDate(start),
            end_date: toDate(end),
            status: 'active'
          })
        })

        const params = new URLSearchParams({
          user_id: String(state.user.id),
          subscription_id: String(subscription?.id || pkg.id),
          amount: String(pkg.price),
          payment_method: 'bank_transfer',
          discount_code: ''
        })
        const paymentResult = await api(`/api/payment/create?${params.toString()}`, {
          method: 'POST'
        })
        state.pendingPayment = paymentResult || null
        sessionStorage.setItem('pending_payment_payload', JSON.stringify(paymentResult || {}))
        navigate(`/customer/subscription?package=${pkg.id}&order=${encodeURIComponent(paymentResult?.order_id || '')}`)
      } catch (err) {
        alert(err.message)
      }
    }
  }
  const confirmPaidBtn = document.getElementById('confirm-paid-btn')
  if (confirmPaidBtn) {
    confirmPaidBtn.onclick = () => {
      state.pendingPayment = null
      sessionStorage.removeItem('pending_payment_payload')
      sessionStorage.removeItem('pending_payment_order')
      navigate('/customer')
    }
  }
  const backCustomerBtn = document.getElementById('back-customer-btn')
  if (backCustomerBtn) {
    backCustomerBtn.onclick = () => {
      state.pendingPayment = null
      sessionStorage.removeItem('pending_payment_payload')
      sessionStorage.removeItem('pending_payment_order')
      navigate('/customer')
    }
  }
  document.querySelectorAll('[data-package-id]').forEach(btn => {
    btn.onclick = async () => {
      if (!state.user) return navigate('/login')
      const action = btn.getAttribute('data-package-action')
      if (action === 'select') {
        navigate(`/customer/subscription?package=${btn.getAttribute('data-package-id')}`)
      } else {
        navigate(`/customer/subscription?package=${btn.getAttribute('data-package-id')}`)
      }
    }
  })
  loadLandingPackages()
  loadProductsGrid()
}

async function loadLandingPackages() {
  const el = document.getElementById('landing-packages')
  if (!el) return
  const packages = await loadPackages()
  el.innerHTML = (packages || []).slice(0, 3).map(pkg => packageCard(pkg, !!state.user, false)).join('')
  bindPackageButtons()
}

async function loadProductsGrid() {
  const el = document.getElementById('products-list')
  if (!el) return
  const [products, featured] = await Promise.all([
    api('/api/membership/products/').catch(() => []),
    api('/api/membership/products/featured').catch(() => [])
  ])
  const all = [...(Array.isArray(featured) ? featured : []), ...(Array.isArray(products) ? products : [])]
  el.innerHTML = all.slice(0, 6).map((p) => `
    <div class="card" style="padding:24px">
      <div class="pill blue">Product</div>
      <h3>${escapeHtml(p.name || 'Sản phẩm')}</h3>
      <p class="muted">${escapeHtml(p.description || '')}</p>
    </div>
  `).join('') || '<div class="card" style="padding:24px">Chưa có sản phẩm.</div>'
}

function bindPackageButtons() {
  document.querySelectorAll('[data-package-id]').forEach(btn => {
    btn.onclick = async () => {
      if (!state.user) return navigate('/login')
      navigate(`/customer/subscription?package=${btn.getAttribute('data-package-id')}`)
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
