import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { ArrowLeft, Store, AlertCircle } from "lucide-react";

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-card rounded-3xl p-8 border border-border shadow-md space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#FDF6E2] border border-[#EED896] dark:bg-[#3A3530] dark:border-[#5A4F3D] flex items-center justify-center mx-auto text-[#B8860B] dark:text-[#F5A623] shadow-2xs">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#785600] dark:text-[#F5A623] bg-[#FDF6E2] dark:bg-[#3A3530] px-3 py-1 rounded-full border border-[#EED896] dark:border-[#5A4F3D]">
            Error 404
          </span>
          <h1 className="text-2xl font-black text-foreground tracking-tight pt-2">
            Page Not Found
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The requested screen or workstation path does not exist or has been moved to another route.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex-1 text-xs h-10"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Previous Page
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="flex-1 text-xs h-10 font-bold"
          >
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;