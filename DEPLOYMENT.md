# Deployment Guide

This guide covers deploying your AI chatbot with MCP integration to both Netlify and Vercel.

## 🚀 Netlify Deployment (Recommended)

Netlify offers excellent support for Next.js apps with serverless functions and is often more reliable for complex API integrations.

### Prerequisites

1. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
2. **Netlify CLI**: Already installed as dev dependency
3. **Environment Variables**: Have your API keys ready

### Quick Deploy

#### Option 1: Git Integration (Recommended)

1. **Push to GitHub**:
```bash
git add .
git commit -m "Add Netlify deployment configuration"
git push origin main
```

2. **Connect to Netlify**:
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Choose your repository
   - Configure build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `.next`
     - **Functions directory**: `netlify/functions`

3. **Set Environment Variables**:
   - Go to Site Settings → Environment Variables
   - Add these variables:
```env
OPENAI_API_KEY=your_openai_api_key_here
EXA_API_KEY=your_exa_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

4. **Deploy**: Netlify will automatically build and deploy your site

#### Option 2: CLI Deploy

1. **Login to Netlify**:
```bash
npx netlify login
```

2. **Initialize Site**:
```bash
npx netlify init
```

3. **Set Environment Variables**:
```bash
npx netlify env:set OPENAI_API_KEY "your_openai_api_key_here"
npx netlify env:set EXA_API_KEY "your_exa_api_key_here"
npx netlify env:set NEXT_PUBLIC_SUPABASE_URL "your_supabase_url_here"
npx netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your_supabase_anon_key_here"
```

4. **Deploy**:
```bash
npm run netlify:deploy:prod
```

### Netlify-Specific Features

#### API Endpoints
Your API routes are automatically converted to Netlify Functions:
- `https://your-site.netlify.app/.netlify/functions/chat-mojo`
- `https://your-site.netlify.app/.netlify/functions/mcp-test`

#### Testing Netlify Functions Locally
```bash
npm run netlify:dev
```

This starts a local development server that mimics Netlify's environment.

### Netlify Configuration

The `netlify.toml` file configures:
- **Build settings**: Node.js version, build command
- **Redirects**: API routes to functions
- **Headers**: Security and caching headers
- **Environment**: Production settings

## 🔷 Vercel Deployment (Alternative)

Vercel is the original platform for Next.js and offers excellent performance.

### Quick Deploy

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Login**:
```bash
vercel login
```

3. **Deploy**:
```bash
npm run deploy
```

4. **Set Environment Variables**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your project → Settings → Environment Variables
   - Add the same environment variables as above

### Vercel-Specific Configuration

The `vercel.json` file handles:
- Function configuration
- Build settings
- Environment variables

## 🧪 Testing Your Deployment

### After Deployment

1. **Test MCP Connections**:
```bash
# For Netlify
curl https://your-site.netlify.app/.netlify/functions/mcp-test

# For Vercel  
curl https://your-site.vercel.app/api/mcp/test
```

2. **Test Chat API**:
```bash
# For Netlify
curl -X POST https://your-site.netlify.app/.netlify/functions/chat-mojo \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello, search for recent AI news"}]}'

# For Vercel
curl -X POST https://your-site.vercel.app/api/chat/mojo \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello, search for recent AI news"}]}'
```

3. **Check Frontend**:
   - Visit your deployed site
   - Test the chat interface
   - Verify MCP tools are working

## 🔧 Troubleshooting

### Common Issues

#### Environment Variables Not Set
**Symptoms**: API errors, missing configuration
**Solution**: 
- Double-check all environment variables are set in your platform's dashboard
- Redeploy after setting variables

#### Function Timeout
**Symptoms**: 504 Gateway Timeout errors
**Solution**:
- **Netlify**: Functions timeout after 10 seconds (26 seconds for Pro)
- **Vercel**: Functions timeout after 10 seconds (Hobby), 60 seconds (Pro)
- Optimize MCP calls or upgrade plan

#### CORS Issues
**Symptoms**: Browser console errors about CORS
**Solution**: 
- Check that CORS headers are properly set in function responses
- Verify your domain is correctly configured

#### MCP Server Connection Failures
**Symptoms**: Tools not working, connection errors
**Solution**:
- Test MCP endpoints directly: `/mcp-test` or `/api/mcp/test`
- Verify API keys are correctly set
- Check server logs for detailed errors

### Platform-Specific Issues

#### Netlify Issues
- **Build failures**: Check build logs in Netlify dashboard
- **Function errors**: Check function logs in Netlify dashboard
- **Redirects not working**: Verify `netlify.toml` configuration

#### Vercel Issues
- **Edge runtime errors**: Consider switching to Node.js runtime
- **Import errors**: Ensure all dependencies are properly installed
- **API route issues**: Check file structure matches Vercel conventions

## 📊 Monitoring and Analytics

### Netlify Analytics
- Enable Netlify Analytics in site settings
- Monitor function invocations and errors
- Track performance metrics

### Vercel Analytics
- Enable Vercel Analytics in project settings
- Monitor function performance
- Track user interactions

### Custom Monitoring
Add logging to track MCP usage:
```javascript
console.log('MCP Tool Used:', {
  tool: toolName,
  server: serverLabel,
  success: !error,
  timestamp: new Date().toISOString()
});
```

## 🚀 Performance Optimization

### Netlify Optimizations
- Enable asset optimization in build settings
- Use Netlify's CDN for static assets
- Configure caching headers in `netlify.toml`

### Vercel Optimizations
- Enable Edge Functions for better performance
- Use Vercel's Image Optimization
- Configure ISR (Incremental Static Regeneration) where appropriate

### General Optimizations
- Minimize function cold starts
- Cache MCP tool definitions
- Optimize bundle size
- Use compression for API responses

## 🔐 Security Considerations

### Environment Variables
- Never commit API keys to version control
- Use different keys for development and production
- Regularly rotate API keys

### Function Security
- Validate all inputs
- Implement rate limiting
- Use HTTPS only
- Set appropriate CORS headers

### MCP Security
- Only connect to trusted MCP servers
- Monitor MCP tool usage
- Implement approval workflows for sensitive operations

## 📈 Scaling Considerations

### Traffic Growth
- Monitor function invocation limits
- Consider upgrading to paid plans for higher limits
- Implement caching strategies

### Cost Management
- Monitor API usage and costs
- Set up billing alerts
- Optimize function execution time

### Performance Monitoring
- Track response times
- Monitor error rates
- Set up alerting for issues

## 🆘 Getting Help

### Platform Support
- **Netlify**: [Netlify Support](https://www.netlify.com/support/)
- **Vercel**: [Vercel Support](https://vercel.com/support)

### Community Resources
- **Netlify Community**: [community.netlify.com](https://community.netlify.com)
- **Vercel Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

### Debugging Tools
- Platform-specific logs and analytics
- Browser developer tools
- MCP test endpoints
- Local development environments