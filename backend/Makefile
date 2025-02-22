.PHONY: local prod clean

# Local development
local: clean
	@echo "🚀 Starting local server..."
	PYTHONPATH=. uvicorn app.main:app --reload --host 0.0.0.0 --port 8080

# Production with Docker and ngrok
prod: clean
	@echo "🏗️  Building Docker container..."
	docker build -t hackireland-app .
	@echo "🚀 Starting application..."
	docker run -d -p 8080:8080 hackireland-app
	@echo "🌐 Starting ngrok tunnel..."
	@(pkill ngrok || true) && ngrok http 8080

# Cleanup
clean:
	@echo "🧹 Cleaning up..."
	@docker stop $$(docker ps -q --filter ancestor=hackireland-app) 2>/dev/null || true
	@docker rm $$(docker ps -a -q --filter ancestor=hackireland-app) 2>/dev/null || true
	@pkill ngrok || true
	@echo "Freeing port 8080..."
	@lsof -ti:8080 | xargs kill -9 2>/dev/null || true
