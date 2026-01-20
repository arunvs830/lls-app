from flask import Blueprint, request, jsonify
from models import db, AcademicYear
from datetime import datetime

academic_year_bp = Blueprint('academic_year', __name__)

def parse_date(date_str):
    if not date_str:
        return None
    return datetime.strptime(date_str, '%Y-%m-%d').date()

@academic_year_bp.route('/api/academic-years', methods=['GET'])
def get_all():
    years = AcademicYear.query.all()
    return jsonify([{
        'id': y.id,
        'year_name': y.year_name,
        'start_date': y.start_date.isoformat() if y.start_date else None,
        'end_date': y.end_date.isoformat() if y.end_date else None,
        'created_at': y.created_at.isoformat() if y.created_at else None
    } for y in years])

@academic_year_bp.route('/api/academic-years', methods=['POST'])
def create():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        if 'year_name' not in data:
            return jsonify({'error': 'year_name is required'}), 400
        
        if 'start_date' not in data:
            return jsonify({'error': 'start_date is required'}), 400
            
        if 'end_date' not in data:
            return jsonify({'error': 'end_date is required'}), 400
        
        # Parse dates
        start_date = parse_date(data['start_date'])
        end_date = parse_date(data['end_date'])
        
        if not start_date or not end_date:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        # Validate date range
        if start_date >= end_date:
            return jsonify({'error': 'start_date must be before end_date'}), 400
        
        year = AcademicYear(
            year_name=data['year_name'],
            start_date=start_date,
            end_date=end_date
        )
        db.session.add(year)
        db.session.commit()
        return jsonify({'id': year.id, 'message': 'Academic year created successfully'}), 201
        
    except ValueError as e:
        return jsonify({'error': f'Invalid date format: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@academic_year_bp.route('/api/academic-years/<int:id>', methods=['GET'])
def get_one(id):
    year = AcademicYear.query.get_or_404(id)
    return jsonify({
        'id': year.id,
        'year_name': year.year_name,
        'start_date': year.start_date.isoformat() if year.start_date else None,
        'end_date': year.end_date.isoformat() if year.end_date else None
    })

@academic_year_bp.route('/api/academic-years/<int:id>', methods=['PUT'])
def update(id):
    try:
        year = AcademicYear.query.get_or_404(id)
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Update year_name if provided
        if 'year_name' in data:
            year.year_name = data['year_name']
        
        # Update start_date if provided
        if 'start_date' in data:
            start_date = parse_date(data['start_date'])
            if not start_date:
                return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD'}), 400
            year.start_date = start_date
        
        # Update end_date if provided
        if 'end_date' in data:
            end_date = parse_date(data['end_date'])
            if not end_date:
                return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD'}), 400
            year.end_date = end_date
        
        # Validate date range
        if year.start_date >= year.end_date:
            return jsonify({'error': 'start_date must be before end_date'}), 400
        
        db.session.commit()
        return jsonify({'message': 'Academic year updated successfully'})
        
    except ValueError as e:
        return jsonify({'error': f'Invalid date format: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@academic_year_bp.route('/api/academic-years/<int:id>', methods=['DELETE'])
def delete(id):
    year = AcademicYear.query.get_or_404(id)
    db.session.delete(year)
    db.session.commit()
    return jsonify({'message': 'Deleted successfully'})
