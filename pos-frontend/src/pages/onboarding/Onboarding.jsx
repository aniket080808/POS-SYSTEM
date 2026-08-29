import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import OwnerDetailsForm from './OwnerDetailsForm';
import StoreDetailsForm from './StoreDetailsForm';
import { completeOnboarding } from '../../Redux Toolkit/features/onboarding/onboardingThunk';
import { getStoreByAdmin } from '../../Redux Toolkit/features/store/storeThunks';
import { getUserProfile } from '../../Redux Toolkit/features/user/userThunks';
import { useNavigate, Link } from 'react-router';
import { useToast } from '../../components/ui/use-toast';
import { ThemeToggle } from '../../components/theme-toggle';
import { Store, ShieldCheck, Check, Layers, BarChart3, Receipt, Sparkles } from 'lucide-react';

const Onboarding = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loading, error, isCompleted } = useSelector((state) => state.onboarding);
  
  const [step, setStep] = useState(1);
  const [fadeIn, setFadeIn] = useState(true);
  const [formData, setFormData] = useState({
    // Owner Details
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Store Details
    storeName: '',
    storeType: '',
    storeAddress: '',
  });
  const [localError, setLocalError] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);

  // On mount: check JWT, fetch profile, and store
  useEffect(() => {
    const checkOnboarding = async () => {
      const jwt = localStorage.getItem('jwt');
      
      if (jwt) {
        setLocalLoading(true);
        try {
          const userRes = await dispatch(getUserProfile(jwt)).unwrap();
          if (userRes && userRes.role === 'ROLE_STORE_ADMIN') {
            try {
              const storeRes = await dispatch(getStoreByAdmin(jwt)).unwrap();
              if (storeRes && storeRes.id) {
                navigate('/store');
                return;
              } else {
                setStep(2);
              }
            } catch (err) {
              setStep(2);
            }
          }
        } catch (err) {
          localStorage.removeItem('jwt');
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
      if (updatedFormData.password && updatedFormData.confirmPassword && updatedFormData.password !== updatedFormData.confirmPassword) {
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
        await dispatch(completeOnboarding({
          fullName: updatedFormData.fullName,
          email: updatedFormData.email,
          password: updatedFormData.password,
          storeName: updatedFormData.storeName,
          storeType: updatedFormData.storeType,
          storeAddress: updatedFormData.storeAddress,
        })).unwrap();
        navigate('/store');
      } catch (err) {
        const msg = typeof err === 'string' ? err : (err?.message || 'Onboarding failed');
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

  // Handle successful completion
  useEffect(() => {
    if (isCompleted) {
      toast({
        title: "Success",
        description: "Onboarding completed successfully!",
      });
      navigate('/store');
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
    <div className="min-h-screen bg-background flex flex-col lg:flex-row relative selection:bg-primary/20">
      {/* Theme Toggle Top Right */}
      <div className="absolute top-4 right-4 z-30">
        <ThemeToggle />
      </div>

      {/* Left Feature Showcase Banner (Desktop) */}
      <div className="hidden lg:flex lg:w-5/12 bg-muted/40 border-r border-border/70 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-card border border-border shadow-2xs mb-8">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-xs">
              <Store className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">NexPOS</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">
            Power your business with an enterprise-ready retail engine
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            Join modern merchants managing multi-terminal checkouts, inventory tracking, branch shifts, and realtime revenue analytics.
          </p>

          {/* Capabilities based on real codebase features */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">High-Speed POS Terminal</h4>
                <p className="text-xs text-muted-foreground">Barcode scanning, cash drawer management, and instant invoice receipts.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Multi-Branch Architecture</h4>
                <p className="text-xs text-muted-foreground">Manage centralized catalogs with branch-level inventory control & staff roles.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Financial & Shift Analytics</h4>
                <p className="text-xs text-muted-foreground">Comprehensive PDF/Excel export reports, cashier shift summaries, and metrics.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-border/60">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-bit SSL encrypted & role-gated POS system</span>
          </div>
        </div>
      </div>

      {/* Right Form Card */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 min-h-screen">
        <div className="w-full max-w-md">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Step {step} of 2
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {step === 1 ? '1. Owner Credentials' : '2. Store Details'}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(step / 2) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Card Container */}
          <Card className="border border-border/80 shadow-sm rounded-2xl bg-card">
            <CardHeader className="text-left pb-4 pt-6 px-6">
              <CardTitle className="text-xl font-bold tracking-tight text-foreground">
                {step === 1 ? 'Create Store Admin Account' : 'Set Up Store Profile'}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {step === 1
                  ? 'Enter your administrative credentials to manage your store.'
                  : 'Enter your business details to configure your primary branch.'}
              </p>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0">
              {/* Error Notice */}
              {(error || localError) && (
                <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  {typeof (error || localError) === 'object'
                    ? ((error || localError)?.message || String(error || localError))
                    : (error || localError)}
                </div>
              )}

              <div
                className={`transition-all duration-200 ${
                  fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
              >
                {renderStep()}
              </div>
            </CardContent>
          </Card>

          {/* Footer Back to Login */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Already registered?{' '}
              <Link to="/auth/login" className="text-primary font-semibold hover:underline">
                Sign in to your account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding; 