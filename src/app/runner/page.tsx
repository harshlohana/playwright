"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ReactFlowProvider } from "@xyflow/react";
import type { Node, Edge } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Play,
  Pause,
  StopCircle,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { BuilderCanvas } from "@/components";
import { pipelineToPlaywright } from "@/lib";

interface LogEntry {
  id: string;
  timestamp: Date;
  level: "info" | "error" | "success" | "warning";
  message: string;
  nodeId?: string;
}

interface TestRunnerContentProps {
  jobId: string;
}

function TestRunnerContent({ jobId }: TestRunnerContentProps) {
  const router = useRouter();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [jobName, setJobName] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());
  const [failedNodes, setFailedNodes] = useState<Set<string>>(new Set());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [testStatus, setTestStatus] = useState<
    "idle" | "running" | "passed" | "failed"
  >("idle");
  const logsEndRef = useRef<HTMLDivElement>(null);
  const isRunningRef = useRef(false);

  // Load job data
  useEffect(() => {
    loadJob(jobId);
  }, [jobId]);

  const loadJob = async (id: string) => {
    try {
      const response = await fetch("/api/savePipeline");
      if (response.ok) {
        const pipelines = await response.json();
        const pipeline = pipelines.find((p: any) => p.id === id);
        if (pipeline) {
          setNodes(pipeline.nodes || []);
          setEdges(pipeline.edges || []);
          setJobName(pipeline.name || "Untitled Pipeline");
        } else {
          addLog("error", "Pipeline not found");
        }
      }
    } catch (error) {
      console.error("Failed to load pipeline:", error);
      addLog("error", "Failed to load pipeline data");
    }
  };

  const addLog = (
    level: LogEntry["level"],
    message: string,
    nodeId?: string
  ) => {
    const newLog: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      level,
      message,
      nodeId,
    };
    setLogs((prev) => [...prev, newLog]);
  };

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Update node visual states
  useEffect(() => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isRunning: node.id === currentNodeId,
          isCompleted: completedNodes.has(node.id),
          isFailed: failedNodes.has(node.id),
        },
      }))
    );
  }, [currentNodeId, completedNodes, failedNodes]);

  const runTest = async () => {
    if (nodes.length === 0) {
      addLog("error", "No nodes to execute");
      return;
    }

    setIsRunning(true);
    isRunningRef.current = true;
    setTestStatus("running");
    setCompletedNodes(new Set());
    setFailedNodes(new Set());
    setLogs([]);
    addLog("info", `Starting test execution: ${jobName}`);

    // Save the test run to the database
    try {
      await fetch("/api/testRuns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pipelineId: jobId,
          status: "running",
        }),
      });
    } catch (error) {
      console.error("Failed to save test run:", error);
    }

    // Generate Playwright code
    const code = pipelineToPlaywright(nodes, edges, "");
    addLog("info", "Generated Playwright test code");

    try {
      // Sort nodes based on edges for execution order
      const sortedNodes = topologicalSort(nodes, edges);
      addLog("info", `Executing ${sortedNodes.length} nodes in sequence`);

      // Simulate execution of each node
      for (let i = 0; i < sortedNodes.length; i++) {
        if (!isRunningRef.current) break;

        const node = sortedNodes[i];
        setCurrentNodeId(node.id);
        addLog("info", `Executing node: ${getNodeDescription(node)}`, node.id);

        // Simulate node execution delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        if (!isRunningRef.current) break;

        // Mark as completed
        setCompletedNodes((prev) => new Set([...prev, node.id]));
        addLog("success", `✓ Completed: ${getNodeDescription(node)}`, node.id);
      }

      if (!isRunningRef.current) {
        setIsRunning(false);
        setCurrentNodeId(null);
        return;
      }

      setCurrentNodeId(null);

      // Run actual Playwright test
      addLog("info", "Running Playwright test...");
      const response = await fetch("/api/runTest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const result = await response.json();

      if (result.success) {
        setTestStatus("passed");
        addLog("success", "✓ All tests passed!");
        addLog("info", result.output || "Test completed successfully");

        // Update test run status
        try {
          await fetch("/api/testRuns", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pipelineId: jobId,
              status: "passed",
              output: result.output,
            }),
          });
        } catch (error) {
          console.error("Failed to update test run:", error);
        }
      } else {
        setTestStatus("failed");
        addLog("error", "✗ Test failed");
        addLog("error", result.output || result.error || "Unknown error");

        // Update test run status
        try {
          await fetch("/api/testRuns", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pipelineId: jobId,
              status: "failed",
              error: result.error,
              output: result.output,
            }),
          });
        } catch (error) {
          console.error("Failed to update test run:", error);
        }
      }
    } catch (error: any) {
      setTestStatus("failed");
      addLog("error", `Test execution failed: ${error.message}`);
      if (currentNodeId) {
        setFailedNodes((prev) => new Set([...prev, currentNodeId]));
      }

      // Update test run status
      try {
        await fetch("/api/testRuns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pipelineId: jobId,
            status: "failed",
            error: error.message,
          }),
        });
      } catch (err) {
        console.error("Failed to update test run:", err);
      }
    } finally {
      setIsRunning(false);
      isRunningRef.current = false;
      setCurrentNodeId(null);
    }
  };

  const stopTest = () => {
    isRunningRef.current = false;
    setIsRunning(false);
    setCurrentNodeId(null);
    setTestStatus("idle");
    addLog("warning", "Test execution stopped by user");
  };

  const getNodeDescription = (node: Node): string => {
    const data = node.data as any;
    switch (node.type) {
      case "navigate":
        return `Navigate to ${data.url || "/"}`;
      case "click":
        return `Click "${data.selector || "element"}"`;
      case "type":
        return `Type "${data.text}" into "${data.selector}"`;
      case "expect":
        return `Assert "${data.selector}" ${data.condition || "toBeVisible"}`;
      case "select":
        return `Select option in "${data.selector}"`;
      case "hover":
        return `Hover over "${data.selector}"`;
      case "wait":
        return `Wait ${data.duration || 1000}ms`;
      case "screenshot":
        return `Take screenshot`;
      case "upload":
        return `Upload file to "${data.selector}"`;
      default:
        return `Execute ${node.type} node`;
    }
  };

  const getStatusIcon = () => {
    switch (testStatus) {
      case "running":
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      case "passed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (testStatus) {
      case "running":
        return "Running...";
      case "passed":
        return "Test Passed";
      case "failed":
        return "Test Failed";
      default:
        return "Ready to Run";
    }
  };

  const getStatusColor = () => {
    switch (testStatus) {
      case "running":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "passed":
        return "bg-green-50 text-green-700 border-green-200";
      case "failed":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b bg-background p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/pipelines")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pipelines
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-xl font-bold">{jobName}</h1>
            <p className="text-sm text-muted-foreground">Test Runner</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor()}`}
          >
            {getStatusIcon()}
            <span className="font-semibold text-sm">{getStatusText()}</span>
          </div>
          {!isRunning ? (
            <Button onClick={runTest} size="lg">
              <Play className="h-4 w-4 mr-2" />
              Run Test
            </Button>
          ) : (
            <Button onClick={stopTest} variant="destructive" size="lg">
              <StopCircle className="h-4 w-4 mr-2" />
              Stop
            </Button>
          )}
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Visual Builder - Top 65% */}
        <div className="flex-[65] border-b bg-white relative">
          {nodes.length > 0 ? (
            <BuilderCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={() => {}}
              onEdgesChange={() => {}}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg font-semibold">Loading pipeline...</p>
                <p className="text-sm">Fetching workflow data</p>
              </div>
            </div>
          )}
        </div>

        {/* Logs - Bottom 35% */}
        <div className="flex-[35] bg-slate-900 text-white overflow-hidden flex flex-col">
          <div className="border-b border-slate-700 px-4 py-2 flex items-center justify-between bg-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="font-semibold">Execution Logs</span>
              <span className="text-xs text-slate-400">
                {logs.length} entries
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLogs([])}
              className="text-slate-400 hover:text-white"
            >
              Clear
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1">
            {logs.length === 0 ? (
              <div className="text-slate-500 text-center py-8">
                No logs yet. Click "Run Test" to start execution.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-start gap-3 py-1 ${
                    log.level === "error"
                      ? "text-red-400"
                      : log.level === "success"
                      ? "text-green-400"
                      : log.level === "warning"
                      ? "text-yellow-400"
                      : "text-slate-300"
                  }`}
                >
                  <span className="text-slate-500 text-xs whitespace-nowrap">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  <span
                    className={`text-xs font-semibold uppercase w-16 ${
                      log.level === "error"
                        ? "text-red-500"
                        : log.level === "success"
                        ? "text-green-500"
                        : log.level === "warning"
                        ? "text-yellow-500"
                        : "text-blue-500"
                    }`}
                  >
                    {log.level}
                  </span>
                  <span className="flex-1">{log.message}</span>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Topological sort helper
function topologicalSort(nodes: Node[], edges: Edge[]): Node[] {
  if (nodes.length === 0) return [];

  const adjacencyList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  nodes.forEach((node) => {
    adjacencyList.set(node.id, []);
    inDegree.set(node.id, 0);
  });

  edges.forEach((edge) => {
    adjacencyList.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });

  const queue: string[] = [];
  nodes.forEach((node) => {
    if (inDegree.get(node.id) === 0) {
      queue.push(node.id);
    }
  });

  const result: Node[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodeMap.get(nodeId);
    if (node) result.push(node);

    const neighbors = adjacencyList.get(nodeId) || [];
    neighbors.forEach((neighborId) => {
      const degree = inDegree.get(neighborId)! - 1;
      inDegree.set(neighborId, degree);
      if (degree === 0) {
        queue.push(neighborId);
      }
    });
  }

  return result.length > 0 ? result : nodes;
}

export default function TestRunnerPage() {
  const searchParams = useSearchParams();
  const pipelineId =
    searchParams.get("pipelineId") || searchParams.get("jobId");
  const router = useRouter();

  if (!pipelineId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">No Pipeline Selected</h2>
          <p className="text-muted-foreground mb-4">
            Please select a pipeline to run tests.
          </p>
          <Button onClick={() => router.push("/pipelines")}>
            Go to Pipelines
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <TestRunnerContent jobId={pipelineId} />
    </ReactFlowProvider>
  );
}
