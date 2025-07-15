# AI Chatbot with MCP Integration

An advanced AI chatbot built with Next.js, OpenAI's Responses API, and Model Context Protocol (MCP) servers for enhanced capabilities.

## Features

- **Dual AI Models**: 
  - Mojo (GPT-4.1): Witty, sarcastic AI companion with personality
  - Mojo++ (O3-mini): Advanced reasoning model with high-effort thinking
- **MCP Integration**: Web search, documentation access, and more via remote MCP servers
- **Advanced Tools**: Code interpreter, image generation, and data analysis
- **User Authentication**: Supabase-powered user management
- **Responsive Design**: Material-UI components with modern styling

## Getting Started

### Environment Setup

1. Copy the environment template:
```bash
cp .env.local.example .env.local
```

2. Fill in your API keys in `.env.local`:
```env
OPENAI_API_KEY=your_openai_api_key_here
EXA_API_KEY=your_exa_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Development

1. Install dependencies:
```bash
npm install
```

2. Test MCP connections:
```bash
npm run mcp:test
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## MCP Integration

This project leverages OpenAI's Responses API with MCP (Model Context Protocol) servers:

### Available MCP Servers

- **Exa Search**: Web search, research papers, company info, GitHub repos
- **Context7**: Programming documentation and library information

### Available Tools

- **Code Interpreter**: Python execution, data analysis, visualizations
- **Image Generation**: AI-powered image creation and editing
- **Web Search**: Real-time information retrieval
- **Documentation**: Up-to-date programming library docs

### Testing MCP Connections

```bash
# Test all MCP servers
npm run mcp:test

# Test via API endpoint
curl http://localhost:3000/api/mcp/test
```

## API Routes

- `/api/chat/mojo` - GPT-4.1 with personality (Mojo)
- `/api/chat/mojo-plus` - O3-mini with reasoning (Mojo++)
- `/api/mcp/test` - MCP connection testing

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `OPENAI_API_KEY`
   - `EXA_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy

### Environment Variables for Production

Make sure all environment variables are set in your production environment. The app will warn you about missing MCP connections but will continue to work with available tools.

## Troubleshooting

### MCP Connection Issues

1. Run the MCP test: `npm run mcp:test`
2. Check the debugging guide: [MCP_DEBUGGING_GUIDE.md](./MCP_DEBUGGING_GUIDE.md)
3. Visit `/api/mcp/test` endpoint for detailed connection status

### Common Issues

- **API Keys**: Ensure all API keys are properly set
- **Network**: Check if MCP server URLs are accessible
- **Vercel**: Verify environment variables are set in production

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   ├── mojo/          # GPT-4.1 endpoint
│   │   │   └── mojo-plus/     # O3-mini endpoint
│   │   └── mcp/
│   │       └── test/          # MCP testing endpoint
│   ├── auth/                  # Authentication pages
│   └── chat/                  # Chat interface
├── components/                # React components
├── lib/
│   ├── mcp-config.ts         # MCP configuration
│   └── mcp-test.ts           # MCP testing utilities
└── hooks/                    # Custom React hooks
```

## Technologies Used

- **Frontend**: Next.js 15, React 19, Material-UI, TypeScript
- **Backend**: OpenAI Responses API, Supabase
- **AI Models**: GPT-4.1, O3-mini
- **MCP Servers**: Exa Search, Context7
- **Deployment**: Vercel

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test MCP connections: `npm run mcp:test`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.