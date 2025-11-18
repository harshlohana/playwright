import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectDB();

    const isConnected = mongoose.connection.readyState === 1;

    return NextResponse.json({
      status: isConnected ? "healthy" : "unhealthy",
      database: isConnected ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        error: "Failed to connect to database",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
