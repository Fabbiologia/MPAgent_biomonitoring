# Deployment Guide for Gulf of California Marine Assessment Application

This document provides instructions for deploying the Gulf of California Marine Assessment application in various environments.

## Prerequisites

- Docker and Docker Compose installed
- Git (optional, for version control)

## Local Deployment with Docker

1. Clone or download this repository
2. Navigate to the project directory:
   ```bash
   cd MPAgent_biomonitoring
   ```
3. Build and start the Docker containers:
   ```bash
   docker-compose up -d
   ```
4. Access the application at http://localhost:5000

## Production Deployment Options

### Option 1: Deploy to a Cloud Provider with Docker Support

#### AWS Elastic Beanstalk

1. Install the EB CLI:
   ```bash
   pip install awsebcli
   ```
2. Initialize your EB project:
   ```bash
   eb init
   ```
3. Create an environment:
   ```bash
   eb create my-environment-name
   ```
4. Deploy:
   ```bash
   eb deploy
   ```

#### Google Cloud Run

1. Build the Docker image:
   ```bash
   docker build -t gcr.io/[PROJECT-ID]/marine-assessment:v1 .
   ```
2. Push to Google Container Registry:
   ```bash
   docker push gcr.io/[PROJECT-ID]/marine-assessment:v1
   ```
3. Deploy to Cloud Run:
   ```bash
   gcloud run deploy marine-assessment --image gcr.io/[PROJECT-ID]/marine-assessment:v1 --platform managed
   ```

### Option 2: Deploy to Heroku

1. Install the Heroku CLI
2. Login to Heroku:
   ```bash
   heroku login
   ```
3. Create a Heroku app:
   ```bash
   heroku create your-app-name
   ```
4. Set up the Heroku container registry:
   ```bash
   heroku container:login
   ```
5. Build and push the Docker image:
   ```bash
   heroku container:push web -a your-app-name
   ```
6. Release the image:
   ```bash
   heroku container:release web -a your-app-name
   ```

## Environment Variables

The following environment variables can be set for configuration:

- `PORT`: The port on which the application runs (default: 5000)
- `FLASK_ENV`: Set to 'production' for production deployments

## Persistent Storage

For production deployments, ensure that you configure persistent storage for:
- `/app/uploads`: Uploaded video files
- `/app/static/reports`: Generated reports
- `/app/static/plots`: Generated plots

## Monitoring and Logging

The application logs to stdout/stderr, which Docker captures. Use your platform's logging tools to monitor application logs:

- Docker: `docker logs container_id`
- AWS: CloudWatch Logs
- GCP: Cloud Logging
- Heroku: `heroku logs --tail`

## Troubleshooting

If you encounter connection issues with Socket.IO:
1. Ensure your deployment platform supports WebSockets
2. Check that no proxy or load balancer is blocking WebSocket connections
3. Set proper CORS configuration if accessing from different domains
