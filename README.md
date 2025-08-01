# Rapid Reef Assessment from Diver Video

A proof of concept (PoC) application for marine ecosystem assessment from diver videos in the Gulf of California.

## Overview

This application demonstrates a simulated workflow for analyzing underwater video footage to assess reef health and marine ecosystem parameters. It features:

- Video upload and analysis interface
- Simulated video analysis pipeline with real-time console feedback
- Technical report generation with ecological metrics
- Interactive data visualizations (bar charts, radar plots)
- ReefBot chatbot for interactive ecological queries
- Gulf of California map with assessment locations
- Historical report archive functionality

## Features

### 1. Video Upload Interface

- Supports `.mp4`, `.mov`, and other video formats
- Special processing for files containing "algal_bloom" in the filename
- Real-time upload progress tracking

### 2. Simulated Analysis Pipeline

- Console view shows step-by-step "analysis" logs
- Simulated random values for fish density and invertebrate cover
- Fixed values for coral bleaching and invasive species
- Special handling for algal bloom detection

### 3. Technical Report Generation

- Location metadata from Gulf of California sites
- Fish Health Index (FHI) computed from fish density and invertebrate cover
- Interactive data visualizations
- Status indicators for different ecological parameters
- Auto-generated conclusion based on assessment results

### 4. Interactive Chatbot

- "Ask the ReefBot" panel answers ecological questions
- Pre-defined query buttons for common questions
- Contextually aware responses based on analysis results

## Getting Started

### Prerequisites

- Python 3.8+
- Flask and dependencies (see requirements.txt)

### Installation

1. Create a virtual environment:

```bash
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
```

2. Install dependencies:

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

3. Run the application:

```bash
source env/bin/activate && python app.py
```

4. Open a browser and navigate to:

```text
http://localhost:5000
```

## Usage

1. Upload a video file through the web interface
   - For special algal bloom detection, include "algal_bloom" in the filename
   - e.g., "coral_reef_algal_bloom.mp4"

2. Wait for the simulated analysis to complete
   - Watch the console output for analysis progress

3. Review the generated technical report
   - Check Fish Health Index and other metrics
   - Examine visualizations of reef health parameters

4. Interact with the ReefBot chatbot
   - Use pre-defined questions or ask your own
   - Get contextual information about marine ecology

## Demo Data

For testing purposes, the application generates:

- Fish density: random between 50-300 fish/ha
- Invertebrate cover: random between 10-70%
- Coral bleaching: fixed at 20%
- Invasive species: fixed at 0
- Algal bloom: High (0.85) for "algal_bloom" videos, otherwise Low (0.15)

## Directory Structure

```text
reef-assessment/
├── app.py              # Flask application
├── requirements.txt    # Python dependencies
├── static/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js
│   │   ├── console.js
│   │   ├── report.js
│   │   ├── chatbot.js
│   │   └── history.js
│   ├── reports/        # Generated reports
│   └── plots/          # Generated plots
├── templates/
│   └── index.html      # Main application template
└── uploads/            # Uploaded video storage
```

## Deployment Options

The application can be deployed in several ways depending on your needs:

### 1. Docker Deployment

A Dockerfile and docker-compose.yml are provided for easy containerization:

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or manually build and run
docker build -t gulf-assessment .
docker run -p 5000:5000 -v ./uploads:/app/uploads gulf-assessment
```

The Docker deployment includes:
- Python 3.9 environment with all dependencies
- Volume mapping for uploads and reports persistence
- Production-ready configuration

### 2. Render.com Deployment

For easy cloud deployment, use Render.com with the provided `render.yaml`:

1. Create a new Render account or login at [render.com](https://render.com)
2. Connect your Git repository
3. Select "Blueprint" as deployment type to use the render.yaml configuration
4. Configure any environment variables if needed
5. Deploy

### 3. PythonAnywhere Deployment

To deploy on PythonAnywhere:

1. Create a PythonAnywhere account
2. Upload your code (via Git or file upload)
3. Create a new web app using the Flask framework
4. Set the WSGI configuration file to use `pythonanywhere_wsgi.py`
5. Set up the virtual environment with your dependencies

### 4. GitHub Pages Static Demo

A static demo version can be deployed to GitHub Pages using the provided GitHub Action:

1. Push your code to a GitHub repository
2. Enable GitHub Actions in your repository settings
3. The workflow at `.github/workflows/static-deploy.yml` will automatically build a static demo
4. Access the demo at `https://[your-username].github.io/[repository-name]/`

Note: The static demo has limited functionality as it doesn't include server-side processing.

## Notes

This is a proof of concept application with simulated outputs. In a real-world implementation, the application would:

1. Actually process video footage using computer vision techniques
2. Use real ecological data and models for assessment
3. Implement proper data storage and authentication
4. Have proper error handling and validation

## License

This project is intended for educational purposes only.
