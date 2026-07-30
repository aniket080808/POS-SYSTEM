import React, { useEffect, useRef, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Store, Clock, TrendingUp, AlertTriangle, RefreshCw, Loader2, Wifi, WifiOff } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Client } from "@stomp/stompjs";
import {
  getDashboardSummary,
  getStoreRegistrationStats,
  getStoreStatusDistribution,
  getRecentActivities
} from "../../Redux Toolkit/features/adminDashboard/adminDashboardThunks";

const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

const POLLING_INTERVAL = 30000; // 30 seconds (fallback when WebSocket is unavailable)

const StatCard = ({ title, value, icon, description, trend }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        {trend !== undefined && (
          <span className={trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : ""}>
            {trend > 0 ? "+" : ""}{trend}%
          </span>
        )}
        {description}
      </p>
    </CardContent>
  </Card>
);

/**
 * Returns a human-readable relative time string.
 * e.g. "2 minutes ago", "1 hour ago", "Yesterday", "3 days ago"
 */
function getRelativeTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

/**
 * Returns the appropriate color dot for an activity based on its action/status.
 */
function getActivityColor(action, status) {
  const actionUpper = (action || "").toUpperCase();
  const statusUpper = (status || "").toUpperCase();

  if (actionUpper.includes("APPROVED") || actionUpper.includes("ACTIVE") || statusUpper === "ACTIVE") {
    return "bg-green-500";
  }
  if (actionUpper.includes("BLOCKED") || actionUpper.includes("REJECTED") || actionUpper.includes("DELETED") || statusUpper === "BLOCKED") {
    return "bg-red-500";
  }
  if (actionUpper.includes("PENDING") || actionUpper.includes("REGISTERED") || statusUpper === "PENDING") {
    return "bg-yellow-500";
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
      debug: (str) => {
        // Uncomment for debugging WebSocket
        // console.log('WS:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setWsConnected(true);
        console.log("✅ WebSocket connected for real-time activities");
        client.subscribe("/topic/activities", (message) => {
          try {
            const newActivity = JSON.parse(message.body);
            // Fetch activities to get the latest list
            dispatch(getRecentActivities());
          } catch (e) {
            console.error("Failed to parse WebSocket message:", e);
          }
        });
      },
      onDisconnect: () => {
        setWsConnected(false);
        console.log("❌ WebSocket disconnected");
      },
      onStompError: (frame) => {
        setWsConnected(false);
        console.error("STOMP error:", frame.headers["message"]);
      },
    });

    // Only activate WebSocket if not already connected
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

    // Set up polling only if WebSocket is not connected
    // The interval checks wsConnected state to avoid duplicate requests
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

  // Prepare data for charts
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of all stores and system statistics
          </p>
        </div>
        {/* Connection Status Indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {wsConnected ? (
            <>
              <Wifi className="h-3 w-3 text-green-500" />
              <span className="text-green-500">Live</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 text-yellow-500" />
              <span className="text-yellow-500">Polling (30s)</span>
            </>
          )}
        </div>
      </div>

      {loading && <div className="text-center py-8">Loading dashboard...</div>}
      {error && <div className="text-center py-8 text-red-500">{error}</div>}

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Stores"
          value={dashboardSummary?.totalStores ?? "-"}
          icon={<Store className="h-4 w-4 text-muted-foreground" />}
          description="from last month"
          trend={undefined}
        />
        <StatCard
          title="Active Stores"
          value={dashboardSummary?.activeStores ?? "-"}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          description="currently operational"
          trend={undefined}
        />
        <StatCard
          title="Blocked Stores"
          value={dashboardSummary?.blockedStores ?? "-"}
          icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
          description="suspended accounts"
          trend={undefined}
        />
        <StatCard
          title="Pending Requests"
          value={dashboardSummary?.pendingStores ?? "-"}
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          description="awaiting approval"
          trend={undefined}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Store Registrations (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={barData}>
                <XAxis
                  dataKey="date"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <Tooltip />
                <Bar
                  dataKey="stores"
                  fill="currentColor"
                  radius={[4, 4, 0, 0]}
                  className="fill-primary"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Store Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity - Real data from backend */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <div className="flex items-center gap-2">
            {wsConnected && (
              <span className="flex items-center gap-1 text-xs text-green-500">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Live
              </span>
            )}
            <button
              onClick={fetchActivities}
              disabled={activitiesLoading}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${activitiesLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Loading State */}
          {activitiesLoading && recentActivities.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading activities...</span>
            </div>
          )}

          {/* Error State */}
          {activitiesError && !activitiesLoading && (
            <div className="text-center py-8">
              <p className="text-sm text-red-500">
                {typeof activitiesError === "string" ? activitiesError : "Failed to load recent activities"}
              </p>
              <button
                onClick={fetchActivities}
                className="mt-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!activitiesLoading && !activitiesError && recentActivities.length === 0 && (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          )}

          {/* Activity List */}
          {recentActivities.length > 0 && (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getActivityColor(activity.action, activity.status)}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
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