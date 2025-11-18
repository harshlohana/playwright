import type { Node, Edge } from "@xyflow/react";

export function pipelineToPlaywright(
  nodes: Node[],
  edges: Edge[],
  baseUrl: string
): string {
  if (nodes.length === 0) {
    return "// No nodes to generate code from";
  }

  // Sort nodes based on edges to get execution order
  const sortedNodes = topologicalSort(nodes, edges);

  let code = `import { test, expect } from '@playwright/test';

test('Generated test', async ({ page }) => {
`;

  for (const node of sortedNodes) {
    const indent = "  ";

    switch (node.type) {
      case "navigate": {
        const data = node.data as any;
        const url = data.url || "/";
        const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;
        code += `${indent}await page.goto('${fullUrl}');\n`;
        break;
      }

      case "click": {
        const data = node.data as any;
        const selector = data.selector || "";
        if (selector) {
          code += `${indent}await page.click('${selector}');\n`;
        }
        break;
      }

      case "type": {
        const data = node.data as any;
        const selector = data.selector || "";
        const text = data.text || "";
        if (selector && text) {
          code += `${indent}await page.fill('${selector}', '${text}');\n`;
        }
        break;
      }

      case "expect": {
        const data = node.data as any;
        const selector = data.selector || "";
        const condition = data.condition || "toBeVisible";

        if (selector) {
          switch (condition) {
            case "toBeVisible":
              code += `${indent}await expect(page.locator('${selector}')).toBeVisible();\n`;
              break;
            case "toHaveText":
              const expectedText = data.expectedText || "";
              code += `${indent}await expect(page.locator('${selector}')).toHaveText('${expectedText}');\n`;
              break;
            case "toHaveValue":
              const expectedValue = data.expectedValue || "";
              code += `${indent}await expect(page.locator('${selector}')).toHaveValue('${expectedValue}');\n`;
              break;
            default:
              code += `${indent}await expect(page.locator('${selector}')).${condition}();\n`;
          }
        }
        break;
      }
    }
  }

  code += `});
`;

  return code;
}

// Topological sort to determine node execution order
function topologicalSort(nodes: Node[], edges: Edge[]): Node[] {
  if (nodes.length === 0) return [];

  // Build adjacency list
  const adjacencyList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  nodes.forEach((node) => {
    adjacencyList.set(node.id, []);
    inDegree.set(node.id, 0);
  });

  edges.forEach((edge) => {
    adjacencyList.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });

  // Find nodes with no incoming edges
  const queue: string[] = [];
  nodes.forEach((node) => {
    if (inDegree.get(node.id) === 0) {
      queue.push(node.id);
    }
  });

  const result: Node[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodeMap.get(nodeId);
    if (node) result.push(node);

    const neighbors = adjacencyList.get(nodeId) || [];
    neighbors.forEach((neighborId) => {
      const degree = inDegree.get(neighborId)! - 1;
      inDegree.set(neighborId, degree);
      if (degree === 0) {
        queue.push(neighborId);
      }
    });
  }

  // If no edges, return nodes in their original order
  return result.length > 0 ? result : nodes;
}
