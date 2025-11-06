import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Auto-login if token exists
    useEffect(() => {
        if (token) {
            verifyToken()
        }
    }, [token])

    const verifyToken = useCallback(async () => {
        try {
             setLoading(true)
        const token = localStorage.getItem('token')
        
        if (!token) {
            logout()
            return
        }
        
        // Try to get user from localStorage first
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser)
            setUser(parsedUser)
            console.log('✅ User loaded from localStorage:', parsedUser)
        }
        
        // Then verify with backend
        const userData = await authService.verifyToken(token)
        setUser(userData)
        console.log('✅ User verified from backend:', userData)
        
        } catch (error) {
            console.error('Token verification failed:', error)
            logout()
        } finally {
            setLoading(false)
        }
    }, [token])

  const login = useCallback(async (loginData, userType) => {
    try {
        setLoading(true)
        setError('')
        
        console.log('Attempting login...', { userType })
        
        const response = await authService.login(loginData, userType)
        
        console.log('✅ Login response:', response)
        
        const { token: newToken, data } = response
        
        // Save everything to state
        setToken(newToken)
        setUser(data)
        
        // Save everything to localStorage
        localStorage.setItem('token', newToken)
        localStorage.setItem('user', JSON.stringify(data))
        localStorage.setItem('userType', userType)
        
        console.log('Saved to localStorage:', {
            token: newToken,
            user: data,
            userType
        })
        
        return { success: true }
    } catch (error) {
        console.error('Login error:', error)
        const message = error.response?.data?.message || error.message || 'Login failed'
        setError(message)
        return { success: false, message }
    } finally {
        setLoading(false)
    }
}, [])

    const register = useCallback(async (userData) => {
        try {
            setLoading(true)
            setError('')

            const response = await authService.register(userData)
            return { success: true, data: response.data }
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed'
            setError(message)
            return { success: false, message }
        } finally {
            setLoading(false)
        }
    }, [])

    const logout = useCallback(() => {
        setUser(null)
        setToken(null)
        setError('')
        localStorage.removeItem('token')
        localStorage.removeItem('userType')

        // Call logout API
        authService.logout().catch(console.error)
    }, [])

    const value = {
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token,
        userType: user?.userType || localStorage.getItem('userType')
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}