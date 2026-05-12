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

// Request interceptor
userAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})