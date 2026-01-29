from flask import Blueprint, request, jsonify
from models import db, Communication, Student, Staff, Notification
from datetime import datetime

communication_bp = Blueprint('communication', __name__)

@communication_bp.route('/api/communications', methods=['POST'])
def send_message():
    """Send a new message"""
    try:
        data = request.json
        
        # Validate required fields
        required = ['sender_type', 'sender_id', 'receiver_type', 'receiver_id', 'message']
        if not all(field in data for field in required):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Validate sender and receiver types
        valid_types = ['student', 'staff', 'admin']
        if data['sender_type'] not in valid_types or data['receiver_type'] not in valid_types:
            return jsonify({'error': 'Invalid sender or receiver type'}), 400
            
        # Permission Check: Students can ONLY send to Staff
        if data['sender_type'] == 'student' and data['receiver_type'] != 'staff':
            return jsonify({'error': 'Students can only send messages to staff members'}), 403
        
        communication = Communication(
            sender_type=data['sender_type'],
            sender_id=data['sender_id'],
            receiver_type=data['receiver_type'],
            receiver_id=data['receiver_id'],
            subject=data.get('subject', ''),
            message=data['message'],
            is_read=False
        )
        
        db.session.add(communication)
        db.session.flush() # Get ID

        # Create Notification for receiver
        # Resolve sender name for notification title? 
        # For simplicity, we'll use a generic title or partial info, 
        # as getting the full name requires a query which we can do if needed.
        # But let's try to do it properly.
        
        sender_name = "Someone"
        if data['sender_type'] == 'student':
            s = Student.query.get(data['sender_id'])
            if s: sender_name = s.full_name
        elif data['sender_type'] == 'staff':
            s = Staff.query.get(data['sender_id'])
            if s: sender_name = s.full_name
        elif data['sender_type'] == 'admin':
            sender_name = "Administrator"

        notification = Notification(
            user_type=data['receiver_type'],
            user_id=data['receiver_id'],
            title=f"New Message from {sender_name}",
            message=f"Subject: {data.get('subject', '(No Subject)')}",
            notification_type='message',
            reference_type='message',
            reference_id=communication.id
        )
        db.session.add(notification)
        
        db.session.commit()
        
        return jsonify({
            'id': communication.id,
            'message': 'Message sent successfully'
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@communication_bp.route('/api/communications/inbox/<user_type>/<int:user_id>', methods=['GET'])
def get_inbox(user_type, user_id):
    """Get inbox messages for a user"""
    try:
        messages = Communication.query.filter_by(
            receiver_type=user_type,
            receiver_id=user_id
        ).order_by(Communication.sent_at.desc()).all()
        
        result = []
        for msg in messages:
            # Get sender details
            sender_name = 'Unknown'
            if msg.sender_type == 'student':
                student = Student.query.get(msg.sender_id)
                sender_name = student.full_name if student else 'Unknown Student'
            elif msg.sender_type == 'staff':
                staff = Staff.query.get(msg.sender_id)
                sender_name = staff.full_name if staff else 'Unknown Staff'
            elif msg.sender_type == 'admin':
                sender_name = 'Administrator'
            
            result.append({
                'id': msg.id,
                'sender_type': msg.sender_type,
                'sender_id': msg.sender_id,
                'sender_name': sender_name,
                'subject': msg.subject,
                'message': msg.message,
                'is_read': msg.is_read,
                'sent_at': msg.sent_at.isoformat() if msg.sent_at else None,
                'read_at': msg.read_at.isoformat() if msg.read_at else None
            })
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@communication_bp.route('/api/communications/sent/<user_type>/<int:user_id>', methods=['GET'])
def get_sent(user_type, user_id):
    """Get sent messages for a user"""
    try:
        messages = Communication.query.filter_by(
            sender_type=user_type,
            sender_id=user_id
        ).order_by(Communication.sent_at.desc()).all()
        
        result = []
        for msg in messages:
            # Get receiver details
            receiver_name = 'Unknown'
            if msg.receiver_type == 'student':
                student = Student.query.get(msg.receiver_id)
                receiver_name = student.full_name if student else 'Unknown Student'
            elif msg.receiver_type == 'staff':
                staff = Staff.query.get(msg.receiver_id)
                receiver_name = staff.full_name if staff else 'Unknown Staff'
            elif msg.receiver_type == 'admin':
                receiver_name = 'Administrator'
            
            result.append({
                'id': msg.id,
                'receiver_type': msg.receiver_type,
                'receiver_id': msg.receiver_id,
                'receiver_name': receiver_name,
                'subject': msg.subject,
                'message': msg.message,
                'is_read': msg.is_read,
                'sent_at': msg.sent_at.isoformat() if msg.sent_at else None,
                'read_at': msg.read_at.isoformat() if msg.read_at else None
            })
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@communication_bp.route('/api/communications/<int:message_id>', methods=['GET'])
def get_message(message_id):
    """Get a specific message"""
    try:
        msg = Communication.query.get_or_404(message_id)
        
        # Get sender details
        sender_name = 'Unknown'
        if msg.sender_type == 'student':
            student = Student.query.get(msg.sender_id)
            sender_name = student.full_name if student else 'Unknown Student'
        elif msg.sender_type == 'staff':
            staff = Staff.query.get(msg.sender_id)
            sender_name = staff.full_name if staff else 'Unknown Staff'
        elif msg.sender_type == 'admin':
            sender_name = 'Administrator'
        
        # Get receiver details
        receiver_name = 'Unknown'
        if msg.receiver_type == 'student':
            student = Student.query.get(msg.receiver_id)
            receiver_name = student.full_name if student else 'Unknown Student'
        elif msg.receiver_type == 'staff':
            staff = Staff.query.get(msg.receiver_id)
            receiver_name = staff.full_name if staff else 'Unknown Staff'
        elif msg.receiver_type == 'admin':
            receiver_name = 'Administrator'
        
        return jsonify({
            'id': msg.id,
            'sender_type': msg.sender_type,
            'sender_id': msg.sender_id,
            'sender_name': sender_name,
            'receiver_type': msg.receiver_type,
            'receiver_id': msg.receiver_id,
            'receiver_name': receiver_name,
            'subject': msg.subject,
            'message': msg.message,
            'is_read': msg.is_read,
            'sent_at': msg.sent_at.isoformat() if msg.sent_at else None,
            'read_at': msg.read_at.isoformat() if msg.read_at else None
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@communication_bp.route('/api/communications/<int:message_id>/read', methods=['PUT'])
def mark_as_read(message_id):
    """Mark a message as read"""
    try:
        msg = Communication.query.get_or_404(message_id)
        msg.is_read = True
        msg.read_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Message marked as read'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@communication_bp.route('/api/communications/<int:message_id>', methods=['DELETE'])
def delete_message(message_id):
    """Delete a message"""
    try:
        msg = Communication.query.get_or_404(message_id)
        db.session.delete(msg)
        db.session.commit()
        
        return jsonify({'message': 'Message deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@communication_bp.route('/api/communications/unread-count/<user_type>/<int:user_id>', methods=['GET'])
def get_unread_count(user_type, user_id):
    """Get count of unread messages"""
    try:
        count = Communication.query.filter_by(
            receiver_type=user_type,
            receiver_id=user_id,
            is_read=False
        ).count()
        
        return jsonify({'unread_count': count}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
