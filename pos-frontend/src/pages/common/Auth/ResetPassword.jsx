import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Store, 
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { resetPassword } from '@/Redux Toolkit/features/auth/authThunk'
import { ThemeToggle } from '../../../components/theme-toggle'
import { clearResetPasswordState } from '../../../Redux Toolkit/features/auth/authSlice'

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [searchParams] = useSearchParams()
  const [isSuccess, setIsSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState({})

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { resetPasswordLoading, resetPasswordSuccess, resetPasswordError } = useSelector((state) => state.auth)

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      toast({
        title: "Invalid Link",
        description: "No reset token found in the URL",
        variant: "destructive",
      })
      navigate('/auth/login')
    }
  }, [token, navigate, toast])

  useEffect(() => {
    if (resetPasswordSuccess) {
      setIsSuccess(true)
      toast({
        title: "Success",
        description: "Password reset successful! You can now login with your new password.",
      })
    }
  }, [resetPasswordSuccess, toast])

  useEffect(() => {
    if (resetPasswordError) {
      toast({
        title: "Error",
        description: resetPasswordError,
        variant: "destructive",
      })
    }
  }, [resetPasswordError, toast])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    if (!token) {
      toast({
        title: "Error",
        description: "Invalid reset token",
        variant: "destructive",
      })
      return
    }

    try {
      await dispatch(resetPassword({ token, password: formData.password })).unwrap()
    } catch (error) {
      console.error('Reset password error:', error)
    }
  }

  const handleBackToLogin = () => {
    dispatch(clearResetPasswordState())
    navigate('/auth/login')
  }

  if (!token) {
    return null
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
            {isSuccess ? 'Password Updated' : 'Set New Password'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSuccess 
              ? 'Your account credentials have been securely updated'
              : 'Choose a strong password with at least 8 characters'
            }
          </p>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="bg-card rounded-2xl shadow-sm border border-border/80 p-8 text-center transition-all">
            <div className="w-14 h-14 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              Reset Completed
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              You can now sign in to your terminal using your new credentials.
            </p>
            <Button
              onClick={handleBackToLogin}
              className="w-full h-11 rounded-xl"
            >
              Proceed to Sign In
            </Button>
          </div>
        ) : (
          /* Reset Password Form */
          <div className="bg-card rounded-2xl shadow-sm border border-border/80 p-8 transition-all">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password Field */}
              <div>
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  New Password
                </label>
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
                    className={`pl-10 pr-11 h-11 rounded-xl ${errors.password ? 'border-destructive' : ''}`}
                    placeholder="At least 8 characters"
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
                {errors.password && (
                  <div className="flex items-center mt-1.5 text-xs text-destructive">
                    <AlertCircle className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`pl-10 pr-11 h-11 rounded-xl ${errors.confirmPassword ? 'border-destructive' : ''}`}
                    placeholder="Re-enter new password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-center mt-1.5 text-xs text-destructive">
                    <AlertCircle className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 text-sm font-semibold rounded-xl gap-2 mt-2"
                disabled={resetPasswordLoading}
              >
                {resetPasswordLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Saving Password...</span>
                  </div>
                ) : (
                  <>
                    <span>Update Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link 
                to="/auth/login" 
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Return to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResetPassword
