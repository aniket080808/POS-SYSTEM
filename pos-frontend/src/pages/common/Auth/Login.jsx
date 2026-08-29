import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ShoppingCart,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { login, forgotPassword } from "@/Redux Toolkit/features/auth/authThunk";
import { getUserProfile } from "../../../Redux Toolkit/features/user/userThunks";
import { startShift } from "../../../Redux Toolkit/features/shiftReport/shiftReportThunks";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [forgotEmail, setForgotEmail] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { forgotPasswordLoading } = useSelector((state) => state.auth);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const resultAction = await dispatch(login(formData));
      if (login.fulfilled.match(resultAction)) {
        toast({
          title: "Authenticated",
          description: "Login successful. Redirecting to workspace...",
        });

        const user = resultAction.payload.user;
        await dispatch(getUserProfile(resultAction.payload.jwt));

        // Redirect based on user role
        const userRole = user.role;
        if (userRole === "ROLE_ADMIN") {
          navigate("/super-admin");
        } else if (userRole === "ROLE_BRANCH_CASHIER") {
          navigate("/cashier");
          dispatch(startShift(user.branchId));
        } else if (
          userRole === "ROLE_STORE_ADMIN" ||
          userRole === "ROLE_STORE_MANAGER"
        ) {
          navigate("/store");
        } else if (
          userRole === "ROLE_BRANCH_MANAGER" ||
          userRole === "ROLE_BRANCH_ADMIN"
        ) {
          navigate("/branch");
        } else {
          navigate("/");
        }
      } else {
        toast({
          title: "Authentication Failed",
          description: resultAction.payload || "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast({
        title: "Validation Error",
        description: "Please enter your registered email address",
        variant: "destructive",
      });
      return;
    }

    try {
      const resultAction = await dispatch(forgotPassword(forgotEmail));
      if (forgotPassword.fulfilled.match(resultAction)) {
        setEmailSent(true);
        toast({
          title: "Reset Email Dispatched",
          description: "Password reset link sent to your email.",
        });
      } else {
        const errorMsg = resultAction.payload || "Failed to send reset email";
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err?.message || "Failed to send reset email",
        variant: "destructive",
      });
    }
  };

  const resetForgotPassword = () => {
    setShowForgotPassword(false);
    setEmailSent(false);
    setForgotEmail("");
  };

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4 selection:bg-accent selection:text-accent-foreground">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-6">
          <div
            className="flex items-center justify-center space-x-2.5 mb-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-xs">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-foreground">
              NexPOS
            </span>
          </div>
          <h1 className="text-xl font-bold text-foreground">
            {showForgotPassword ? "Reset Account Password" : "Sign In to Terminal"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {showForgotPassword
              ? "Enter your registered email to receive recovery instructions"
              : "Access cashier POS, branch management, or store administration"}
          </p>
        </div>

        {/* Login Form */}
        {!showForgotPassword && !emailSent && (
          <div className="bg-card rounded-2xl shadow-sm border border-border p-7">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold text-foreground mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-9 h-10 text-sm"
                    placeholder="name@store.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="password"
                    className="block text-xs font-bold text-foreground"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-accent font-semibold hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-9 pr-10 h-10 text-sm"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm cursor-pointer shadow-xs mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>
          </div>
        )}

        {/* Forgot Password Form */}
        {showForgotPassword && !emailSent && (
          <div className="bg-card rounded-2xl shadow-sm border border-border p-7">
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label
                  htmlFor="forgot-email"
                  className="block text-xs font-bold text-foreground mb-1"
                >
                  Registered Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    type="email"
                    id="forgot-email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="pl-9 h-10 text-sm"
                    placeholder="name@store.com"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-10 text-xs font-semibold"
                  onClick={resetForgotPassword}
                >
                  Back to Sign In
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-10 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold"
                  disabled={forgotPasswordLoading}
                >
                  {forgotPasswordLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Email Sent Success */}
        {emailSent && (
          <div className="bg-card rounded-2xl shadow-sm border border-border p-7 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Check Your Inbox
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Password recovery instructions were dispatched to{" "}
                <span className="font-semibold text-foreground">{forgotEmail}</span>
              </p>
            </div>
            <Button
              onClick={resetForgotPassword}
              variant="outline"
              className="w-full h-10 text-xs font-semibold"
            >
              Return to Sign In
            </Button>
          </div>
        )}

        {/* Footer Link */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            Registering a new retail business?{" "}
            <Link
              to="/auth/onboarding"
              className="text-accent font-bold hover:underline"
            >
              Start Store Onboarding
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;