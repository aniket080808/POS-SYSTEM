import React, { useEffect, useRef, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { StatCard } from "../../components/ui/stat-card";
import { Store, Clock, TrendingUp, AlertTriangle, RefreshCw, Loader2, Wifi, WifiOff, CheckCircle2, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Client } from "@stomp/stompjs";
import {
  getDashboardSummary,
  getStoreRegistrationStats,
  getStoreStatusDistribution,
  getRecentActivities
} from "../../Redux Toolkit/features/adminDashboard/adminDashboardThunks";

const COLORS = ["#10b981", "#f59e0b", "#ef4444"];
const POLLING_INTERVAL = 30000;

function getRelativeTime(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getActivityColor(action, status) {
  const actionUpper = (action || "").toUpperCase();
  const statusUpper = (status || "").toUpperCase();

  if (actionUpper.includes("APPROVED") || actionUpper.includes("ACTIVE") || statusUpper === "ACTIVE") {
    return "bg-emerald-500 ring-emerald-500/20";
  }
  if (actionUpper.includes("BLOCKED") || actionUpper.includes("REJECTED") || actionUpper.includes("DELETED") || statusUpper === "BLOCKED") {
    return "bg-destructive ring-destructive/20";
  }
  if (actionUpper.includes("PENDING") || actionUpper.includes("REGISTERED") || statusUpper === "PENDING") {
    return "bg-amber-500 ring-amber-500/20";
  }
  return "bg-primary ring-primary/20";
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const pollingRef = useRef(null);
  const stompClientRef = useRef(null);
  const [wsConnected, setWsConnected] = useState(false);
  const {
    dashboardSummary,
    storeRegistrationStats,
    storeStatusDistribution,
    recentActivities,
    activitiesLoading,
    activitiesError,
    loading,
    error
  } = useSelector((state) => state.adminDashboard);

  const fetchActivities = useCallback(() => {
    dispatch(getRecentActivities());
  }, [dispatch]);

  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const wsUrl = apiUrl.replace(/^http/, 'ws') + '/ws/websocket';
    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setWsConnected(true);
        client.subscribe("/topic/activities", (message) => {
          try {
            dispatch(getRecentActivities());
          } catch (e) {
            console.error("Failed to parse WebSocket message:", e);
          }
        });
      },
      onDisconnect: () => {
        setWsConnected(false);
      },
      onStompError: (frame) => {
        setWsConnected(false);
      },
    });

    if (!stompClientRef.current?.active) {
      client.activate();
      stompClientRef.current = client;
    }

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(getDashboardSummary());
    dispatch(getStoreRegistrationStats());
    dispatch(getStoreStatusDistribution());
    fetchActivities();

    pollingRef.current = setInterval(() => {
      if (!stompClientRef.current?.active) {
        fetchActivities();
      }
    }, POLLING_INTERVAL);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [dispatch, fetchActivities]);

  const barData = storeRegistrationStats?.map((item) => ({
    date: item.date || item.day || item.label,
    stores: item.count || item.value || 0
  })) || [];

  const pieData = storeStatusDistribution
    ? [
        { name: "Active", value: storeStatusDistribution.active, color: COLORS[0] },
        { name: "Pending", value: storeStatusDistribution.pending, color: COLORS[1] },
        { name: "Blocked", value: storeStatusDistribution.blocked, color: COLORS[2] },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Page Title & Live Stream Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Platform Overview</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            System performance, tenant health, and registration activity across all registered retail stores.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            wsConnected 
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
          }`}>
            {wsConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Gateway</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                <span>Polling (30s)</span>
              </>
            )}
          </div>

          <button
            onClick={() => {
              dispatch(getDashboardSummary());
              dispatch(getStoreRegistrationStats());
              dispatch(getStoreStatusDistribution());
              fetchActivities();
            }}
            disabled={loading || activitiesLoading}
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${loading || activitiesLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Store Tenants"
          value={dashboardSummary?.totalStores ?? "—"}
          icon={Store}
          description="Registered brand accounts"
          badgeText="All Stores"
        />
        <StatCard
          title="Active & Operating"
          value={dashboardSummary?.activeStores ?? "—"}
          icon={TrendingUp}
          description="Approved live retail stores"
          badgeText="Operational"
        />
        <StatCard
          title="Pending Moderation"
          value={dashboardSummary?.pendingStores ?? "—"}
          icon={Clock}
          description="Awaiting super admin review"
          badgeText="Action Needed"
        />
        <StatCard
          title="Suspended / Blocked"
          value={dashboardSummary?.blockedStores ?? "—"}
          icon={AlertTriangle}
          description="Restricted tenant accounts"
          badgeText="Suspended"
        />
      </div>

      {/* Analytics Visualizations */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Registration Velocity Bar Chart */}
        <Card className="lg:col-span-8 rounded-2xl border-border/80 shadow-2xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-foreground">
              New Store Registrations (Past 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/60" />
                  <XAxis
                    dataKey="date"
                    stroke="currentColor"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground font-mono"
                  />
                  <YAxis
                    stroke="currentColor"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    className="text-muted-foreground font-mono"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                  />
                  <Bar
                    dataKey="stores"
                    fill="currentColor"
                    radius={[6, 6, 0, 0]}
                    className="fill-primary"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-xs text-muted-foreground">
                No registration trends available for this period.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Store Status Distribution */}
        <Card className="lg:col-span-4 rounded-2xl border-border/80 shadow-2xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-foreground">
              Tenant Health Ratio
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {pieData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '0.75rem',
                      fontSize: '12px'
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-xs text-muted-foreground">
                No store records found in system.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Real-time Activity Stream */}
      <Card className="rounded-2xl border-border/80 shadow-2xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
          <div>
            <CardTitle className="text-sm font-bold text-foreground">Real-Time Audit Stream</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Live events logged across tenant registration and moderation</p>
          </div>
          <button
            onClick={fetchActivities}
            disabled={activitiesLoading}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${activitiesLoading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {activitiesLoading && recentActivities.length === 0 && (
            <div className="flex items-center justify-center py-10 text-xs text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span>Fetching live event stream...</span>
            </div>
          )}

          {activitiesError && !activitiesLoading && (
            <div className="text-center py-8 text-xs text-destructive">
              <p>{typeof activitiesError === "string" ? activitiesError : "Failed to load audit activities"}</p>
            </div>
          )}

          {!activitiesLoading && !activitiesError && recentActivities.length === 0 && (
            <div className="text-center py-10 text-xs text-muted-foreground">
              <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <span>No administrative activities recorded yet.</span>
            </div>
          )}

          {recentActivities.length > 0 && (
            <div className="space-y-2.5">
              {recentActivities.slice(0, 8).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between gap-4 p-3 rounded-xl bg-card border border-border/60 hover:border-border transition-colors text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2.5 h-2.5 rounded-full ring-4 ${getActivityColor(activity.action, activity.status)} flex-shrink-0`} />
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{activity.description}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {activity.performedBy ? `${activity.performedBy} • ` : ""}
                        <span className="font-mono">{getRelativeTime(activity.createdAt)}</span>
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-muted-foreground uppercase px-2 py-0.5 rounded-md bg-muted/60 flex-shrink-0">
                    {activity.action || "EVENT"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}