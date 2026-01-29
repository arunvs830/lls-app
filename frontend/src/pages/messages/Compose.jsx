import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { communicationApi, staffApi, studentApi } from '../../services/api';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { Send, ArrowLeft } from 'lucide-react';

const Compose = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const replyTo = location.state?.replyTo;

    const userType = user?.role || 'student';
    const userId = user?.id;

    const [formData, setFormData] = useState({
        receiver_type: replyTo?.receiver_type || (userType === 'staff' ? 'student' : 'staff'),
        receiver_id: replyTo?.receiver_id || '',
        subject: replyTo?.subject || '',
        message: replyTo?.original_message ? `\n\n\n--- Original Message ---\nFrom: ${replyTo.original_sender}\nSent: ${new Date(replyTo.original_date).toLocaleString()}\nSubject: ${replyTo.subject}\n\n${replyTo.original_message}` : ''
    });

    const [recipients, setRecipients] = useState([]);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadRecipients();
    }, [formData.receiver_type]);

    const loadRecipients = async () => {
        if (!userType) return;
        try {
            let data = [];
            if (formData.receiver_type === 'staff') {
                data = await staffApi.getAll();
            } else if (formData.receiver_type === 'student') {
                data = await studentApi.getAll();
            }
            setRecipients(data);
        } catch (error) {
            console.error('Error loading recipients:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            await communicationApi.send({
                sender_type: userType,
                sender_id: userId,
                receiver_type: formData.receiver_type,
                receiver_id: formData.receiver_id,
                subject: formData.subject,
                message: formData.message
            });
            alert('Message sent successfully!');
            navigate(userType === 'student' ? '/student/messages' : '/staff/messages');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="card" style={{ padding: '24px' }}>
            {/* Header with title */}
            <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '1px solid #E3E5E8'
            }}>
                <h2 style={{ margin: 0, color: '#21272A' }}>Compose Message</h2>
            </div>

            <form onSubmit={handleSubmit}>
                {userType === 'staff' && (
                    <div className="input-field-wrapper" style={{ marginBottom: '1.5rem' }}>
                        <label className="input-label">Send To:</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, receiver_type: 'student', receiver_id: '' })}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    border: formData.receiver_type === 'student' ? '2px solid #14BF96' : '1px solid #E3E5E8',
                                    background: formData.receiver_type === 'student' ? 'rgba(20, 191, 150, 0.1)' : '#FAFBFC',
                                    color: formData.receiver_type === 'student' ? '#14BF96' : '#5C6873',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                Student
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, receiver_type: 'staff', receiver_id: '' })}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    border: formData.receiver_type === 'staff' ? '2px solid #14BF96' : '1px solid #E3E5E8',
                                    background: formData.receiver_type === 'staff' ? 'rgba(20, 191, 150, 0.1)' : '#FAFBFC',
                                    color: formData.receiver_type === 'staff' ? '#14BF96' : '#5C6873',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                Staff
                            </button>
                        </div>
                    </div>
                )}

                <div className="input-field-wrapper" style={{ marginBottom: '1rem' }}>
                    <label className="input-label">Recipient</label>
                    <select
                        id="receiver_id"
                        className="input-element"
                        value={formData.receiver_id}
                        onChange={handleChange}
                        required
                        style={{ width: '100%' }}
                    >
                        <option value="">Select Recipient...</option>
                        {recipients.map(r => (
                            <option key={r.id} value={r.id}>
                                {r.full_name || r.name || `User ${r.id}`}
                            </option>
                        ))}
                    </select>
                </div>

                <InputField
                    id="subject"
                    label="Subject"
                    placeholder="Enter subject..."
                    value={formData.subject}
                    onChange={handleChange}
                    required
                />

                <div className="input-field-wrapper" style={{ marginBottom: '1rem' }}>
                    <label className="input-label">Message</label>
                    <textarea
                        id="message"
                        className="input-element"
                        rows="6"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Type your message here..."
                        style={{ resize: 'vertical', width: '100%' }}
                        required
                    ></textarea>
                </div>

                {/* Button container with equal width buttons */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    gap: '1rem',
                    marginTop: '1.5rem'
                }}>
                    <Button type="submit" disabled={sending}>
                        <Send size={16} style={{ marginRight: '8px' }} />
                        {sending ? 'Sending...' : 'Send Message'}
                    </Button>
                    <Button variant="secondary" onClick={() => navigate(-1)} type="button">
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default Compose;
