# Lion Rocket AI Chat Service - Deployment Guide

## Overview

This guide covers deployment options for the Lion Rocket AI Chat Service, including Docker Compose and Kubernetes deployments.

## Prerequisites

- Docker and Docker Compose (for Docker deployment)
- Kubernetes cluster and kubectl (for Kubernetes deployment)
- Claude API key from Anthropic

## Quick Start

### Development Environment

```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment

1. **Configure Environment Variables**

```bash
# Copy example files
cp backend/.env.example .env
cp frontend/.env.example .env.frontend

# Edit .env files with your configuration
# IMPORTANT: Set CLAUDE_API_KEY and SECRET_KEY
```

2. **Deploy with Docker Compose**

```bash
# Deploy to production
./scripts/deploy.sh production

# Or manually:
docker-compose -f docker-compose.prod.yml up -d
```

3. **Deploy to Kubernetes**

```bash
# Update k8s/secrets.yaml with your secrets
kubectl apply -f k8s/

# Or use the deploy script
./scripts/deploy.sh kubernetes
```

## Configuration

### Backend Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `sqlite:///./data/lionrocket.db` |
| `SECRET_KEY` | JWT secret key | Must be set for production |
| `CLAUDE_API_KEY` | Anthropic Claude API key | Required |
| `DEFAULT_ADMIN_USERNAME` | Default admin username | `admin` |
| `DEFAULT_ADMIN_PASSWORD` | Default admin password | `admin123` |

### Frontend Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |
| `VITE_WS_URL` | WebSocket URL | `ws://localhost:8000` |

## Deployment Options

### 1. Docker Compose (Recommended for Small Deployments)

Perfect for single-server deployments.

```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d --build

# Scale backend
docker-compose -f docker-compose.prod.yml scale backend=3

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

### 2. Kubernetes (Recommended for Production)

For scalable, high-availability deployments.

```bash
# Create namespace
kubectl create namespace lionrocket

# Create secrets
kubectl create secret generic backend-secrets \
  --from-literal=secret-key=your-secret-key \
  --from-literal=claude-api-key=your-claude-api-key \
  --from-literal=admin-password=your-admin-password \
  -n lionrocket

# Deploy
kubectl apply -f k8s/

# Check status
kubectl get pods -n lionrocket
kubectl get svc -n lionrocket
kubectl get ingress -n lionrocket
```

### 3. Manual Deployment

For custom deployment scenarios.

**Backend:**
```bash
cd backend
pip install -r requirements.txt
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run build
# Serve dist/ folder with any web server
```

## SSL/TLS Configuration

### Docker Compose with Let's Encrypt

Add to `docker-compose.prod.yml`:

```yaml
  certbot:
    image: certbot/certbot
    volumes:
      - ./ssl:/etc/letsencrypt
    command: certonly --webroot --webroot-path=/var/www/certbot --email your-email@example.com --agree-tos --no-eff-email -d your-domain.com
```

### Kubernetes with cert-manager

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create certificate issuer
kubectl apply -f k8s/cert-issuer.yaml
```

## Monitoring

### Health Checks

- Backend: `http://your-domain/health`
- Frontend: `http://your-domain/`
- WebSocket: `ws://your-domain/ws`

### Logging

**Docker Compose:**
```bash
docker-compose logs -f --tail=100
```

**Kubernetes:**
```bash
kubectl logs -f deployment/backend -n lionrocket
kubectl logs -f deployment/frontend -n lionrocket
```

## Backup and Recovery

### Backup

```bash
# Run backup script
./scripts/backup.sh

# Manual backup
cp ./data/lionrocket.db ./backups/lionrocket_$(date +%Y%m%d).db
```

### Restore

```bash
# Stop services
docker-compose down

# Restore database
cp ./backups/lionrocket_backup.db ./data/lionrocket.db

# Start services
docker-compose up -d
```

## Scaling

### Horizontal Scaling

**Docker Compose:**
```bash
docker-compose -f docker-compose.prod.yml scale backend=3 frontend=2
```

**Kubernetes:**
```bash
kubectl scale deployment backend --replicas=5 -n lionrocket
kubectl scale deployment frontend --replicas=3 -n lionrocket
```

### Auto-scaling (Kubernetes)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: lionrocket
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Troubleshooting

### Common Issues

1. **Database Lock Error**
   - Ensure only one backend instance accesses SQLite at a time
   - Consider migrating to PostgreSQL for multi-instance deployments

2. **WebSocket Connection Failed**
   - Check nginx/ingress WebSocket configuration
   - Verify CORS settings

3. **Claude API Rate Limits**
   - Implement request queuing
   - Use multiple API keys for load distribution

### Debug Mode

```bash
# Enable debug logging
export DEBUG=true
docker-compose up
```

## Security Considerations

1. **Change Default Credentials**
   - Update admin password immediately after deployment
   - Use strong SECRET_KEY

2. **Network Security**
   - Use HTTPS in production
   - Implement firewall rules
   - Use private networks for internal communication

3. **Data Protection**
   - Regular backups
   - Encrypt sensitive data
   - Implement access controls

## Performance Optimization

1. **Caching**
   - Enable browser caching for static assets
   - Implement Redis for session storage (optional)

2. **Database**
   - Regular VACUUM for SQLite
   - Consider PostgreSQL for better concurrency

3. **CDN**
   - Serve static assets through CDN
   - Use CloudFlare or similar for DDoS protection

## Support

For issues and questions:
- GitHub Issues: [your-repo-url]/issues
- Email: support@lionrocket.com
- Documentation: [your-docs-url]