import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Eye,
  EyeOff,
  Lock,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword } from "@/Redux Toolkit/features/auth/authThunk";
import { clearResetPasswordState } from "../../../Redux Toolkit/features/auth/authSlice";

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
        description: "Password reset token is missing. Please request a new link.",
        variant: "destructive",
      });
      navigate("/auth/forgot-password");
    }
  }, [token, navigate, toast]);

  useEffect(() => {
    if (resetPasswordSuccess) {
      setIsSuccess(true);
      toast({
        title: "Password Updated",
        description: "Your password has been reset successfully!",
      });
    }
  }, [resetPasswordSuccess, toast]);

  useEffect(() => {
    if (resetPasswordError) {
      toast({
        title: "Reset Failed",
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
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
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

    try {
      await dispatch(
        resetPassword({
          token,
          newPassword: formData.password,
        })
      ).unwrap();
    } catch {
      // Handled via Redux state
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
            {isSuccess ? "Password Reset Complete" : "Set New Password"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isSuccess
              ? "Your credentials have been securely updated"
              : "Enter your new credentials below to restore account access"}
          </p>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="bg-card rounded-2xl shadow-sm border border-border p-7 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Password Successfully Reset
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                You can now sign in to your terminal or management portal using your updated password.
              </p>
            </div>
            <Button
              onClick={handleBackToLogin}
              className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold"
            >
              Sign In with New Password
            </Button>
          </div>
        ) : (
          /* Reset Password Form */
          <div className="bg-card rounded-2xl shadow-sm border border-border p-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-foreground mb-1"
                >
                  New Password <span className="text-red-500">*</span>
                </label>
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
                    placeholder="Minimum 6 characters"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 text-muted-foreground hover:text-foreground cursor-pointer"
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
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-bold text-foreground mb-1"
                >
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-9 pr-10 h-10 text-sm"
                    placeholder="Re-enter password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 text-muted-foreground hover:text-foreground cursor-pointer"
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
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm cursor-pointer shadow-xs mt-2"
                disabled={resetPasswordLoading}
              >
                {resetPasswordLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                    <span>Resetting Password...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Save New Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-5 text-center">
              <Link
                to="/auth/login"
                className="text-xs text-accent font-bold hover:underline"
              >
                Return to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
