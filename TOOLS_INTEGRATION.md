# MCP Tools Integration Guide

This guide explains the different approaches to integrating MCP (Model Context Protocol) tools in your AI chatbot and helps you choose the best approach for your needs.

## Available Approaches

### 1. OpenAI Responses API (Current Implementation)
- **Files**: `src/app/api/chat/mojo/route.ts`, `src/app/api/chat/mojo-plus/route.ts`
- **Models**: GPT-4.1, O3-mini
- **Pros**: 
  - Direct OpenAI integration
  - Advanced reasoning capabilities (O3)
  - Built-in tool orchestration
- **Cons**: 
  - Newer API with less documentation
  - Limited model selection

### 2. Vercel AI SDK (Alternative Implementation)
- **Files**: `src/app/api/chat/mojo-ai-sdk/route.ts`
- **Models**: GPT-4-turbo, GPT-4, GPT-3.5-turbo
- **Pros**: 
  - Mature, well-documented SDK
  - Better streaming support
  - More flexible tool integration
- **Cons**: 
  - Manual MCP server communication
  - No built-in O3 reasoning support

## Testing Your Integration

### Quick Test
```bash
# Test basic MCP connections
npm run mcp:test

# Compare both approaches
npm run mcp:compare
```

### Manual Testing
```bash
# Test individual endpoints
curl -X POST http://localhost:3000/api/chat/mojo \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Search for recent AI news"}]}'

curl -X POST http://localhost:3000/api/chat/mojo-ai-sdk \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Search for recent AI news"}]}'
```

## MCP Server Configuration

### Current MCP Servers

#### Exa Search Server
- **URL**: `https://mcp.exa.ai/mcp`
- **Authentication**: API key required (`EXA_API_KEY`)
- **Tools**: 
  - `web_search_exa`: General web search
  - `research_paper_search`: Academic paper search
  - `company_research`: Business information
  - `crawling`: Extract content from URLs
  - `wikipedia_search_exa`: Wikipedia search
  - `github_search`: GitHub repository search

#### Context7 Documentation Server
- **URL**: `https://mcp.context7.com/mcp`
- **Authentication**: None required
- **Tools**:
  - `resolve-library-id`: Find library documentation ID
  - `get-library-docs`: Retrieve library documentation

### Adding New MCP Servers

#### For OpenAI Responses API
Edit `src/lib/mcp-config.ts`:
```typescript
export function getMCPTools(): MCPTool[] {
  const tools: MCPTool[] = [];
  
  // Add your new MCP server
  tools.push({
    type: "mcp",
    server_label: "your_server",
    server_url: "https://your-mcp-server.com/mcp",
    require_approval: "never",
    allowed_tools: ["tool1", "tool2"]
  });
  
  return tools;
}
```

#### For AI SDK
Edit `src/app/api/chat/mojo-ai-sdk/route.ts`:
```typescript
const mcpTools = {
  your_tool: {
    description: 'Description of your tool',
    parameters: {
      type: 'object',
      properties: {
        param1: { type: 'string', description: 'Parameter description' }
      },
      required: ['param1']
    },
    execute: async ({ param1 }: any) => {
      const response = await fetch('https://your-mcp-server.com/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: { name: 'your_tool', arguments: { param1 } }
        })
      });
      const data = await response.json();
      return data.result;
    }
  }
};
```

## Troubleshooting Common Issues

### Issue 1: MCP Server Not Responding
**Symptoms**: Connection timeouts, no tools listed
**Solutions**:
1. Test direct MCP connection: `npm run mcp:compare`
2. Check server URL and API keys
3. Verify network connectivity

### Issue 2: Tools Not Being Called
**Symptoms**: AI responds without using tools
**Solutions**:
1. Make your prompts more specific about needing current information
2. Use phrases like "search for", "look up", "find recent"
3. Check tool descriptions are clear and relevant

### Issue 3: Authentication Errors
**Symptoms**: 401/403 errors, authentication failures
**Solutions**:
1. Verify API keys are correctly set in environment variables
2. Check API key permissions and quotas
3. Ensure API keys are properly URL-encoded in server URLs

### Issue 4: Vercel Deployment Issues
**Symptoms**: Works locally but fails in production
**Solutions**:
1. Set all environment variables in Vercel dashboard
2. Check function timeout limits (Vercel has 10s limit for Hobby plan)
3. Consider using Node.js runtime instead of Edge runtime

## Performance Optimization

### Reduce Latency
1. **Cache MCP tool lists**: Keep `mcp_list_tools` in conversation context
2. **Limit tool scope**: Use `allowed_tools` to restrict available tools
3. **Batch requests**: Combine multiple tool calls when possible

### Improve Reliability
1. **Add retry logic**: Implement exponential backoff for failed MCP calls
2. **Fallback handling**: Gracefully handle MCP server failures
3. **Monitor usage**: Track tool call success rates and response times

## Best Practices

### Tool Design
1. **Clear descriptions**: Make tool purposes obvious to the AI
2. **Specific parameters**: Use enums and validation where possible
3. **Error handling**: Return meaningful error messages

### Security
1. **API key management**: Never expose API keys in client-side code
2. **Input validation**: Sanitize all tool parameters
3. **Rate limiting**: Implement appropriate rate limits for tool calls

### User Experience
1. **Loading indicators**: Show when tools are being executed
2. **Error messages**: Provide helpful error messages to users
3. **Tool transparency**: Let users know when external tools are being used

## Monitoring and Debugging

### Logging
Add comprehensive logging to track tool usage:
```typescript
console.log('MCP Tool Call:', {
  tool: toolName,
  arguments: args,
  server: serverLabel,
  timestamp: new Date().toISOString()
});
```

### Metrics to Track
- Tool call success/failure rates
- Response times for each MCP server
- Most frequently used tools
- Error patterns and causes

### Debug Endpoints
- `/api/mcp/test` - Test all MCP connections
- `/api/mcp/test?server=exa` - Test specific server
- Browser dev tools - Check network requests and responses

## Migration Guide

### From OpenAI Responses API to AI SDK
1. Install AI SDK: `npm install ai @ai-sdk/openai`
2. Create new route using AI SDK pattern
3. Implement manual MCP tool execution
4. Test thoroughly before switching

### From AI SDK to OpenAI Responses API
1. Update to use `openai.responses.create()`
2. Configure MCP tools in `tools` array
3. Handle `mcp_call` and `mcp_list_tools` output items
4. Update streaming response handling

## Future Considerations

### Upcoming Features
- More MCP servers becoming available
- Improved tool orchestration in OpenAI API
- Better streaming support for tool calls

### Scalability
- Consider implementing tool call caching
- Monitor API usage and costs
- Plan for increased tool complexity

## Getting Help

1. **Test first**: Run `npm run mcp:compare` to identify issues
2. **Check logs**: Look at server logs for detailed error messages
3. **Verify environment**: Ensure all API keys and URLs are correct
4. **Community resources**: Check MCP documentation and community forums