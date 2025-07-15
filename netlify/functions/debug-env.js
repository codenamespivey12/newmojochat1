// Debug function to check environment variables (remove after testing)
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Check environment variables (safely)
  const envCheck = {
    openai_key_exists: !!process.env.OPENAI_API_KEY,
    openai_key_format: process.env.OPENAI_API_KEY ? 
      `${process.env.OPENAI_API_KEY.substring(0, 8)}...${process.env.OPENAI_API_KEY.slice(-4)}` : 
      'Not set',
    openai_key_length: process.env.OPENAI_API_KEY?.length || 0,
    exa_key_exists: !!process.env.EXA_API_KEY,
    supabase_url_exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    node_env: process.env.NODE_ENV,
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(envCheck, null, 2),
  };
};