import React, { useEffect, useRef, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import {
  Store,
  Clock,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Wifi,
  WifiOff,
  Activity,
  Building2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Client } from "@stomp/stompjs";
import {
  getDashboardSummary,
  getStoreRegistrationStats,
  getStoreStatusDistribution,
  getRecentActivities,
} from "../../Redux Toolkit/features/adminDashboard/adminDashboardThunks";
import { getRelativeTime } from "@/utils/dateUtils";

const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

const POLLING_INTERVAL = 30000;

const StatCard = ({ title, value, icon, description, badgeColor = "bg-primary/10 text-primary" }) => (
  <Card className="rounded-2xl border border-border/80 shadow-2xs">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
        {title}
      </CardTitle>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${badgeColor}`}>
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-extrabold tracking-tight text-foreground">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">
        {description}
      </p>
    </CardContent>
  </Card>
);

function getActivityColor(action, status) {
  const actionUpper = (action || "").toUpperCase();
  const statusUpper = (status || "").toUpperCase();

  if (
    actionUpper.includes("APPROVED") ||
    actionUpper.includes("ACTIVE") ||
    statusUpper === "ACTIVE"
  ) {
    return "bg-emerald-500";
  }
  if (
    actionUpper.includes("BLOCKED") ||
    actionUpper.includes("REJECTED") ||
    actionUpper.includes("DELETED") ||
    statusUpper === "BLOCKED"
  ) {
    return "bg-red-500";
  }
  if (
    actionUpper.includes("PENDING") ||
    actionUpper.includes("REGISTERED") ||
    statusUpper === "PENDING"
  ) {
    return "bg-amber-500";
  }
  return "bg-blue-500";
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
    error,
  } = useSelector((state) => state.adminDashboard);

  const fetchActivities = useCallback(() => {
    dispatch(getRecentActivities());
  }, [dispatch]);

  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const wsUrl = apiUrl.replace(/^http/, "ws") + "/ws/websocket";
    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setWsConnected(true);
        client.subscribe("/topic/activities", () => {
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
        console.error("STOMP error:", frame.headers["message"]);
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

  const barData =
    storeRegistrationStats?.map((item) => ({
      date: item.date || item.day || item.label,
      stores: item.count || item.value || 0,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Platform Overview
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Network statistics, merchant store registrations, and real-time operational telemetry
          </p>
        </div>

        {/* Live Telemetry Status */}
        <div className="inline-flex items-center gap-2 bg-card border border-border/80 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xs">
          {wsConnected ? (
            <>
              <Wifi className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-600 font-bold">WebSocket Live</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-amber-600 font-bold">Polling Active (30s)</span>
            </>
          )}
        </div>
      </div>

      {loading && <div className="text-center py-6 text-xs text-muted-foreground">Loading platform metrics...</div>}
      {error && <div className="text-center py-6 text-xs text-red-500 font-medium">{error}</div>}

      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Registered Stores"
          value={dashboardSummary?.totalStores ?? "—"}
          icon={<Store className="h-4 w-4" />}
          description="Total merchant stores in network"
          badgeColor="bg-primary/10 text-primary"
        />
        <StatCard
          title="Active Operational Stores"
          value={dashboardSummary?.activeStores ?? "—"}
          icon={<TrendingUp className="h-4 w-4" />}
          description="Currently active & processing orders"
          badgeColor="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Pending Approval Requests"
          value={dashboardSummary?.pendingStores ?? "—"}
          icon={<Clock className="h-4 w-4" />}
          description="Merchant registrations awaiting review"
          badgeColor="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Suspended / Blocked Stores"
          value={dashboardSummary?.blockedStores ?? "—"}
          icon={<AlertTriangle className="h-4 w-4" />}
          description="Flagged accounts requiring moderation"
          badgeColor="bg-red-50 text-red-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4 rounded-2xl border border-border/80 shadow-2xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-foreground">
              Store Registrations (Last 7 Days)
            </CardTitle>
            <CardDescription className="text-xs">
              Daily merchant onboarding velocity across all regions
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis
                  dataKey="date"
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "0.75rem",
                    fontSize: "0.75rem",
                  }}
                />
                <Bar
                  dataKey="stores"
                  fill="#d97706"
                  radius={[6, 6, 0, 0]}
                  name="New Stores"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 rounded-2xl border border-border/80 shadow-2xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-foreground">
              Store Status Distribution
            </CardTitle>
            <CardDescription className="text-xs">
              Active, pending review, and suspended store status share
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    percent === 0 ? null : `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={85}
                  innerRadius={45}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "0.75rem",
                    fontSize: "0.75rem",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "0.75rem", paddingTop: "0.5rem" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Operational Activity */}
      <Card className="rounded-2xl border border-border/80 shadow-2xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              Live Platform Activity Log
            </CardTitle>
            <CardDescription className="text-xs">
              Real-time audit log of store creations, approvals, and administrator actions
            </CardDescription>
          </div>
          <button
            onClick={fetchActivities}
            disabled={activitiesLoading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${activitiesLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </CardHeader>
        <CardContent>
          {activitiesLoading && recentActivities.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-xs text-muted-foreground">Loading telemetry...</span>
            </div>
          )}

          {activitiesError && !activitiesLoading && (
            <div className="text-center py-6 text-xs text-red-500">
              {typeof activitiesError === "string"
                ? activitiesError
                : "Failed to load recent activities"}
            </div>
          )}

          {!activitiesLoading && !activitiesError && recentActivities.length === 0 && (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No recent administrative activity recorded.
            </div>
          )}

          {recentActivities.length > 0 && (
            <div className="space-y-2.5">
              {recentActivities.slice(0, 8).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3.5 p-3 rounded-xl border border-border/60 bg-card hover:bg-muted/30 transition-colors"
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${getActivityColor(
                      activity.action,
                      activity.status
                    )}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {activity.description}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {activity.performedBy ? `${activity.performedBy} · ` : ""}
                      {getRelativeTime(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}