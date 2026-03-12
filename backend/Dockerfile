# ============================================================
# Digital CMO AI — Backend Dockerfile
# python:3.11-slim + FastAPI/uvicorn
# ============================================================

FROM python:3.11-slim

WORKDIR /app

# System deps (curl for healthcheck, build tools for compiled packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (cache layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Ensure runtime directories exist
RUN mkdir -p data memory/projects/default memory/workspace memory/preferences memory/knowledge_base

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD curl -f http://localhost:8000/health/ready || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
