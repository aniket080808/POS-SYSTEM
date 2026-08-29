import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Mail, ShoppingCart, CheckCircle2, ArrowLeft, Send } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "../../../Redux Toolkit/features/auth/authThunk";
import { clearForgotPasswordState } from "../../../Redux Toolkit/features/auth/authSlice";

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
        description: "Please enter your registered email address",
        variant: "destructive",
      });
      return;
    }

    try {
      const resultAction = await dispatch(forgotPassword(email));
      if (forgotPassword.fulfilled.match(resultAction)) {
        setEmailSent(true);
        toast({
          title: "Dispatched",
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

  const handleReset = () => {
    dispatch(clearForgotPasswordState());
    setEmailSent(false);
    setEmail("");
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
            {emailSent ? "Check Your Inbox" : "Forgot Password"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {emailSent
              ? `Password reset link was dispatched to ${email}`
              : "Enter your registered email address to receive password recovery instructions"}
          </p>
        </div>

        {/* Success State */}
        {emailSent ? (
          <div className="bg-card rounded-2xl shadow-sm border border-border p-7 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Reset Link Dispatched
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                If an account with that email exists, you will receive a secure password reset link (valid for 5 minutes).
              </p>
            </div>
            <div className="space-y-2.5 pt-2">
              <Button
                onClick={() => {
                  handleReset();
                  navigate("/auth/login");
                }}
                className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold"
              >
                Return to Sign In
              </Button>
              <button
                onClick={() => setEmailSent(false)}
                className="text-xs text-accent font-bold hover:underline cursor-pointer"
              >
                Didn't receive it? Try another email
              </button>
            </div>
          </div>
        ) : (
          /* Forgot Password Form */
          <div className="bg-card rounded-2xl shadow-sm border border-border p-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
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
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  onClick={() => {
                    handleReset();
                    navigate("/auth/login");
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Back to Sign In
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-10 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs"
                  disabled={forgotPasswordLoading}
                >
                  {forgotPasswordLoading ? (
                    <div className="flex items-center gap-1.5">
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-primary-foreground border-t-transparent" />
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span>Send Link</span>
                      <Send className="w-3.5 h-3.5" />
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
