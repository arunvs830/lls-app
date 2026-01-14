from flask import Blueprint, request, jsonify
from models import db, Program

program_bp = Blueprint('program', __name__)

@program_bp.route('/api/programs', methods=['GET'])
def get_all():
    programs = Program.query.all()
    return jsonify([{
        'id': p.id,
        'program_name': p.program_name,
        'program_code': p.program_code
    } for p in programs])

@program_bp.route('/api/programs', methods=['POST'])
def create():
    data = request.get_json()
    program = Program(
        program_name=data['program_name'],
        program_code=data['program_code']
    )
    db.session.add(program)
    db.session.commit()
    return jsonify({'id': program.id, 'message': 'Created successfully'}), 201

@program_bp.route('/api/programs/<int:id>', methods=['DELETE'])
def delete(id):
    program = Program.query.get_or_404(id)
    db.session.delete(program)
    db.session.commit()
    return jsonify({'message': 'Deleted successfully'})
