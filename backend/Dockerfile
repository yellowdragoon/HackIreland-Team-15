FROM python:3.9-slim

WORKDIR /src

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the app directory and .env file
COPY ./app ./app
COPY ../.env .

# Set environment variables
ENV PORT=8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
