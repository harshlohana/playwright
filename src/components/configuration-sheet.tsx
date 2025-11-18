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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, X } from "lucide-react";
import { useReactFlow } from "@xyflow/react";

interface ConfigurationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeCount: number;
  edgeCount: number;
  onClearCanvas: () => void;
}

export function ConfigurationSheet({
  open,
  onOpenChange,
  nodeCount,
  edgeCount,
  onClearCanvas,
}: ConfigurationSheetProps) {
  const [pipelineName, setPipelineName] = useState("My Test Pipeline");
  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([]);
  const [secrets, setSecrets] = useState<{ key: string; value: string }[]>([]);
  const [retryCount, setRetryCount] = useState("0");
  const [notificationEmail, setNotificationEmail] = useState("");
  const [notifyOnFailure, setNotifyOnFailure] = useState(true);

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: "", value: "" }]);
  };

  const removeEnvVar = (index: number) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
  };

  const updateEnvVar = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const updated = [...envVars];
    updated[index][field] = value;
    setEnvVars(updated);
  };

  const addSecret = () => {
    setSecrets([...secrets, { key: "", value: "" }]);
  };

  const removeSecret = (index: number) => {
    setSecrets(secrets.filter((_, i) => i !== index));
  };

  const updateSecret = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const updated = [...secrets];
    updated[index][field] = value;
    setSecrets(updated);
  };

  const handleClear = () => {
    if (
      confirm(
        "Are you sure you want to clear the entire canvas? This action cannot be undone."
      )
    ) {
      onClearCanvas();
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
        <div className="p-6 border-b">
          <SheetHeader>
            <SheetTitle>Configuration</SheetTitle>
            <SheetDescription>
              Configure your test pipeline settings
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-140px)]">
          <div className="space-y-6">
            {/* Pipeline Name */}
            <div className="space-y-2">
              <Label htmlFor="pipelineName">Pipeline Name</Label>
              <Input
                id="pipelineName"
                value={pipelineName}
                onChange={(e) => setPipelineName(e.target.value)}
                placeholder="My Test Pipeline"
              />
              <p className="text-xs text-muted-foreground">
                A descriptive name for your test pipeline
              </p>
            </div>

            <Separator />

            {/* Environment Variables */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Environment Variables</h3>
                <Button onClick={addEnvVar} variant="outline" size="sm">
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              {envVars.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No environment variables configured
                </p>
              ) : (
                <div className="space-y-2">
                  {envVars.map((envVar, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="KEY"
                        value={envVar.key}
                        onChange={(e) =>
                          updateEnvVar(index, "key", e.target.value)
                        }
                        className="flex-1"
                      />
                      <Input
                        placeholder="value"
                        value={envVar.value}
                        onChange={(e) =>
                          updateEnvVar(index, "value", e.target.value)
                        }
                        className="flex-1"
                      />
                      <Button
                        onClick={() => removeEnvVar(index)}
                        variant="ghost"
                        size="icon"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Secrets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Secrets</h3>
                <Button onClick={addSecret} variant="outline" size="sm">
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              {secrets.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No secrets configured
                </p>
              ) : (
                <div className="space-y-2">
                  {secrets.map((secret, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="SECRET_KEY"
                        value={secret.key}
                        onChange={(e) =>
                          updateSecret(index, "key", e.target.value)
                        }
                        className="flex-1"
                      />
                      <Input
                        type="password"
                        placeholder="value"
                        value={secret.value}
                        onChange={(e) =>
                          updateSecret(index, "value", e.target.value)
                        }
                        className="flex-1"
                      />
                      <Button
                        onClick={() => removeSecret(index)}
                        variant="ghost"
                        size="icon"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Retry Configuration */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Retry Settings</h3>
              <div className="space-y-2">
                <Label htmlFor="retryCount">Retry Failed Tests</Label>
                <Select value={retryCount} onValueChange={setRetryCount}>
                  <SelectTrigger id="retryCount">
                    <SelectValue placeholder="Select retry count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No Retry</SelectItem>
                    <SelectItem value="1">1 time</SelectItem>
                    <SelectItem value="2">2 times</SelectItem>
                    <SelectItem value="3">3 times</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Number of times to retry failed tests
                </p>
              </div>
            </div>

            <Separator />

            {/* Notifications */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="notifyOnFailure"
                    checked={notifyOnFailure}
                    onChange={(e) => setNotifyOnFailure(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label
                    htmlFor="notifyOnFailure"
                    className="cursor-pointer text-sm"
                  >
                    Notify on test failure
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notificationEmail">Email Address</Label>
                  <Input
                    id="notificationEmail"
                    type="email"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Receive notifications at this email
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Pipeline Statistics */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Pipeline Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">
                    {nodeCount}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Nodes
                  </div>
                </div>
                <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                  <div className="text-2xl font-bold text-teal-600">
                    {edgeCount}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Connections
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Danger Zone */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-destructive">
                Danger Zone
              </h3>
              <Button
                onClick={handleClear}
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Entire Canvas
              </Button>
              <p className="text-xs text-muted-foreground">
                This will remove all nodes and connections from the canvas.
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
