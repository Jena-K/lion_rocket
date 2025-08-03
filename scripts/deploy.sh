#!/bin/bash

# Deploy script for Lion Rocket AI Chat Service

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-development}
DOCKER_REGISTRY=${DOCKER_REGISTRY:-"docker.io/lionrocket"}
VERSION=${VERSION:-$(git describe --tags --always)}

echo -e "${GREEN}Lion Rocket AI Chat Service Deployment${NC}"
echo -e "Environment: ${YELLOW}${ENVIRONMENT}${NC}"
echo -e "Version: ${YELLOW}${VERSION}${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."
if ! command_exists docker; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

if ! command_exists docker-compose && [ "$ENVIRONMENT" != "kubernetes" ]; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    exit 1
fi

if [ "$ENVIRONMENT" == "kubernetes" ] && ! command_exists kubectl; then
    echo -e "${RED}Error: kubectl is not installed${NC}"
    exit 1
fi

# Build images
build_images() {
    echo -e "${GREEN}Building Docker images...${NC}"
    
    echo "Building backend image..."
    docker build -t ${DOCKER_REGISTRY}/backend:${VERSION} -f backend/Dockerfile.prod backend/
    docker tag ${DOCKER_REGISTRY}/backend:${VERSION} ${DOCKER_REGISTRY}/backend:latest
    
    echo "Building frontend image..."
    docker build -t ${DOCKER_REGISTRY}/frontend:${VERSION} -f frontend/Dockerfile.prod frontend/
    docker tag ${DOCKER_REGISTRY}/frontend:${VERSION} ${DOCKER_REGISTRY}/frontend:latest
    
    echo -e "${GREEN}Images built successfully${NC}"
}

# Push images to registry
push_images() {
    echo -e "${GREEN}Pushing images to registry...${NC}"
    
    docker push ${DOCKER_REGISTRY}/backend:${VERSION}
    docker push ${DOCKER_REGISTRY}/backend:latest
    docker push ${DOCKER_REGISTRY}/frontend:${VERSION}
    docker push ${DOCKER_REGISTRY}/frontend:latest
    
    echo -e "${GREEN}Images pushed successfully${NC}"
}

# Deploy to Docker Compose
deploy_docker_compose() {
    echo -e "${GREEN}Deploying with Docker Compose...${NC}"
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        echo -e "${YELLOW}Creating .env file from examples...${NC}"
        cat backend/.env.example > .env
        echo "" >> .env
        cat frontend/.env.example >> .env
    fi
    
    # Stop existing containers
    docker-compose -f docker-compose.prod.yml down
    
    # Start new containers
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services to be healthy
    echo "Waiting for services to be healthy..."
    sleep 10
    
    # Check health
    if curl -f http://localhost/health > /dev/null 2>&1; then
        echo -e "${GREEN}Deployment successful!${NC}"
    else
        echo -e "${RED}Health check failed${NC}"
        docker-compose -f docker-compose.prod.yml logs
        exit 1
    fi
}

# Deploy to Kubernetes
deploy_kubernetes() {
    echo -e "${GREEN}Deploying to Kubernetes...${NC}"
    
    # Apply Kubernetes manifests
    kubectl apply -f k8s/namespace.yaml
    kubectl apply -f k8s/secrets.yaml
    kubectl apply -f k8s/persistent-volume.yaml
    kubectl apply -f k8s/backend-deployment.yaml
    kubectl apply -f k8s/frontend-deployment.yaml
    kubectl apply -f k8s/ingress.yaml
    
    # Wait for rollout
    echo "Waiting for deployments to be ready..."
    kubectl rollout status deployment/backend -n lionrocket
    kubectl rollout status deployment/frontend -n lionrocket
    
    echo -e "${GREEN}Kubernetes deployment successful!${NC}"
}

# Main deployment logic
case $ENVIRONMENT in
    development)
        echo -e "${GREEN}Starting development environment...${NC}"
        docker-compose up -d
        ;;
    
    production)
        build_images
        deploy_docker_compose
        ;;
    
    kubernetes)
        build_images
        push_images
        deploy_kubernetes
        ;;
    
    *)
        echo -e "${RED}Unknown environment: $ENVIRONMENT${NC}"
        echo "Usage: $0 [development|production|kubernetes]"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Deployment complete!${NC}"
echo "Access the application at:"
echo "- Frontend: http://localhost"
echo "- API Docs: http://localhost/docs"
echo "- Health Check: http://localhost/health"