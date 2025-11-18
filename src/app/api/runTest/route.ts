import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Test code is required" },
        { status: 400 }
      );
    }

    // Create a temporary test file
    const testsDir = path.join(process.cwd(), "temp-tests");
    await fs.mkdir(testsDir, { recursive: true });

    const timestamp = Date.now();
    const testFile = path.join(testsDir, `test-${timestamp}.spec.ts`);
    const configFile = path.join(testsDir, `playwright.config.${timestamp}.ts`);

    // Create a minimal Playwright config
    const playwrightConfig = `import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  timeout: 30000,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'off',
    screenshot: 'only-on-failure',
  },
  reporter: 'line',
});
`;

    await fs.writeFile(testFile, code);
    await fs.writeFile(configFile, playwrightConfig);

    try {
      // Run the test using Playwright with the config
      const { stdout, stderr } = await execAsync(
        `npx playwright test ${path.basename(
          testFile
        )} --config=${path.basename(configFile)}`,
        {
          cwd: testsDir,
          timeout: 60000, // 60 second timeout
        }
      );

      // Clean up
      await fs.unlink(testFile).catch(() => {});
      await fs.unlink(configFile).catch(() => {});

      return NextResponse.json({
        success: true,
        output: stdout || stderr,
      });
    } catch (error: any) {
      // Clean up
      await fs.unlink(testFile).catch(() => {});
      await fs.unlink(configFile).catch(() => {});

      // Check if the error is due to missing browsers
      const errorOutput = error.stdout || error.stderr || error.message || "";
      if (
        errorOutput.includes("Executable doesn't exist") ||
        errorOutput.includes("playwright install")
      ) {
        return NextResponse.json({
          success: false,
          error:
            "Playwright browsers not installed. Please run: npx playwright install",
          output:
            "⚠️  Playwright browsers are not installed on the server.\n\nTo fix this, run the following command in your terminal:\n\n  npx playwright install\n\nThis will download the necessary browser binaries (Chromium, Firefox, WebKit).",
        });
      }

      return NextResponse.json({
        success: false,
        output: errorOutput,
      });
    }
  } catch (error: any) {
    console.error("Error running test:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to run test",
        output: error.message,
      },
      { status: 500 }
    );
  }
}
