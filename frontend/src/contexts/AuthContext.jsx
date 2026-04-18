import React, { createContext, useContext, useReducer, useEffect } from 'react'

const AuthContext = createContext()

const AUTH_STORAGE_KEY = 'clothing_store_auth'

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true
}

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload, isAuthenticated: true, loading: false }
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, loading: false }
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } }
    case 'INIT_AUTH':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload, loading: false }
    default:
      return state
  }
}

// Load user from localStorage
function loadUserFromStorage() {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

// Save user to localStorage
function saveUserToStorage(user) {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  } catch (error) {
    console.error('Error saving auth:', error)
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Initialize auth from localStorage
  useEffect(() => {
    const user = loadUserFromStorage()
    dispatch({ type: 'INIT_AUTH', payload: user })
  }, [])

  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      // Simulate API call - in real app, call backend API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Demo user data - replace with real API response
      const userData = {
        id: 1,
        name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email: email,
        phone: '098 765 4321',
        birthDate: '15/05/1995',
        gender: 'Nam',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        memberLevel: 'Gold'
      }
      
      saveUserToStorage(userData)
      dispatch({ type: 'LOGIN_SUCCESS', payload: userData })
      return { success: true }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      return { success: false, error: 'Đăng nhập thất bại' }
    }
  }

  const register = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        birthDate: '',
        gender: '',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        memberLevel: 'Bronze'
      }
      
      saveUserToStorage(newUser)
      dispatch({ type: 'LOGIN_SUCCESS', payload: newUser })
      return { success: true }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      return { success: false, error: 'Đăng ký thất bại' }
    }
  }

  const logout = () => {
    saveUserToStorage(null)
    dispatch({ type: 'LOGOUT' })
  }

  const updateUser = (data) => {
    const updatedUser = { ...state.user, ...data }
    saveUserToStorage(updatedUser)
    dispatch({ type: 'UPDATE_USER', payload: data })
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
