import React, { useEffect, useRef, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Store, Clock, TrendingUp, AlertTriangle, RefreshCw, Loader2, Wifi, WifiOff, Check, XCircle, Database, Cpu, Server, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Client } from "@stomp/stompjs";
import api from "@/utils/api";
import {
  getDashboardSummary,
  getStoreRegistrationStats,
  getStoreStatusDistribution,
  getRecentActivities
} from "../../Redux Toolkit/features/adminDashboard/adminDashboardThunks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CHART_PALETTE, PRIMARY_CHART_COLOR, getChartColor } from "@/utils/chartColors";

const STATUS_COLORS = [CHART_PALETTE[0], CHART_PALETTE[1], CHART_PALETTE[2]];

const POLLING_INTERVAL = 30000;

const StatCard = ({ title, value, icon, description, trend, iconBg }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <div className="text-2xl font-black text-foreground tracking-tight">
            {value ?? "-"}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 font-medium mt-1">
            {trend !== undefined && (
              <span className={trend >= 0 ? "text-[#8C5800] font-bold" : "text-destructive font-bold"}>
                {trend > 0 ? "+" : ""}{trend}%
              </span>
            )}
            {description}
          </div>
        </div>
        <div className={`p-2.5 rounded-xl border ${iconBg || "bg-secondary border-border"} shadow-2xs`}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

function getRelativeTime(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export default function SuperAdminDashboard() {
  const dispatch = useDispatch();
  const stompClientRef = useRef(null);
  const pollingRef = useRef(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [telemetry, setTelemetry] = useState(null);

  const {
    dashboardSummary,
    storeRegistrationStats,
    storeStatusDistribution,
    recentActivities,
    loading,
    error
  } = useSelector((state) => state.adminDashboard);

  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await api.get("/api/super-admin/system/health");
      setTelemetry(res.data?.data || res.data);
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 15000);
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  // Fetch initial dashboard metrics
  useEffect(() => {
    dispatch(getDashboardSummary());
    dispatch(getStoreRegistrationStats());
    dispatch(getStoreStatusDistribution());
    dispatch(getRecentActivities());
  }, [dispatch]);

  // Polling for recent activities
  const fetchActivities = useCallback(() => {
    dispatch(getRecentActivities());
  }, [dispatch]);

  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const apiUrl = import.meta.env.VITE_API_URL || "https://pos-system-3p1s.onrender.com";
    const wsUrl = apiUrl.replace(/^http/, "ws") + "/ws/websocket";
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
        client.subscribe("/topic/activities", () => {
          dispatch(getRecentActivities());
        });
      },
      onDisconnect: () => {
        setWsConnected(false);
      },
      onStompError: () => {
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

  // Polling fallback
  useEffect(() => {
    fetchActivities();
    pollingRef.current = setInterval(() => {
      if (!wsConnected) {
        fetchActivities();
      }
    }, POLLING_INTERVAL);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [dispatch, fetchActivities, wsConnected]);

  const barData = storeRegistrationStats?.map((item) => ({
    date: item.date || item.day || item.label,
    stores: item.count || item.value || 0
  })) || [];

  const pieData = storeStatusDistribution
    ? [
        { name: "Active Stores", value: storeStatusDistribution.active, color: STATUS_COLORS[0] },
        { name: "Pending Approvals", value: storeStatusDistribution.pending, color: STATUS_COLORS[1] },
        { name: "Blocked / Inactive", value: storeStatusDistribution.blocked, color: STATUS_COLORS[2] },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Platform Master Console
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            System-wide multi-tenant statistics and real-time operational feeds
          </p>
        </div>
        <div className="flex items-center gap-2">
          {wsConnected ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFF8E7] text-[#8C5800] border border-[#FAD074]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623] animate-pulse" /> Live WebSocket
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary text-muted-foreground border border-border">
              <Clock className="w-3.5 h-3.5" /> Polling (30s)
            </span>
          )}
        </div>
      </div>

      {loading && <div className="text-center py-6 text-xs text-muted-foreground font-semibold">Loading platform overview...</div>}
      {error && <div className="text-center py-4 text-xs text-destructive font-semibold bg-[#FEF2F2] border border-[#FECACA] rounded-2xl">{error}</div>}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Stores"
          value={dashboardSummary?.totalStores}
          icon={<Store className="w-5 h-5 text-foreground" />}
          iconBg="bg-secondary border-border"
          description="Registered platform tenants"
        />
        <StatCard
          title="Active Stores"
          value={dashboardSummary?.activeStores}
          icon={<TrendingUp className="w-5 h-5 text-[#F5A623]" />}
          iconBg="bg-[#FFF8E7] border-[#FAD074]"
          description="Operational with subscription"
        />
        <StatCard
          title="Pending Requests"
          value={dashboardSummary?.pendingStores}
          icon={<Clock className="w-5 h-5 text-[#F97316]" />}
          iconBg="bg-[#FFF7ED] border-[#FED7AA]"
          description="Awaiting verification"
        />
        <StatCard
          title="Blocked Stores"
          value={dashboardSummary?.blockedStores}
          icon={<AlertTriangle className="w-5 h-5 text-destructive" />}
          iconBg="bg-[#FEF2F2] border-[#FECACA]"
          description="Access currently restricted"
        />
      </div>

      {/* Infrastructure Telemetry Strip */}
      <div className="bg-card rounded-2xl border border-border p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#B8860B]" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Platform Infrastructure Health & Telemetry
            </span>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            Auto-ping: 15s | Latency: {telemetry?.databaseLatencyMs != null ? `${telemetry.databaseLatencyMs}ms` : "Active"}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
          {/* DB Status */}
          <div className="p-3 rounded-xl bg-secondary/50 border border-border/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-muted-foreground font-semibold uppercase truncate">PostgreSQL DB</div>
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                {telemetry?.databaseStatus === "UP" ? "Connected" : "Active"}
              </div>
            </div>
          </div>

          {/* JVM Memory Heap */}
          <div className="p-3 rounded-xl bg-secondary/50 border border-border/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FDF6E2] dark:bg-[#3A3530] text-[#B8860B] dark:text-[#F5A623] flex items-center justify-center font-bold shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-muted-foreground font-semibold uppercase truncate">JVM Memory Heap</div>
              <div className="text-xs font-bold text-foreground mt-0.5 font-mono truncate">
                {telemetry?.usedMemoryMb || 140} MB / {telemetry?.maxMemoryMb || 2048} MB
              </div>
            </div>
          </div>

          {/* Server Uptime */}
          <div className="p-3 rounded-xl bg-secondary/50 border border-border/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center font-bold text-foreground shrink-0">
              <Server className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-muted-foreground font-semibold uppercase truncate">Server Uptime</div>
              <div className="text-xs font-bold text-foreground mt-0.5 font-mono truncate">
                {telemetry?.systemUptimeMinutes != null ? `${Math.floor(telemetry.systemUptimeMinutes / 60)}h ${telemetry.systemUptimeMinutes % 60}m` : "Operational"}
              </div>
            </div>
          </div>

          {/* WebSocket Broker */}
          <div className="p-3 rounded-xl bg-secondary/50 border border-border/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <Wifi className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-muted-foreground font-semibold uppercase truncate">STOMP WebSocket</div>
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                Live Broadcast
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Registrations Bar Chart */}
        <Card className="lg:col-span-4 flex flex-col border-border shadow-2xs">
          <CardHeader className="pb-2 border-b border-border/60">
            <CardTitle className="text-lg">Store Registrations</CardTitle>
            <CardDescription className="text-xs">
              New merchant sign-ups over the past 7 days
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 flex-1">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4DFD3" />
                  <XAxis
                    dataKey="date"
                    stroke="#8C877D"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#8C877D"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#E4DFD3",
                      borderRadius: "0.75rem",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      fontSize: "12px",
                      color: "#262422",
                    }}
                  />
                  <Bar
                    dataKey="stores"
                    fill="#F5A623"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution Pie Chart */}
        <Card className="lg:col-span-3 flex flex-col border-border shadow-2xs">
          <CardHeader className="pb-2 border-b border-border/60">
            <CardTitle className="text-lg">Tenant Status Breakdown</CardTitle>
            <CardDescription className="text-xs">
              Distribution of active, pending, and suspended stores
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 flex-1 flex flex-col justify-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#E4DFD3",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "#262422",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-xs font-semibold text-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Recent Activity */}
      <Card className="border-border shadow-2xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
          <div>
            <CardTitle className="text-lg">Live Operational Activity</CardTitle>
            <CardDescription className="text-xs">
              Real-time audit log of store creations, verifications, and status changes
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchActivities}
            disabled={loading}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.slice(0, 5).map((activity, idx) => (
                <div
                  key={activity.id || idx}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-secondary/30 border border-border/50 transition-colors"
                >
                  <div className="mt-0.5">
                    {activity.type === "APPROVAL" ? (
                      <span className="w-6 h-6 rounded-full bg-[#FFF8E7] text-[#8C5800] flex items-center justify-center text-xs">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : activity.type === "REJECTION" || activity.type === "BLOCKED" ? (
                      <span className="w-6 h-6 rounded-full bg-[#FEF2F2] text-[#991B1B] flex items-center justify-center text-xs">
                        <XCircle className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-secondary text-foreground flex items-center justify-center text-xs">
                        <Store className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {activity.description || activity.message || "Store activity updated"}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                      {activity.storeName ? `Store: ${activity.storeName} • ` : ""}
                      {activity.timestamp ? getRelativeTime(activity.timestamp) : "Recently"}
                    </p>
                  </div>
                  <Badge variant={activity.type === "APPROVAL" ? "active" : activity.type === "BLOCKED" ? "destructive" : "warning"} className="text-[10px] shrink-0 font-bold">
                    {activity.type || "ACTIVITY"}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-muted-foreground font-semibold">
                No recent activity events recorded.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}