import React from "react";
import { useSelector } from "react-redux";
import { MapPin, Store } from "lucide-react";

const BranchInfo = () => {
  const { branch } = useSelector((state) => state.branch);
  const { userProfile } = useSelector((state) => state.user);

  const branchName =
    branch?.name || userProfile?.branchName || userProfile?.branch?.name || "Main Branch Station";
  const branchAddress =
    branch?.address || userProfile?.branch?.address || "Store Main Location";

  return (
    <div className="p-3 bg-[#33302D] border border-[#423E3A] rounded-2xl text-xs space-y-2">
      <div className="flex items-center gap-2 text-white font-bold">
        <Store className="h-4 w-4 text-[#C9A227] shrink-0" />
        <span className="truncate">{branchName}</span>
      </div>

      <div className="flex items-start gap-1.5 text-[#A8A29E] text-[11px]">
        <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[#C9A227]/70" />
        <span className="line-clamp-2 leading-relaxed">{branchAddress}</span>
      </div>

      <div className="pt-1.5 flex items-center justify-between text-[10px] text-[#A8A29E] border-t border-[#423E3A]">
        <span className="flex items-center gap-1 font-bold text-[#C9A227]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />
          Till Active
        </span>
        <span className="font-mono text-white">
          {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
};

export default BranchInfo;
