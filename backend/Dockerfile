FROM python:3.9-slim

WORKDIR /src

# Install build dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY ./app ./app
COPY .env .


CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
