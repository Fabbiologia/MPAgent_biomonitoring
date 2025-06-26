#!/usr/bin/env python3
# Ensure eventlet monkey patching occurs at the very start
import eventlet
eventlet.monkey_patch()
"""
Rapid Reef Assessment from Diver Video - Proof of Concept Application
A simulated marine ecosystem assessment tool for Gulf of California diver videos.

Author: AI Assistant
Date: 2025-06-26
Purpose: Educational/Demo PoC for marine ecosystem assessment
"""

import os
import random
import time
import datetime
import json
import io
import base64
import tempfile
from flask import Flask, render_template, request, jsonify, url_for, send_file
from flask_socketio import SocketIO, emit
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import uuid

import logging
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_file, session
from flask_socketio import SocketIO
import json
import time
from threading import Thread

# Configure logging for verbose output as per user rules
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('reef_assessment.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize the Flask app and SocketIO for real-time communication
app = Flask(__name__)
app.config['SECRET_KEY'] = 'rapidreefassessment'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['REPORTS_FOLDER'] = 'static/reports'
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB max upload size

# Configure SocketIO with simplified settings focused on stability
# Lowering ping_interval and using threading for background tasks
socketio = SocketIO(app, async_mode='eventlet', ping_timeout=5, ping_interval=3, 
                   cors_allowed_origins='*', logger=False, engineio_logger=False)

# Create necessary directories if they don't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['REPORTS_FOLDER'], exist_ok=True)
os.makedirs('static/plots', exist_ok=True)

# Global storage for session data (in production, use proper database)
analysis_sessions = {}
upload_history = []

# Gulf of California locations for random selection
GULF_LOCATIONS = [
    {"name": "La Paz", "lat": 24.1426, "lng": -110.3128},
    {"name": "Bahía de los Ángeles", "lat": 28.9514, "lng": -113.5622},
    {"name": "Cabo Pulmo", "lat": 23.4333, "lng": -109.4167},
    {"name": "Loreto", "lat": 26.0115, "lng": -111.3486}
]

# Baseline data for comparisons (simulated)
CABO_PULMO_BASELINE = {
    "fish_health_index": 0.85,
    "fish_density": 280,
    "invertebrate_cover": 65,
    "coral_bleaching": 5,
    "invasive_species": 0
}

def generate_analysis_id():
    """Generate unique analysis session ID"""
    return str(uuid.uuid4())[:8]

def simulate_video_analysis(video_filename, session_id):
    """
    Simulate video analysis pipeline with realistic timing and logging
    Args:
        video_filename (str): Name of uploaded video file
        session_id (str): Unique session identifier
    """
    logger.info(f"Starting video analysis for {video_filename} (Session: {session_id})")
    
    # Analysis steps with realistic timing
    analysis_steps = [
        ("Initializing video processing pipeline...", 2),
        ("Extracting frames for analysis...", 3),
        ("Analyzing fish density using computer vision...", 5),
        ("Identifying fish species and counting individuals...", 4),
        ("Estimating invertebrate cover using segmentation...", 4),
        ("Detecting coral bleaching patterns...", 3),
        ("Screening for invasive species...", 3),
        ("Performing algal bloom detection...", 2),
        ("Computing ecological indices...", 2),
        ("Generating assessment report...", 1)
    ]
    
    # Initialize analysis results
    results = {}
    
    # Set random seed for reproducibility (user rule #15)
    random.seed(42)
    
    for step_desc, duration in analysis_steps:
        socketio.emit('analysis_step', {
            'session_id': session_id,
            'message': step_desc,
            'timestamp': datetime.now().strftime('%H:%M:%S')
        })
        time.sleep(duration)
    
    # Generate simulated results based on specifications
    results['fish_density'] = random.randint(50, 300)  # fish/ha
    results['invertebrate_cover'] = random.randint(10, 70)  # percentage
    results['coral_bleaching'] = 20  # fixed at 20% as specified
    results['invasive_species'] = 0  # always 0 as specified
    
    # Special handling for algal bloom based on filename
    if 'algal_bloom' in video_filename.lower():
        results['algal_bloom_score'] = 0.85
        results['algal_bloom_level'] = 'High'
        logger.info(f"Algal bloom detected in filename: {video_filename}")
    else:
        results['algal_bloom_score'] = 0.15
        results['algal_bloom_level'] = 'Low'
    
    # Calculate Fish Health Index (FHI) as specified
    results['fish_health_index'] = (results['fish_density'] / 300) * 0.6 + (results['invertebrate_cover'] / 100) * 0.4
    
    # Generate fake metadata
    location = random.choice(GULF_LOCATIONS)
    results['location'] = location['name']
    results['coordinates'] = {"lat": location['lat'], "lng": location['lng']}
    results['date'] = datetime.now().strftime('%Y-%m-%d')
    results['diver'] = 'Simulated Divemaster'
    results['depth_range'] = f"{random.randint(5, 12)}-{random.randint(13, 18)} m"
    results['video_filename'] = video_filename
    results['session_id'] = session_id
    
    # Store results in global session storage
    analysis_sessions[session_id] = results
    
    socketio.emit('analysis_complete', {
        'session_id': session_id,
        'results': results,
        'message': 'Analysis complete! Generating report...'
    })
    
    logger.info(f"Analysis completed for session {session_id}")
    logger.info(f"Results: FHI={results['fish_health_index']:.2f}, Fish={results['fish_density']}, Algal={results['algal_bloom_level']}")

@app.route('/')
def index():
    """Main application interface"""
    logger.info("Serving main application interface")
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_video():
    """Handle video file upload and trigger analysis"""
    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400
    
    file = request.files['video']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Validate file extension
    allowed_extensions = {'.mp4', '.mov', '.avi', '.mkv'}
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        return jsonify({'error': f'Invalid file type. Allowed: {", ".join(allowed_extensions)}'}), 400
    
    # Generate session ID and save file
    session_id = generate_analysis_id()
    filename = f"{session_id}_{file.filename}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    
    try:
        file.save(filepath)
        logger.info(f"Video uploaded successfully: {filename}")
        
        # Add to upload history
        upload_history.append({
            'session_id': session_id,
            'filename': file.filename,
            'upload_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'filepath': filepath
        })
        
        # Start analysis in background thread
        analysis_thread = Thread(
            target=simulate_video_analysis,
            args=(file.filename, session_id)
        )
        analysis_thread.daemon = True
        analysis_thread.start()
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'filename': file.filename,
            'message': 'Upload successful. Analysis starting...'
        })
        
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@app.route('/results/<session_id>')
def get_results(session_id):
    """Retrieve analysis results for a session"""
    if session_id not in analysis_sessions:
        return jsonify({'error': 'Session not found'}), 404
    
    results = analysis_sessions[session_id]
    logger.info(f"Serving results for session {session_id}")
    return jsonify(results)

@app.route('/get-history')
def get_history():
    """Return the upload history."""
    return jsonify(upload_history)

@app.route('/generate-pdf', methods=['POST'])
def generate_pdf():
    """Generate a PDF report from analysis results."""
    try:
        # Get data from request
        data = request.get_json()
        session_id = data.get('session_id')
        results = data.get('results')
        
        if not session_id or not results or session_id not in analysis_sessions:
            return jsonify({'error': 'Invalid session or missing data'}), 400
        
        # Generate PDF using ReportLab
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )
        
        # Get styles for document
        styles = getSampleStyleSheet()
        styles.add(
            ParagraphStyle(
                name='Title',
                parent=styles['Heading1'],
                fontName='Helvetica-Bold',
                fontSize=18,
                alignment=1,  # Center alignment
                spaceAfter=16
            )
        )
        styles.add(
            ParagraphStyle(
                name='Subtitle',
                parent=styles['Heading2'],
                fontName='Helvetica-Bold',
                fontSize=14,
                spaceAfter=10
            )
        )
        styles.add(
            ParagraphStyle(
                name='Normal',
                parent=styles['Normal'],
                fontSize=10,
                spaceAfter=6
            )
        )
        
        # Build story (content) for PDF
        story = []
        
        # Title
        story.append(Paragraph(f"Rapid Reef Assessment Report", styles['Title']))
        story.append(Paragraph(f"Location: {results['location']}", styles['Subtitle']))
        story.append(Spacer(1, 0.25*inch))
        
        # Metadata Table
        metadata = [
            ["Date", results.get('date', datetime.datetime.now().strftime("%Y-%m-%d"))],
            ["Location", results['location']],
            ["Diver", results.get('diver', 'Unknown')],
            ["Depth Range", results.get('depth_range', '5-15m')],
            ["Assessment ID", session_id],
            ["Report Generated", datetime.datetime.now().strftime("%Y-%m-%d %H:%M")]
        ]
        
        meta_table = Table(metadata, colWidths=[1.5*inch, 4*inch])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(meta_table)
        story.append(Spacer(1, 0.5*inch))
        
        # Health Status Table
        story.append(Paragraph("Ecosystem Health Metrics", styles['Subtitle']))
        story.append(Spacer(1, 0.1*inch))
        
        # Functions to determine status
        def get_fish_density_status(value):
            if value < 100:
                return "Low", colors.red
            elif value < 200:
                return "Moderate", colors.orange
            else:
                return "High", colors.green
        
        def get_invertebrate_status(value):
            if value < 25:
                return "Low", colors.red
            elif value < 50:
                return "Moderate", colors.orange
            else:
                return "High", colors.green
        
        def get_bleaching_status(value):
            if value > 30:
                return "Severe", colors.red
            elif value > 15:
                return "Moderate", colors.orange
            else:
                return "Minimal", colors.green
        
        def get_algal_status(value):
            if results.get('algal_bloom_level') == 'High':
                return "High Risk", colors.red
            else:
                return "Low Risk", colors.green
        
        def get_fhi_status(value):
            if value < 0.4:
                return "Poor", colors.red
            elif value < 0.7:
                return "Moderate", colors.orange
            else:
                return "Healthy", colors.green
        
        # Create health status table
        fish_status, fish_color = get_fish_density_status(results['fish_density'])
        invert_status, invert_color = get_invertebrate_status(results['invertebrate_cover'])
        bleach_status, bleach_color = get_bleaching_status(results['coral_bleaching'])
        algal_status, algal_color = get_algal_status(results.get('algal_bloom_score', 0.15))
        fhi_status, fhi_color = get_fhi_status(results['fish_health_index'])
        
        health_data = [
            ["Metric", "Value", "Status"],
            ["Fish Density", f"{results['fish_density']} fish/ha", fish_status],
            ["Invertebrate Cover", f"{results['invertebrate_cover']}%", invert_status],
            ["Coral Bleaching", f"{results['coral_bleaching']}%", bleach_status],
            ["Algal Bloom Risk", f"{int(results.get('algal_bloom_score', 0.15) * 100)}%", algal_status],
            ["Fish Health Index", f"{results['fish_health_index']:.2f}", fhi_status]
        ]
        
        health_table = Table(health_data, colWidths=[2*inch, 2*inch, 1.5*inch])
        health_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (0, -1), colors.lightgrey),
            ('BACKGROUND', (2, 1), (2, 1), fish_color),
            ('BACKGROUND', (2, 2), (2, 2), invert_color),
            ('BACKGROUND', (2, 3), (2, 3), bleach_color),
            ('BACKGROUND', (2, 4), (2, 4), algal_color),
            ('BACKGROUND', (2, 5), (2, 5), fhi_color),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        
        story.append(health_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Generate bar chart for metrics
        plt.figure(figsize=(7, 4))
        metrics = ['Fish Density\n(fish/ha÷10)', 'Invertebrate\nCover (%)', 'Coral\nBleaching (%)', 'Algal Bloom\nRisk (%)'] 
        values = [results['fish_density']/10, results['invertebrate_cover'], 
                 results['coral_bleaching'], results.get('algal_bloom_score', 0.15)*100]
        colors_bar = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12']
        
        plt.bar(metrics, values, color=colors_bar)
        plt.ylabel('Value')
        plt.title('Reef Health Metrics')
        plt.tight_layout()
        
        # Save the figure to a temporary file
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp:
            plt.savefig(tmp.name, format='png', dpi=300)
            tmp_path = tmp.name
        plt.close()
        
        # Add the chart to the PDF
        img = Image(tmp_path, width=6*inch, height=3*inch)
        story.append(img)
        story.append(Spacer(1, 0.3*inch))
        
        # Conclusion text based on FHI
        conclusion_text = "Assessment Conclusion: "
        if results['fish_health_index'] >= 0.7:
            conclusion_text += "This site shows a healthy marine ecosystem with good fish density and invertebrate diversity. "
        elif results['fish_health_index'] >= 0.4:
            conclusion_text += "This site shows moderate ecosystem health with room for improvement in either fish density or invertebrate cover. "
        else:
            conclusion_text += "This site shows concerning ecosystem health indicators that suggest remediation actions may be necessary. "
            
        if results.get('algal_bloom_level') == 'High':
            conclusion_text += "The high algal bloom risk is particularly concerning and warrants further investigation."
        else:
            conclusion_text += "Algal bloom risk is currently low, indicating reasonable water quality at this site."
        
        story.append(Paragraph("Conclusion", styles['Subtitle']))
        story.append(Paragraph(conclusion_text, styles['Normal']))
        
        # Add timestamp and disclaimer
        story.append(Spacer(1, 0.5*inch))
        story.append(Paragraph(f"Report generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles["Normal"]))
        story.append(Paragraph("Disclaimer: This is a simulated assessment for demonstration purposes only.", 
                             ParagraphStyle('Disclaimer', parent=styles['Normal'], fontSize=8, fontName='Helvetica-Oblique'))) 
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        
        # Clean up temporary file
        os.unlink(tmp_path)
        
        # Send the PDF as a response
        return send_file(
            buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"reef_assessment_{results['location'].lower().replace(' ', '_')}_{datetime.datetime.now().strftime('%Y%m%d')}.pdf"
        )
        
    except Exception as e:
        print(f"Error generating PDF: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/chatbot', methods=['POST'])
def chatbot_response():
    """Handle chatbot queries with simulated ecological responses"""
    data = request.get_json()
    query = data.get('query', '').lower()
    session_id = data.get('session_id')
    
    # Get session results if available
    session_results = analysis_sessions.get(session_id, {})
    
    # Generate contextual responses based on query
    if 'temperature' in query and 'fish' in query:
        response = f"""Based on simulated SST data (26.3°C), fish density appears {'lower' if session_results.get('fish_density', 150) < 200 else 'higher'} than average, consistent with {'mild thermal stress' if session_results.get('fish_density', 150) < 200 else 'favorable thermal conditions'}. 
        
Current fish density: {session_results.get('fish_density', 'N/A')} fish/ha
Gulf of California optimal range: 180-250 fish/ha"""
        
    elif 'bleaching' in query and 'fish' in query:
        fhi = session_results.get('fish_health_index', 0.5)
        response = f"""Bleaching is at {session_results.get('coral_bleaching', 20)}%, which is {'not yet impacting' if fhi > 0.6 else 'potentially impacting'} trophic structure. Fish Health Index is {fhi:.2f}.
        
Continued monitoring is advised as bleaching above 25% typically correlates with reduced fish recruitment and altered feeding patterns."""
        
    elif 'cabo pulmo' in query or 'baseline' in query:
        current_fhi = session_results.get('fish_health_index', 0.5)
        cabo_fhi = CABO_PULMO_BASELINE['fish_health_index']
        
        response = f"""Compared to Cabo Pulmo baseline (FHI = {cabo_fhi}), this site scores {current_fhi:.2f}. 
        
Key differences:
• Fish density: {session_results.get('fish_density', 'N/A')} vs {CABO_PULMO_BASELINE['fish_density']} (baseline)
• Invertebrate cover: {session_results.get('invertebrate_cover', 'N/A')}% vs {CABO_PULMO_BASELINE['invertebrate_cover']}%
• Primary drivers: {'Lower predator richness and macroinvertebrate cover' if current_fhi < cabo_fhi else 'Comparable ecosystem health'}"""
        
    else:
        # Default ecological response
        response = f"""Based on the current analysis:
        
• Ecosystem status: {'Moderate health' if session_results.get('fish_health_index', 0.5) > 0.5 else 'Requires attention'}
• Primary concerns: {'Algal bloom detected' if session_results.get('algal_bloom_level') == 'High' else 'Normal algal levels'}
• Recommendations: Continue monitoring, especially during thermal stress periods"""
    
    logger.info(f"Chatbot query processed for session {session_id}: {query[:50]}...")
    
    return jsonify({
        'response': response,
        'timestamp': datetime.now().strftime('%H:%M:%S')
    })

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    logger.info(f"Client connected: {request.sid}")
    emit('connected', {'message': 'Connected to Reef Assessment System'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    logger.info(f"Client disconnected: {request.sid}")

if __name__ == '__main__':
    # Create necessary directories if they don't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['REPORTS_FOLDER'], exist_ok=True)
    
    logger.info('Starting Rapid Reef Assessment Application')
    logger.info(f"Upload folder: {app.config['UPLOAD_FOLDER']}")
    logger.info('Application ready for marine ecosystem assessment')
    
    # Get port from environment variable or use default
    port = int(os.environ.get('PORT', 5000))
    
    # Determine if we're running in production
    is_production = os.environ.get('FLASK_ENV') == 'production'
    
    # Run with appropriate host and debug settings
    socketio.run(app, 
                host='0.0.0.0',  # Bind to all network interfaces
                port=port,
                debug=not is_production)
