"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Navigation,
  MousePointerClick,
  Type,
  CheckCircle,
  Search,
  ChevronRight,
  Upload,
  ListChecks,
  MousePointer2,
  Focus,
  Eye,
  Clock,
  FileDown,
  Camera,
  ArrowLeft,
  RotateCcw,
  Keyboard,
  Square,
  Timer,
} from "lucide-react";
import { useReactFlow } from "@xyflow/react";

interface AddNodesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddNodesSheet({ open, onOpenChange }: AddNodesSheetProps) {
  const { setNodes, getNodes } = useReactFlow();
  const [searchQuery, setSearchQuery] = useState("");

  const addNode = (type: string) => {
    const nodes = getNodes();
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 100, y: 100 + nodes.length * 100 },
      data: getDefaultData(type),
    };
    setNodes((nds) => [...nds, newNode]);
    onOpenChange(false);
  };

  const getDefaultData = (type: string) => {
    switch (type) {
      case "navigate":
        return { url: "https://example.com" };
      case "click":
        return { selector: "button" };
      case "type":
        return { selector: "input", text: "Hello World" };
      case "expect":
        return { selector: ".success", condition: "toBeVisible" };
      case "select":
        return { selector: "select", value: "option1" };
      case "hover":
        return { selector: ".menu-item" };
      case "focus":
        return { selector: "input" };
      case "upload":
        return { selector: 'input[type="file"]', filePath: "./test-file.pdf" };
      case "check":
        return { selector: 'input[type="checkbox"]' };
      case "wait":
        return { waitType: "timeout", value: "1000" };
      case "screenshot":
        return { filename: "screenshot.png", fullPage: false };
      case "goBack":
        return {};
      case "reload":
        return {};
      case "press":
        return { key: "Enter" };
      case "dragDrop":
        return { sourceSelector: ".draggable", targetSelector: ".dropzone" };
      case "scroll":
        return { selector: ".element", behavior: "smooth" };
      default:
        return {};
    }
  };

  const nodeGroups = [
    {
      title: "NAVIGATION",
      nodes: [
        {
          type: "navigate",
          title: "Navigate",
          icon: Navigation,
          iconBg: "bg-blue-600",
        },
        {
          type: "goBack",
          title: "Go Back",
          icon: ArrowLeft,
          iconBg: "bg-blue-500",
        },
        {
          type: "reload",
          title: "Reload Page",
          icon: RotateCcw,
          iconBg: "bg-blue-400",
        },
      ],
    },
    {
      title: "INTERACTIONS",
      nodes: [
        {
          type: "click",
          title: "Click Element",
          icon: MousePointerClick,
          iconBg: "bg-green-600",
        },
        {
          type: "type",
          title: "Type Text",
          icon: Type,
          iconBg: "bg-purple-600",
        },
        {
          type: "select",
          title: "Select Option",
          icon: ListChecks,
          iconBg: "bg-indigo-600",
        },
        {
          type: "hover",
          title: "Hover Element",
          icon: MousePointer2,
          iconBg: "bg-teal-600",
        },
        {
          type: "focus",
          title: "Focus Element",
          icon: Focus,
          iconBg: "bg-cyan-600",
        },
        {
          type: "check",
          title: "Check/Uncheck",
          icon: Square,
          iconBg: "bg-emerald-600",
        },
        {
          type: "upload",
          title: "Upload File",
          icon: Upload,
          iconBg: "bg-pink-600",
        },
        {
          type: "press",
          title: "Press Key",
          icon: Keyboard,
          iconBg: "bg-violet-600",
        },
        {
          type: "dragDrop",
          title: "Drag & Drop",
          icon: MousePointer2,
          iconBg: "bg-fuchsia-600",
        },
        {
          type: "scroll",
          title: "Scroll To Element",
          icon: Eye,
          iconBg: "bg-sky-600",
        },
      ],
    },
    {
      title: "WAIT & TIMING",
      nodes: [
        {
          type: "wait",
          title: "Wait",
          icon: Clock,
          iconBg: "bg-orange-600",
        },
      ],
    },
    {
      title: "ASSERTIONS",
      nodes: [
        {
          type: "expect",
          title: "Expect Condition",
          icon: CheckCircle,
          iconBg: "bg-amber-600",
        },
      ],
    },
    {
      title: "UTILITIES",
      nodes: [
        {
          type: "screenshot",
          title: "Take Screenshot",
          icon: Camera,
          iconBg: "bg-slate-600",
        },
      ],
    },
  ];

  const filteredGroups = nodeGroups
    .map((group) => ({
      ...group,
      nodes: group.nodes.filter((node) =>
        node.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((group) => group.nodes.length > 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[320px] sm:w-[380px] p-0">
        {/* Search Header */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tools"
              className="pl-9 bg-muted/50 border-0"
            />
          </div>
        </div>

        {/* Node List */}
        <div className="overflow-y-auto h-[calc(100vh-80px)]">
          {filteredGroups.map((group, groupIndex) => (
            <div key={group.title}>
              {/* Group Header */}
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {group.title}
              </div>

              {/* Group Items */}
              <div className="px-2">
                {group.nodes.map((node) => {
                  const Icon = node.icon;
                  return (
                    <button
                      key={node.type}
                      onClick={() => addNode(node.type)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted/50 transition-colors group text-left"
                    >
                      <div className={`${node.iconBg} p-1.5 rounded`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="flex-1 text-sm font-medium text-foreground">
                        {node.title}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
              </div>

              {groupIndex < filteredGroups.length - 1 && (
                <Separator className="my-2" />
              )}
            </div>
          ))}

          {filteredGroups.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No nodes found matching "{searchQuery}"
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
