# sixtyoneeighty Chat - Deployment Guide

## Vercel Deployment

### Prerequisites
1. Vercel account
2. GitHub repository with your code
3. Environment variables ready

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/sixtyoneeighty-chat)

### Manual Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

### Environment Variables

Set these environment variables in your Vercel dashboard:

#### Required Variables
```
OPENAI_API_KEY=your_openai_api_key
EXA_API_KEY=your_exa_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
SUPABASE_ACCESS_TOKEN=your_supabase_access_token
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NON_POOLING=your_postgres_url_non_pooling
POSTGRES_USER=your_postgres_user
POSTGRES_HOST=your_postgres_host
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_postgres_database
```

#### Optional Variables e
```
NEXT_PUBLIC_APP_NAME=sixtyoneeighty
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Build Configuration

The project includes:
- `vercel.json` - Vercel configuration
- `next.config.ts` - Next.js configuration
- `eslint.config.mjs` - ESLint configuration for deployment

### Troubleshooting

#### 404 Errors
- Ensure all pages have proper exports
- Check that dynamic routes are correctly named
- Verify API routes are in the correct directory structure

#### Build Failures
- Run `npm run build` locally to check for errors
- Fix TypeScript errors before deploying
- Ensure all dependencies are in package.json

#### Environment Variable Issues
- Double-check variable names match exactly
- Ensure sensitive variables are not in public environment
- Use NEXT_PUBLIC_ prefix only for client-side variables

### Post-Deployment

1. **Test Authentication**
   - Sign up/sign in functionality
   - User session persistence

2. **Test Chat Functionality**
   - Create new chats
   - Send messages
   - File uploads (if configured)

3. **Test API Routes**
   - `/api/chat/mojo` - GPT-4.1 endpoint
   - `/api/chat/mojo-plus` - O3 endpoint
   - `/api/mcp/tools` - MCP tools endpoint

### Performance Optimization

1. **Enable Edge Runtime** (optional)
   ```typescript
   export const runtime = 'edge'
   ```

2. **Configure Caching**
   - API responses
   - Static assets
   - Database queries

3. **Monitor Performance**
   - Vercel Analytics
   - Core Web Vitals
   - API response times

### Security Checklist

- [ ] Environment variables are secure
- [ ] API keys are not exposed in client code
- [ ] Supabase RLS policies are enabled
- [ ] CORS is properly configured
- [ ] Rate limiting is implemented

### Scaling Considerations

1. **Database**
   - Monitor Supabase usage
   - Consider connection pooling
   - Optimize queries

2. **API Limits**
   - OpenAI API rate limits
   - Exa API quotas
   - Implement proper error handling

3. **Storage**
   - Supabase Storage for file uploads
   - CDN for static assets

### Support

For deployment issues:
1. Check Vercel deployment logs
2. Review browser console for client errors
3. Monitor API endpoint responses
4. Check Supabase logs for database issues

### Custom Domain (Optional)

1. Add domain in Vercel dashboard
2. Configure DNS records
3. Update NEXT_PUBLIC_APP_URL
4. Test SSL certificate

---

## Alternative Deployment Options

### Netlify
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables

### Railway
1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically on push

### Self-Hosted
1. Build the application: `npm run build`
2. Start the server: `npm start`
3. Configure reverse proxy (nginx/Apache)
4. Set up SSL certificate
5. Configure environment variables

---

**Note**: This application requires Node.js 18+ and modern browser support for optimal performance.
