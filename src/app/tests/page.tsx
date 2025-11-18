"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileCode, Download, Trash2 } from "lucide-react";
import { PageHeader } from "@/components";

interface Pipeline {
  name: string;
  createdAt: string;
  baseUrl: string;
  nodes: any[];
}

export default function TestsPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPipelines();
  }, []);

  const loadPipelines = async () => {
    try {
      const response = await fetch("/api/savePipeline");
      const data = await response.json();
      setPipelines(data.pipelines || []);
    } catch (error) {
      console.error("Error loading pipelines:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader
          icon={FileCode}
          title="Saved Tests & Pipelines"
          description="View and manage your saved test pipelines"
        />
        <div className="flex-1 overflow-auto p-6">
          <p>Loading tests...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        icon={FileCode}
        title="Saved Tests & Pipelines"
        description="View and manage your saved test pipelines"
      />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {pipelines.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No tests yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first test using the Visual Builder or AI Generator
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pipelines.map((pipeline, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{pipeline.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {new Date(pipeline.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {pipeline.nodes?.length || 0} nodes
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Base URL:</span>
                    <br />
                    <span className="font-mono text-xs">
                      {pipeline.baseUrl}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="mr-2 h-3 w-3" />
                      Export
                    </Button>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
