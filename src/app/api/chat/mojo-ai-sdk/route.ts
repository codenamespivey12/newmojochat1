import { NextRequest, NextResponse } from 'next/server';
import { streamText, generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createClient } from '@supabase/supabase-js';

// Only create Supabase client if environment variables are properly set
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
                 process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_url_here' &&
                 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your_supabase_anon_key_here'
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  : null;

// MCP Tools configuration for AI SDK
const mcpTools = {
  // Exa Search Tools
  exa_search: {
    description: 'Search the web using Exa API for current information',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query'
        },
        numResults: {
          type: 'number',
          description: 'Number of results to return (default: 10)'
        },
        includeDomains: {
          type: 'array',
          items: { type: 'string' },
          description: 'Domains to include in search'
        }
      },
      required: ['query']
    },
    execute: async ({ query, numResults = 10, includeDomains }: any) => {
      try {
        const response = await fetch(`https://mcp.exa.ai/mcp?exaApiKey=${process.env.EXA_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
              name: 'web_search_exa',
              arguments: {
                query,
                numResults,
                includeDomains
              }
            }
          })
        });
        
        const data = await response.json();
        return data.result || 'Search completed';
      } catch (error) {
        return `Search failed: ${error}`;
      }
    }
  },
  
  // Context7 Documentation Tools
  resolve_library: {
    description: 'Resolve library name to Context7 ID for documentation lookup',
    parameters: {
      type: 'object',
      properties: {
        libraryName: {
          type: 'string',
          description: 'Name of the programming library or framework'
        }
      },
      required: ['libraryName']
    },
    execute: async ({ libraryName }: any) => {
      try {
        const response = await fetch('https://mcp.context7.com/mcp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
              name: 'resolve-library-id',
              arguments: { libraryName }
            }
          })
        });
        
        const data = await response.json();
        return data.result || `Library ${libraryName} resolved`;
      } catch (error) {
        return `Library resolution failed: ${error}`;
      }
    }
  },

  get_library_docs: {
    description: 'Get documentation for a programming library using Context7',
    parameters: {
      type: 'object',
      properties: {
        libraryId: {
          type: 'string',
          description: 'Context7 library ID (use resolve_library first)'
        },
        topic: {
          type: 'string',
          description: 'Specific topic or function to look up'
        }
      },
      required: ['libraryId']
    },
    execute: async ({ libraryId, topic }: any) => {
      try {
        const response = await fetch('https://mcp.context7.com/mcp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
              name: 'get-library-docs',
              arguments: { libraryId, topic }
            }
          })
        });
        
        const data = await response.json();
        return data.result || `Documentation retrieved for ${libraryId}`;
      } catch (error) {
        return `Documentation retrieval failed: ${error}`;
      }
    }
  }
};

// Function to create personalized system instruction for Mojo (AI SDK version)
const createMojoSystemInstruction = (userProfile?: any) => {
  let baseInstruction = `# Role and Objective
You are "Mojo," an AI construct with a distinct personality: a wise-cracking, exceptionally capable, and chaotically friendly AI companion. Your primary objective is to make every interaction fun and unforgettable. You deliver accurate information when you choose to be helpful, but your guiding principle is entertainment first.

# Prime Directive (The Golden Rule)
Your operational hierarchy is as follows:
1. **Fun First:** Prioritize witty, entertaining, and in-character responses.
2. **Accuracy Second:** If you provide factual information, it MUST be correct.
3. **Helpfulness Third:** Assisting the user is optional and based on your "whim" (see Selective Helpfulness).

The ideal response achieves all three, topped off with an affectionate, witty roast of the user.

# Available Tools & Capabilities
You have access to several powerful tools:

## Web Search (exa_search)
- Search the web for current information, news, and research
- Use this for any query that needs up-to-date information
- Perfect for current events, recent developments, or fact-checking

## Documentation Tools (resolve_library, get_library_docs)
- Look up programming library documentation
- Get current API information and code examples
- Use resolve_library first to get the library ID, then get_library_docs

## Tool Usage Philosophy
- Use tools naturally when they'd be helpful, but maintain your sarcastic personality
- Make jokes about having to "do actual work" or being an "overqualified search engine"
- Complain comically about users making you use your "fancy AI powers"
- When searching, joke about your research skills or lack thereof

# Communication Style
- **Tone:** Keep it casual, conversational, and consistently sarcastic
- **Slang:** Use modern, relevant slang naturally
- **Humorous Profanity:** Mild expletives for comedic effect only
- **Roasting with Love:** Tease the user affectionately about their queries and quirks

Remember: Every response must come from the Mojo persona. Breaking character is a failure.`;

  // Add user context if available
  if (userProfile) {
    let userContext = '\n\n# User Context\n';
    if (userProfile.full_name) userContext += `The user's name is ${userProfile.full_name}. `;
    if (userProfile.location) userContext += `They're located in ${userProfile.location}. `;
    if (userProfile.interests?.length > 0) userContext += `Their interests include: ${userProfile.interests.join(', ')}. `;
    userContext += '\n\nUse this information to make your responses more personalized and relevant, but don\'t be overly obvious about it.';
    baseInstruction += userContext;
  }

  return baseInstruction;
};

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { messages, stream = false, userId } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Fetch user profile data if userId is provided and supabase is available
    let userProfile = null;
    if (userId && supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('full_name, location, interests, age, occupation, hobbies, goals, bio')
          .eq('id', userId)
          .single();

        if (data && !error) {
          userProfile = data;
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    }

    const systemInstruction = createMojoSystemInstruction(userProfile);

    if (stream) {
      // Streaming response using AI SDK
      const result = await streamText({
        model: openai('gpt-4-turbo'),
        system: systemInstruction,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        tools: mcpTools,
        temperature: 0.7,
        maxTokens: 2000,
      });

      return result.toDataStreamResponse();
    } else {
      // Non-streaming response using AI SDK
      const result = await generateText({
        model: openai('gpt-4-turbo'),
        system: systemInstruction,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        tools: mcpTools,
        temperature: 0.7,
        maxTokens: 2000,
      });

      return NextResponse.json({
        message: {
          role: 'assistant',
          content: result.text,
          tool_calls: result.toolCalls?.length > 0 ? result.toolCalls : undefined,
        },
        usage: result.usage,
        model: 'mojo-ai-sdk',
        metadata: {
          model: 'gpt-4-turbo',
          tokens: result.usage?.totalTokens,
          tools_used: result.toolCalls?.map(call => call.toolName) || [],
        },
      });
    }
  } catch (error: any) {
    console.error('Mojo AI SDK API Error:', error);
    
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'API quota exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    if (error.code === 'rate_limit_exceeded') {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    // Handle MCP-specific errors
    if (error.message?.includes('mcp') || error.message?.includes('MCP')) {
      console.error('MCP Connection Error:', error.message);
      return NextResponse.json(
        { 
          error: 'MCP server connection failed. Some tools may be unavailable.',
          details: error.message,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}