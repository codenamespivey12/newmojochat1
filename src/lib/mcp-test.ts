// MCP Connection Testing Utility
import OpenAI from 'openai';
import { getMCPTools } from './mcp-config';

export async function testMCPConnection(serverLabel: string): Promise<{
  success: boolean;
  error?: string;
  tools?: any[];
}> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const mcpTools = getMCPTools();
    const targetTool = mcpTools.find(tool => tool.server_label === serverLabel);
    
    if (!targetTool) {
      return {
        success: false,
        error: `MCP server '${serverLabel}' not found in configuration`
      };
    }

    // Test connection by creating a simple response with just this MCP tool
    const response = await openai.responses.create({
      model: 'gpt-4.1',
      input: 'Test connection - please respond with "Connection successful"',
      tools: [targetTool],
      max_output_tokens: 50,
    });

    // Check if we got mcp_list_tools in the output (indicates successful connection)
    const mcpListTools = response.output?.find(item => item.type === 'mcp_list_tools');
    
    if (mcpListTools) {
      return {
        success: true,
        tools: (mcpListTools as any).tools || []
      };
    } else {
      return {
        success: false,
        error: 'No MCP tools list received - server may be unreachable'
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
}

export async function testAllMCPConnections(): Promise<Record<string, {
  success: boolean;
  error?: string;
  tools?: any[];
}>> {
  const mcpTools = getMCPTools();
  const results: Record<string, any> = {};

  for (const tool of mcpTools) {
    results[tool.server_label] = await testMCPConnection(tool.server_label);
  }

  return results;
}