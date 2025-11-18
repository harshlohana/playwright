import mongoose, { Schema, Document } from "mongoose";

export interface IPipeline extends Document {
  name: string;
  status: "draft" | "published";
  nodes: any[];
  edges: any[];
  nodeCount: number;
  edgeCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastRun?: Date;
}

const PipelineSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    nodes: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    edges: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    nodeCount: {
      type: Number,
      default: 0,
    },
    edgeCount: {
      type: Number,
      default: 0,
    },
    lastRun: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
PipelineSchema.index({ createdAt: -1 });
PipelineSchema.index({ status: 1 });
PipelineSchema.index({ name: "text" });

export default mongoose.models.Pipeline ||
  mongoose.model<IPipeline>("Pipeline", PipelineSchema);
