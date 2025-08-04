# Unified Backend Dockerfile - Python 3.11 with UV
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install UV package manager
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.cargo/bin:$PATH"

# Copy dependency files first for better caching
COPY pyproject.toml uv.lock* requirements.txt ./

# Install Python dependencies with UV (fallback to pip)
RUN uv pip install --system -r pyproject.toml || pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Create data and logs directories
RUN mkdir -p /app/data /app/logs /app/uploads/avatars

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Environment variable for deployment flexibility
ENV DEPLOYMENT_MODE=development

# Start FastAPI server with conditional configuration
CMD if [ "$DEPLOYMENT_MODE" = "production" ]; then \
        gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000; \
    else \
        uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload; \
    fi