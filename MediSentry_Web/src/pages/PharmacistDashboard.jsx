import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { ClipboardList, CheckCircle, AlertTriangle, Search, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PharmacistDashboard = () => {
    const { userInfo } = useContext(AuthContext);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [verifiedCount, setVerifiedCount] = useState(0);
    const navigate = useNavigate();

    const fetchPrescriptions = async () => {
        try {
            const res = await api.get('/prescriptions/');
            // Filter for PENDING, FLAGGED, or UNDER_REVIEW for the queue
            const pending = res.data.filter(p => ['PENDING', 'FLAGGED', 'UNDER_REVIEW'].includes(p.status));
            setPrescriptions(pending);

            // Calculate Verified Today: Status is not PENDING and created today (as proxy since no updated_at)
            const todayStr = new Date().toISOString().split('T')[0];
            const verified = res.data.filter(p => 
                ['APPROVED', 'REJECTED', 'FLAGGED'].includes(p.status) && 
                p.created_at.startsWith(todayStr)
            ).length;
            setVerifiedCount(verified);
            
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const stats = [
        { label: 'Pending Queue', value: prescriptions.length, icon: <ClipboardList size={22} />, color: '#F59E0B' },
        { label: 'Verified Today', value: verifiedCount, icon: <CheckCircle size={22} />, color: '#10B981' },
    ];

    return (
        <div className="pharmacist-dashboard">
            <div className="welcome-section">
                <h1>Pharmacy Portal</h1>
                <p>Welcome back, {userInfo?.username}. Please review the priority queue.</p>
            </div>

            <div className="stats-row">
                {stats.map((stat, i) => (
                    <div key={i} className="stat-pill glass-card">
                        <div className="stat-pill-icon" style={{ color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-pill-info">
                            <span className="val">{stat.value}</span>
                            <span className="lbl">{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="queue-section">
                <div className="section-header">
                    <h2>Priority Queue</h2>
                    <div className="queue-filters">
                        <span>{prescriptions.length} items pending</span>
                    </div>
                </div>

                <div className="queue-table-container glass-card">
                    {loading ? (
                        <div className="loading-state">
                            <Loader2 className="animate-spin" size={32} />
                            <p>Loading queue...</p>
                        </div>
                    ) : prescriptions.length === 0 ? (
                        <div className="empty-state">
                            <CheckCircle size={48} color="#10B981" />
                            <h3>All Caught Up!</h3>
                            <p>No pending prescriptions require review at this moment.</p>
                        </div>
                    ) : (
                        <div className="queue-list">
                            {prescriptions.map((item) => (
                                <div key={item.id} className="queue-item" onClick={() => navigate(`/verification-detail/${item.id}`, { state: { prescription: item } })}>
                                    <div className="patient-info">
                                        <h3>{item.patient_name || `Patient #${item.patient}`}</h3>
                                        <div className="meta">
                                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                            <span className="dot">•</span>
                                            <span>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>

                                    <div className="doctor-info">
                                        <p className="dr-name">{(item.doctor_name || '(? )').replace(/^Dr\.\s*/i, '')}</p>
                                        <p className="dr-spec">{item.doctor_specialization || 'General Physician'}</p>
                                    </div>

                                    <div className="status-info">
                                        <span className={`status-badge ${item.status.toLowerCase()}`}>
                                            {item.status}
                                            {item.status === 'FLAGGED' && <AlertTriangle size={14} />}
                                        </span>
                                    </div>

                                    <div className="action-info">
                                        <button className="review-btn">
                                            Review <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .welcome-section { margin-bottom: 30px; }
                .welcome-section h1 { font-size: 2rem; font-weight: 700; }
                .welcome-section p { color: var(--text-secondary); }
                
                .stats-row { display: flex; gap: 20px; margin-bottom: 30px; }
                .stat-pill { display: flex; align-items: center; gap: 15px; padding: 15px 25px; min-width: 200px; }
                .stat-pill-icon { width: 40px; height: 40px; border-radius: 10px; background: #F3F4F6; display: flex; align-items: center; justify-content: center; }
                .stat-pill-info { display: flex; flex-direction: column; }
                .stat-pill-info .val { font-size: 1.5rem; font-weight: 700; color: var(--text-main); line-height: 1; }
                .stat-pill-info .lbl { font-size: 0.85rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; }

                .queue-section h2 { font-size: 1.5rem; font-weight: 700; }
                .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .queue-filters span { font-size: 0.9rem; color: var(--text-secondary); font-weight: 600; }

                .queue-table-container { min-height: 400px; padding: 0; overflow: hidden; }
                .queue-list { display: flex; flex-direction: column; }
                .queue-item { display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr; align-items: center; padding: 20px 30px; border-bottom: 1px solid #F3F4F6; cursor: pointer; transition: var(--transition); }
                .queue-item:hover { background: #F9FAFB; }
                .queue-item:last-child { border-bottom: none; }

                .patient-info h3 { font-size: 1.1rem; font-weight: 700; color: var(--primary-color); margin-bottom: 4px; }
                .meta { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #888; }
                .dot { color: #ccc; }

                .dr-name { font-weight: 700; font-size: 0.95rem; color: var(--text-main); }
                .dr-spec { font-size: 0.85rem; color: #666; }

                .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
                .status-badge.pending { background: #F3F4F6; color: #4B5563; }
                .status-badge.flagged { background: #FEE2E2; color: #EF4444; }
                .status-badge.under_review { background: #DBEAFE; color: #3B82F6; }

                .review-btn { background: var(--primary-color); color: white; padding: 8px 16px; border-radius: 8px; font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: var(--transition); }
                .review-btn:hover { background: var(--accent-color); }

                .loading-state, .empty-state { padding: 80px; text-align: center; color: var(--text-secondary); display: flex; flex-direction: column; align-items: center; gap: 15px; }
                .empty-state h3 { color: var(--text-main); margin-top: 10px; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                @media (max-width: 900px) {
                    .queue-item { grid-template-columns: 1fr 1fr; gap: 20px; }
                    .status-info, .action-info { justify-self: end; }
                }
            ` }} />
        </div>
    );
};

export default PharmacistDashboard;
