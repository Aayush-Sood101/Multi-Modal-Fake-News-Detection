# Multi-Modal Fake News Detection System

A comprehensive web application that analyzes text, audio, and video content to detect misinformation using AI models, featuring a professional dashboard with interactive visualizations.

## Features

- 🎯 **Multi-Modal Analysis**: Analyze text, audio, and video content
- 🤖 **AI-Powered Detection**: State-of-the-art ML models for fake news detection
- 📊 **Interactive Visualizations**: Professional dashboards with Recharts and D3.js
- 🔍 **Source Credibility**: Evaluate content sources and cross-reference fact-checkers
- ⚡ **Real-Time Processing**: WebSocket-based live updates
- 🎨 **Modern UI**: Built with Next.js 14, Tailwind CSS, and shadcn/ui

## Tech Stack

### Frontend
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts, D3.js, Video.js, Wavesurfer.js

### Backend
- FastAPI (Python 3.10+)
- PostgreSQL
- Redis
- Celery

### ML/AI
- PyTorch
- Hugging Face Transformers
- BERT/RoBERTa (text)
- Whisper (audio)
- FaceForensics++ (video)

## Project Structure

```
multi-modal-fake-news-agent/
├── frontend/           # Next.js application
├── backend/            # FastAPI application
├── ml-models/          # Model training & experiments
├── shared/             # Shared utilities
├── docker/             # Docker configurations
└── docs/               # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Python 3.10+
- Docker and Docker Compose

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd multi-modal-fake-news-agent
```

2. Install frontend dependencies:
```bash
pnpm install
```

3. Install backend dependencies:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Start the development environment:
```bash
docker-compose up
```

### Development

- **Frontend**: `cd frontend && pnpm dev` (http://localhost:3000)
- **Backend**: `cd backend && uvicorn app.main:app --reload` (http://localhost:8000)
- **API Docs**: http://localhost:8000/docs

## Development Milestones

- [x] Phase 1: Foundation & Setup
  - [x] Milestone 1.1: Project Initialization
  - [ ] Milestone 1.2: Development Environment
  - [ ] Milestone 1.3: Basic UI Framework
- [ ] Phase 2: Data Processing Pipeline
- [ ] Phase 3: ML Model Integration
- [ ] Phase 4: Frontend Visualization
- [ ] Phase 5: Enhancement & Polish
- [ ] Phase 6: Testing & Deployment

## Contributing

Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Research papers and datasets used in this project
- Open-source ML models and libraries
- Community contributions

## Contact

For questions or support, please open an issue or contact the maintainers.
