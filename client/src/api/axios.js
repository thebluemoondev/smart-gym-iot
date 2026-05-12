import axios from 'axios'

const API_BASE = '/api'

// User Service - endpoints: /register, /login, /search, /{id}, /access-check/{card_uid}
export const userAPI = axios.create({
  baseURL: `${API_BASE}/users`,
})

// Membership Service - endpoints: /packages, /subscriptions
export const membershipAPI = axios.create({
  baseURL: `${API_BASE}/membership`,
})

// Workout Service - endpoints: /exercises, /workout/plans, /workout/history
export const workoutAPI = axios.create({
  baseURL: `${API_BASE}/workout`,
})

// Facility Service - endpoints: /equipment, /maintenance, /areas
export const facilityAPI = axios.create({
  baseURL: `${API_BASE}/facility`,
})

// Chatbot Service - endpoints: /chat
export const chatbotAPI = axios.create({
  baseURL: `${API_BASE}/chatbot`,
})

// Payment Service - endpoints: /create, /callback, /order/{order_id}, /user/{user_id}, /methods
export const paymentAPI = axios.create({
  baseURL: `${API_BASE}/payment`,
})

// Request interceptor - Add auth token to all API calls
const addAuthToken = (config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

userAPI.interceptors.request.use(addAuthToken)
membershipAPI.interceptors.request.use(addAuthToken)
workoutAPI.interceptors.request.use(addAuthToken)
facilityAPI.interceptors.request.use(addAuthToken)
chatbotAPI.interceptors.request.use(addAuthToken)
paymentAPI.interceptors.request.use(addAuthToken)