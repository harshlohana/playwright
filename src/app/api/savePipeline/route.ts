import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Pipeline from "@/models/Pipeline";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { id, name, nodes, edges, status } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Pipeline name is required" },
        { status: 400 }
      );
    }

    let pipeline;

    if (id) {
      // Update existing pipeline
      pipeline = await Pipeline.findByIdAndUpdate(
        id,
        {
          name,
          nodes: nodes || [],
          edges: edges || [],
          status: status || "draft",
          nodeCount: nodes?.length || 0,
          edgeCount: edges?.length || 0,
        },
        { new: true, runValidators: true }
      );

      if (!pipeline) {
        return NextResponse.json(
          { error: "Pipeline not found" },
          { status: 404 }
        );
      }
    } else {
      // Create new pipeline
      pipeline = await Pipeline.create({
        name,
        nodes: nodes || [],
        edges: edges || [],
        status: status || "draft",
        nodeCount: nodes?.length || 0,
        edgeCount: edges?.length || 0,
      });
    }

    // Convert MongoDB document to plain object with id field
    const pipelineObj = pipeline.toObject();
    const response = {
      ...pipelineObj,
      id: pipelineObj._id.toString(),
      createdAt: pipelineObj.createdAt.toISOString(),
      updatedAt: pipelineObj.updatedAt.toISOString(),
    };
    delete response._id;
    delete response.__v;

    return NextResponse.json({
      success: true,
      message: "Pipeline saved successfully",
      pipeline: response,
    });
  } catch (error) {
    console.error("Error saving pipeline:", error);
    return NextResponse.json(
      { error: "Failed to save pipeline" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const pipelines = await Pipeline.find()
      .sort({ updatedAt: -1 })
      .lean()
      .exec();

    // Transform MongoDB documents to match frontend expectations
    const transformedPipelines = pipelines.map((pipeline: any) => ({
      ...pipeline,
      id: pipeline._id.toString(),
      createdAt: pipeline.createdAt.toISOString(),
      updatedAt: pipeline.updatedAt.toISOString(),
      lastRun: pipeline.lastRun ? pipeline.lastRun.toISOString() : undefined,
    }));

    // Remove MongoDB-specific fields
    transformedPipelines.forEach((p: any) => {
      delete p._id;
      delete p.__v;
    });

    return NextResponse.json(transformedPipelines);
  } catch (error) {
    console.error("Error loading pipelines:", error);
    return NextResponse.json(
      { error: "Failed to load pipelines" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Pipeline ID is required" },
        { status: 400 }
      );
    }

    const pipeline = await Pipeline.findByIdAndDelete(id);

    if (!pipeline) {
      return NextResponse.json(
        { error: "Pipeline not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Pipeline deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting pipeline:", error);
    return NextResponse.json(
      { error: "Failed to delete pipeline" },
      { status: 500 }
    );
  }
}
