# MCP Server Debugging Guide

This guide will help you troubleshoot MCP (Model Context Protocol) server connection issues in your AI chatbot project.

## Quick Diagnosis

### 1. Test MCP Connections
```bash
npm run mcp:test
```

This will test all configured MCP servers and show you exactly what's working and what isn't.

### 2. Check API Endpoint
Visit your deployed app's MCP test endpoint:
```
https://your-app.vercel.app/api/mcp/test
```

Or locally:
```
http://localhost:3000/api/mcp/test
```

## Common Issues & Solutions

### Issue 1: Environment Variables Not Set

**Symptoms:**
- `❌ Exa API Key: Missing` in test output
- MCP tools not working in chat

**Solution:**
1. Check your `.env.local` file exists and contains:
```env
OPENAI_API_KEY=your_openai_api_key_here
EXA_API_KEY=c69ad329-ded7-44fe-903a-42c355ad759d
```

2. For Vercel deployment, set environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to Environment Variables
   - Add `OPENAI_API_KEY` and `EXA_API_KEY`

### Issue 2: MCP Server Unreachable

**Symptoms:**
- `❌ connection failed - no tools list received`
- Network timeout errors

**Solution:**
1. Check if the MCP server URLs are correct:
   - Exa: `https://mcp.exa.ai/mcp`
   - Context7: `https://mcp.context7.com/mcp`

2. Test manually with curl:
```bash
curl -X POST "https://mcp.exa.ai/mcp?exaApiKey=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'
```

### Issue 3: API Key Invalid

**Symptoms:**
- Authentication errors
- 401/403 HTTP status codes

**Solution:**
1. Verify your Exa API key is valid
2. Check if the API key has the necessary permissions
3. Try regenerating the API key from the Exa dashboard

### Issue 4: Vercel Edge Runtime Issues

**Symptoms:**
- Works locally but fails on Vercel
- Edge runtime compatibility errors

**Solution:**
1. Check if all dependencies are compatible with Edge Runtime
2. Consider switching to Node.js runtime if needed:
```typescript
export const runtime = 'nodejs'; // instead of 'edge'
```

## Debugging Steps

### Step 1: Local Testing
1. Run `npm run mcp:test` locally
2. Check console output for specific errors
3. Verify all environment variables are set

### Step 2: API Endpoint Testing
1. Test the `/api/mcp/test` endpoint
2. Check browser network tab for HTTP errors
3. Look at server logs for detailed error messages

### Step 3: Production Testing
1. Deploy to Vercel with environment variables set
2. Test the production `/api/mcp/test` endpoint
3. Check Vercel function logs for errors

### Step 4: Chat Integration Testing
1. Try using MCP tools in actual chat conversations
2. Look for tool call results in the response
3. Check for `mcp_call` items in the API response

## MCP Server Status

### Exa Search Server
- **URL:** `https://mcp.exa.ai/mcp`
- **Authentication:** API key required
- **Tools:** web_search_exa, research_paper_search, company_research, crawling, wikipedia_search_exa, github_search

### Context7 Documentation Server
- **URL:** `https://mcp.context7.com/mcp`
- **Authentication:** None required
- **Tools:** resolve-library-id, get-library-docs

## Monitoring MCP Usage

### In Chat Responses
Look for these items in the API response:
```json
{
  "type": "mcp_list_tools",
  "server_label": "exa",
  "tools": [...]
}
```

```json
{
  "type": "mcp_call",
  "server_label": "exa",
  "name": "web_search_exa",
  "arguments": "...",
  "output": "..."
}
```

### Error Handling
The API now includes specific MCP error handling:
- Connection failures return 503 status
- Detailed error messages in response
- Suggestions for debugging

## Getting Help

If you're still having issues:

1. Check the console logs for detailed error messages
2. Test individual MCP servers using the test script
3. Verify your OpenAI API key has access to the Responses API
4. Ensure your Vercel deployment has all required environment variables

## Advanced Debugging

### Enable Detailed Logging
Add this to your API routes for more verbose logging:
```typescript
console.log('MCP Tools Configuration:', JSON.stringify(tools, null, 2));
console.log('Response Output:', JSON.stringify(response.output, null, 2));
```

### Test Individual Tools
You can test specific MCP tools by modifying the test script to call individual tools:
```javascript
// Test specific Exa search
const response = await openai.responses.create({
  model: 'gpt-4.1',
  input: 'Search for recent news about artificial intelligence',
  tools: [exaMCPTool],
  tool_choice: 'required'
});
```