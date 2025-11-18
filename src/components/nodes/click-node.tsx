"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { MousePointerClick } from "lucide-react";

export const ClickNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as any;
  const isRunning = nodeData.isRunning || false;
  const isCompleted = nodeData.isCompleted || false;
  const isFailed = nodeData.isFailed || false;

  const handleClass =
    "!bg-teal-400 !w-4 !h-4 !border-4 !border-white !rounded-full !shadow-lg";

  const getBorderStyle = () => {
    if (isRunning)
      return "border-blue-500 shadow-blue-200 animate-pulse ring-4 ring-blue-200";
    if (isCompleted) return "border-green-500 shadow-green-200";
    if (isFailed) return "border-red-500 shadow-red-200";
    if (selected) return "border-teal-400 shadow-teal-100";
    return "border-teal-300";
  };

  const getStatusBadge = () => {
    if (isRunning)
      return (
        <span className="text-xs px-2.5 py-1 bg-blue-500 text-white rounded-full font-medium animate-pulse">
          Running...
        </span>
      );
    if (isCompleted)
      return (
        <span className="text-xs px-2.5 py-1 bg-green-500 text-white rounded-full font-medium">
          ✓ Done
        </span>
      );
    if (isFailed)
      return (
        <span className="text-xs px-2.5 py-1 bg-red-500 text-white rounded-full font-medium">
          ✗ Failed
        </span>
      );
    return (
      <span className="text-xs px-2.5 py-1 bg-green-100 text-green-700 rounded-full font-medium">
        Action
      </span>
    );
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
        className={`min-w-[340px] bg-white rounded-2xl border-2 transition-all shadow-lg ${getBorderStyle()}`}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-green-50 p-2.5 rounded-xl flex-shrink-0">
              <MousePointerClick className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Click Element</h3>
                {getStatusBadge()}
              </div>
              <p className="text-sm text-gray-500">
                Click on:{" "}
                <span className="font-mono text-gray-700">
                  {nodeData.selector || "button"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ClickNode.displayName = "ClickNode";
