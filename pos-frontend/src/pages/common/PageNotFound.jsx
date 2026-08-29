import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Home, ArrowLeft, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router";

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center p-6 text-center selection:bg-accent selection:text-accent-foreground">
      <div className="max-w-md w-full bg-card rounded-2xl border border-border p-8 shadow-sm space-y-6">
        {/* Brand */}
        <div
          className="inline-flex items-center justify-center space-x-2.5 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-xs">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-foreground">
            NexPOS
          </span>
        </div>

        {/* 404 Visual Number */}
        <div className="space-y-2">
          <div className="text-6xl sm:text-7xl font-extrabold tracking-tight text-accent font-mono">
            404
          </div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            Route Not Found
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            The destination URL does not exist or you may not have active permissions to view this terminal view.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex-1 h-10 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Previous Page
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="flex-1 h-10 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs"
          >
            <Home className="w-4 h-4 mr-1.5" />
            Return Home
          </Button>
        </div>

        <div className="pt-2 border-t border-border/60">
          <button
            onClick={() => navigate("/auth/login")}
            className="text-xs text-accent font-bold hover:underline cursor-pointer"
          >
            Need to sign in to another portal? Click here
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;