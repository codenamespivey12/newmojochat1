// MCP Server Configuration Utility
export interface MCPTool {
  type: "mcp";
  server_label: string;
  server_url: string;
  require_approval: "never" | "always" | { never: { tool_names: string[] } };
  allowed_tools?: string[];
  headers?: Record<string, string>;
}

export function getMCPTools(): MCPTool[] {
  const tools: MCPTool[] = [];

  // Exa Search MCP Server
  if (process.env.EXA_API_KEY) {
    tools.push({
      type: "mcp",
      server_label: "exa",
      server_url: `https://mcp.exa.ai/mcp?exaApiKey=${process.env.EXA_API_KEY}`,
      require_approval: "never",
      allowed_tools: [
        "web_search_exa",
        "research_paper_search", 
        "company_research",
        "crawling",
        "wikipedia_search_exa",
        "github_search"
      ]
    });
  }

  // Context7 Documentation MCP Server
  tools.push({
    type: "mcp",
    server_label: "context7",
    server_url: "https://mcp.context7.com/mcp",
    require_approval: "never",
    allowed_tools: [
      "resolve-library-id",
      "get-library-docs"
    ]
  });

  return tools;
}

export function validateMCPConnection(serverLabel: string): boolean {
  switch (serverLabel) {
    case "exa":
      return !!process.env.EXA_API_KEY;
    case "context7":
      return true; // No API key required
    default:
      return false;
  }
}

export function getMCPErrorMessage(serverLabel: string): string {
  switch (serverLabel) {
    case "exa":
      return "Exa API key not configured. Please set EXA_API_KEY environment variable.";
    case "context7":
      return "Context7 MCP server connection failed.";
    default:
      return `Unknown MCP server: ${serverLabel}`;
  }
}