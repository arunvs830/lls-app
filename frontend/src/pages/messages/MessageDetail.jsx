import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { communicationApi } from '../../services/api';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Trash2, Reply, User, Calendar } from 'lucide-react';

const MessageDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(true);

    const userType = user?.role || 'student';
    const userId = user?.id;

    useEffect(() => {
        loadMessage();
    }, [id]);

    const loadMessage = async () => {
        try {
            const data = await communicationApi.getOne(id);
            setMessage(data);

            // Mark as read if I am the receiver and it's not read
            if (data.receiver_id == userId && data.receiver_type === userType && !data.is_read) {
                await communicationApi.markAsRead(id);
            }
        } catch (error) {
            console.error('Error loading message:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Delete this message?')) {
            try {
                await communicationApi.delete(id);
                navigate(-1);
            } catch (error) {
                console.error('Error deleting:', error);
            }
        }
    };

    const handleReply = () => {
        // Navigate to compose with reply info in state
        const basePath = userType === 'student' ? '/student/messages/new' : '/staff/messages/new';
        navigate(basePath, {
            state: {
                replyTo: {
                    receiver_type: message.sender_type,
                    receiver_id: message.sender_id,
                    receiver_name: message.sender_name,
                    subject: message.subject?.startsWith('Re: ') ? message.subject : `Re: ${message.subject || ''}`,
                    original_message: message.message,
                    original_date: message.sent_at,
                    original_sender: message.sender_name || message.sender_type
                }
            }
        });
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#5C6873' }}>Loading message...</div>;
    if (!message) return <div style={{ padding: '2rem', textAlign: 'center', color: '#5C6873' }}>Message not found</div>;

    const isSender = message.sender_id == userId && message.sender_type === userType;

    return (
        <div className="card" style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '1px solid #E3E5E8'
            }}>
                <h2 style={{ margin: 0, color: '#21272A' }}>Message Details</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={handleDelete}
                        style={{
                            background: '#FEE2E2',
                            color: '#DC2626',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <Trash2 size={18} />
                    </button>
                    {!isSender && (
                        <Button onClick={handleReply}>
                            <Reply size={16} style={{ marginRight: '6px' }} />
                            Reply
                        </Button>
                    )}
                </div>
            </div>

            {/* Message Content */}
            <div style={{ background: '#FAFBFC', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E3E5E8' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #E3E5E8' }}>
                    <h3 style={{ color: '#21272A', fontSize: '1.25rem', marginBottom: '1rem', fontWeight: '600' }}>
                        {message.subject || '(No Subject)'}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#5C6873' }}>
                            <User size={16} color="#14BF96" />
                            <span>From: <strong style={{ color: '#21272A' }}>{message.sender_name || message.sender_type}</strong></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#5C6873' }}>
                            <User size={16} color="#3B82F6" />
                            <span>To: <strong style={{ color: '#21272A' }}>{message.receiver_name || message.receiver_type}</strong></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#5C6873' }}>
                            <Calendar size={16} />
                            <span>{new Date(message.sent_at).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '1.5rem', color: '#21272A', lineHeight: '1.7', fontSize: '1rem', whiteSpace: 'pre-wrap', background: '#FFFFFF' }}>
                    {message.message}
                </div>
            </div>
        </div>
    );
};

export default MessageDetail;
