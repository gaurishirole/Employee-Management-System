import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { BarChart3, Eye, EyeOff, User, Briefcase, Shield, Lock, Mail } from 'lucide-react'
import loginImg from '../assets/login img.webp'
import DashboardSkeleton from '../components/DashboardSkeleton'


const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { toast } = useNotification()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeForm, setActiveForm] = useState('login') // 'login' or 'recover'
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoveryStep, setRecoveryStep] = useState('email') // 'email' | 'otp' | 'reset'
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    let timer
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [cooldown])

  // Helper to dynamically load SweetAlert2 from CDN and show success dialog
  const showSuccessAlert = (roleName) => {
    const triggerSwal = () => {
      window.Swal.fire({
        title: 'Login Successful..!',
        text: `Welcome back! You have logged in as ${roleName.toUpperCase()}.`,
        icon: 'success',
        confirmButtonText: 'OK..',
        confirmButtonColor: '#0c6396',
        customClass: {
          popup: 'rounded-3xl border border-slate-100',
          confirmButton: 'rounded-xl px-6 py-2.5 font-bold text-sm shadow-md'
        }
      })
    }

    if (window.Swal) {
      triggerSwal()
    } else {
      // Inject CSS
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css'
      document.head.appendChild(link)

      // Inject JS
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11'
      script.onload = triggerSwal
      document.body.appendChild(script)
    }
  }

  // Helper to dynamically load SweetAlert2 from CDN and show error dialog
  const showErrorAlert = (message) => {
    const triggerSwal = () => {
      window.Swal.fire({
        title: 'Login Failed!',
        text: message,
        icon: 'error',
        confirmButtonText: 'Try Again',
        confirmButtonColor: '#0c6396',
        customClass: {
          popup: 'rounded-3xl border border-slate-100',
          confirmButton: 'rounded-xl px-6 py-2.5 font-bold text-sm shadow-md'
        }
      })
    }

    if (window.Swal) {
      triggerSwal()
    } else {
      // Inject CSS
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css'
      document.head.appendChild(link)

      // Inject JS
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11'
      script.onload = triggerSwal
      document.body.appendChild(script)
    }
  }



  const validateEmail = (emailVal) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(emailVal)
  }

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault()
    if (!recoveryEmail) {
      toast.error('Please enter your email')
      return
    }
    if (!validateEmail(recoveryEmail)) {
      toast.error('Please enter a valid email format')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: recoveryEmail }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP')
      }

      toast.success(data.message || 'OTP sent successfully!')
      setRecoveryStep('otp')
      setCooldown(30)
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a 6-digit OTP')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: recoveryEmail, otp }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Invalid OTP')
      }

      toast.success(data.message || 'OTP verified successfully!')
      setRecoveryStep('reset')
    } catch (err) {
      toast.error(err.message || 'Failed to verify OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!newPassword) {
      toast.error('Please enter a new password')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/
    if (!passwordRegex.test(newPassword)) {
      toast.error('Password must be at least 8 characters, with 1 uppercase, 1 number, and 1 special character')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: recoveryEmail, otp, newPassword }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password')
      }

      toast.success(data.message || 'Password reset successfully!')
      setRecoveryStep('email')
      setRecoveryEmail('')
      setOtp('')
      setNewPassword('')
      setConfirmPassword('')
      setActiveForm('login')
    } catch (err) {
      toast.error(err.message || 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!email || !password) {
        showErrorAlert('Please fill in all fields')
        setIsLoading(false)
        return
      }

      const loggedInUser = await login(email, password)
      if (loggedInUser) {
        showSuccessAlert(loggedInUser.role)
        setTimeout(() => navigate('/dashboard'), 1500)
      } else {
        showErrorAlert('Invalid email or password')
        setIsLoading(false)
      }
    } catch (err) {
      showErrorAlert(err.message || 'Invalid email or password')
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <DashboardSkeleton pathname="/dashboard" />
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-4 sm:p-6 relative"
      style={{ backgroundImage: `url(${loginImg})` }}
    >
      {/* Page-wide dark translucent overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/80 via-slate-900/75 to-indigo-950/45 backdrop-blur-[2px] z-0" />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md bg-card/95 dark:bg-slate-900/95 rounded-3xl p-8 sm:p-10 shadow-2xl border border-border/40 flex flex-col justify-between min-h-[480px]">

        {activeForm === 'login' ? (
          <div className="space-y-6">
            {/* Header: User Icon badge */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#0c6396] flex items-center justify-center shadow-lg shadow-[#0c6396]/20">
                <User size={28} className="text-white" />
              </div>
              <h2 className="text-xl font-bold tracking-wider uppercase text-foreground">Login</h2>
            </div>

            {/* Toggle pill selector for Login / Recover */}
            <div className="flex gap-1 p-1 bg-muted/60 rounded-full border border-border/40 max-w-[200px] mx-auto text-xs font-bold">
              <button
                onClick={() => setActiveForm('login')}
                className="flex-1 py-1.5 bg-background text-[#0c6396] rounded-full shadow-sm cursor-pointer"
              >
                LOGIN
              </button>
              <button
                onClick={() => setActiveForm('recover')}
                className="flex-1 py-1.5 text-muted-foreground hover:text-foreground rounded-full transition-colors cursor-pointer"
              >
                RECOVER
              </button>
            </div>



            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Address */}
              <div className="flex items-center border-b border-border/80 py-2.5">
                <User size={18} className="text-muted-foreground mr-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tdtl.com"
                  className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm font-medium"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Password */}
              <div className="flex items-center border-b border-border/80 py-2.5 relative">
                <Lock size={18} className="text-muted-foreground mr-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm font-medium pr-10"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Actions: Forgot Password & Submit */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setActiveForm('recover')}
                  className="text-xs font-semibold text-[#0c6396] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-2.5 bg-[#0c6396] hover:bg-[#094f79] text-white rounded-full font-bold text-sm transition-all shadow-md shadow-[#0c6396]/15 hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? 'LOGIN...' : 'LOGIN'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header: Shield Icon badge */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#0c6396] flex items-center justify-center shadow-lg shadow-[#0c6396]/20">
                <Shield size={28} className="text-white" />
              </div>
              <h2 className="text-xl font-bold tracking-wider uppercase text-foreground">
                {recoveryStep === 'email' ? 'Recovery' : recoveryStep === 'otp' ? 'Verification' : 'New Password'}
              </h2>
            </div>

            {/* Toggle pill selector for Login / Recover (only in email step) */}
            {recoveryStep === 'email' && (
              <div className="flex gap-1 p-1 bg-muted/60 rounded-full border border-border/40 max-w-[200px] mx-auto text-xs font-bold">
                <button
                  onClick={() => {
                    setActiveForm('login')
                    setRecoveryStep('email')
                  }}
                  className="flex-1 py-1.5 text-muted-foreground hover:text-foreground rounded-full transition-colors cursor-pointer"
                >
                  LOGIN
                </button>
                <button
                  onClick={() => setActiveForm('recover')}
                  className="flex-1 py-1.5 bg-background text-[#0c6396] rounded-full shadow-sm cursor-pointer"
                >
                  RECOVER
                </button>
              </div>
            )}

            {/* Step 1: Recovery Form (Email Input) */}
            {recoveryStep === 'email' && (
              <form onSubmit={handleSendOTP} className="space-y-6">
                <div className="flex items-center border-b border-border/80 py-2.5">
                  <Mail size={18} className="text-muted-foreground mr-3" />
                  <input
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="Registered Email"
                    className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm font-medium"
                    disabled={isLoading}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#0c6396] hover:bg-[#094f79] text-white rounded-full font-bold text-sm transition-all shadow-md shadow-[#0c6396]/15 hover:shadow-lg disabled:opacity-50 cursor-pointer text-center"
                >
                  {isLoading ? 'SENDING...' : 'SEND OTP'}
                </button>
              </form>
            )}

            {/* Step 2: Verification Form (OTP Input) */}
            {recoveryStep === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="flex items-center border-b border-border/80 py-2.5">
                  <Lock size={18} className="text-muted-foreground mr-3" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-Digit OTP"
                    className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm font-medium tracking-widest text-center"
                    disabled={isLoading}
                    required
                  />
                </div>

                {/* Resend OTP button with Cooldown */}
                <div className="flex justify-center text-xs">
                  {cooldown > 0 ? (
                    <span className="text-muted-foreground">Resend OTP in {cooldown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOTP()}
                      className="text-[#0c6396] font-bold hover:underline cursor-pointer bg-transparent border-none"
                      disabled={isLoading}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#0c6396] hover:bg-[#094f79] text-white rounded-full font-bold text-sm transition-all shadow-md shadow-[#0c6396]/15 hover:shadow-lg disabled:opacity-50 cursor-pointer text-center"
                >
                  {isLoading ? 'VERIFYING...' : 'VERIFY OTP'}
                </button>
              </form>
            )}

            {/* Step 3: New Password Form */}
            {recoveryStep === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="flex items-center border-b border-border/80 py-2.5 relative">
                  <Lock size={18} className="text-muted-foreground mr-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password (min 8 chars)"
                    className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm font-medium pr-10"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="flex items-center border-b border-border/80 py-2.5 relative">
                  <Lock size={18} className="text-muted-foreground mr-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm New Password"
                    className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm font-medium pr-10"
                    disabled={isLoading}
                    required
                  />
                </div>

                <p className="text-[10px] text-muted-foreground leading-normal mt-1 text-center">
                  Password must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character.
                </p>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#0c6396] hover:bg-[#094f79] text-white rounded-full font-bold text-sm transition-all shadow-md shadow-[#0c6396]/15 hover:shadow-lg disabled:opacity-50 cursor-pointer text-center"
                >
                  {isLoading ? 'RESETTING...' : 'RESET PASSWORD'}
                </button>
              </form>
            )}

            {/* Remembered Link */}
            <p className="text-center text-xs text-muted-foreground mt-4">
              Remembered?{' '}
              <button
                onClick={() => {
                  setRecoveryStep('email')
                  setActiveForm('login')
                }}
                className="text-[#0c6396] hover:underline font-bold bg-transparent border-none cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </div>
        )}

        {/* Footer Back Button */}
        <div className="flex justify-center mt-8 pt-4 border-t border-border/40">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0c6396] hover:underline"
          >
            <span>←</span>
            <span>Back home</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
