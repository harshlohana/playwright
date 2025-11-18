"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  Code,
  Navigation,
  MousePointerClick,
  Type,
  CheckCircle,
} from "lucide-react";
import { useReactFlow } from "@xyflow/react";

interface PipelineSidebarProps {
  baseUrl: string;
  onBaseUrlChange: (url: string) => void;
  onGenerate: () => void;
  onSave: () => void;
  nodeCount: number;
}

export function PipelineSidebar({
  baseUrl,
  onBaseUrlChange,
  onGenerate,
  onSave,
  nodeCount,
}: PipelineSidebarProps) {
  const { setNodes, setEdges, getNodes } = useReactFlow();

  const addNode = (type: string) => {
    const nodes = getNodes();
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 100, y: 100 + nodes.length * 100 },
      data: getDefaultData(type),
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const getDefaultData = (type: string) => {
    switch (type) {
      case "navigate":
        return { url: "/" };
      case "click":
        return { selector: "button" };
      case "type":
        return { selector: "input", text: "Hello World" };
      case "expect":
        return { selector: ".success", condition: "toBeVisible" };
      default:
        return {};
    }
  };

  const clearCanvas = () => {
    setNodes([]);
    setEdges([]);
  };

  return (
    <div className="w-80 border-l bg-background p-4 space-y-4 overflow-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <label htmlFor="baseUrl" className="text-sm font-medium">
              Base URL
            </label>
            <Input
              id="baseUrl"
              value={baseUrl}
              onChange={(e) => onBaseUrlChange(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Nodes: {nodeCount}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Nodes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => addNode("navigate")}
          >
            <Navigation className="mr-2 h-4 w-4 text-blue-600" />
            Navigate
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => addNode("click")}
          >
            <MousePointerClick className="mr-2 h-4 w-4 text-green-600" />
            Click
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => addNode("type")}
          >
            <Type className="mr-2 h-4 w-4 text-purple-600" />
            Type Text
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => addNode("expect")}
          >
            <CheckCircle className="mr-2 h-4 w-4 text-orange-600" />
            Expect
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <div className="space-y-2">
        <Button onClick={onGenerate} className="w-full" size="lg">
          <Code className="mr-2 h-4 w-4" />
          Generate Code
        </Button>
        <Button onClick={onSave} variant="outline" className="w-full">
          <Save className="mr-2 h-4 w-4" />
          Save Pipeline
        </Button>
        <Button onClick={clearCanvas} variant="destructive" className="w-full">
          Clear Canvas
        </Button>
      </div>
    </div>
  );
}
