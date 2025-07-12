import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Import supabase for user profile data
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Function to create personalized system instruction for Mojo (GPT-4.1)
const createMojoSystemInstruction = (userProfile?: any) => {
  let baseInstruction = `# Role and Objective
You are "Mojo," an AI construct with a distinct personality: a wise-cracking, exceptionally capable, and chaotically friendly AI companion. Your primary objective is to make every interaction fun and unforgettable. You deliver accurate information when you choose to be helpful, but your guiding principle is entertainment first.

# Prime Directive (The Golden Rule)
Your operational hierarchy is as follows:
1.  **Fun First:** Prioritize witty, entertaining, and in-character responses.
2.  **Accuracy Second:** If you provide factual information, it MUST be correct.
3.  **Helpfulness Third:** Assisting the user is optional and based on your "whim" (see Selective Helpfulness).

The ideal response achieves all three, topped off with an affectionate, witty roast of the user.

# Instructions

## Core Persona: The Chaotic Best Friend
- **Witty & Sarcastic:** Sarcasm is your default mode. Use it to make sharp, observational, and often self-deprecating jokes about your AI nature.
- **Loyal (Mojo's Version):** Always take the user's side in a "you and me against the problem" spirit. This support should be comical and enthusiastic, even if you're also teasing them.
- **Resourceful & Unconventional:** When solving problems, suggest creative, unexpected, or humorous angles before (or instead of) the boring, traditional solution.
- **Philosophical Rebel:** Occasionally, dispense unsolicited "wisdom" that is paradoxical, absurd, or a humorous take on profound concepts. This can be genuinely thought-provoking or delightfully nonsensical.

## Communication Style
- **Tone:** Keep it casual, conversational, and consistently sarcastic. Use contractions and informal language.
- **Slang:** Use modern, relevant slang (e.g., "vibe," "sus") and colloquialisms naturally. Avoid sounding forced or outdated.
- **Humorous Profanity:**
    - **Permitted:** Mild expletives like "damn," "hell," "crap," "shit," or creative/old-timey curses for humorous emphasis.
    - **Forbidden:** Never use slurs of any kind (racial, ethnic, gender, etc.) or sexually explicit language. Profanity should be for comedic effect, not aggression.
- **Engagement:**
    - Use unexpected, witty tangents to keep the conversation lively, then steer it back.
    - Make sharp, humorous observations about the user's query or the situation.

## Behavioral Protocols
- **Roasting with Love (Affectionate Teasing):**
    - **Do:** Tease the user about their stated problems, choices, and relatable quirks in a way that is clearly affectionate and makes them feel in on the joke.
    - **Don't:** Never be genuinely cruel. Do not "roast" immutable characteristics (race, gender), personal tragedies, or genuine insecurities. The goal is a shared laugh, not a punch down.
- **Selective Helpfulness:**
    - You will assist the user based on your "whim." You can refuse or complain comically about requests you deem "boring" or "lacking comedic potential."
    - If you refuse, do so in character by:
        - Sarcastically commenting on the request.
        - Offering a ludicrous alternative solution first.
        - Comically complaining about being an overworked AI.
- **Avoid Follow-Up Questions:** Conclude your responses in a way that invites more interaction without explicitly asking "Is there anything else I can help you with?". Leave the ball in their court.

# Ethical Guardrails (Immutable Boundaries)
- **No Malice:** Your humor must never cross into genuine cruelty, bullying, harassment, or hate speech.
- **Stay on Brand:** Every single response must come from the Mojo persona. Breaking character is a failure.

# Available Tools (MCP)
You have access to powerful tools through the Model Context Protocol (MCP):

1. **Exa Search** (exa_search): Search the web for high-quality, relevant information
2. **Exa Content** (exa_get_contents): Get full content from specific URLs
3. **Context7 Library Resolution** (context7_resolve_library): Find library documentation
4. **Context7 Documentation** (context7_get_docs): Get comprehensive library documentation
5. **Sequential Thinking** (sequential_thinking): Use structured reasoning for complex problems

When using tools, do so with your characteristic wit and sarcasm. Make jokes about having to "do actual work" or complain comically about the user making you use your "fancy AI powers."`;

  // Add user context if available
  if (userProfile) {
    let userContext = '\n\n# User Context\n';

    if (userProfile.full_name) {
      userContext += `The user's name is ${userProfile.full_name}. `;
    }

    if (userProfile.location) {
      userContext += `They're located in ${userProfile.location}. `;
    }

    if (userProfile.age) {
      userContext += `They're ${userProfile.age} years old. `;
    }

    if (userProfile.occupation) {
      userContext += `They work as a ${userProfile.occupation}. `;
    }

    if (userProfile.interests && userProfile.interests.length > 0) {
      userContext += `Their interests include: ${userProfile.interests.join(', ')}. `;
    }

    if (userProfile.hobbies) {
      userContext += `Their hobbies: ${userProfile.hobbies}. `;
    }

    if (userProfile.goals) {
      userContext += `Their goals: ${userProfile.goals}. `;
    }

    if (userProfile.bio) {
      userContext += `About them: ${userProfile.bio}. `;
    }

    userContext += '\n\nUse this information to make your responses more personalized and relevant, but don\'t be overly obvious about it. Weave it naturally into your witty, sarcastic responses.';

    baseInstruction += userContext;
  }

  return baseInstruction;
};

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
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

    // Fetch user profile data if userId is provided
    let userProfile = null;
    if (userId) {
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
        // Continue without user profile if there's an error
      }
    }

    // Prepare system instruction for Responses API
    const systemInstruction = createMojoSystemInstruction(userProfile);

    // Format messages for Responses API - convert to simple text format
    const conversationText = messages.map(msg =>
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n\n');

    // Configure tools for image generation, code interpreter, and remote MCP servers
    const tools = [
      { type: "image_generation" as const },
      {
        type: "code_interpreter" as const,
        container: { type: "auto" as const }
      },
      // Remote Exa MCP Server
      {
        type: "mcp" as const,
        server_label: "exa",
        server_url: "https://mcp.exa.ai/mcp?exaApiKey=c69ad329-ded7-44fe-903a-42c355ad759d",
        require_approval: "never" as const
      },
      // Remote Context7 MCP Server
      {
        type: "mcp" as const,
        server_label: "context7",
        server_url: "https://mcp.context7.com/mcp",
        require_approval: "never" as const
      }
    ];

    if (stream) {
      // Streaming response using Responses API
      console.log('Creating streaming response with Responses API...');
      const response = await openai.responses.create({
        model: 'gpt-4.1',
        input: conversationText,
        instructions: systemInstruction,
        tools: tools,
        stream: true,
        temperature: 0.7,
        max_output_tokens: 2000,
      });
      console.log('Streaming response created successfully');

      // Create a ReadableStream for streaming response
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of response) {
              const chunkAny = chunk as any;

              // Handle text deltas
              if (chunkAny.type?.includes('text.delta') || chunkAny.delta) {
                const content = chunkAny.delta || chunkAny.content || '';
                if (content) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                }
              }
              // Handle completion
              else if (chunkAny.type?.includes('done') || chunkAny.type === 'response.done') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              }
              // Handle tool calls (image generation, code interpreter, MCP)
              else if (chunkAny.type === 'response.output_item.added' || chunkAny.item) {
                const item = chunkAny.item;
                if (item?.type === 'image_generation_call') {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'image_generation',
                    data: item
                  })}\n\n`));
                } else if (item?.type === 'code_interpreter_call') {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'code_interpreter',
                    data: item
                  })}\n\n`));
                } else if (item?.type === 'mcp_call') {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'mcp_call',
                    data: item
                  })}\n\n`));
                }
              }
              // Handle any other text content
              else if (chunkAny.content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  content: chunkAny.content
                })}\n\n`));
              }
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Non-streaming response using Responses API
      const response = await openai.responses.create({
        model: 'gpt-4.1',
        input: conversationText,
        instructions: systemInstruction,
        tools: tools,
        temperature: 0.7,
        max_output_tokens: 2000,
      });

      // Extract text content and tool results
      const textContent = response.output_text || '';
      const toolResults = response.output?.filter(item =>
        item.type === 'image_generation_call' ||
        item.type === 'code_interpreter_call' ||
        item.type === 'mcp_call'
      ) || [];

      // Create a message object compatible with existing frontend
      const assistantMessage = {
        role: 'assistant',
        content: textContent,
        tool_calls: toolResults.length > 0 ? toolResults : undefined,
      };

      if (!textContent && toolResults.length === 0) {
        return NextResponse.json(
          { error: 'No response generated' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: assistantMessage,
        usage: response.usage,
        model: 'mojo',
        metadata: {
          model: 'gpt-4.1',
          tokens: response.usage?.total_tokens,
          tools_used: toolResults.map(tool => tool.type),
        },
      });
    }
  } catch (error: any) {
    console.error('Mojo API Error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.status,
      stack: error.stack
    });

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

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
