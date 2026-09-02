import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Eye,
  EyeOff,
  Lock,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword } from "@/Redux Toolkit/features/auth/authThunk";
import { clearResetPasswordState } from "../../../Redux Toolkit/features/auth/authSlice";
import NexPOSLogo from "@/components/common/NexPOSLogo";

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { resetPasswordLoading, resetPasswordSuccess, resetPasswordError } =
    useSelector((state) => state.auth);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      toast({
        title: "Invalid Link",
        description: "No reset token found in the URL",
        variant: "destructive",
      });
      navigate("/auth/login");
    }
  }, [token, navigate, toast]);

  useEffect(() => {
    if (resetPasswordSuccess) {
      setIsSuccess(true);
      toast({
        title: "Password Updated",
        description: "Password reset successful. Please sign in with your new credentials.",
      });
    }
  }, [resetPasswordSuccess, toast]);

  useEffect(() => {
    if (resetPasswordError) {
      toast({
        title: "Error",
        description: resetPasswordError,
        variant: "destructive",
      });
    }
  }, [resetPasswordError, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!token) {
      toast({
        title: "Error",
        description: "Invalid reset token",
        variant: "destructive",
      });
      return;
    }

    try {
      await dispatch(
        resetPassword({ token, password: formData.password })
      ).unwrap();
    } catch (error) {
      console.error("Reset password error:", error);
    }
  };

  const handleBackToLogin = () => {
    dispatch(clearResetPasswordState());
    navigate("/auth/login");
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="flex justify-center mb-4">
          <NexPOSLogo size="lg" onClick={() => navigate("/")} />
        </div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">
          {isSuccess ? "Password Reset Complete" : "Create New Password"}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {isSuccess
            ? "Your credentials have been securely updated"
            : "Enter a strong new password for your account"}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-md">
          {isSuccess ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 rounded-full bg-[#262422] text-[#FAF8F3] flex items-center justify-center mx-auto shadow-sm">
                <Check className="w-6 h-6 stroke-[3] text-[#C9A227]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Credentials Updated
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  You can now sign in to your store portal with your new password.
                </p>
              </div>
              <Button
                onClick={handleBackToLogin}
                className="w-full text-xs h-10 font-bold"
              >
                Sign In Now
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 text-xs h-11 ${
                      errors.password ? "border-destructive ring-1 ring-destructive" : ""
                    }`}
                    placeholder="At least 8 characters"
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
                {errors.password && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 text-xs h-11 ${
                      errors.confirmPassword ? "border-destructive ring-1 ring-destructive" : ""
                    }`}
                    placeholder="Repeat password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-xs font-bold mt-2"
                disabled={resetPasswordLoading}
              >
                {resetPasswordLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          )}
        </div>

        <div className="text-center mt-6">
          <Link
            to="/auth/login"
            className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
