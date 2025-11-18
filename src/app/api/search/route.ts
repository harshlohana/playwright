import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Pipeline from "@/models/Pipeline";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = parseInt(searchParams.get("skip") || "0");

    const filter: any = {};

    // Text search
    if (query) {
      filter.$text = { $search: query };
    }

    // Status filter
    if (status && (status === "draft" || status === "published")) {
      filter.status = status;
    }

    const pipelines = await Pipeline.find(filter)
      .sort(query ? { score: { $meta: "textScore" } } : { updatedAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
      .exec();

    const total = await Pipeline.countDocuments(filter);

    // Transform MongoDB documents
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

    return NextResponse.json({
      pipelines: transformedPipelines,
      total,
      limit,
      skip,
    });
  } catch (error) {
    console.error("Error searching pipelines:", error);
    return NextResponse.json(
      { error: "Failed to search pipelines" },
      { status: 500 }
    );
  }
}
