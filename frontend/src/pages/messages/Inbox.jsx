import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { communicationApi } from '../../services/api';
import Button from '../../components/Button';
import { Mail, Send, Trash2, Eye, Inbox as InboxIcon } from 'lucide-react';

const Inbox = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' or 'sent'
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    // Get user info from localStorage
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userType = storedUser.role || localStorage.getItem('role') || 'student';
    const userId = storedUser.id || localStorage.getItem('userId') || 1;

    useEffect(() => {
        loadMessages();
    }, [activeTab]);

    const loadMessages = async () => {
        setLoading(true);
        try {
            let data;
            if (activeTab === 'inbox') {
                data = await communicationApi.getInbox(userType, userId);
            } else {
                data = await communicationApi.getSent(userType, userId);
            }
            setMessages(data);
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this message?')) {
            try {
                await communicationApi.delete(id);
                loadMessages(); // Reload list
            } catch (error) {
                console.error('Error deleting message:', error);
            }
        }
    };

    const handleMessageClick = (id) => {
        navigate(userType === 'student' ? `/student/messages/${id}` : `/staff/messages/${id}`);
    };

    const handleCompose = () => {
        navigate(userType === 'student' ? '/student/messages/new' : `/staff/messages/new`);
    };

    const getSenderName = (msg) => {
        if (activeTab === 'sent') {
            return `To: ${msg.receiver_name || msg.receiver_type}`;
        }
        return `From: ${msg.sender_name || msg.sender_type}`;
    };

    return (
        <div className="card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={24} color="#8b5cf6" />
                    Messages
                </h2>
                <Button onClick={handleCompose}>
                    <Send size={18} />
                    Compose
                </Button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                <button
                    onClick={() => setActiveTab('inbox')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: activeTab === 'inbox' ? '#8b5cf6' : 'rgba(255,255,255,0.6)',
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 500,
                        borderBottom: activeTab === 'inbox' ? '2px solid #8b5cf6' : '2px solid transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <InboxIcon size={18} />
                    Inbox
                </button>
                <button
                    onClick={() => setActiveTab('sent')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: activeTab === 'sent' ? '#8b5cf6' : 'rgba(255,255,255,0.6)',
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 500,
                        borderBottom: activeTab === 'sent' ? '2px solid #8b5cf6' : '2px solid transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <Send size={18} />
                    Sent
                </button>
            </div>

            {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Loading messages...</div>
            ) : messages.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <div style={{ marginBottom: '1rem', opacity: 0.3 }}><Mail size={48} /></div>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>No messages found in {activeTab}</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {messages.map(msg => (
                        <div
                            key={msg.id}
                            onClick={() => handleMessageClick(msg.id)}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1.25rem',
                                background: activeTab === 'inbox' && !msg.is_read ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.03)',
                                borderRadius: '12px',
                                border: activeTab === 'inbox' && !msg.is_read ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            className="message-item"
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span style={{ fontWeight: 600, color: 'white', fontSize: '1.05rem' }}>
                                        {msg.subject || '(No Subject)'}
                                    </span>
                                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
                                        {new Date(msg.sent_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.9rem', color: '#8b5cf6' }}>
                                        {getSenderName(msg)}
                                    </span>
                                    {activeTab === 'inbox' && !msg.is_read && (
                                        <span style={{ fontSize: '0.75rem', background: '#8b5cf6', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>
                                            New
                                        </span>
                                    )}
                                </div>
                                <p style={{
                                    fontSize: '0.9rem',
                                    color: 'rgba(255,255,255,0.6)',
                                    margin: '0.25rem 0 0 0',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '600px'
                                }}>
                                    {msg.message}
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem', alignItems: 'center' }}>
                                <button
                                    onClick={(e) => handleDelete(e, msg.id)}
                                    style={{
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        color: '#ef4444',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Inbox;
