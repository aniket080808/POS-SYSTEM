import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { 
  Eye, 
  EyeOff, 
  Lock, 
  ShoppingCart, 
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { resetPassword } from '@/Redux Toolkit/features/auth/authThunk'
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
        description: "Password reset token is missing. Please request a new link.",
        variant: "destructive",
      })
      navigate('/auth/forgot-password')
    }
  }, [token, navigate, toast])

  useEffect(() => {
    if (resetPasswordSuccess) {
      setIsSuccess(true)
      toast({
        title: "Success",
        description: "Password has been reset successfully!",
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
    
    // Clear error when user types
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
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required'
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

    try {
      await dispatch(resetPassword({
        token,
        newPassword: formData.password
      })).unwrap()
    } catch (err) {
      // Error handled by redux slice/effect
    }
  }

  const handleBackToLogin = () => {
    dispatch(clearResetPasswordState())
    navigate('/auth/login')
  }

  if (!token) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2.5 mb-4">
            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-xs">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">NexPOS</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {isSuccess ? 'Password Reset Complete' : 'Reset Your Password'}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {isSuccess 
              ? 'Your password has been successfully reset'
              : 'Enter your new password below'
            }
          </p>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="bg-card rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Password Reset Complete
            </h3>
            <p className="text-muted-foreground mb-6">
              Your password has been successfully updated. You can now login with your new password.
            </p>
            <Button
              onClick={handleBackToLogin}
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        ) : (
          /* Reset Password Form */
          <div className="bg-card rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pl-10 pr-12 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center z-10"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`pl-10 pr-12 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center z-10"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              {/* Password Requirements */}
              <div className="text-sm text-muted-foreground">
                <p className="mb-1">Password requirements:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>At least 8 characters long</li>
                  <li>Use a combination of letters and numbers</li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full py-3 text-lg font-medium"
                disabled={resetPasswordLoading}
              >
                {resetPasswordLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Resetting Password...
                  </div>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>

            {/* Back to Login Link */}
            <div className="mt-6 text-center">
              <Link 
                to="/auth/login" 
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                ← Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResetPassword
