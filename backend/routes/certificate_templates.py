from flask import Blueprint, jsonify
from models import db, CertificateLayout
import json

template_bp = Blueprint('certificate_templates', __name__, url_prefix='/api')

# Default certificate templates
DEFAULT_TEMPLATES = [
    {
        'layout_name': 'Classic Elegant',
        'template_content': json.dumps({
            'version': '5.3.0',
            'objects': [
                {
                    'type': 'rect',
                    'left': 50,
                    'top': 50,
                    'width': 900,
                    'height': 600,
                    'fill': '',
                    'stroke': '#2c3e50',
                    'strokeWidth': 8,
                    'rx': 20,
                    'ry': 20
                },
                {
                    'type': 'rect',
                    'left': 70,
                    'top': 70,
                    'width': 860,
                    'height': 560,
                    'fill': '',
                    'stroke': '#d4af37',
                    'strokeWidth': 2,
                    'rx': 15,
                    'ry': 15
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 130,
                    'text': 'CERTIFICATE OF ACHIEVEMENT',
                    'fontSize': 38,
                    'fontFamily': 'Georgia',
                    'fontWeight': 'bold',
                    'fill': '#2c3e50',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 200,
                    'text': 'This is to certify that',
                    'fontSize': 20,
                    'fontFamily': 'Georgia',
                    'fill': '#34495e',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 260,
                    'text': '{{student_name}}',
                    'fontSize': 48,
                    'fontFamily': 'Brush Script MT',
                    'fontWeight': 'bold',
                    'fill': '#2c3e50',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 340,
                    'text': 'has successfully completed the course',
                    'fontSize': 18,
                    'fontFamily': 'Georgia',
                    'fill': '#34495e',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 380,
                    'text': '{{course_name}}',
                    'fontSize': 28,
                    'fontFamily': 'Georgia',
                    'fontWeight': 'bold',
                    'fill': '#d4af37',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 430,
                    'text': 'in the program',
                    'fontSize': 16,
                    'fontFamily': 'Georgia',
                    'fill': '#34495e',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 460,
                    'text': '{{program_name}}',
                    'fontSize': 24,
                    'fontFamily': 'Georgia',
                    'fontWeight': 'normal',
                    'fill': '#2c3e50',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 500,
                    'text': 'with outstanding performance',
                    'fontSize': 16,
                    'fontFamily': 'Georgia',
                    'fill': '#34495e',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 200,
                    'top': 560,
                    'text': '{{issue_date}}',
                    'fontSize': 14,
                    'fontFamily': 'Arial',
                    'fill': '#7f8c8d',
                    'textAlign': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 800,
                    'top': 560,
                    'text': '{{certificate_number}}',
                    'fontSize': 14,
                    'fontFamily': 'Arial',
                    'fill': '#7f8c8d',
                    'textAlign': 'center'
                }
            ]
        }),
        'background_image': None,
        'is_default': False
    },
    {
        'layout_name': 'Modern Professional',
        'template_content': json.dumps({
            'version': '5.3.0',
            'objects': [
                {
                    'type': 'rect',
                    'left': 0,
                    'top': 0,
                    'width': 1000,
                    'height': 150,
                    'fill': 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    'stroke': '',
                    'strokeWidth': 0
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 60,
                    'text': 'CERTIFICATE',
                    'fontSize': 48,
                    'fontFamily': 'Helvetica',
                    'fontWeight': 'bold',
                    'fill': '#ffffff',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'rect',
                    'left': 100,
                    'top': 200,
                    'width': 800,
                    'height': 4,
                    'fill': '#667eea',
                    'stroke': '',
                    'strokeWidth': 0
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 240,
                    'text': '{{student_name}}',
                    'fontSize': 52,
                    'fontFamily': 'Arial',
                    'fontWeight': 'bold',
                    'fill': '#2d3748',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 320,
                    'text': 'has successfully completed the course',
                    'fontSize': 20,
                    'fontFamily': 'Arial',
                    'fill': '#4a5568',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 360,
                    'text': '{{course_name}}',
                    'fontSize': 32,
                    'fontFamily': 'Arial',
                    'fontWeight': 'bold',
                    'fill': '#667eea',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 410,
                    'text': '{{program_name}}',
                    'fontSize': 24,
                    'fontFamily': 'Arial',
                    'fill': '#718096',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 460,
                    'text': 'Awarded on {{issue_date}}',
                    'fontSize': 16,
                    'fontFamily': 'Arial',
                    'fill': '#718096',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'rect',
                    'left': 420,
                    'top': 500,
                    'width': 160,
                    'height': 2,
                    'fill': '#2d3748',
                    'stroke': '',
                    'strokeWidth': 0
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 515,
                    'text': 'Authorized Signature',
                    'fontSize': 14,
                    'fontFamily': 'Arial',
                    'fill': '#718096',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 900,
                    'top': 660,
                    'text': '{{certificate_number}}',
                    'fontSize': 12,
                    'fontFamily': 'Arial',
                    'fill': '#a0aec0',
                    'textAlign': 'right'
                }
            ]
        }),
        'background_image': None,
        'is_default': False
    },
    {
        'layout_name': 'Academic Excellence',
        'template_content': json.dumps({
            'version': '5.3.0',
            'objects': [
                {
                    'type': 'rect',
                    'left': 0,
                    'top': 0,
                    'width': 1000,
                    'height': 700,
                    'fill': '#f8f9fa',
                    'stroke': '',
                    'strokeWidth': 0
                },
                {
                    'type': 'rect',
                    'left': 40,
                    'top': 40,
                    'width': 920,
                    'height': 620,
                    'fill': '#ffffff',
                    'stroke': '#1a202c',
                    'strokeWidth': 12,
                    'rx': 10,
                    'ry': 10
                },
                {
                    'type': 'circle',
                    'left': 450,
                    'top': 80,
                    'radius': 50,
                    'fill': '',
                    'stroke': '#c79100',
                    'strokeWidth': 6
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 105,
                    'text': '⭐',
                    'fontSize': 40,
                    'fontFamily': 'Arial',
                    'fill': '#c79100',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 200,
                    'text': 'CERTIFICATE OF EXCELLENCE',
                    'fontSize': 36,
                    'fontFamily': 'Times New Roman',
                    'fontWeight': 'bold',
                    'fill': '#1a202c',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'rect',
                    'left': 350,
                    'top': 250,
                    'width': 300,
                    'height': 3,
                    'fill': '#c79100',
                    'stroke': '',
                    'strokeWidth': 0
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 280,
                    'text': 'THIS CERTIFIES THAT',
                    'fontSize': 16,
                    'fontFamily': 'Arial',
                    'letterSpacing': 100,
                    'fill': '#4a5568',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 330,
                    'text': '{{student_name}}',
                    'fontSize': 50,
                    'fontFamily': 'Brush Script MT',
                    'fontWeight': 'bold',
                    'fill': '#1a202c',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 405,
                    'text': 'has successfully completed the course',
                    'fontSize': 18,
                    'fontFamily': 'Times New Roman',
                    'fill': '#4a5568',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 445,
                    'text': '{{course_name}}',
                    'fontSize': 30,
                    'fontFamily': 'Times New Roman',
                    'fontWeight': 'bold',
                    'fill': '#c79100',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                 {
                    'type': 'i-text',
                    'left': 500,
                    'top': 485,
                    'text': '({{program_name}})',
                    'fontSize': 20,
                    'fontFamily': 'Times New Roman',
                    'fontStyle': 'italic',
                    'fill': '#4a5568',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 530,
                    'text': 'with distinction and exemplary performance',
                    'fontSize': 16,
                    'fontFamily': 'Times New Roman',
                    'fontStyle': 'italic',
                    'fill': '#4a5568',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 200,
                    'top': 580,
                    'text': 'Date: {{issue_date}}',
                    'fontSize': 14,
                    'fontFamily': 'Arial',
                    'fill': '#718096',
                    'textAlign': 'left'
                },
                {
                    'type': 'i-text',
                    'left': 800,
                    'top': 580,
                    'text': 'No: {{certificate_number}}',
                    'fontSize': 14,
                    'fontFamily': 'Arial',
                    'fill': '#718096',
                    'textAlign': 'right'
                }
            ]
        }),
        'background_image': None,
        'is_default': False
    },
    {
        'layout_name': 'Minimalist Design',
        'template_content': json.dumps({
            'version': '5.3.0',
            'objects': [
                {
                    'type': 'rect',
                    'left': 0,
                    'top': 0,
                    'width': 1000,
                    'height': 700,
                    'fill': '#ffffff',
                    'stroke': '',
                    'strokeWidth': 0
                },
                {
                    'type': 'rect',
                    'left': 0,
                    'top': 0,
                    'width': 20,
                    'height': 700,
                    'fill': '#3b82f6',
                    'stroke': '',
                    'strokeWidth': 0
                },
                {
                    'type': 'i-text',
                    'left': 150,
                    'top': 150,
                    'text': 'CERTIFICATE',
                    'fontSize': 60,
                    'fontFamily': 'Helvetica',
                    'fontWeight': 'bold',
                    'fill': '#1e293b',
                    'textAlign': 'left'
                },
                {
                    'type': 'rect',
                    'left': 150,
                    'top': 230,
                    'width': 100,
                    'height': 5,
                    'fill': '#3b82f6',
                    'stroke': '',
                    'strokeWidth': 0
                },
                {
                    'type': 'i-text',
                    'left': 150,
                    'top': 280,
                    'text': '{{student_name}}',
                    'fontSize': 42,
                    'fontFamily': 'Helvetica',
                    'fontWeight': 'bold',
                    'fill': '#0f172a',
                    'textAlign': 'left'
                },
                {
                    'type': 'i-text',
                    'left': 150,
                    'top': 350,
                    'text': 'Successfully completed',
                    'fontSize': 20,
                    'fontFamily': 'Helvetica',
                    'fill': '#64748b',
                    'textAlign': 'left'
                },
                {
                    'type': 'i-text',
                    'left': 150,
                    'top': 390,
                    'text': '{{course_name}}',
                    'fontSize': 28,
                    'fontFamily': 'Helvetica',
                    'fontWeight': '600',
                    'fill': '#3b82f6',
                    'textAlign': 'left'
                },
                {
                    'type': 'i-text',
                    'left': 150,
                    'top': 440,
                    'text': '{{program_name}}',
                    'fontSize': 20,
                    'fontFamily': 'Helvetica',
                    'fill': '#64748b',
                    'textAlign': 'left'
                },
                {
                    'type': 'i-text',
                    'left': 150,
                    'top': 500,
                    'text': '{{issue_date}}',
                    'fontSize': 16,
                    'fontFamily': 'Helvetica',
                    'fill': '#94a3b8',
                    'textAlign': 'left'
                },
                {
                    'type': 'i-text',
                    'left': 150,
                    'top': 600,
                    'text': '{{certificate_number}}',
                    'fontSize': 14,
                    'fontFamily': 'Courier New',
                    'fill': '#cbd5e1',
                    'textAlign': 'left'
                }
            ]
        }),
        'background_image': None,
        'is_default': False
    },
    {
        'layout_name': 'Royal Diploma',
        'template_content': json.dumps({
            'version': '5.3.0',
            'objects': [
                {
                    'type': 'rect',
                    'left': 0,
                    'top': 0,
                    'width': 1000,
                    'height': 700,
                    'fill': '#fefcf8',
                    'stroke': '',
                    'strokeWidth': 0
                },
                {
                    'type': 'rect',
                    'left': 30,
                    'top': 30,
                    'width': 940,
                    'height': 640,
                    'fill': '',
                    'stroke': '#8b4513',
                    'strokeWidth': 15,
                    'rx': 5,
                    'ry': 5
                },
                {
                    'type': 'rect',
                    'left': 50,
                    'top': 50,
                    'width': 900,
                    'height': 600,
                    'fill': '',
                    'stroke': '#d4af37',
                    'strokeWidth': 3,
                    'rx': 5,
                    'ry': 5
                },
                {
                    'type': 'rect',
                    'left': 60,
                    'top': 60,
                    'width': 880,
                    'height': 580,
                    'fill': '',
                    'stroke': '#8b4513',
                    'strokeWidth': 1,
                    'rx': 5,
                    'ry': 5
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 110,
                    'text': '⚜ DIPLOMA ⚜',
                    'fontSize': 44,
                    'fontFamily': 'Georgia',
                    'fontWeight': 'bold',
                    'fill': '#8b4513',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 180,
                    'text': 'This is to hereby certify that',
                    'fontSize': 18,
                    'fontFamily': 'Georgia',
                    'fontStyle': 'italic',
                    'fill': '#5d4037',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 240,
                    'text': '{{student_name}}',
                    'fontSize': 56,
                    'fontFamily': 'Brush Script MT',
                    'fontWeight': 'bold',
                    'fill': '#3e2723',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'rect',
                    'left': 300,
                    'top': 320,
                    'width': 400,
                    'height': 2,
                    'fill': '#d4af37',
                    'stroke': '',
                    'strokeWidth': 0
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 350,
                    'text': 'has completed with distinction',
                    'fontSize': 18,
                    'fontFamily': 'Georgia',
                    'fill': '#5d4037',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 390,
                    'text': '{{course_name}}',
                    'fontSize': 34,
                    'fontFamily': 'Georgia',
                    'fontWeight': 'bold',
                    'fill': '#d4af37',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 430,
                    'text': 'Program: {{program_name}}',
                    'fontSize': 20,
                    'fontFamily': 'Georgia',
                    'fontStyle': 'italic',
                    'fill': '#5d4037',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 490,
                    'text': 'in recognition of outstanding achievement',
                    'fontSize': 16,
                    'fontFamily': 'Georgia',
                    'fontStyle': 'italic',
                    'fill': '#5d4037',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 250,
                    'top': 570,
                    'text': '{{issue_date}}',
                    'fontSize': 14,
                    'fontFamily': 'Georgia',
                    'fill': '#795548',
                    'textAlign': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 750,
                    'top': 570,
                    'text': '{{certificate_number}}',
                    'fontSize': 14,
                    'fontFamily': 'Georgia',
                    'fill': '#795548',
                    'textAlign': 'center'
                }
            ]
        }),
        'background_image': None,
        'is_default': False
    },
    {
        'layout_name': 'Modern Premium',
        'template_content': json.dumps({
            'version': '5.3.0',
            'objects': [
                {
                    'type': 'rect',
                    'left': 0,
                    'top': 0,
                    'width': 1000,
                    'height': 700,
                    'fill': '#212121',
                    'stroke': '',
                    'strokeWidth': 0
                },
                {
                    'type': 'rect',
                    'left': 20,
                    'top': 20,
                    'width': 960,
                    'height': 660,
                    'fill': '#1a1a1a',
                    'stroke': '#d4af37',
                    'strokeWidth': 4,
                    'rx': 0,
                    'ry': 0
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 100,
                    'text': 'CERTIFICATE OF COMPLETION',
                    'fontSize': 42,
                    'fontFamily': 'Cinzel',
                    'fontWeight': 'bold',
                    'fill': '#f5f5f5',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'rect',
                    'left': 400,
                    'top': 160,
                    'width': 200,
                    'height': 2,
                    'fill': '#d4af37',
                    'stroke': '',
                    'strokeWidth': 0
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 220,
                    'text': 'This certificate is proudly presented to',
                    'fontSize': 18,
                    'fontFamily': 'Lato',
                    'fill': '#b0b0b0',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 280,
                    'text': '{{student_name}}',
                    'fontSize': 54,
                    'fontFamily': 'Great Vibes',
                    'fill': '#d4af37',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 360,
                    'text': 'For successfully completing the course',
                    'fontSize': 18,
                    'fontFamily': 'Lato',
                    'fill': '#b0b0b0',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 410,
                    'text': '{{course_name}}',
                    'fontSize': 36,
                    'fontFamily': 'Cinzel',
                    'fontWeight': 'bold',
                    'fill': '#f5f5f5',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 460,
                    'text': '{{program_name}}',
                    'fontSize': 22,
                    'fontFamily': 'Lato',
                    'fill': '#888888',
                    'textAlign': 'center',
                    'originX': 'center'
                },
                {
                    'type': 'i-text',
                    'left': 200,
                    'top': 580,
                    'text': '{{issue_date}}',
                    'fontSize': 16,
                    'fontFamily': 'Lato',
                    'fill': '#f5f5f5',
                    'textAlign': 'center'
                },
                 {
                    'type': 'rect',
                    'left': 150,
                    'top': 570,
                    'width': 150,
                    'height': 1,
                    'fill': '#d4af37',
                    'stroke': '',
                    'strokeWidth': 0
                },
                {
                    'type': 'i-text',
                    'left': 800,
                    'top': 580,
                    'text': 'SIGNATURE',
                    'fontSize': 16,
                    'fontFamily': 'Lato',
                    'fill': '#f5f5f5',
                    'textAlign': 'center'
                },
                 {
                    'type': 'rect',
                    'left': 750,
                    'top': 570,
                    'width': 150,
                    'height': 1,
                    'fill': '#d4af37',
                    'stroke': '',
                    'strokeWidth': 0
                },
                {
                    'type': 'i-text',
                    'left': 500,
                    'top': 630,
                    'text': 'ID: {{certificate_number}}',
                    'fontSize': 12,
                    'fontFamily': 'Lato',
                    'fill': '#555555',
                    'textAlign': 'center',
                    'originX': 'center'
                }
            ]
        }),
        'background_image': None,
        'is_default': False
    }
]

@template_bp.route('/certificate-templates/seed', methods=['POST'])
def seed_templates():
    """Seed default certificate templates into the database"""
    try:
        added_count = 0
        for template_data in DEFAULT_TEMPLATES:
            # Check if template already exists
            existing = CertificateLayout.query.filter_by(
                layout_name=template_data['layout_name']
            ).first()
            
            if not existing:
                new_template = CertificateLayout(
                    layout_name=template_data['layout_name'],
                    template_content=template_data['template_content'],
                    background_image=template_data['background_image'],
                    is_default=template_data['is_default'],
                    program_id=None  # Global templates
                )
                db.session.add(new_template)
                added_count += 1
        
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully seeded {added_count} certificate templates',
            'total_templates': len(DEFAULT_TEMPLATES)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@template_bp.route('/certificate-templates', methods=['GET'])
def get_default_templates():
    """Get all default certificate templates"""
    try:
        templates = CertificateLayout.query.filter_by(program_id=None).all()
        return jsonify([{
            'id': t.id,
            'layout_name': t.layout_name,
            'template_content': t.template_content,
            'background_image': t.background_image,
            'is_default': t.is_default,
            'created_at': t.created_at.isoformat() if t.created_at else None
        } for t in templates])
    except Exception as e:
        return jsonify({'error': str(e)}), 500
