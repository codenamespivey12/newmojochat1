#!/usr/bin/env node

// Simple MCP Connection Test Script
// Run with: node test-mcp.js

const OpenAI = require('openai');
require('dotenv').config({ path: '.env.local' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testMCPServer(serverLabel, serverUrl) {
  console.log(`\n🔍 Testing ${serverLabel} MCP server...`);
  console.log(`URL: ${serverUrl.replace(/apiKey=[^&]+/, 'apiKey=***')}`);
  
  try {
    const response = await openai.responses.create({
      model: 'gpt-4.1',
      input: 'Test connection - please respond with "Connection successful"',
      tools: [{
        type: "mcp",
        server_label: serverLabel,
        server_url: serverUrl,
        require_approval: "never"
      }],
      max_output_tokens: 100,
    });

    // Check for mcp_list_tools in output
    const mcpListTools = response.output?.find(item => item.type === 'mcp_list_tools');
    
    if (mcpListTools) {
      console.log(`✅ ${serverLabel} connected successfully!`);
      console.log(`📋 Available tools: ${mcpListTools.tools?.length || 0}`);
      if (mcpListTools.tools?.length > 0) {
        mcpListTools.tools.forEach(tool => {
          console.log(`   - ${tool.name}`);
        });
      }
      return true;
    } else {
      console.log(`❌ ${serverLabel} connection failed - no tools list received`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${serverLabel} connection failed:`, error.message);
    return false;
  }
}

async function testAllMCPServers() {
  console.log('🚀 Starting MCP Server Connection Tests...\n');
  
  // Check environment variables
  console.log('📋 Environment Check:');
  console.log(`   OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Exa API Key: ${process.env.EXA_API_KEY ? '✅ Set' : '❌ Missing'}`);
  
  const servers = [
    {
      label: 'exa',
      url: `https://mcp.exa.ai/mcp?exaApiKey=${process.env.EXA_API_KEY}`
    },
    {
      label: 'context7',
      url: 'https://mcp.context7.com/mcp'
    }
  ];

  let successCount = 0;
  
  for (const server of servers) {
    const success = await testMCPServer(server.label, server.url);
    if (success) successCount++;
  }
  
  console.log(`\n📊 Results: ${successCount}/${servers.length} servers connected successfully`);
  
  if (successCount === servers.length) {
    console.log('🎉 All MCP servers are working correctly!');
  } else {
    console.log('⚠️  Some MCP servers failed to connect. Check the errors above.');
  }
}

// Run the test
testAllMCPServers().catch(console.error);