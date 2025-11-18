import mongoose, { Schema, Document } from "mongoose";

export interface ITestRun extends Document {
  pipelineId: mongoose.Types.ObjectId;
  pipelineName: string;
  status: "running" | "passed" | "failed" | "cancelled";
  startTime: Date;
  endTime?: Date;
  duration?: number;
  logs: Array<{
    timestamp: Date;
    level: "info" | "error" | "success" | "warning";
    message: string;
    nodeId?: string;
  }>;
  output?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TestRunSchema: Schema = new Schema(
  {
    pipelineId: {
      type: Schema.Types.ObjectId,
      ref: "Pipeline",
      required: true,
    },
    pipelineName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["running", "passed", "failed", "cancelled"],
      default: "running",
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number,
      default: null,
    },
    logs: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
        },
        level: {
          type: String,
          enum: ["info", "error", "success", "warning"],
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        nodeId: {
          type: String,
          default: null,
        },
      },
    ],
    output: {
      type: String,
      default: null,
    },
    error: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes
TestRunSchema.index({ pipelineId: 1, createdAt: -1 });
TestRunSchema.index({ status: 1 });
TestRunSchema.index({ createdAt: -1 });

export default mongoose.models.TestRun ||
  mongoose.model<ITestRun>("TestRun", TestRunSchema);
