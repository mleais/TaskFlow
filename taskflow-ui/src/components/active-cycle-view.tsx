import { useCycles } from "@/hooks/use-api";
import { Zap, Loader2, Clock } from "lucide-react";

export function ActiveCycleView() {
  const { data: cycles, isLoading } = useCycles();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-white/50" />
      </div>
    );
  }

  const activeCycle = cycles?.find(c => c.isActive) || cycles?.[0];

  return (
    <div className="flex flex-col h-full bg-[#0A0A0B] p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-md">
            <Zap className="w-5 h-5 text-orange-400" />
          </div>
          <h1 className="text-2xl font-semibold text-[#E8E8ED]">Active Cycle</h1>
        </div>
        {activeCycle && (
          <div className="flex items-center gap-2 text-sm text-[#9BA1A6] bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            <Clock className="w-3.5 h-3.5" />
            <span>Ends {new Date(activeCycle.endDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {!activeCycle ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-lg">
          <Zap className="w-10 h-10 text-white/20 mb-4" />
          <h3 className="text-[#E8E8ED] font-medium mb-1">No Active Cycle</h3>
          <p className="text-sm text-[#9BA1A6]">Start a new cycle to track your team's sprint.</p>
        </div>
      ) : (
        <div className="bg-[#1C1C1E] border border-[#27282b] rounded-lg p-6">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-lg font-medium text-[#E8E8ED] mb-1">{activeCycle.name}</h2>
              <p className="text-sm text-[#9BA1A6]">{activeCycle.issues?.length || 0} issues in this cycle</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold text-[#E8E8ED]">65%</div>
              <p className="text-xs text-[#696C75]">Completed</p>
            </div>
          </div>
          
          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500/80 rounded-full" style={{ width: '65%' }} />
          </div>
        </div>
      )}
    </div>
  );
}
