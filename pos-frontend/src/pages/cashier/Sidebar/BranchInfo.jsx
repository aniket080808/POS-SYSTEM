import React from "react";
import { useSelector } from "react-redux";
import { MapPin, Store } from "lucide-react";

const BranchInfo = () => {
  const { branch } = useSelector((state) => state.branch);
  const { userProfile } = useSelector((state) => state.user);

  const branchName = branch?.name || userProfile?.branchName || userProfile?.branch?.name || "Main Branch";
  const branchAddress = branch?.address || userProfile?.branch?.address || "Store Main Location";

  return (
    <div className="p-3 bg-zinc-800/70 border border-zinc-700/60 rounded-xl text-xs space-y-2">
      <div className="flex items-center gap-2 text-white font-bold">
        <Store className="h-4 w-4 text-amber-400 shrink-0" />
        <span className="truncate">{branchName}</span>
      </div>

      <div className="flex items-start gap-1.5 text-zinc-400 text-[11px]">
        <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500/70" />
        <span className="line-clamp-2 leading-relaxed">{branchAddress}</span>
      </div>

      <div className="pt-1.5 flex items-center justify-between text-[10px] text-zinc-400 border-t border-zinc-700/60">
        <span className="flex items-center gap-1.5 font-medium text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Terminal Live
        </span>
        <span className="font-mono text-zinc-400">
          {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
};

export default BranchInfo;
