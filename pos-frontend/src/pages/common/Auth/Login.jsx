import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Store, 
  ArrowLeft,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '@/Redux Toolkit/features/auth/authThunk'
import { getUserProfile } from '../../../Redux Toolkit/features/user/userThunks'
import { startShift } from '../../../Redux Toolkit/features/shiftReport/shiftReportThunks'
import { ThemeToggle } from '../../../components/theme-toggle'
import { forgotPassword } from '../../../Redux Toolkit/features/auth/authThunk'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [forgotEmail, setForgotEmail] = useState('')

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { error, loading, forgotPasswordLoading } = useSelector((state) => state.auth)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const resultAction = await dispatch(login(formData))
      if (login.fulfilled.match(resultAction)) {
        toast({
          title: "Success",
          description: "Login successful!",
        })

        const user = resultAction.payload.user;

        console.log('Login success:', resultAction.payload.user.role)
        await dispatch(getUserProfile(resultAction.payload.jwt)); 
        
        // Redirect based on user role
        const userRole = user.role
        if (userRole === 'ROLE_ADMIN') {
          navigate('/super-admin')
        } else if (userRole === 'ROLE_BRANCH_CASHIER') {
          navigate('/cashier')
          dispatch(startShift(user.branchId))
        } else if (userRole === 'ROLE_STORE_ADMIN' || userRole === 'ROLE_STORE_MANAGER') {
          navigate('/store')
        } else if (userRole === 'ROLE_BRANCH_MANAGER' || userRole === 'ROLE_BRANCH_ADMIN') {
          navigate('/branch')
        } else {
          // Unknown role, redirect to landing page
          navigate('/')
        }
      } else {
        toast({
          title: "Error",
          description: resultAction.payload || 'Login failed',
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || 'Login failed',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()

    try {
      const resultAction = await dispatch(forgotPassword(forgotEmail))
      if (forgotPassword.fulfilled.match(resultAction)) {
        setEmailSent(true)
        toast({
          title: "Success",
          description: "Password reset instructions sent to your email!",
        })
      } else {
        const errorMsg = resultAction.payload || 'Failed to send reset email'
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err?.message || 'Failed to send reset email',
        variant: "destructive",
      })
    }
  }

  const resetForgotPassword = () => {
    setShowForgotPassword(false)
    setEmailSent(false)
    setForgotEmail('')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative selection:bg-primary/20">
      {/* Background Subtle Accent */}
      <div className="absolute inset-0 bg-radial from-primary/5 via-transparent to-transparent pointer-events-none" />

      {/* Theme Toggle - Functional preservation */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2.5 mb-3 px-3.5 py-1.5 rounded-2xl bg-muted/60 border border-border/80 shadow-2xs">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-xs">
              <Store className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">NexPOS</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {showForgotPassword ? 'Reset Password' : 'Sign In to NexPOS'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {showForgotPassword 
              ? 'Enter your email to receive a password reset link'
              : 'Enter your credentials to access your terminal'
            }
          </p>
        </div>

        {/* Login Form Card */}
        {!showForgotPassword && !emailSent && (
          <div className="bg-card rounded-2xl shadow-sm border border-border/80 p-8 transition-all">
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 h-11 rounded-xl"
                    placeholder="name@business.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs font-medium text-primary hover:underline transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-11 h-11 rounded-xl"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2.5 block text-xs text-muted-foreground cursor-pointer select-none">
                  Remember this device for 30 days
                </label>
              </div>

              {/* Login Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 text-sm font-semibold rounded-xl gap-2 mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <>
                    <span>Sign In to Terminal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        )}

        {/* Forgot Password Form */}
        {showForgotPassword && !emailSent && (
          <div className="bg-card rounded-2xl shadow-sm border border-border/80 p-8 transition-all">
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <label htmlFor="forgot-email" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Registered Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    type="email"
                    id="forgot-email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="pl-10 h-11 rounded-xl"
                    placeholder="name@business.com"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11 rounded-xl"
                  onClick={resetForgotPassword}
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 rounded-xl"
                  disabled={forgotPasswordLoading}
                >
                  {forgotPasswordLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    'Send Link'
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Email Sent Success Screen */}
        {emailSent && (
          <div className="bg-card rounded-2xl shadow-sm border border-border/80 p-8 text-center transition-all">
            <div className="w-14 h-14 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              Check Your Inbox
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              We've sent a 5-minute password reset link to <strong className="text-foreground">{forgotEmail}</strong>
            </p>
            <div className="space-y-3">
              <Button
                onClick={resetForgotPassword}
                className="w-full h-11 rounded-xl"
              >
                Back to Sign In
              </Button>
              <p className="text-xs text-muted-foreground">
                Didn't receive the email? Check spam or{' '}
                <button
                  onClick={() => setEmailSent(false)}
                  className="text-primary hover:underline font-medium cursor-pointer"
                >
                  try again
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Signup Link */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            New store owner?{' '}
            <Link to="/auth/onboarding" className="text-primary hover:underline font-semibold">
              Register store & owner account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login 