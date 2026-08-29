import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { 
  Mail, 
  ShoppingCart, 
  CheckCircle,
  ArrowLeft
} from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { forgotPassword } from '../../../Redux Toolkit/features/auth/authThunk'
import { clearForgotPasswordState } from '../../../Redux Toolkit/features/auth/authSlice'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { forgotPasswordLoading } = useSelector((state) => state.auth)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: "Validation Error",
        description: "Please enter your email address",
        variant: "destructive",
      })
      return
    }

    try {
      const resultAction = await dispatch(forgotPassword(email))
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

  const handleReset = () => {
    dispatch(clearForgotPasswordState())
    setEmailSent(false)
    setEmail('')
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
            {emailSent ? 'Check Your Email' : 'Forgot Password'}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {emailSent 
              ? `We've sent password reset instructions to ${email}`
              : 'Enter your email address and we will send you a link to reset your password'
            }
          </p>
        </div>

        {/* Success State */}
        {emailSent ? (
          <div className="bg-card rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Email Sent
            </h3>
            <p className="text-muted-foreground mb-6">
              If an account with that email exists, you will receive a password reset link shortly (valid for 5 minutes).
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => {
                  handleReset()
                  navigate('/auth/login')
                }}
                className="w-full"
              >
                Back to Login
              </Button>
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setEmailSent(false)}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  try again
                </button>
              </p>
            </div>
          </div>
        ) : (
          /* Forgot Password Form */
          <div className="bg-card rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="Enter your registered email"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    handleReset()
                    navigate('/auth/login')
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={forgotPasswordLoading}
                >
                  {forgotPasswordLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </div>
            </form>

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

export default ForgotPassword
