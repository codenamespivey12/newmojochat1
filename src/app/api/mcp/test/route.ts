import { NextRequest, NextResponse } from 'next/server';
import { testAllMCPConnections, testMCPConnection } from '@/lib/mcp-test';
import { getMCPTools, validateMCPConnection, getMCPErrorMessage } from '@/lib/mcp-config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serverLabel = searchParams.get('server');

    if (serverLabel) {
      // Test specific server
      const result = await testMCPConnection(serverLabel);
      return NextResponse.json({
        server: serverLabel,
        ...result
      });
    } else {
      // Test all servers
      const results = await testAllMCPConnections();
      const mcpTools = getMCPTools();
      
      // Add configuration validation
      const configStatus = mcpTools.map(tool => ({
        server_label: tool.server_label,
        server_url: tool.server_url.replace(/apiKey=[^&]+/, 'apiKey=***'), // Hide API key
        configured: validateMCPConnection(tool.server_label),
        error_message: validateMCPConnection(tool.server_label) ? null : getMCPErrorMessage(tool.server_label)
      }));

      return NextResponse.json({
        configuration: configStatus,
        connection_tests: results,
        environment: {
          openai_key_set: !!process.env.OPENAI_API_KEY,
          exa_key_set: !!process.env.EXA_API_KEY,
        }
      });
    }
  } catch (error: any) {
    console.error('MCP Test Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to test MCP connections',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, server_label } = body;

    if (action === 'test_connection' && server_label) {
      const result = await testMCPConnection(server_label);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: 'Invalid action or missing server_label' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('MCP Test POST Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process MCP test request',
        details: error.message 
      },
      { status: 500 }
    );
  }
}