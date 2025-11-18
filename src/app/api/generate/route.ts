import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    const { useCase, baseUrl } = await request.json();

    if (!useCase || !baseUrl) {
      return NextResponse.json(
        { error: "useCase and baseUrl are required" },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      // Return a mock response if no API key
      const mockCode = generateMockPlaywrightCode(useCase, baseUrl);
      return NextResponse.json({ code: mockCode });
    }

    const prompt = `Generate a Playwright test case for the following scenario:

Base URL: ${baseUrl}
Test Case: ${useCase}

Generate complete, production-ready Playwright test code using TypeScript.
Include proper imports, test structure, and assertions.
Use modern Playwright best practices.

Return only the code, no explanations.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an expert at writing Playwright test automation code. Generate clean, efficient, and well-structured test code.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const code = completion.choices[0]?.message?.content || "";

    // Extract code from markdown if present
    const codeMatch = code.match(/```(?:typescript|ts)?\n([\s\S]*?)\n```/);
    const cleanCode = codeMatch ? codeMatch[1] : code;

    return NextResponse.json({ code: cleanCode });
  } catch (error) {
    console.error("Error generating test:", error);

    // Fallback to mock code on error
    const { useCase, baseUrl } = await request.json();
    const mockCode = generateMockPlaywrightCode(useCase, baseUrl);

    return NextResponse.json({ code: mockCode });
  }
}

function generateMockPlaywrightCode(useCase: string, baseUrl: string): string {
  return `import { test, expect } from '@playwright/test';

test('${useCase.slice(0, 50)}...', async ({ page }) => {
  // Navigate to the application
  await page.goto('${baseUrl}');
  
  // TODO: Implement test steps based on use case:
  // ${useCase}
  
  // Example assertions
  await expect(page).toHaveURL('${baseUrl}');
  await expect(page.locator('body')).toBeVisible();
  
  // Add your test steps here
});
`;
}
