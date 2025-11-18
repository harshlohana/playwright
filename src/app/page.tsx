import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Workflow,
  Sparkles,
  FileCode,
  Plus,
  Home as HomeIcon,
} from "lucide-react";
import { PageHeader } from "@/components";

export default function Home() {
  return (
    <>
      <PageHeader
        icon={HomeIcon}
        title="Playwright Test Generator"
        description="Create comprehensive Playwright tests using visual builder or AI"
      />
      <div className="flex-1 overflow-auto p-6 space-y-8">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Workflow className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Visual Builder</CardTitle>
              <CardDescription>
                Drag and drop nodes to create test flows visually
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/builder">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Flow
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Sparkles className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>AI Generator</CardTitle>
              <CardDescription>
                Describe your test case and let AI generate the code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/ai">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Test
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileCode className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Test Files</CardTitle>
              <CardDescription>
                View and manage your generated test files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/tests">View Tests</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Follow these steps to create your first test
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                1
              </div>
              <div>
                <h3 className="font-semibold">Configure Your App</h3>
                <p className="text-sm text-muted-foreground">
                  Add your web app's base URL and authentication credentials
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                2
              </div>
              <div>
                <h3 className="font-semibold">Create Test Flow</h3>
                <p className="text-sm text-muted-foreground">
                  Use the visual builder or AI generator to create your test
                  scenario
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold">Export & Run</h3>
                <p className="text-sm text-muted-foreground">
                  Export as .spec.ts files or run tests directly from the
                  platform
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
