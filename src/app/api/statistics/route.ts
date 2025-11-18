import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Pipeline from "@/models/Pipeline";
import TestRun from "@/models/TestRun";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const pipelineId = searchParams.get("pipelineId");

    if (!pipelineId) {
      // Get overall statistics
      const totalPipelines = await Pipeline.countDocuments();
      const publishedPipelines = await Pipeline.countDocuments({
        status: "published",
      });
      const draftPipelines = await Pipeline.countDocuments({
        status: "draft",
      });
      const totalTestRuns = await TestRun.countDocuments();
      const passedTests = await TestRun.countDocuments({ status: "passed" });
      const failedTests = await TestRun.countDocuments({ status: "failed" });
      const runningTests = await TestRun.countDocuments({ status: "running" });

      // Get recent test runs
      const recentTestRuns = await TestRun.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
        .exec();

      // Get most active pipelines
      const pipelineActivity = await TestRun.aggregate([
        { $group: { _id: "$pipelineId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]);

      return NextResponse.json({
        overview: {
          totalPipelines,
          publishedPipelines,
          draftPipelines,
          totalTestRuns,
          passedTests,
          failedTests,
          runningTests,
          successRate:
            totalTestRuns > 0
              ? ((passedTests / totalTestRuns) * 100).toFixed(2)
              : "0",
        },
        recentTestRuns: recentTestRuns.map((run: any) => ({
          ...run,
          id: run._id.toString(),
          pipelineId: run.pipelineId.toString(),
          createdAt: run.createdAt.toISOString(),
        })),
        pipelineActivity,
      });
    } else {
      // Get statistics for a specific pipeline
      const pipeline = await Pipeline.findById(pipelineId).lean().exec();

      if (!pipeline) {
        return NextResponse.json(
          { error: "Pipeline not found" },
          { status: 404 }
        );
      }

      const totalRuns = await TestRun.countDocuments({ pipelineId });
      const passedRuns = await TestRun.countDocuments({
        pipelineId,
        status: "passed",
      });
      const failedRuns = await TestRun.countDocuments({
        pipelineId,
        status: "failed",
      });

      // Get last 10 test runs for this pipeline
      const recentRuns = await TestRun.find({ pipelineId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
        .exec();

      // Calculate average duration
      const completedRuns = await TestRun.find({
        pipelineId,
        duration: { $exists: true, $ne: null },
      })
        .select("duration")
        .lean()
        .exec();

      const avgDuration =
        completedRuns.length > 0
          ? completedRuns.reduce((sum, run) => sum + (run.duration || 0), 0) /
            completedRuns.length
          : 0;

      return NextResponse.json({
        pipeline: {
          ...(pipeline as any),
          id: (pipeline as any)._id.toString(),
        },
        statistics: {
          totalRuns,
          passedRuns,
          failedRuns,
          successRate:
            totalRuns > 0 ? ((passedRuns / totalRuns) * 100).toFixed(2) : "0",
          averageDuration: Math.round(avgDuration),
        },
        recentRuns: recentRuns.map((run: any) => ({
          ...run,
          id: run._id.toString(),
          pipelineId: run.pipelineId.toString(),
          createdAt: run.createdAt.toISOString(),
          startTime: run.startTime.toISOString(),
          endTime: run.endTime ? run.endTime.toISOString() : null,
        })),
      });
    }
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
