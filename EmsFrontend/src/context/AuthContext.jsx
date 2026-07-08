import React, { createContext, useState, useContext, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is in localStorage on mount
    const storedUser = localStorage.getItem('TDTL-user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
        setIsAuthenticated(true)
      } catch (e) {
        console.error('Failed to parse stored user:', e)
        localStorage.removeItem('TDTL-user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email, password, portalRole) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid email or password');
      }

      const data = await response.json();
      // data contains: { token, role, name, email, id }
      
      // Normalize 'leader' to 'leaders' for compatibility with frontend dashboard routes
      let userRole = data.role;
      if (userRole === 'leader') {
        userRole = 'leaders';
      }

      const authenticatedUser = {
        id: data.id || 'emp-' + Date.now().toString(),
        email: data.email || email,
        name: data.name || email.split('@')[0],
        role: userRole,
        department: data.department || 'General'
      };

      setUser(authenticatedUser);
      setIsAuthenticated(true);
      localStorage.setItem('TDTL-user', JSON.stringify(authenticatedUser));
      localStorage.setItem('TDTL-token', data.token);
      return authenticatedUser;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  const register = (email, password, name) => {
    // Mock registration
    if (email && password && name) {
      const mockUser = {
        id: 'emp-' + Date.now().toString(),
        email,
        name,
        role: 'employee',
        department: 'General'
      }
      setUser(mockUser)
      setIsAuthenticated(true)
      localStorage.setItem('TDTL-user', JSON.stringify(mockUser))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('TDTL-user')
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
