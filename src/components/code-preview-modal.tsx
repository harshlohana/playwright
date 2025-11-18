"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Download, Play } from "lucide-react";
import { useState } from "react";

interface CodePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
  title?: string;
}

export function CodePreviewModal({
  open,
  onOpenChange,
  code,
  title = "Generated Code",
}: CodePreviewModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `test-${Date.now()}.spec.ts`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRun = async () => {
    try {
      const response = await fetch("/api/runTest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      alert(
        `Test execution ${data.success ? "succeeded" : "failed"}\n\n${
          data.output
        }`
      );
    } catch (error) {
      alert("Failed to run test. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Preview, copy, download, or run your generated test
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto rounded-lg bg-slate-950 p-4">
          <pre className="text-sm text-slate-50">
            <code>{code || "// No code generated yet"}</code>
          </pre>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleCopy} variant="outline" className="flex-1">
            <Copy className="mr-2 h-4 w-4" />
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button onClick={handleDownload} variant="outline" className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button onClick={handleRun} className="flex-1">
            <Play className="mr-2 h-4 w-4" />
            Run Test
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
