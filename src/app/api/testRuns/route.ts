import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import TestRun from "@/models/TestRun";
import Pipeline from "@/models/Pipeline";

// GET - Fetch test runs (optionally filtered by pipelineId)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const pipelineId = searchParams.get("pipelineId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = parseInt(searchParams.get("skip") || "0");

    const query = pipelineId ? { pipelineId } : {};

    const testRuns = await TestRun.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
      .exec();

    const total = await TestRun.countDocuments(query);

    // Transform MongoDB documents
    const transformedRuns = testRuns.map((run: any) => ({
      ...run,
      id: run._id.toString(),
      pipelineId: run.pipelineId.toString(),
      createdAt: run.createdAt.toISOString(),
      updatedAt: run.updatedAt.toISOString(),
      startTime: run.startTime.toISOString(),
      endTime: run.endTime ? run.endTime.toISOString() : null,
    }));

    // Remove MongoDB-specific fields
    transformedRuns.forEach((r: any) => {
      delete r._id;
      delete r.__v;
    });

    return NextResponse.json({
      testRuns: transformedRuns,
      total,
      limit,
      skip,
    });
  } catch (error) {
    console.error("Error fetching test runs:", error);
    return NextResponse.json(
      { error: "Failed to fetch test runs" },
      { status: 500 }
    );
  }
}

// POST - Create a new test run
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { pipelineId, pipelineName } = await request.json();

    if (!pipelineId || !pipelineName) {
      return NextResponse.json(
        { error: "Pipeline ID and name are required" },
        { status: 400 }
      );
    }

    const testRun = await TestRun.create({
      pipelineId,
      pipelineName,
      status: "running",
      startTime: new Date(),
      logs: [
        {
          timestamp: new Date(),
          level: "info",
          message: `Starting test execution: ${pipelineName}`,
        },
      ],
    });

    // Update pipeline's lastRun timestamp
    await Pipeline.findByIdAndUpdate(pipelineId, {
      lastRun: new Date(),
    });

    const testRunObj = testRun.toObject();
    const response = {
      ...testRunObj,
      id: testRunObj._id.toString(),
      pipelineId: testRunObj.pipelineId.toString(),
      createdAt: testRunObj.createdAt.toISOString(),
      updatedAt: testRunObj.updatedAt.toISOString(),
      startTime: testRunObj.startTime.toISOString(),
    };
    delete response._id;
    delete response.__v;

    return NextResponse.json({
      success: true,
      testRun: response,
    });
  } catch (error) {
    console.error("Error creating test run:", error);
    return NextResponse.json(
      { error: "Failed to create test run" },
      { status: 500 }
    );
  }
}

// PATCH - Update test run (add logs, update status, etc.)
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const { id, status, logs, output, error } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Test run ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (status) {
      updateData.status = status;
      if (status !== "running") {
        updateData.endTime = new Date();
      }
    }

    if (logs) {
      updateData.$push = { logs: { $each: logs } };
    }

    if (output !== undefined) {
      updateData.output = output;
    }

    if (error !== undefined) {
      updateData.error = error;
    }

    const testRun = await TestRun.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!testRun) {
      return NextResponse.json(
        { error: "Test run not found" },
        { status: 404 }
      );
    }

    // Calculate duration if test is completed
    if (testRun.endTime && testRun.startTime) {
      const duration = testRun.endTime.getTime() - testRun.startTime.getTime();
      await TestRun.findByIdAndUpdate(id, { duration });
    }

    const testRunObj = testRun.toObject();
    const response = {
      ...testRunObj,
      id: testRunObj._id.toString(),
      pipelineId: testRunObj.pipelineId.toString(),
      createdAt: testRunObj.createdAt.toISOString(),
      updatedAt: testRunObj.updatedAt.toISOString(),
      startTime: testRunObj.startTime.toISOString(),
      endTime: testRunObj.endTime ? testRunObj.endTime.toISOString() : null,
    };
    delete response._id;
    delete response.__v;

    return NextResponse.json({
      success: true,
      testRun: response,
    });
  } catch (error) {
    console.error("Error updating test run:", error);
    return NextResponse.json(
      { error: "Failed to update test run" },
      { status: 500 }
    );
  }
}
