"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, Copy, Download } from "lucide-react";
import { CodePreviewModal, PageHeader } from "@/components";

export default function AIGeneratorPage() {
  const [useCase, setUseCase] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = async () => {
    if (!useCase.trim() || !baseUrl.trim()) {
      alert("Please provide both base URL and test use case");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useCase, baseUrl }),
      });

      const data = await response.json();
      setGeneratedCode(data.code);
      setShowPreview(true);
    } catch (error) {
      console.error("Error generating test:", error);
      alert("Failed to generate test. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        icon={Sparkles}
        title="AI Test Generator"
        description="Describe your test case in natural language and let AI generate Playwright code"
      />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
              <CardDescription>
                Provide details about your test scenario
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="baseUrl" className="text-sm font-medium">
                  Base URL
                </label>
                <Input
                  id="baseUrl"
                  placeholder="https://example.com"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="useCase" className="text-sm font-medium">
                  Test Use Case
                </label>
                <Textarea
                  id="useCase"
                  placeholder="Example: Test the login flow by navigating to /login, entering username 'testuser' and password 'password123', clicking the submit button, and verifying that the user is redirected to the dashboard."
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  rows={10}
                  className="resize-none"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading || !useCase.trim() || !baseUrl.trim()}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Test
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Examples</CardTitle>
              <CardDescription>
                Click to use an example test case
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setUseCase(example.description);
                    setBaseUrl(example.baseUrl);
                  }}
                  className="w-full text-left p-4 rounded-lg border hover:bg-accent hover:border-primary transition-colors"
                >
                  <h4 className="font-semibold text-sm mb-1">
                    {example.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {example.description}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        <CodePreviewModal
          open={showPreview}
          onOpenChange={setShowPreview}
          code={generatedCode}
          title="Generated Playwright Test"
        />
      </div>
    </>
  );
}

const examples = [
  {
    title: "Login Flow Test",
    baseUrl: "https://example.com",
    description:
      "Navigate to /login, enter username 'admin' and password 'admin123', click submit, and verify redirect to dashboard with welcome message.",
  },
  {
    title: "E-commerce Checkout",
    baseUrl: "https://shop.example.com",
    description:
      "Add a product to cart, go to checkout, fill in shipping details, select payment method, and verify order confirmation page.",
  },
  {
    title: "Form Submission",
    baseUrl: "https://forms.example.com",
    description:
      "Fill out a contact form with name, email, and message, submit the form, and verify success message appears.",
  },
];
