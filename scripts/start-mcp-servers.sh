#!/bin/bash

# Start MCP servers for sixtyoneeighty chat application
# This script starts Exa, Context7, and Sequential Thinking MCP servers

set -e

echo "🚀 Starting MCP servers for sixtyoneeighty..."

# Check if required environment variables are set
if [ -z "$EXA_API_KEY" ]; then
    echo "⚠️  Warning: EXA_API_KEY not set. Exa server may not work properly."
fi

# Function to start a server in the background
start_server() {
    local name=$1
    local port=$2
    local command=$3
    shift 3
    local args=("$@")
    
    echo "Starting $name server on port $port..."
    
    # Kill any existing process on the port
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
    
    # Start the server
    nohup $command "${args[@]}" > "logs/${name}.log" 2>&1 &
    local pid=$!
    
    echo "$pid" > "pids/${name}.pid"
    echo "✅ $name server started (PID: $pid)"
}

# Create directories for logs and PIDs
mkdir -p logs pids

# Start Exa MCP Server
echo "📡 Starting Exa MCP Server..."
EXA_API_KEY="$EXA_API_KEY" start_server "exa" 3001 npx -y @exa-ai/mcp-server-exa

# Wait a moment between starts
sleep 2

# Start Context7 MCP Server
echo "📚 Starting Context7 MCP Server..."
start_server "context7" 3002 npx -y @context7/mcp-server

# Wait a moment between starts
sleep 2

# Start Sequential Thinking MCP Server
echo "🧠 Starting Sequential Thinking MCP Server..."
start_server "sequential-thinking" 3003 npx -y @sequential-thinking/mcp-server

echo ""
echo "🎉 All MCP servers started successfully!"
echo ""
echo "Server Status:"
echo "- Exa: http://localhost:3001"
echo "- Context7: http://localhost:3002"
echo "- Sequential Thinking: http://localhost:3003"
echo ""
echo "Logs are available in the 'logs/' directory"
echo "PIDs are stored in the 'pids/' directory"
echo ""
echo "To stop all servers, run: ./scripts/stop-mcp-servers.sh"
