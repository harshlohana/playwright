"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { ListChecks } from "lucide-react";

interface SelectNodeProps {
  data: {
    selector?: string;
    value?: string;
    isRunning?: boolean;
    isCompleted?: boolean;
    isFailed?: boolean;
  };
}

export const SelectNode = memo(({ data }: SelectNodeProps) => {
  const isRunning = data.isRunning || false;
  const isCompleted = data.isCompleted || false;
  const isFailed = data.isFailed || false;

  const handleClass =
    "!bg-teal-400 !w-4 !h-4 !border-4 !border-white !rounded-full !shadow-lg";

  const getBorderStyle = () => {
    if (isRunning)
      return "border-blue-500 shadow-blue-200 animate-pulse ring-4 ring-blue-200";
    if (isCompleted) return "border-green-500 shadow-green-200";
    if (isFailed) return "border-red-500 shadow-red-200";
    return "border-teal-200";
  };

  return (
    <div className="relative">
      {/* Top handles - both source and target */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className={handleClass}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        className={handleClass}
      />

      {/* Right handles - both source and target */}
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        className={handleClass}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className={handleClass}
      />

      {/* Bottom handles - both source and target */}
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        className={handleClass}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className={handleClass}
      />

      {/* Left handles - both source and target */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className={handleClass}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        className={handleClass}
      />

      <div
        className={`px-5 py-3 bg-white border-2 rounded-xl shadow-md min-w-[200px] transition-all ${getBorderStyle()}`}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
            <ListChecks className="text-white w-4 h-4" />
          </div>
          <div className="font-bold text-sm text-slate-700">Select</div>
          {isRunning && (
            <span className="ml-auto text-xs px-2 py-0.5 bg-blue-500 text-white rounded-full animate-pulse">
              Running
            </span>
          )}
          {isCompleted && (
            <span className="ml-auto text-xs px-2 py-0.5 bg-green-500 text-white rounded-full">
              ✓
            </span>
          )}
          {isFailed && (
            <span className="ml-auto text-xs px-2 py-0.5 bg-red-500 text-white rounded-full">
              ✗
            </span>
          )}
        </div>
        <div className="text-xs text-slate-600 space-y-1">
          <div className="font-mono truncate">{data.selector || "select"}</div>
          <div className="text-slate-500">→ {data.value || "option"}</div>
        </div>
      </div>
    </div>
  );
});

SelectNode.displayName = "SelectNode";
