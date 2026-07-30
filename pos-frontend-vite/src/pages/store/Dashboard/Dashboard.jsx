import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import DashboardStats from "./DashboardStats";
import RecentSales from "./RecentSales";
import SalesTrend from "./SalesTrend";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Lock, BadgeDollarSign, ShieldAlert } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { statusResponse } = useSelector((state) => state.storeSubscription);
  const { store } = useSelector((state) => state.store);

  const regStatus = statusResponse?.registrationStatus || store?.status || 'PENDING';
  const subStatus = statusResponse?.subscriptionStatus || 'NONE';
  const isFullyActive = regStatus === 'ACTIVE' && subStatus === 'ACTIVE';

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      {!isFullyActive ? (
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 via-background to-amber-100/30 p-8 shadow-md">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4 py-8">
            <div className="p-4 bg-amber-100 rounded-full text-amber-600">
              <Lock className="w-10 h-10" />
            </div>
            <div className="max-w-md space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">No Active Subscription</h2>
              <p className="text-muted-foreground text-sm">
                Your store registration or plan subscription is currently inactive. Subscribe or upgrade your plan to unlock business statistics, products, sales, and branch features.
              </p>
            </div>
            <Button onClick={() => navigate('/store/upgrade')} className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white">
              <BadgeDollarSign className="w-4 h-4 mr-2" /> Upgrade Plan / View Status
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Overview */}
          <DashboardStats />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Recent Sales */}
            <RecentSales />

            {/* Sales Trend */}
            <SalesTrend />
          </div>
        </>
      )}
    </div>
  );
}