import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, ShieldCheck } from "lucide-react";

const EmployeeStats = ({ employees = [] }) => {
  const activeCount = employees.filter((e) => e.enabled !== false).length;
  const cashierCount = employees.filter((e) => e.role === "ROLE_BRANCH_CASHIER").length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card className="border-border shadow-2xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Roster
            </p>
            <p className="text-2xl font-black font-mono text-foreground mt-1">
              {employees.length}
            </p>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-secondary flex items-center justify-center text-foreground">
            <Users className="h-5 w-5 text-[#B8860B]" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-2xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Active Shift Access
            </p>
            <p className="text-2xl font-black font-mono text-foreground mt-1">
              {activeCount}
            </p>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-[#262422] text-white flex items-center justify-center">
            <UserCheck className="h-5 w-5 text-[#C9A227]" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-2xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Cashier Operators
            </p>
            <p className="text-2xl font-black font-mono text-foreground mt-1">
              {cashierCount}
            </p>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-secondary flex items-center justify-center text-foreground">
            <ShieldCheck className="h-5 w-5 text-[#B8860B]" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeStats;