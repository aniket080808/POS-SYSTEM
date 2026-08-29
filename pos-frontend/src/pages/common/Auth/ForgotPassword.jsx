import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { 
  Mail, 
  Store, 
  CheckCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { forgotPassword } from '../../../Redux Toolkit/features/auth/authThunk'
import { ThemeToggle } from '../../../components/theme-toggle'
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
            {emailSent ? 'Check Your Email' : 'Reset Your Password'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {emailSent 
              ? `We've sent reset instructions to ${email}`
              : 'Enter your registered email address and we will send you a reset link'
            }
          </p>
        </div>

        {/* Success State */}
        {emailSent ? (
          <div className="bg-card rounded-2xl shadow-sm border border-border/80 p-8 text-center transition-all">
            <div className="w-14 h-14 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              Instructions Dispatched
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              If an account with that email exists, you will receive a password reset link valid for 5 minutes.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => {
                  handleReset()
                  navigate('/auth/login')
                }}
                className="w-full h-11 rounded-xl"
              >
                Back to Sign In
              </Button>
              <p className="text-xs text-muted-foreground">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setEmailSent(false)}
                  className="text-primary hover:underline font-medium cursor-pointer"
                >
                  try again
                </button>
              </p>
            </div>
          </div>
        ) : (
          /* Forgot Password Form */
          <div className="bg-card rounded-2xl shadow-sm border border-border/80 p-8 transition-all">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Registered Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  onClick={() => {
                    handleReset()
                    navigate('/auth/login')
                  }}
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
      </div>
    </div>
  )
}

export default ForgotPassword
