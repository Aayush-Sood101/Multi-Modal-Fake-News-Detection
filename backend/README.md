# Backend Development Setup

## Quick Start

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Copy environment file:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

5. Access API documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── api/              # API endpoints
│   │   └── v1/
│   │       └── endpoints/
│   ├── core/             # Core configuration
│   ├── models/           # Database models
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic
│   └── ml/               # ML pipelines
├── tests/                # Test files
├── requirements.txt      # Python dependencies
└── .env.example         # Example environment variables
```

## Development

### Linting
```bash
flake8 app
```

### Formatting
```bash
black app
```

### Type Checking
```bash
mypy app
```

### Testing
```bash
pytest
```

## API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `POST /api/v1/text/analyze` - Analyze text
- `POST /api/v1/audio/analyze` - Analyze audio
- `POST /api/v1/video/analyze` - Analyze video
- `POST /api/v1/analysis/complete` - Complete multi-modal analysis
