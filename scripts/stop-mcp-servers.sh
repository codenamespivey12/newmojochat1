#!/bin/bash

# Stop MCP servers for sixtyoneeighty chat application

set -e

echo "🛑 Stopping MCP servers..."

# Function to stop a server
stop_server() {
    local name=$1
    local port=$2
    
    echo "Stopping $name server..."
    
    # Try to kill by PID first
    if [ -f "pids/${name}.pid" ]; then
        local pid=$(cat "pids/${name}.pid")
        if kill -0 $pid 2>/dev/null; then
            kill $pid
            echo "✅ $name server stopped (PID: $pid)"
        else
            echo "⚠️  $name server PID $pid not found"
        fi
        rm -f "pids/${name}.pid"
    fi
    
    # Kill any remaining processes on the port
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
}

# Stop all servers
stop_server "exa" 3001
stop_server "context7" 3002
stop_server "sequential-thinking" 3003

# Clean up directories
rmdir pids 2>/dev/null || true

echo ""
echo "✅ All MCP servers stopped successfully!"
