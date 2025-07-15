#!/usr/bin/env node

// MCP Integration Comparison Test
// Tests both OpenAI Responses API and Vercel AI SDK approaches

const OpenAI = require('openai');
require('dotenv').config({ path: '.env.local' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testResponsesAPI() {
  console.log('\n🔍 Testing OpenAI Responses API with MCP...');
  
  try {
    const response = await openai.responses.create({
      model: 'gpt-4.1',
      input: 'Search for recent news about artificial intelligence and summarize the top 3 findings',
      tools: [
        {
          type: "mcp",
          server_label: "exa",
          server_url: `https://mcp.exa.ai/mcp?exaApiKey=${process.env.EXA_API_KEY}`,
          require_approval: "never"
        }
      ],
      max_output_tokens: 500,
    });

    console.log('✅ Responses API - Success');
    console.log('📋 Output items:', response.output?.length || 0);
    
    // Check for MCP tool usage
    const mcpCalls = response.output?.filter(item => item.type === 'mcp_call') || [];
    const mcpListTools = response.output?.find(item => item.type === 'mcp_list_tools');
    
    console.log('🔧 MCP tools listed:', mcpListTools ? mcpListTools.tools?.length || 0 : 0);
    console.log('📞 MCP calls made:', mcpCalls.length);
    
    if (mcpCalls.length > 0) {
      mcpCalls.forEach((call, index) => {
        console.log(`   Call ${index + 1}: ${call.name} - ${call.error ? 'Failed' : 'Success'}`);
      });
    }
    
    console.log('💬 Response text length:', response.output_text?.length || 0);
    
    return {
      success: true,
      toolsListed: mcpListTools?.tools?.length || 0,
      toolsCalled: mcpCalls.length,
      responseLength: response.output_text?.length || 0
    };
  } catch (error) {
    console.log('❌ Responses API - Failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

async function testDirectMCPCall() {
  console.log('\n🔍 Testing Direct MCP Server Call...');
  
  try {
    const response = await fetch(`https://mcp.exa.ai/mcp?exaApiKey=${process.env.EXA_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(`MCP Error: ${data.error.message}`);
    }
    
    console.log('✅ Direct MCP Call - Success');
    console.log('🔧 Available tools:', data.result?.tools?.length || 0);
    
    if (data.result?.tools) {
      data.result.tools.forEach(tool => {
        console.log(`   - ${tool.name}: ${tool.description || 'No description'}`);
      });
    }
    
    return {
      success: true,
      toolsAvailable: data.result?.tools?.length || 0,
      tools: data.result?.tools || []
    };
  } catch (error) {
    console.log('❌ Direct MCP Call - Failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

async function testAISDKEndpoint() {
  console.log('\n🔍 Testing AI SDK Endpoint...');
  
  try {
    const response = await fetch('http://localhost:3000/api/chat/mojo-ai-sdk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Search for recent news about artificial intelligence and tell me about it'
          }
        ],
        stream: false
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('✅ AI SDK Endpoint - Success');
    console.log('💬 Response length:', data.message?.content?.length || 0);
    console.log('🔧 Tools used:', data.metadata?.tools_used?.length || 0);
    
    if (data.metadata?.tools_used?.length > 0) {
      console.log('   Tools:', data.metadata.tools_used.join(', '));
    }
    
    return {
      success: true,
      responseLength: data.message?.content?.length || 0,
      toolsUsed: data.metadata?.tools_used?.length || 0
    };
  } catch (error) {
    console.log('❌ AI SDK Endpoint - Failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

async function runComparison() {
  console.log('🚀 Starting MCP Integration Comparison...\n');
  
  // Check environment
  console.log('📋 Environment Check:');
  console.log(`   OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Exa API Key: ${process.env.EXA_API_KEY ? '✅ Set' : '❌ Missing'}`);
  
  if (!process.env.OPENAI_API_KEY || !process.env.EXA_API_KEY) {
    console.log('\n❌ Missing required API keys. Please check your .env.local file.');
    return;
  }
  
  // Run tests
  const directMCP = await testDirectMCPCall();
  const responsesAPI = await testResponsesAPI();
  const aiSDK = await testAISDKEndpoint();
  
  // Summary
  console.log('\n📊 Comparison Summary:');
  console.log('┌─────────────────────┬─────────┬─────────────────────────────────┐');
  console.log('│ Method              │ Status  │ Details                         │');
  console.log('├─────────────────────┼─────────┼─────────────────────────────────┤');
  console.log(`│ Direct MCP Call     │ ${directMCP.success ? '✅ Pass' : '❌ Fail'} │ ${directMCP.success ? `${directMCP.toolsAvailable} tools available` : directMCP.error?.substring(0, 25) + '...'} │`);
  console.log(`│ OpenAI Responses    │ ${responsesAPI.success ? '✅ Pass' : '❌ Fail'} │ ${responsesAPI.success ? `${responsesAPI.toolsCalled} calls, ${responsesAPI.responseLength} chars` : responsesAPI.error?.substring(0, 25) + '...'} │`);
  console.log(`│ AI SDK Endpoint     │ ${aiSDK.success ? '✅ Pass' : '❌ Fail'} │ ${aiSDK.success ? `${aiSDK.toolsUsed} tools, ${aiSDK.responseLength} chars` : aiSDK.error?.substring(0, 25) + '...'} │`);
  console.log('└─────────────────────┴─────────┴─────────────────────────────────┘');
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  if (directMCP.success && !responsesAPI.success && !aiSDK.success) {
    console.log('   - MCP server is accessible, but integration methods are failing');
    console.log('   - Check OpenAI API configuration and model availability');
  } else if (directMCP.success && (responsesAPI.success || aiSDK.success)) {
    console.log('   - MCP integration is working! 🎉');
    if (responsesAPI.success && aiSDK.success) {
      console.log('   - Both approaches work - choose based on your preference');
    } else if (responsesAPI.success) {
      console.log('   - OpenAI Responses API approach is working');
    } else if (aiSDK.success) {
      console.log('   - Vercel AI SDK approach is working');
    }
  } else if (!directMCP.success) {
    console.log('   - MCP server connection is failing');
    console.log('   - Check your EXA_API_KEY and network connectivity');
  }
}

// Run the comparison
runComparison().catch(console.error);