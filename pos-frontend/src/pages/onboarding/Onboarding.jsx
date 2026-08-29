import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import OwnerDetailsForm from "./OwnerDetailsForm";
import StoreDetailsForm from "./StoreDetailsForm";
import { completeOnboarding } from "../../Redux Toolkit/features/onboarding/onboardingThunk";
import { getStoreByAdmin } from "../../Redux Toolkit/features/store/storeThunks";
import { getUserProfile } from "../../Redux Toolkit/features/user/userThunks";
import { useNavigate, Link } from "react-router";
import { useToast } from "../../components/ui/use-toast";
import { ShoppingCart, CheckCircle2, Store as StoreIcon, ShieldCheck, ArrowLeft } from "lucide-react";

const Onboarding = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isCompleted } = useSelector((state) => state.onboarding);

  const [step, setStep] = useState(1);
  const [fadeIn, setFadeIn] = useState(true);
  const [formData, setFormData] = useState({
    // Owner Details
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Store Details
    storeName: "",
    storeType: "",
    storeAddress: "",
  });
  const [localError, setLocalError] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);

  // On mount: check JWT, fetch profile, and store
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
                navigate("/store");
                return;
              } else {
                setStep(2);
              }
            } catch {
              setStep(2);
            }
          }
        } catch {
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
      // Step 1: Save owner details locally and advance to Step 2
      setFadeIn(false);
      setTimeout(() => {
        setStep(2);
        setFadeIn(true);
      }, 150);
    } else if (step === 2) {
      // Step 2: Atomic onboarding request creating both Store Admin User and Store
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
        navigate("/store");
      } catch (err) {
        const msg =
          typeof err === "string"
            ? err
            : err?.message || "Onboarding submission failed";
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
        title: "Registration Complete",
        description: "Your store setup is complete. Welcome to NexPOS!",
      });
      navigate("/store");
    }
  }, [isCompleted, toast, navigate]);

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-accent selection:text-accent-foreground">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        {/* Brand Logo & Back to Home */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center space-x-2.5 cursor-pointer mb-3"
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
            Retail Store Registration
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure your store admin credentials and initial retail business profile
          </p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-xs mb-6">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className={step >= 1 ? "text-accent" : "text-muted-foreground"}>
              1. Administrator Account
            </span>
            <span className={step >= 2 ? "text-accent" : "text-muted-foreground"}>
              2. Store Profile
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-accent h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Error Notification */}
        {localError && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl shadow-2xs">
            {localError}
          </div>
        )}

        {/* Form Container */}
        <Card className="rounded-2xl border border-border bg-card shadow-sm p-7">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-lg font-bold text-foreground">
              {step === 1 ? "Step 1: Admin Credentials" : "Step 2: Store Information"}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {step === 1
                ? "Enter the primary administrator email and password"
                : "Enter your store brand name, business category, and address"}
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div
              className={`transition-all duration-200 ${
                fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              {step === 1 ? (
                <OwnerDetailsForm
                  initialValues={{
                    fullName: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword,
                  }}
                  onSubmit={handleStepSubmit}
                />
              ) : (
                <StoreDetailsForm
                  initialValues={{
                    storeName: formData.storeName,
                    storeType: formData.storeType,
                    storeAddress: formData.storeAddress,
                  }}
                  onSubmit={handleStepSubmit}
                  onBack={handleStepBack}
                  isLoading={localLoading}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            Already registered?{" "}
            <Link to="/auth/login" className="text-accent font-bold hover:underline">
              Sign in to Terminal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;