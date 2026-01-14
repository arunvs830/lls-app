import os
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
from models import db, StudyMaterial
from datetime import datetime

study_material_bp = Blueprint('study_material', __name__)

ALLOWED_EXTENSIONS = {'pdf', 'ppt', 'pptx', 'mp4', 'mov', 'avi', 'doc', 'docx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def serialize_material(m, include_children=False):
    data = {
        'id': m.id,
        'title': m.title,
        'description': m.description,
        'file_path': m.file_path,
        'file_type': m.file_type,
        'thumbnail_path': m.thumbnail_path,
        'staff_course_id': m.staff_course_id,
        'parent_id': m.parent_id,
        'upload_date': m.upload_date.isoformat() if m.upload_date else None
    }
    if include_children:
        data['children'] = [serialize_material(c, False) for c in m.children]
    return data

def _process_file_upload(file, file_type):
    """Internal helper to save file and generate thumbnail if needed"""
    if not (file and file.filename and allowed_file(file.filename)):
        return None, None
        
    filename = secure_filename(f"material_{datetime.now().timestamp()}_{file.filename}")
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    file_url = f"/api/study-materials/download/{filename}"
    
    thumbnail_url = None
    # Generate thumbnail for PPT/PPTX files
    if file_type == 'ppt' or filename.lower().endswith(('.ppt', '.pptx')):
        try:
            from thumbnail_generator import generate_thumbnail_simple
            thumb_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'thumbnails')
            thumb_result = generate_thumbnail_simple(filepath, thumb_dir)
            if thumb_result and os.path.exists(thumb_result):
                thumb_filename = os.path.basename(str(thumb_result))
                thumbnail_url = f"/api/study-materials/thumbnail/{thumb_filename}"
        except Exception as thumb_error:
            print(f"Thumbnail generation failed: {thumb_error}")
            
    return file_url, thumbnail_url

@study_material_bp.route('/api/study-materials', methods=['GET'])
def get_all():
    staff_course_id = request.args.get('staff_course_id')
    file_type = request.args.get('file_type')
    parent_only = request.args.get('parent_only')
    
    query = StudyMaterial.query
    if staff_course_id:
        query = query.filter_by(staff_course_id=staff_course_id)
    if file_type:
        query = query.filter_by(file_type=file_type)
    if parent_only == 'true':
        query = query.filter_by(parent_id=None)
    
    materials = query.order_by(StudyMaterial.upload_date.desc()).all()
    return jsonify([serialize_material(m, include_children=True) for m in materials])

@study_material_bp.route('/api/study-materials', methods=['POST'])
def create():
    data = request.get_json()
    material = StudyMaterial(
        title=data['title'],
        description=data.get('description'),
        file_path=data.get('file_path'),
        file_type=data.get('file_type', 'video'),
        staff_course_id=data.get('staff_course_id'),
        parent_id=data.get('parent_id')
    )
    db.session.add(material)
    db.session.commit()
    return jsonify({'id': material.id, 'message': 'Created successfully'}), 201

@study_material_bp.route('/api/study-materials/<int:id>', methods=['GET'])
def get_one(id):
    material = StudyMaterial.query.get_or_404(id)
    return jsonify(serialize_material(material, include_children=True))

@study_material_bp.route('/api/study-materials/<int:id>', methods=['PUT'])
def update(id):
    material = StudyMaterial.query.get_or_404(id)
    data = request.get_json()
    material.title = data.get('title', material.title)
    material.description = data.get('description', material.description)
    material.file_path = data.get('file_path', material.file_path)
    material.file_type = data.get('file_type', material.file_type)
    db.session.commit()
    return jsonify({'message': 'Updated successfully'})

@study_material_bp.route('/api/study-materials/<int:id>', methods=['DELETE'])
def delete(id):
    material = StudyMaterial.query.get_or_404(id)
    db.session.delete(material)
    db.session.commit()
    return jsonify({'message': 'Deleted successfully'})

# Download study material files
@study_material_bp.route('/api/study-materials/download/<filename>')
def download_file(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

# Serve thumbnail images
@study_material_bp.route('/api/study-materials/thumbnail/<filename>')
def serve_thumbnail(filename):
    thumb_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'thumbnails')
    return send_from_directory(thumb_dir, filename)

# Get materials by course
@study_material_bp.route('/api/courses/<int:course_id>/materials', methods=['GET'])
def get_by_course(course_id):
    from models import StaffCourse
    staff_courses = StaffCourse.query.filter_by(course_id=course_id).all()
    staff_course_ids = [sc.id for sc in staff_courses]
    
    # Get only parent materials (parent_id is None)
    materials = StudyMaterial.query.filter(
        StudyMaterial.staff_course_id.in_(staff_course_ids),
        StudyMaterial.parent_id == None
    ).order_by(StudyMaterial.upload_date.desc()).all()
    
    return jsonify([serialize_material(m, include_children=True) for m in materials])

# Add material to a course (with file upload support)
@study_material_bp.route('/api/courses/<int:course_id>/materials', methods=['POST'])
def add_to_course(course_id):
    from models import StaffCourse
    
    try:
        staff_course = StaffCourse.query.filter_by(course_id=course_id).first()
        
        if not staff_course:
            return jsonify({'error': 'Course not found or no staff assigned'}), 404
        
        if request.content_type and 'multipart/form-data' in request.content_type:
            title = request.form.get('title')
            description = request.form.get('description')
            file_type = request.form.get('file_type', 'pdf')
            file_path = request.form.get('file_path', '')
            thumbnail_path = None
            
            if 'file' in request.files:
                f_path, t_path = _process_file_upload(request.files['file'], file_type)
                if f_path: file_path = f_path
                if t_path: thumbnail_path = t_path
            
            material = StudyMaterial(
                title=title,
                description=description,
                file_path=file_path,
                file_type=file_type,
                thumbnail_path=thumbnail_path,
                staff_course_id=staff_course.id
            )
        else:
            # JSON request
            data = request.get_json()
            material = StudyMaterial(
                title=data['title'],
                description=data.get('description'),
                file_path=data.get('file_path', data.get('video_url', '')),
                file_type=data.get('file_type', 'youtube'),
                staff_course_id=staff_course.id,
                parent_id=data.get('parent_id')
            )
    
        db.session.add(material)
        db.session.commit()
        return jsonify({'id': material.id, 'message': 'Created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@study_material_bp.route('/api/study-materials/<int:parent_id>/children', methods=['POST'])
def add_child(parent_id):
    parent = StudyMaterial.query.get_or_404(parent_id)
    
    try:
        if request.content_type and 'multipart/form-data' in request.content_type:
            title = request.form.get('title')
            description = request.form.get('description')
            file_type = request.form.get('file_type', 'pdf')
            file_path = ''
            thumbnail_path = None
            
            if 'file' in request.files:
                f_path, t_path = _process_file_upload(request.files['file'], file_type)
                if f_path: file_path = f_path
                if t_path: thumbnail_path = t_path
                
            child = StudyMaterial(
                title=title,
                description=description,
                file_path=file_path,
                file_type=file_type,
                thumbnail_path=thumbnail_path,
                staff_course_id=parent.staff_course_id,
                parent_id=parent_id
            )
        else:
            data = request.get_json()
            child = StudyMaterial(
                title=data['title'],
                description=data.get('description'),
                file_path=data.get('file_path'),
                file_type=data.get('file_type', 'pdf'),
                staff_course_id=parent.staff_course_id,
                parent_id=parent_id
            )
            
        db.session.add(child)
        db.session.commit()
        return jsonify({'id': child.id, 'message': 'Created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get children of a material
@study_material_bp.route('/api/study-materials/<int:parent_id>/children', methods=['GET'])
def get_children(parent_id):
    children = StudyMaterial.query.filter_by(parent_id=parent_id).all()
    return jsonify([serialize_material(c, False) for c in children])
