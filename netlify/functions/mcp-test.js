// Netlify Function for MCP Testing
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testMCPConnection(serverLabel, serverUrl) {
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
      max_output_tokens: 50,
    });

    // Check if we got mcp_list_tools in the output (indicates successful connection)
    const mcpListTools = response.output?.find(item => item.type === 'mcp_list_tools');
    
    if (mcpListTools) {
      return {
        success: true,
        tools: mcpListTools.tools || []
      };
    } else {
      return {
        success: false,
        error: 'No MCP tools list received - server may be unreachable'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
}

async function testAllMCPConnections() {
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

  const results = {};
  
  for (const server of servers) {
    results[server.label] = await testMCPConnection(server.label, server.url);
  }

  return results;
}

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { queryStringParameters } = event;
    const serverLabel = queryStringParameters?.server;

    if (serverLabel) {
      // Test specific server
      let serverUrl;
      if (serverLabel === 'exa') {
        serverUrl = `https://mcp.exa.ai/mcp?exaApiKey=${process.env.EXA_API_KEY}`;
      } else if (serverLabel === 'context7') {
        serverUrl = 'https://mcp.context7.com/mcp';
      } else {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Unknown server label' }),
        };
      }

      const result = await testMCPConnection(serverLabel, serverUrl);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          server: serverLabel,
          ...result
        }),
      };
    } else {
      // Test all servers
      const results = await testAllMCPConnections();
      
      // Add configuration validation
      const configStatus = [
        {
          server_label: 'exa',
          server_url: 'https://mcp.exa.ai/mcp?exaApiKey=***',
          configured: !!process.env.EXA_API_KEY,
          error_message: !process.env.EXA_API_KEY ? 'EXA_API_KEY not configured' : null
        },
        {
          server_label: 'context7',
          server_url: 'https://mcp.context7.com/mcp',
          configured: true,
          error_message: null
        }
      ];

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          configuration: configStatus,
          connection_tests: results,
          environment: {
            openai_key_set: !!process.env.OPENAI_API_KEY,
            exa_key_set: !!process.env.EXA_API_KEY,
            platform: 'netlify'
          }
        }),
      };
    }
  } catch (error) {
    console.error('MCP Test Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to test MCP connections',
        details: error.message
      }),
    };
  }
};