"use client";

import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type DefaultEdgeOptions,
  MarkerType,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  NavigateNode,
  ClickNode,
  TypeNode,
  ExpectNode,
  SelectNode,
  HoverNode,
  WaitNode,
  ScreenshotNode,
  UploadNode,
} from "./nodes";

const nodeTypes: NodeTypes = {
  navigate: NavigateNode,
  click: ClickNode,
  type: TypeNode,
  expect: ExpectNode,
  select: SelectNode,
  hover: HoverNode,
  wait: WaitNode,
  screenshot: ScreenshotNode,
  upload: UploadNode,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  type: "smoothstep",
  animated: true,
  style: { stroke: "#5eead4", strokeWidth: 2.5 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "#5eead4",
    width: 18,
    height: 18,
  },
};

interface BuilderCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  onNodeClick?: (node: Node) => void;
}

export function BuilderCanvas({
  nodes: initialNodes,
  edges: initialEdges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
}: BuilderCanvasProps) {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);

  // Sync with parent nodes when they change
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  // Sync with parent edges when they change
  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdges = addEdge(connection, edges);
      setEdges(newEdges);
      onEdgesChange(newEdges);
    },
    [edges, setEdges, onEdgesChange]
  );

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChangeInternal(changes);
      // Update parent state
      setTimeout(() => {
        setNodes((nds) => {
          onNodesChange(nds);
          return nds;
        });
      }, 0);
    },
    [onNodesChangeInternal, onNodesChange, setNodes]
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChangeInternal(changes);
      // Update parent state
      setTimeout(() => {
        setEdges((eds) => {
          onEdgesChange(eds);
          return eds;
        });
      }, 0);
    },
    [onEdgesChangeInternal, onEdgesChange, setEdges]
  );

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeClick?.(node);
    },
    [onNodeClick]
  );

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineStyle={{ stroke: "#5eead4", strokeWidth: 2.5 }}
        fitView
        minZoom={0.2}
        maxZoom={4}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
          color="#cbd5e1"
        />
        <Controls className="bg-white border shadow-lg rounded-lg" />
      </ReactFlow>
    </div>
  );
}
