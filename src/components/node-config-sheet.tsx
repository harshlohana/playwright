"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";
import type { Node } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";

interface NodeConfigSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedNode: Node | null;
}

export function NodeConfigSheet({
  open,
  onOpenChange,
  selectedNode,
}: NodeConfigSheetProps) {
  const { setNodes, deleteElements } = useReactFlow();
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (selectedNode) {
      setFormData(selectedNode.data || {});
    }
  }, [selectedNode]);

  const handleSave = () => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? { ...node, data: { ...node.data, ...formData } }
          : node
      )
    );
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!selectedNode) return;
    deleteElements({ nodes: [selectedNode] });
    onOpenChange(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  if (!selectedNode) return null;

  const getNodeTitle = () => {
    switch (selectedNode.type) {
      case "navigate":
        return "Navigate Node";
      case "click":
        return "Click Node";
      case "type":
        return "Type Node";
      case "expect":
        return "Expect Node";
      case "select":
        return "Select Node";
      case "hover":
        return "Hover Node";
      case "wait":
        return "Wait Node";
      case "screenshot":
        return "Screenshot Node";
      case "upload":
        return "Upload File Node";
      default:
        return "Node Configuration";
    }
  };

  const renderFields = () => {
    switch (selectedNode.type) {
      case "navigate":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={formData.url || ""}
                onChange={(e) => handleChange("url", e.target.value)}
                placeholder="https://example.com"
              />
              <p className="text-xs text-muted-foreground">
                The full URL to navigate to (e.g., https://example.com/login)
              </p>
            </div>
          </div>
        );

      case "click":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="selector">CSS Selector</Label>
              <Input
                id="selector"
                value={formData.selector || ""}
                onChange={(e) => handleChange("selector", e.target.value)}
                placeholder="button"
              />
              <p className="text-xs text-muted-foreground">
                CSS selector of the element to click
              </p>
            </div>
          </div>
        );

      case "type":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="selector">CSS Selector</Label>
              <Input
                id="selector"
                value={formData.selector || ""}
                onChange={(e) => handleChange("selector", e.target.value)}
                placeholder="input"
              />
              <p className="text-xs text-muted-foreground">
                CSS selector of the input element
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="text">Text to Type</Label>
              <Input
                id="text"
                value={formData.text || ""}
                onChange={(e) => handleChange("text", e.target.value)}
                placeholder="Hello World"
              />
              <p className="text-xs text-muted-foreground">
                The text to type into the input
              </p>
            </div>
          </div>
        );

      case "expect":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="selector">CSS Selector</Label>
              <Input
                id="selector"
                value={formData.selector || ""}
                onChange={(e) => handleChange("selector", e.target.value)}
                placeholder=".success"
              />
              <p className="text-xs text-muted-foreground">
                CSS selector of the element to test
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select
                value={formData.condition || "toBeVisible"}
                onValueChange={(value) => handleChange("condition", value)}
              >
                <SelectTrigger id="condition">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="toBeVisible">To Be Visible</SelectItem>
                  <SelectItem value="toBeHidden">To Be Hidden</SelectItem>
                  <SelectItem value="toHaveText">To Have Text</SelectItem>
                  <SelectItem value="toContainText">To Contain Text</SelectItem>
                  <SelectItem value="toBeEnabled">To Be Enabled</SelectItem>
                  <SelectItem value="toBeDisabled">To Be Disabled</SelectItem>
                  <SelectItem value="toBeChecked">To Be Checked</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The assertion to perform
              </p>
            </div>
            {(formData.condition === "toHaveText" ||
              formData.condition === "toContainText") && (
              <div className="space-y-2">
                <Label htmlFor="expectedText">Expected Text</Label>
                <Input
                  id="expectedText"
                  value={formData.expectedText || ""}
                  onChange={(e) => handleChange("expectedText", e.target.value)}
                  placeholder="Enter expected text"
                />
              </div>
            )}
          </div>
        );

      case "select":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="selector">CSS Selector</Label>
              <Input
                id="selector"
                value={formData.selector || ""}
                onChange={(e) => handleChange("selector", e.target.value)}
                placeholder="select"
              />
              <p className="text-xs text-muted-foreground">
                CSS selector of the select element
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Option Value</Label>
              <Input
                id="value"
                value={formData.value || ""}
                onChange={(e) => handleChange("value", e.target.value)}
                placeholder="option1"
              />
              <p className="text-xs text-muted-foreground">
                The value of the option to select
              </p>
            </div>
          </div>
        );

      case "hover":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="selector">CSS Selector</Label>
              <Input
                id="selector"
                value={formData.selector || ""}
                onChange={(e) => handleChange("selector", e.target.value)}
                placeholder=".menu-item"
              />
              <p className="text-xs text-muted-foreground">
                CSS selector of the element to hover
              </p>
            </div>
          </div>
        );

      case "wait":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="waitType">Wait Type</Label>
              <Select
                value={formData.waitType || "timeout"}
                onValueChange={(value) => handleChange("waitType", value)}
              >
                <SelectTrigger id="waitType">
                  <SelectValue placeholder="Select wait type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="timeout">Timeout (ms)</SelectItem>
                  <SelectItem value="selector">Wait for Selector</SelectItem>
                  <SelectItem value="navigation">
                    Wait for Navigation
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">
                {formData.waitType === "timeout" ? "Duration (ms)" : "Selector"}
              </Label>
              <Input
                id="value"
                value={formData.value || ""}
                onChange={(e) => handleChange("value", e.target.value)}
                placeholder={
                  formData.waitType === "timeout" ? "1000" : ".element"
                }
              />
            </div>
          </div>
        );

      case "screenshot":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="filename">Filename</Label>
              <Input
                id="filename"
                value={formData.filename || ""}
                onChange={(e) => handleChange("filename", e.target.value)}
                placeholder="screenshot.png"
              />
              <p className="text-xs text-muted-foreground">
                The filename for the screenshot
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="fullPage"
                checked={formData.fullPage || false}
                onChange={(e) =>
                  handleChange("fullPage", e.target.checked.toString())
                }
                className="h-4 w-4"
              />
              <Label htmlFor="fullPage" className="cursor-pointer">
                Capture full page
              </Label>
            </div>
          </div>
        );

      case "upload":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="selector">CSS Selector</Label>
              <Input
                id="selector"
                value={formData.selector || ""}
                onChange={(e) => handleChange("selector", e.target.value)}
                placeholder='input[type="file"]'
              />
              <p className="text-xs text-muted-foreground">
                CSS selector of the file input element
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filePath">File Path</Label>
              <Input
                id="filePath"
                value={formData.filePath || ""}
                onChange={(e) => handleChange("filePath", e.target.value)}
                placeholder="./test-file.pdf"
              />
              <p className="text-xs text-muted-foreground">
                Path to the file to upload
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
        {/* Header */}
        <div className="p-6 border-b">
          <SheetHeader>
            <SheetTitle>{getNodeTitle()}</SheetTitle>
            <SheetDescription>
              Configure the properties for this node
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-200px)]">
          {renderFields()}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t bg-muted/20">
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            <Button
              onClick={handleDelete}
              variant="destructive"
              size="icon"
              title="Delete node"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
