import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import OwnerDetailsForm from "./OwnerDetailsForm";
import StoreDetailsForm from "./StoreDetailsForm";
import { completeOnboarding } from "../../Redux Toolkit/features/onboarding/onboardingThunk";
import { getStoreByAdmin } from "../../Redux Toolkit/features/store/storeThunks";
import { getUserProfile } from "../../Redux Toolkit/features/user/userThunks";
import { useNavigate, Link, useSearchParams } from "react-router";
import { useToast } from "../../components/ui/use-toast";
import { Store, User, Check, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import NexPOSLogo from "@/components/common/NexPOSLogo";

const Onboarding = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPlanName = searchParams.get("planName");
  const selectedPlanPrice = searchParams.get("price");
  const { toast } = useToast();
  const { isCompleted } = useSelector((state) => state.onboarding);

  const [step, setStep] = useState(1);
  const [fadeIn, setFadeIn] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    storeName: "",
    storeType: "",
    storeAddress: "",
  });
  const [localError, setLocalError] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      const jwt = localStorage.getItem("jwt");
      if (jwt) {
        setLocalLoading(true);
        try {
          const userRes = await dispatch(getUserProfile(jwt)).unwrap();
          if (userRes && userRes.role === "ROLE_STORE_ADMIN") {
            try {
              const storeRes = await dispatch(getStoreByAdmin(jwt)).unwrap();
              if (storeRes && storeRes.id) {
                navigate("/store/dashboard");
                return;
              } else {
                setStep(2);
              }
            } catch (err) {
              setStep(2);
            }
          }
        } catch (err) {
          localStorage.removeItem("jwt");
        }
        setLocalLoading(false);
      }
    };
    checkOnboarding();
  }, [dispatch, navigate]);

  const handleStepSubmit = async (stepData) => {
    setLocalError(null);
    const updatedFormData = { ...formData, ...stepData };
    setFormData(updatedFormData);

    if (step === 1) {
      if (
        updatedFormData.password &&
        updatedFormData.confirmPassword &&
        updatedFormData.password !== updatedFormData.confirmPassword
      ) {
        setLocalError("Passwords do not match");
        return;
      }
      setFadeIn(false);
      setTimeout(() => {
        setStep(2);
        setFadeIn(true);
      }, 150);
    } else if (step === 2) {
      setLocalLoading(true);
      try {
        await dispatch(
          completeOnboarding({
            fullName: updatedFormData.fullName,
            email: updatedFormData.email,
            password: updatedFormData.password,
            storeName: updatedFormData.storeName,
            storeType: updatedFormData.storeType,
            storeAddress: updatedFormData.storeAddress,
          })
        ).unwrap();
        navigate("/store/dashboard");
      } catch (err) {
        const msg =
          typeof err === "string" ? err : err?.message || "Onboarding failed";
        setLocalError(msg);
      }
      setLocalLoading(false);
    }
  };

  const handleStepBack = () => {
    if (step > 1) {
      setFadeIn(false);
      setTimeout(() => {
        setStep(step - 1);
        setFadeIn(true);
      }, 150);
    }
  };

  useEffect(() => {
    if (isCompleted) {
      toast({
        title: "Store Setup Submitted",
        description: "Your registration is now pending Super Admin approval.",
      });
      navigate("/store/dashboard");
    }
  }, [isCompleted, toast, navigate]);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <OwnerDetailsForm
            initialValues={{
              fullName: formData.fullName,
              email: formData.email,
              password: formData.password,
              confirmPassword: formData.confirmPassword,
            }}
            onSubmit={handleStepSubmit}
            onBack={handleStepBack}
          />
        );
      case 2:
        return (
          <StoreDetailsForm
            initialValues={{
              storeName: formData.storeName,
              storeType: formData.storeType,
              storeAddress: formData.storeAddress,
            }}
            onSubmit={handleStepSubmit}
            onBack={handleStepBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="max-w-md w-full mx-auto text-center mb-6">
        <div className="flex justify-center mb-4">
          <NexPOSLogo size="lg" onClick={() => navigate("/")} />
        </div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">
          Register Your Store Account
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Complete initial setup to submit your store profile for verification
        </p>
      </div>

      <div className="max-w-md w-full mx-auto">
        {/* Step Progress Bar */}
        <div className="bg-card rounded-2xl p-4 border border-border mb-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-foreground mb-2">
            <span className="flex items-center gap-1.5">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 1 ? "bg-primary text-primary-foreground" : "bg-[#262422] text-white"}`}>
                {step > 1 ? <Check className="w-3 h-3" /> : "1"}
              </span>
              Owner Profile
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 2 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                2
              </span>
              Store Configuration
            </span>
          </div>
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Selected Plan Banner */}
        {selectedPlanName && (
          <div className="mb-4 p-3 bg-[#FDF6E2] dark:bg-[#3A3530] border border-[#EED896] dark:border-[#5A4F3D] text-[#785600] dark:text-[#F5A623] rounded-2xl text-xs font-semibold flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#B8860B] dark:text-[#F5A623]" />
              <span>
                Selected Plan: <strong>{selectedPlanName}</strong>
              </span>
            </div>
            {selectedPlanPrice && (
              <span className="font-mono font-bold text-xs bg-white/80 dark:bg-black/40 px-2 py-0.5 rounded-lg border border-[#EED896] dark:border-[#5A4F3D]">
                ₹{Number(selectedPlanPrice).toLocaleString()}/mo
              </span>
            )}
          </div>
        )}

        {/* Error Notification */}
        {localError && (
          <div className="mb-4 p-3.5 bg-[#FBF0EC] dark:bg-destructive/20 border border-[#EFC8BD] dark:border-destructive/40 text-[#7A331E] dark:text-red-300 rounded-2xl text-xs font-medium flex items-start gap-2">
            <span className="font-bold shrink-0">Registration Notice:</span>
            <span>{localError}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-md relative">
          {localLoading && (
            <div className="absolute inset-0 bg-card/70 backdrop-blur-xs rounded-3xl flex items-center justify-center z-20">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
                <p className="text-xs font-bold text-foreground">Configuring your store account...</p>
              </div>
            </div>
          )}

          <div
            className={`transition-all duration-200 ${
              fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            {renderStep()}
          </div>
        </div>

        {/* Sign In Link */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            Already have a store account?{" "}
            <Link
              to="/auth/login"
              className="font-bold text-foreground hover:text-primary transition-colors underline underline-offset-4 decoration-[#C9A227]"
            >
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;