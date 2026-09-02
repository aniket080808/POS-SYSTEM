import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Mail, ArrowLeft, Check, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "../../../Redux Toolkit/features/auth/authThunk";
import { clearForgotPasswordState } from "../../../Redux Toolkit/features/auth/authSlice";
import NexPOSLogo from "@/components/common/NexPOSLogo";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { forgotPasswordLoading } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Validation Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    try {
      const resultAction = await dispatch(forgotPassword(email));
      if (forgotPassword.fulfilled.match(resultAction)) {
        setEmailSent(true);
        toast({
          title: "Reset Link Dispatched",
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

  const handleReset = () => {
    dispatch(clearForgotPasswordState());
    setEmailSent(false);
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="flex justify-center mb-4">
          <NexPOSLogo size="lg" onClick={() => navigate("/")} />
        </div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">
          {emailSent ? "Check Your Email" : "Forgot your password?"}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {emailSent
            ? `We've sent password reset instructions to ${email}`
            : "Enter your registered email address to receive a secure recovery link"}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-md">
          {emailSent ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 rounded-full bg-[#262422] text-[#FAF8F3] flex items-center justify-center mx-auto shadow-sm">
                <Check className="w-6 h-6 stroke-[3] text-[#C9A227]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Reset Link Dispatched
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  If an account with that email exists, you will receive a recovery link valid for 5 minutes.
                </p>
              </div>
              <div className="space-y-2 pt-2">
                <Button
                  onClick={() => {
                    handleReset();
                    navigate("/auth/login");
                  }}
                  className="w-full text-xs h-10 font-bold"
                >
                  Return to Sign In
                </Button>
                <button
                  type="button"
                  onClick={() => setEmailSent(false)}
                  className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
                >
                  Didn't receive email? Try another address
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Registered Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  onClick={() => {
                    handleReset();
                    navigate("/auth/login");
                  }}
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 text-xs h-10 font-bold"
                  disabled={forgotPasswordLoading}
                >
                  {forgotPasswordLoading ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </div>
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

export default ForgotPassword;
