"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ReactFlowProvider } from "@xyflow/react";
import type { Node, Edge } from "@xyflow/react";
import { Card } from "@/components/ui/card";
import {
  BuilderCanvas,
  NodeConfigSheet,
  CodePreviewModal,
  AddNodesSheet,
  ConfigurationSheet,
} from "@/components";
import { pipelineToPlaywright } from "@/lib";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Settings, Rocket } from "lucide-react";
import { useReactFlow } from "@xyflow/react";

function BuilderContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [jobName, setJobName] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showNodeConfig, setShowNodeConfig] = useState(false);
  const [showAddNodes, setShowAddNodes] = useState(false);
  const [showConfiguration, setShowConfiguration] = useState(false);
  const { setNodes: setReactFlowNodes, setEdges: setReactFlowEdges } =
    useReactFlow();

  // Load job data if jobId is present
  useEffect(() => {
    if (jobId) {
      loadJob(jobId);
    }
  }, [jobId]);

  const loadJob = async (id: string) => {
    try {
      const response = await fetch("/api/savePipeline");
      if (response.ok) {
        const jobs = await response.json();
        const job = jobs.find((j: any) => j.id === id);
        if (job) {
          setNodes(job.nodes || []);
          setEdges(job.edges || []);
          setReactFlowNodes(job.nodes || []);
          setReactFlowEdges(job.edges || []);
          setJobName(job.name || "");
        }
      }
    } catch (error) {
      console.error("Failed to load job:", error);
    }
  };

  const handleSave = useCallback(
    async (status: "draft" | "published" = "draft") => {
      const name = jobName || `Pipeline-${Date.now()}`;

      try {
        const response = await fetch("/api/savePipeline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: jobId,
            name,
            nodes,
            edges,
            status,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          alert(
            `Pipeline ${
              status === "published" ? "published" : "saved"
            } successfully!`
          );
          if (!jobId && data.pipeline?.id) {
            // Update URL with new job ID
            window.history.replaceState(
              {},
              "",
              `/builder?jobId=${data.pipeline.id}`
            );
          }
        }
      } catch (error) {
        alert("Failed to save pipeline");
      }
    },
    [nodes, edges, jobId, jobName]
  );

  const handlePublish = useCallback(() => {
    handleSave("published");
  }, [handleSave]);

  const handleGenerate = useCallback(() => {
    // Base URL will be extracted from navigate nodes
    const code = pipelineToPlaywright(nodes, edges, "");
    setGeneratedCode(code);
    setShowPreview(true);
  }, [nodes, edges]);

  const handleNodeClick = useCallback((node: Node) => {
    setSelectedNode(node);
    setShowNodeConfig(true);
  }, []);

  const handleClearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setReactFlowNodes([]);
    setReactFlowEdges([]);
  }, [setReactFlowNodes, setReactFlowEdges]);

  return (
    <>
      <div className="flex h-screen flex-col">
        <div className="border-b bg-background p-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Visual Test Builder</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setShowAddNodes(true)} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Nodes
            </Button>
            <Button
              onClick={() => setShowConfiguration(true)}
              variant="outline"
            >
              <Settings className="mr-2 h-4 w-4" />
              Configuration
            </Button>
            <Button onClick={handlePublish}>
              <Rocket className="mr-2 h-4 w-4" />
              Publish
            </Button>
          </div>
        </div>
        <BuilderCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={setNodes}
          onEdgesChange={setEdges}
          onNodeClick={handleNodeClick}
        />
      </div>

      <AddNodesSheet open={showAddNodes} onOpenChange={setShowAddNodes} />

      <ConfigurationSheet
        open={showConfiguration}
        onOpenChange={setShowConfiguration}
        nodeCount={nodes.length}
        edgeCount={edges.length}
        onClearCanvas={handleClearCanvas}
      />

      <NodeConfigSheet
        open={showNodeConfig}
        onOpenChange={setShowNodeConfig}
        selectedNode={selectedNode}
      />

      <CodePreviewModal
        open={showPreview}
        onOpenChange={setShowPreview}
        code={generatedCode}
        title="Generated Playwright Test"
      />
    </>
  );
}

export default function BuilderPage() {
  return (
    <ReactFlowProvider>
      <BuilderContent />
    </ReactFlowProvider>
  );
}
