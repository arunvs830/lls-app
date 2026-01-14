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
    data = request.get_json()
    year = AcademicYear(
        year_name=data['year_name'],
        start_date=parse_date(data.get('start_date')),
        end_date=parse_date(data.get('end_date'))
    )
    db.session.add(year)
    db.session.commit()
    return jsonify({'id': year.id, 'message': 'Created successfully'}), 201

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
    year = AcademicYear.query.get_or_404(id)
    data = request.get_json()
    year.year_name = data.get('year_name', year.year_name)
    year.start_date = data.get('start_date', year.start_date)
    year.end_date = data.get('end_date', year.end_date)
    db.session.commit()
    return jsonify({'message': 'Updated successfully'})

@academic_year_bp.route('/api/academic-years/<int:id>', methods=['DELETE'])
def delete(id):
    year = AcademicYear.query.get_or_404(id)
    db.session.delete(year)
    db.session.commit()
    return jsonify({'message': 'Deleted successfully'})
