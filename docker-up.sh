#!/bin/bash

# Docker Compose startup script for LionRocket

echo "Starting LionRocket with Docker Compose..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please edit .env file with your configuration (especially CLAUDE_API_KEY)"
    echo "Then run this script again."
    exit 1
fi

# Build and start services
echo "Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Check service status
echo "Checking service status..."
docker-compose ps

# Show logs for any failing services
if ! docker-compose ps | grep -q "Up"; then
    echo "Some services failed to start. Showing logs..."
    docker-compose logs
fi

echo ""
echo "LionRocket is starting up!"
echo "Backend API: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo "Database: PostgreSQL on localhost:5432"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
echo "To stop and remove data: docker-compose down -v"