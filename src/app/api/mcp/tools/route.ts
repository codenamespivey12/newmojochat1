import { NextRequest, NextResponse } from 'next/server';
import { MCPManager } from '@/lib/mcp';

export async function GET() {
  try {
    const tools = MCPManager.getAvailableTools();
    return NextResponse.json({ tools });
  } catch (error) {
    console.error('Error getting MCP tools:', error);
    return NextResponse.json(
      { error: 'Failed to get available tools' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toolCall } = body;

    if (!toolCall || !toolCall.name) {
      return NextResponse.json(
        { error: 'Tool call with name is required' },
        { status: 400 }
      );
    }

    const result = await MCPManager.callTool(toolCall);
    
    return NextResponse.json({
      result,
      success: !result.isError,
    });
  } catch (error) {
    console.error('Error calling MCP tool:', error);
    return NextResponse.json(
      { error: 'Failed to call tool' },
      { status: 500 }
    );
  }
}
