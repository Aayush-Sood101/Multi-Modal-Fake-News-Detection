# Quick Start Guide

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **Docker** and Docker Compose (optional but recommended)

## Setup

### 1. Clone and Install

```bash
# Clone the repository
cd /path/to/Multi-Modal\ Fake\ News\ Agent

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 2. Environment Configuration

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Frontend
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local if needed
```

### 3. Start Development Environment

#### Option A: Docker (Recommended for beginners)

```bash
# Start only databases (PostgreSQL + Redis)
cd docker
docker-compose -f docker-compose.dev.yml up -d
cd ..

# Verify databases are running
docker ps
```

#### Option B: Local databases

If you have PostgreSQL and Redis installed locally, update the connection settings in `backend/.env`.

### 4. Run the Application

#### Terminal 1: Backend

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at:
- **API:** http://localhost:8000
- **API Docs (Swagger):** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health

#### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

Frontend will be available at:
- **App:** http://localhost:3000

## Verify Installation

### Test Backend

```bash
# Check health
curl http://localhost:8000/health

# Check API endpoints
curl http://localhost:8000/api/v1/text/health
curl http://localhost:8000/api/v1/audio/health
curl http://localhost:8000/api/v1/video/health
```

Expected response:
```json
{"status": "healthy", "service": "text-analysis"}
```

### Test Frontend

Open http://localhost:3000 in your browser. You should see:
- Professional landing page
- Navigation header with logo
- Hero section with "Multi-Modal Fake News Detection" title
- Features cards (Text, Audio, Video)
- Footer with links

## Using Makefile (Alternative)

If you prefer using make commands:

```bash
# Start databases
make dev

# In separate terminals:
make dev-backend
make dev-frontend

# Or start everything with Docker
make docker-up
```

## Project Structure

```
Multi-Modal Fake News Agent/
├── frontend/          # Next.js app (port 3000)
├── backend/           # FastAPI app (port 8000)
├── shared/            # Shared TypeScript types
├── docker/            # Docker configuration
├── ml-models/         # ML models (Phase 3)
└── docs/              # Documentation
```

## Common Issues

### Port Already in Use

If port 3000 or 8000 is in use:

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Find and kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

### Python Virtual Environment Issues

```bash
# Recreate virtual environment
cd backend
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Docker Issues

```bash
# Stop all containers
docker-compose -f docker/docker-compose.dev.yml down

# Remove volumes and restart
docker-compose -f docker/docker-compose.dev.yml down -v
docker-compose -f docker/docker-compose.dev.yml up -d
```

### Node Modules Issues

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

Now that your development environment is running:

1. **Explore the API docs:** http://localhost:8000/docs
2. **Browse the frontend:** http://localhost:3000
3. **Check the project plan:** `.github/prompts/plan-multiModalFakeNewsDetection.prompt.md`
4. **Read Milestone 1 completion:** `docs/MILESTONE-1-COMPLETION.md`

Ready to start implementing Phase 2? Check the project plan for next steps!

## Development Commands

### Frontend
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Lint code
npm run type-check   # Check TypeScript types
```

### Backend
```bash
cd backend
uvicorn app.main:app --reload  # Start dev server
black app/                      # Format code
flake8 app/                     # Lint code
mypy app/                       # Type check
pytest                          # Run tests
```

### Docker
```bash
# Development (databases only)
docker-compose -f docker/docker-compose.dev.yml up -d
docker-compose -f docker/docker-compose.dev.yml down

# Production (all services)
docker-compose -f docker/docker-compose.yml up --build
docker-compose -f docker/docker-compose.yml down
```

## Getting Help

- **Backend API Docs:** http://localhost:8000/docs
- **Project Plan:** `.github/prompts/plan-multiModalFakeNewsDetection.prompt.md`
- **Backend README:** `backend/README.md`
- **Milestone Docs:** `docs/MILESTONE-1-COMPLETION.md`

Happy coding! 🚀
