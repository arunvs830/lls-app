"""
Notification Routes - API endpoints for notifications
"""
from flask import Blueprint, request, jsonify
from models import db, Notification
from datetime import datetime
import sys
import os

# Add parent directory to path to import services
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.notification_service import NotificationService

notification_bp = Blueprint('notification', __name__)


@notification_bp.route('/api/notifications/<user_type>/<int:user_id>', methods=['GET'])
def get_notifications(user_type, user_id):
    """Get all notifications for a user"""
    try:
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        limit = request.args.get('limit', 50, type=int)
        
        notifications = NotificationService.get_user_notifications(
            user_type=user_type,
            user_id=user_id,
            unread_only=unread_only,
            limit=limit
        )
        
        return jsonify([{
            'id': n.id,
            'title': n.title,
            'message': n.message,
            'notification_type': n.notification_type,
            'reference_type': n.reference_type,
            'reference_id': n.reference_id,
            'is_read': n.is_read,
            'created_at': n.created_at.isoformat() if n.created_at else None,
            'read_at': n.read_at.isoformat() if n.read_at else None
        } for n in notifications])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@notification_bp.route('/api/notifications/<user_type>/<int:user_id>/count', methods=['GET'])
def get_notification_count(user_type, user_id):
    """Get count of unread notifications"""
    try:
        count = NotificationService.get_unread_count(user_type, user_id)
        return jsonify({'unread_count': count})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@notification_bp.route('/api/notifications/<int:notification_id>/read', methods=['PUT'])
def mark_notification_read(notification_id):
    """Mark a single notification as read"""
    try:
        notification = NotificationService.mark_as_read(notification_id)
        if notification:
            return jsonify({
                'id': notification.id,
                'is_read': notification.is_read,
                'read_at': notification.read_at.isoformat() if notification.read_at else None
            })
        return jsonify({'error': 'Notification not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@notification_bp.route('/api/notifications/<user_type>/<int:user_id>/read-all', methods=['PUT'])
def mark_all_notifications_read(user_type, user_id):
    """Mark all notifications as read for a user"""
    try:
        NotificationService.mark_all_as_read(user_type, user_id)
        return jsonify({'message': 'All notifications marked as read'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@notification_bp.route('/api/notifications/<int:notification_id>', methods=['DELETE'])
def delete_notification(notification_id):
    """Delete a notification"""
    try:
        notification = Notification.query.get(notification_id)
        if notification:
            db.session.delete(notification)
            db.session.commit()
            return jsonify({'message': 'Notification deleted'})
        return jsonify({'error': 'Notification not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@notification_bp.route('/api/notifications/send-test', methods=['POST'])
def send_test_notification():
    """Send a test notification (for development/testing)"""
    try:
        data = request.json
        user_type = data.get('user_type', 'student')
        user_id = data.get('user_id', 1)
        title = data.get('title', 'Test Notification')
        message = data.get('message', 'This is a test notification message.')
        
        notification = NotificationService.create_notification(
            user_type=user_type,
            user_id=user_id,
            title=title,
            message=message,
            notification_type='test',
            send_email=data.get('send_email', False)
        )
        
        return jsonify({
            'id': notification.id,
            'title': notification.title,
            'message': notification.message,
            'created_at': notification.created_at.isoformat()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@notification_bp.route('/api/notifications/trigger-deadline-check', methods=['POST'])
def trigger_deadline_check():
    """Manually trigger deadline reminder check (for testing)"""
    try:
        from services.notification_service import send_deadline_reminders
        send_deadline_reminders()
        return jsonify({'message': 'Deadline reminders processed'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
