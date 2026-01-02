.PHONY: help install dev build clean test lint format docker-up docker-down

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies
	@echo "Installing dependencies..."
	npm install
	cd frontend && npm install
	cd shared && npm install
	cd backend && python -m venv venv && . venv/bin/activate && pip install -r requirements.txt

dev: ## Start development servers
	@echo "Starting development environment..."
	docker-compose -f docker/docker-compose.dev.yml up -d
	@echo "Databases started. Run 'make dev-frontend' and 'make dev-backend' in separate terminals."

dev-frontend: ## Start frontend development server
	cd frontend && npm run dev

dev-backend: ## Start backend development server
	cd backend && . venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

build: ## Build all services
	cd frontend && npm run build
	cd backend && docker build -f ../docker/backend.Dockerfile -t fake-news-backend ..

lint: ## Lint all code
	npm run lint
	cd backend && . venv/bin/activate && flake8 app && mypy app

format: ## Format all code
	npm run format
	cd backend && . venv/bin/activate && black app

test: ## Run all tests
	cd frontend && npm test
	cd backend && . venv/bin/activate && pytest

docker-up: ## Start all services with Docker Compose
	docker-compose -f docker/docker-compose.yml up --build

docker-down: ## Stop all Docker services
	docker-compose -f docker/docker-compose.yml down
	docker-compose -f docker/docker-compose.dev.yml down

clean: ## Clean build artifacts
	rm -rf frontend/.next frontend/out frontend/build
	rm -rf backend/__pycache__ backend/**/__pycache__
	rm -rf node_modules frontend/node_modules shared/node_modules
	docker-compose -f docker/docker-compose.yml down -v
	docker-compose -f docker/docker-compose.dev.yml down -v
