import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowLeft,
  Check,
  Loader2,
  Store,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { login, forgotPassword } from "@/Redux Toolkit/features/auth/authThunk";
import { getUserProfile } from "../../../Redux Toolkit/features/user/userThunks";
import { startShift } from "../../../Redux Toolkit/features/shiftReport/shiftReportThunks";
import NexPOSLogo from "@/components/common/NexPOSLogo";

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
          description: "Welcome to NexPOS.",
        });

        const user = resultAction.payload.user;
        await dispatch(getUserProfile(resultAction.payload.jwt));

        // Redirect based on role
        const userRole = user.role;
        if (userRole === "ROLE_ADMIN") {
          navigate("/super-admin");
        } else if (userRole === "ROLE_BRANCH_CASHIER") {
          navigate("/cashier");
          if (user.branchId) {
            dispatch(startShift(user.branchId));
          }
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
          title: "Sign In Failed",
          description: resultAction.payload || "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const resultAction = await dispatch(forgotPassword(forgotEmail));
      if (forgotPassword.fulfilled.match(resultAction)) {
        setEmailSent(true);
        toast({
          title: "Reset Link Sent",
          description: "Password reset instructions sent to your email.",
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
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="flex justify-center mb-4">
          <NexPOSLogo size="lg" onClick={() => navigate("/")} />
        </div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">
          {showForgotPassword ? "Reset Portal Access" : "Sign in to your portal"}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {showForgotPassword
            ? "Enter your registered email to receive password reset link"
            : "Enter your credentials to access your store or terminal"}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-md">
          {/* Main Login Form */}
          {!showForgotPassword && !emailSent && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 text-xs h-11"
                    placeholder="name@store.com"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-foreground">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs font-semibold text-[#785600] dark:text-[#F5A623] hover:text-foreground transition-colors cursor-pointer"
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
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 text-xs h-11"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
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

              <Button
                type="submit"
                className="w-full h-11 text-xs font-bold mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Signing In...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          )}

          {/* Forgot Password Flow */}
          {showForgotPassword && !emailSent && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Registered Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="pl-10 text-xs h-11"
                    placeholder="name@store.com"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 text-xs h-10"
                  onClick={resetForgotPassword}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 text-xs h-10"
                  disabled={forgotPasswordLoading}
                >
                  {forgotPasswordLoading ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...
                    </span>
                  ) : (
                    "Send Link"
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Reset Link Sent Success */}
          {emailSent && (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 rounded-full bg-[#262422] text-[#FAF8F3] flex items-center justify-center mx-auto shadow-sm">
                <Check className="w-6 h-6 stroke-[3] text-[#C9A227]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Check Your Inbox
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  We've sent password reset instructions to{" "}
                  <strong className="text-foreground">{forgotEmail}</strong>
                </p>
              </div>
              <Button
                onClick={resetForgotPassword}
                className="w-full text-xs h-10 font-bold"
              >
                Return to Sign In
              </Button>
            </div>
          )}
        </div>

        {/* Onboarding Link */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            Don't have a registered store?{" "}
            <Link
              to="/auth/onboarding"
              className="font-bold text-foreground hover:text-primary transition-colors underline underline-offset-4 decoration-[#C9A227]"
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