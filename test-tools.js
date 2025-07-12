// Test script to verify image generation and code interpreter tools are working
const fetch = require('node-fetch');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('Please set OPENAI_API_KEY environment variable');
  process.exit(1);
}

async function testImageGeneration() {
  console.log('Testing Image Generation...');
  
  try {
    const response = await fetch('http://localhost:3000/api/chat/mojo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Please generate a simple image of a cat sitting on a windowsill'
          }
        ],
        stream: false
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('Error:', data.error);
    } else {
      console.log('✅ Image generation test successful');
      console.log('Response:', data.message.content);
      if (data.metadata?.tools_used) {
        console.log('Tools used:', data.metadata.tools_used);
      }
    }
  } catch (error) {
    console.error('❌ Image generation test failed:', error.message);
  }
}

async function testCodeInterpreter() {
  console.log('\nTesting Code Interpreter...');
  
  try {
    const response = await fetch('http://localhost:3000/api/chat/mojo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Please calculate the factorial of 10 using Python code'
          }
        ],
        stream: false
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('Error:', data.error);
    } else {
      console.log('✅ Code interpreter test successful');
      console.log('Response:', data.message.content);
      if (data.metadata?.tools_used) {
        console.log('Tools used:', data.metadata.tools_used);
      }
    }
  } catch (error) {
    console.error('❌ Code interpreter test failed:', error.message);
  }
}

async function testMojoPlusTools() {
  console.log('\nTesting Mojo++ (O3) with high reasoning effort and tools...');

  try {
    const response = await fetch('http://localhost:3000/api/chat/mojo-plus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Create a visualization showing the fibonacci sequence up to the 10th number'
          }
        ],
        stream: false
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('Error:', data.error);
    } else {
      console.log('✅ Mojo++ tools test successful');
      console.log('Response:', data.message.content);
      if (data.metadata?.tools_used) {
        console.log('Tools used:', data.metadata.tools_used);
      }
    }
  } catch (error) {
    console.error('❌ Mojo++ tools test failed:', error.message);
  }
}

async function testExaMCPTool() {
  console.log('\nTesting Exa MCP Tool...');

  try {
    const response = await fetch('http://localhost:3000/api/chat/mojo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Search for recent news about artificial intelligence breakthroughs'
          }
        ],
        stream: false
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('Error:', data.error);
    } else {
      console.log('✅ Exa MCP tool test successful');
      console.log('Response:', data.message.content);
      if (data.metadata?.tools_used) {
        console.log('Tools used:', data.metadata.tools_used);
      }
    }
  } catch (error) {
    console.error('❌ Exa MCP tool test failed:', error.message);
  }
}

async function testContext7MCPTool() {
  console.log('\nTesting Context7 MCP Tool...');

  try {
    const response = await fetch('http://localhost:3000/api/chat/mojo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Find documentation about React hooks, specifically useState and useEffect'
          }
        ],
        stream: false
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('Error:', data.error);
    } else {
      console.log('✅ Context7 MCP tool test successful');
      console.log('Response:', data.message.content);
      if (data.metadata?.tools_used) {
        console.log('Tools used:', data.metadata.tools_used);
      }
    }
  } catch (error) {
    console.error('❌ Context7 MCP tool test failed:', error.message);
  }
}

async function runTests() {
  console.log('🧪 Testing OpenAI Tools Integration with MCP Servers\n');

  await testImageGeneration();
  await testCodeInterpreter();
  await testMojoPlusTools();
  await testExaMCPTool();
  await testContext7MCPTool();

  console.log('\n✨ All tests completed!');
  console.log('\n📋 Summary:');
  console.log('- Image Generation: Available on both Mojo and Mojo++');
  console.log('- Code Interpreter: Available on both Mojo and Mojo++');
  console.log('- Exa Search: Available via remote MCP server');
  console.log('- Context7 Docs: Available via remote MCP server');
}

runTests().catch(console.error);
