#!/usr/bin/env node

// Test Netlify Functions Locally
// Run with: npm run netlify:dev (in another terminal) then node test-netlify-functions.js

require('dotenv').config({ path: '.env.local' });

async function testNetlifyFunction(functionName, payload = null) {
    const baseUrl = 'http://localhost:8888/.netlify/functions';
    const url = `${baseUrl}/${functionName}`;

    console.log(`\n🔍 Testing Netlify function: ${functionName}`);
    console.log(`URL: ${url}`);

    try {
        const options = {
            method: payload ? 'POST' : 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (payload) {
            options.body = JSON.stringify(payload);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        console.log(`✅ ${functionName} - Success`);
        console.log(`📊 Response size: ${JSON.stringify(data).length} characters`);

        // Function-specific checks
        if (functionName === 'mcp-test') {
            const { configuration, connection_tests, environment } = data;
            console.log(`🔧 Environment check:`);
            console.log(`   OpenAI Key: ${environment.openai_key_set ? '✅' : '❌'}`);
            console.log(`   Exa Key: ${environment.exa_key_set ? '✅' : '❌'}`);
            console.log(`   Platform: ${environment.platform}`);

            console.log(`📋 MCP Servers:`);
            Object.entries(connection_tests).forEach(([server, result]) => {
                console.log(`   ${server}: ${result.success ? '✅' : '❌'} ${result.success ? `(${result.tools?.length || 0} tools)` : result.error}`);
            });
        }

        if (functionName === 'chat-mojo') {
            const { message, metadata } = data;
            console.log(`💬 Response length: ${message?.content?.length || 0} characters`);
            console.log(`🔧 Tools used: ${metadata?.tools_used?.length || 0}`);
            if (metadata?.tools_used?.length > 0) {
                console.log(`   Tools: ${metadata.tools_used.join(', ')}`);
            }
        }

        return { success: true, data };
    } catch (error) {
        console.log(`❌ ${functionName} - Failed: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function runNetlifyTests() {
    console.log('🚀 Testing Netlify Functions Locally...\n');

    // Check if Netlify dev server is running
    try {
        const healthCheck = await fetch('http://localhost:8888');
        if (!healthCheck.ok) {
            throw new Error('Netlify dev server not responding');
        }
    } catch (error) {
        console.log('❌ Netlify dev server is not running!');
        console.log('💡 Please run "npm run netlify:dev" in another terminal first.');
        return;
    }

    console.log('✅ Netlify dev server is running');

    // Test MCP test function
    const mcpTest = await testNetlifyFunction('mcp-test');

    // Test chat function
    const chatTest = await testNetlifyFunction('chat-mojo', {
        messages: [
            {
                role: 'user',
                content: 'Hello! Can you search for recent news about artificial intelligence and tell me about it?'
            }
        ],
        stream: false
    });

    // Summary
    console.log('\n📊 Netlify Functions Test Summary:');
    console.log('┌─────────────────┬─────────┬─────────────────────────────────┐');
    console.log('│ Function        │ Status  │ Details                         │');
    console.log('├─────────────────┼─────────┼─────────────────────────────────┤');
    console.log(`│ mcp-test        │ ${mcpTest.success ? '✅ Pass' : '❌ Fail'} │ ${mcpTest.success ? 'MCP connections tested' : mcpTest.error?.substring(0, 25) + '...'} │`);
    console.log(`│ chat-mojo       │ ${chatTest.success ? '✅ Pass' : '❌ Fail'} │ ${chatTest.success ? 'Chat with MCP tools' : chatTest.error?.substring(0, 25) + '...'} │`);
    console.log('└─────────────────┴─────────┴─────────────────────────────────┘');

    if (mcpTest.success && chatTest.success) {
        console.log('\n🎉 All Netlify functions are working correctly!');
        console.log('💡 Your app is ready for Netlify deployment.');
    } else {
        console.log('\n⚠️  Some functions failed. Check the errors above.');
        console.log('💡 Make sure your environment variables are set correctly.');
    }
}

// Run the tests
runNetlifyTests().catch(console.error);