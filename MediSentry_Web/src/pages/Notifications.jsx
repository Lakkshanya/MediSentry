import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Loader2, 
  Clock,
  History as HistoryIcon,
  Activity,
  User,
  ShieldCheck,
  ChevronRight,
  Stethoscope,
  XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users/notifications/');
            setNotifications(res.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.patch(`/users/notifications/${id}/`, { is_read: true });
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (e) {
            console.error(e);
        }
    };

    const getStatusDetails = (title) => {
        const t = title.toLowerCase();
        if (t.includes('approve')) return { color: '#10B981', icon: <CheckCircle size={22} />, label: 'Approved' };
        if (t.includes('flag')) return { color: '#F59E0B', icon: <AlertTriangle size={22} />, label: 'Flagged' };
        if (t.includes('reject')) return { color: '#EF4444', icon: <XCircle size={22} />, label: 'Rejected' };
        return { color: '#3B82F6', icon: <Info size={22} />, label: 'Update' };
    };

    return (
        <Layout>
            <div className="timeline-page">
                <style>{`
                    .timeline-page { padding: 40px; max-width: 1000px; margin: 0 auto; }
                    .timeline-header { margin-bottom: 50px; display: flex; align-items: flex-end; gap: 25px; }
                    .timeline-header-icon { width: 80px; height: 80px; background: #28005C; border-radius: 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 15px 35px rgba(40, 0, 92, 0.2); }
                    .timeline-header h1 { font-size: 2.5rem; font-weight: 900; color: #28005C; line-height: 1; margin-bottom: 8px; }
                    .timeline-header p { font-size: 1.2rem; color: #666; font-weight: 600; }

                    .timeline-container { position: relative; padding-left: 50px; }
                    .timeline-line { position: absolute; left: 19px; top: 10px; bottom: 10px; width: 4px; background: #E5E7EB; border-radius: 2px; }
                    
                    .timeline-group { margin-bottom: 40px; }
                    .timeline-item { position: relative; margin-bottom: 30px; }
                    .timeline-dot { 
                        position: absolute; left: -49px; top: 10px; width: 44px; height: 44px; 
                        background: white; border-radius: 50%; border: 4px solid #E5E7EB; 
                        display: flex; align-items: center; justify-content: center; z-index: 2;
                        transition: all 0.3s ease;
                    }
                    .timeline-item:hover .timeline-dot { transform: scale(1.1); border-color: #28005C; }
                    
                    .timeline-card { 
                        background: white; padding: 30px; border-radius: 24px; border: 1.5px solid #F0F0F0;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.02); transition: all 0.3s ease; cursor: pointer;
                    }
                    .timeline-card:hover { border-color: #28005C; transform: translateX(10px); box-shadow: 0 15px 40px rgba(0,0,0,0.05); }
                    .timeline-card.unread { border-left: 6px solid #28005C; background: rgba(40, 0, 92, 0.01); }

                    .card-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
                    .action-badge { display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 10px; font-weight: 800; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; }
                    
                    .prescription-ref { font-size: 0.95rem; font-weight: 800; color: #28005C; opacity: 0.6; }
                    .timeline-content h3 { font-size: 1.3rem; font-weight: 800; color: #111; margin-bottom: 10px; }
                    .timeline-content p { font-size: 1.1rem; color: #444; line-height: 1.6; margin-bottom: 20px; font-weight: 500; }
                    
                    .timeline-meta { display: flex; align-items: center; gap: 20px; border-top: 1.5px solid #F8F9FA; padding-top: 20px; color: #999; font-weight: 700; font-size: 0.9rem; }
                    .meta-item { display: flex; align-items: center; gap: 8px; }

                    .loading-state, .empty-state { padding: 120px 30px; text-align: center; }
                    .animate-spin { animation: spin 1s linear infinite; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}</style>

                <div className="timeline-header">
                    <div className="timeline-header-icon">
                        <HistoryIcon size={40} color="white" />
                    </div>
                    <div>
                        <h1>Prescription Timeline</h1>
                        <p>Track Pharmacist reviews and interaction audits</p>
                    </div>
                </div>

                <div className="timeline-container">
                    <div className="timeline-line"></div>
                    
                    {loading ? (
                        <div className="loading-state">
                            <Loader2 className="animate-spin" size={60} color="#28005C" />
                            <p style={{marginTop: 20, fontWeight: 700, fontSize: '1.2rem', color: '#666'}}>Synchronizing clinical records...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="empty-state">
                            <Activity size={80} strokeWidth={1} color="#E0E0E0" />
                            <h2 style={{marginTop: 20, color: '#28005C'}}>Timeline Secure</h2>
                            <p style={{color: '#999', fontWeight: 600}}>No recent pharmacist modifications detected in your queue.</p>
                        </div>
                    ) : (
                        <div className="timeline-list">
                            {notifications.map((n, i) => {
                                const status = getStatusDetails(n.title);
                                return (
                                    <div key={n.id} className="timeline-item" onClick={() => {
                                        markAsRead(n.id);
                                        if (n.prescription) navigate(`/verification-detail/${n.prescription}`);
                                    }}>
                                        <div className="timeline-dot" style={{ borderColor: status.color }}>
                                            {React.cloneElement(status.icon, { size: 20, color: status.color })}
                                        </div>
                                        <div className={`timeline-card ${n.is_read ? '' : 'unread'}`}>
                                            <div className="card-header-v2">
                                                <div className="action-badge" style={{ background: `${status.color}15`, color: status.color }}>
                                                    {status.icon} {status.label}
                                                </div>
                                                <span className="prescription-ref">RX-ID #{n.prescription || 'N/A'}</span>
                                            </div>
                                            <div className="timeline-content">
                                                <h3>{n.title}</h3>
                                                <p>{n.message}</p>
                                            </div>
                                            <div className="timeline-meta">
                                                <div className="meta-item">
                                                    <Clock size={16} />
                                                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="meta-item">
                                                    <Clock size={16} />
                                                    {new Date(n.created_at).toLocaleDateString()}
                                                </div>
                                                <div className="meta-item" style={{marginLeft: 'auto'}}>
                                                    View Details <ChevronRight size={18} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Notifications;
