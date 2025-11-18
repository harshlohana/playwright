"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Workflow,
  Search,
  Plus,
  MoreVertical,
  Play,
  Edit,
  Trash2,
  Calendar,
  GitBranch,
  Code,
  Grid,
  List,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components";

interface Pipeline {
  id: string;
  name: string;
  status: "draft" | "published";
  nodes: any[];
  edges: any[];
  nodeCount: number;
  edgeCount: number;
  createdAt: string;
  updatedAt: string;
  lastRun?: string;
}

type ViewMode = "grid" | "table";

export default function PipelinesPage() {
  const router = useRouter();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [filteredPipelines, setFilteredPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadPipelines();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPipelines(pipelines);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredPipelines(
        pipelines.filter((pipeline) =>
          pipeline.name.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, pipelines]);

  const loadPipelines = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/savePipeline");
      if (response.ok) {
        const data = await response.json();
        setPipelines(data);
        setFilteredPipelines(data);
      }
    } catch (error) {
      console.error("Error loading pipelines:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pipelineId: string) => {
    router.push(`/builder?jobId=${pipelineId}`);
  };

  const handleDelete = async (pipelineId: string) => {
    if (!confirm("Are you sure you want to delete this pipeline?")) {
      return;
    }

    try {
      setDeleting(pipelineId);
      const response = await fetch(`/api/savePipeline?id=${pipelineId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPipelines((prev) => prev.filter((p) => p.id !== pipelineId));
      } else {
        alert("Failed to delete pipeline");
      }
    } catch (error) {
      console.error("Error deleting pipeline:", error);
      alert("Failed to delete pipeline");
    } finally {
      setDeleting(null);
    }
  };

  const handleRun = (pipelineId: string) => {
    router.push(`/runner?pipelineId=${pipelineId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    return status === "published"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
  };

  if (loading) {
    return (
      <>
        <PageHeader
          icon={Workflow}
          title="Pipelines"
          description="Manage and organize your test pipelines"
          actions={
            <Button onClick={() => router.push("/builder")}>
              <Plus className="mr-2 h-4 w-4" />
              New Pipeline
            </Button>
          }
        />
        <div className="flex-1 overflow-auto p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        icon={Workflow}
        title="Pipelines"
        description="Manage and organize your test pipelines"
        actions={
          <Button onClick={() => router.push("/builder")}>
            <Plus className="mr-2 h-4 w-4" />
            New Pipeline
          </Button>
        }
      />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pipelines
              </CardTitle>
              <Workflow className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pipelines.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <GitBranch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pipelines.filter((p) => p.status === "published").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pipelines.filter((p) => p.status === "draft").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Nodes</CardTitle>
              <GitBranch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pipelines.reduce((sum, p) => sum + p.nodeCount, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and View Toggle */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pipelines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {filteredPipelines.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Workflow className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No pipelines found" : "No pipelines yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Create your first pipeline using the Visual Builder"}
              </p>
              {!searchQuery && (
                <Button onClick={() => router.push("/builder")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Pipeline
                </Button>
              )}
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPipelines.map((pipeline) => (
              <Card
                key={pipeline.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {pipeline.name}
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {formatDate(pipeline.updatedAt)}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleRun(pipeline.id)}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Run Test
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEdit(pipeline.id)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(pipeline.id)}
                          className="text-destructive"
                          disabled={deleting === pipeline.id}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(pipeline.status)}>
                      {pipeline.status}
                    </Badge>
                    <Badge variant="secondary">
                      {pipeline.nodeCount} nodes
                    </Badge>
                    <Badge variant="secondary">
                      {pipeline.edgeCount} edges
                    </Badge>
                  </div>
                  {pipeline.lastRun && (
                    <div className="text-sm text-muted-foreground">
                      Last run: {formatDate(pipeline.lastRun)}
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(pipeline.id)}
                    >
                      <Edit className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleRun(pipeline.id)}
                    >
                      <Play className="mr-2 h-3 w-3" />
                      Run
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Nodes</TableHead>
                  <TableHead>Edges</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPipelines.map((pipeline) => (
                  <TableRow key={pipeline.id}>
                    <TableCell className="font-medium">
                      {pipeline.name}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(pipeline.status)}>
                        {pipeline.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{pipeline.nodeCount}</TableCell>
                    <TableCell>{pipeline.edgeCount}</TableCell>
                    <TableCell>{formatDate(pipeline.updatedAt)}</TableCell>
                    <TableCell>
                      {pipeline.lastRun
                        ? formatDate(pipeline.lastRun)
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleRun(pipeline.id)}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Run Test
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(pipeline.id)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(pipeline.id)}
                            className="text-destructive"
                            disabled={deleting === pipeline.id}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </>
  );
}
