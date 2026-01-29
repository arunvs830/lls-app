from flask import Blueprint, request, jsonify
from models import db, CertificateLayout, Program
from datetime import datetime

certificate_bp = Blueprint('certificate', __name__, url_prefix='/api')

# Get all certificate layouts
@certificate_bp.route('/certificate-layouts', methods=['GET'])
def get_all_layouts():
    layouts = CertificateLayout.query.all()
    return jsonify([{
        'id': layout.id,
        'layout_name': layout.layout_name,
        'template_content': layout.template_content,
        'background_image': layout.background_image,
        'program_id': layout.program_id,
        'program': {
            'id': layout.program.id,
            'program_name': layout.program.program_name
        } if layout.program else None,
        'is_default': layout.is_default,
        'created_at': layout.created_at.isoformat() if layout.created_at else None
    } for layout in layouts])

# Get a specific certificate layout
@certificate_bp.route('/certificate-layouts/<int:id>', methods=['GET'])
def get_layout(id):
    layout = CertificateLayout.query.get_or_404(id)
    return jsonify({
        'id': layout.id,
        'layout_name': layout.layout_name,
        'template_content': layout.template_content,
        'background_image': layout.background_image,
        'program_id': layout.program_id,
        'program': {
            'id': layout.program.id,
            'program_name': layout.program.program_name
        } if layout.program else None,
        'is_default': layout.is_default,
        'created_at': layout.created_at.isoformat() if layout.created_at else None
    })

# Create a new certificate layout
@certificate_bp.route('/certificate-layouts', methods=['POST'])
def create_layout():
    data = request.json
    
    # If setting as default, remove default from other layouts of same program
    if data.get('is_default'):
        program_id = data.get('program_id')
        if program_id:
            CertificateLayout.query.filter_by(
                program_id=program_id, 
                is_default=True
            ).update({'is_default': False})
        else:
            # Global default
            CertificateLayout.query.filter(
                CertificateLayout.program_id.is_(None),
                CertificateLayout.is_default == True
            ).update({'is_default': False})
    
    new_layout = CertificateLayout(
        layout_name=data['layout_name'],
        template_content=data.get('template_content'),
        background_image=data.get('background_image'),
        program_id=data.get('program_id'),
        is_default=data.get('is_default', False)
    )
    
    db.session.add(new_layout)
    db.session.commit()
    
    return jsonify({
        'id': new_layout.id,
        'layout_name': new_layout.layout_name,
        'message': 'Certificate layout created successfully'
    }), 201

# Update a certificate layout
@certificate_bp.route('/certificate-layouts/<int:id>', methods=['PUT'])
def update_layout(id):
    layout = CertificateLayout.query.get_or_404(id)
    data = request.json
    
    # Determine new state
    new_program_id = data['program_id'] if 'program_id' in data else layout.program_id
    will_be_default = data['is_default'] if 'is_default' in data else layout.is_default

    # If setting as default, remove default from other layouts of same program
    if will_be_default:
        if new_program_id:
            CertificateLayout.query.filter(
                CertificateLayout.id != id,
                CertificateLayout.program_id == new_program_id, 
                CertificateLayout.is_default == True
            ).update({'is_default': False})
        else:
            # Global default
            CertificateLayout.query.filter(
                CertificateLayout.id != id,
                CertificateLayout.program_id.is_(None),
                CertificateLayout.is_default == True
            ).update({'is_default': False})
    
    layout.layout_name = data.get('layout_name', layout.layout_name)
    layout.template_content = data.get('template_content', layout.template_content)
    layout.background_image = data.get('background_image', layout.background_image)
    layout.program_id = data.get('program_id', layout.program_id)
    layout.is_default = data.get('is_default', layout.is_default)
    
    db.session.commit()
    
    return jsonify({
        'id': layout.id,
        'layout_name': layout.layout_name,
        'message': 'Certificate layout updated successfully'
    })

# Delete a certificate layout
@certificate_bp.route('/certificate-layouts/<int:id>', methods=['DELETE'])
def delete_layout(id):
    layout = CertificateLayout.query.get_or_404(id)
    db.session.delete(layout)
    db.session.commit()
    
    return jsonify({'message': 'Certificate layout deleted successfully'})

# Get layouts by program
@certificate_bp.route('/programs/<int:program_id>/certificate-layouts', methods=['GET'])
def get_layouts_by_program(program_id):
    layouts = CertificateLayout.query.filter_by(program_id=program_id).all()
    return jsonify([{
        'id': layout.id,
        'layout_name': layout.layout_name,
        'is_default': layout.is_default,
        'created_at': layout.created_at.isoformat() if layout.created_at else None
    } for layout in layouts])

# Get default layout for a program
@certificate_bp.route('/programs/<int:program_id>/default-certificate-layout', methods=['GET'])
def get_default_layout(program_id):
    layout = CertificateLayout.query.filter_by(
        program_id=program_id, 
        is_default=True
    ).first()
    
    if not layout:
        # Fallback to global default
        layout = CertificateLayout.query.filter(
            CertificateLayout.program_id.is_(None),
            CertificateLayout.is_default == True
        ).first()

    if not layout:
        # Fallback to any layout for the program
        layout = CertificateLayout.query.filter_by(program_id=program_id).first()

    if not layout:
        # Last resort: any global layout
        layout = CertificateLayout.query.filter(CertificateLayout.program_id.is_(None)).first()

    if not layout:
        return jsonify({'message': 'No certificate layout found for this program'}), 404
    
    return jsonify({
        'id': layout.id,
        'layout_name': layout.layout_name,
        'template_content': layout.template_content,
        'background_image': layout.background_image,
        'is_default': layout.is_default
    })
