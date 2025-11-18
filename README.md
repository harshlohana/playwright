# Playwright Test Generator

A comprehensive Next.js 14 application for generating Playwright test cases using AI and a visual drag-and-drop builder.

## Features

- **🎨 Visual Builder**: Create test flows using a drag-and-drop React Flow interface
- **🤖 AI Generation**: Generate Playwright tests from natural language descriptions
- **📝 Code Export**: Export generated tests as `.spec.ts` files
- **▶️ Test Execution**: Run tests directly from the platform
- **💾 Pipeline Management**: Save and manage your test pipelines

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui components
- React Flow for visual builder
- OpenAI API for AI generation
- Playwright for test execution

## Prerequisites

- Node.js 18+ (recommended Node.js 20+)
- npm or yarn
- OpenAI API key (optional, for AI generation feature)

## Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd playwright-generator
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key_here
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Dashboard

The home page provides quick access to all features and a getting started guide.

### Visual Builder (`/builder`)

1. Click "Add Nodes" to add test steps:
   - **Navigate**: Go to a URL
   - **Click**: Click an element
   - **Type**: Enter text into an input
   - **Expect**: Add assertions
2. Connect nodes by dragging from the bottom handle of one node to the top handle of another
3. Configure each node by clicking on it
4. Click "Generate Code" to convert your flow to Playwright code
5. Save your pipeline for later use

### AI Generator (`/ai`)

1. Enter your application's base URL
2. Describe your test scenario in natural language
3. Click "Generate Test" to create Playwright code
4. Copy, download, or run the generated test

### Test Files (`/tests`)

View and manage all your saved test pipelines.

## API Routes

- `POST /api/generate` - Generate Playwright code from natural language
- `POST /api/savePipeline` - Save a test pipeline
- `GET /api/savePipeline` - Get all saved pipelines
- `POST /api/runTest` - Execute a Playwright test

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── ai/            # AI generator page
│   ├── builder/       # Visual builder page
│   ├── tests/         # Test files page
│   └── page.tsx       # Dashboard
├── components/
│   ├── ui/            # shadcn/ui components
│   ├── nodes/         # React Flow custom nodes
│   ├── app-sidebar.tsx
│   ├── builder-canvas.tsx
│   ├── code-preview-modal.tsx
│   └── pipeline-sidebar.tsx
└── lib/
    ├── pipelineToPlaywright.ts  # Flow to code converter
    └── utils.ts                  # Utility functions
```

## Features in Detail

### Node Types

**Navigate Node**

- Navigates to a specified URL
- Supports both absolute and relative URLs

**Click Node**

- Clicks on an element using a CSS selector
- Waits for element to be clickable

**Type Node**

- Fills text into an input field
- Uses CSS selector to target element

**Expect Node**

- Adds assertions to verify test conditions
- Supports multiple assertion types:
  - `toBeVisible` - Element is visible
  - `toHaveText` - Element contains specific text
  - `toHaveValue` - Input has specific value

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
