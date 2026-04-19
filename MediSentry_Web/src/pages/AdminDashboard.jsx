import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { ShieldCheck, Activity, Users, AlertCircle, FileText, Loader2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { userInfo } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchAnalytics = async () => {
        try {
            const res = await api.get('/prescriptions/analytics/');
            setStats(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (loading) return <div className="loading-state"><Loader2 className="animate-spin" /></div>;

    const cards = [
        { label: 'Total Logs', value: stats?.total_prescriptions || 0, icon: <FileText />, color: '#3B82F6' },
        { label: 'High Risk Rate', value: `${Math.round(stats?.high_risk_rate || 0)}%`, icon: <AlertCircle />, color: '#EF4444' },
        { label: 'Active Pharmacists', value: stats?.total_pharmacists || 0, icon: <Activity />, color: '#F59E0B' },
        { label: 'Active Doctors', value: stats?.total_doctors || 0, icon: <Users />, color: '#8B5CF6' },
    ];

    return (
        <div className="admin-dashboard">
            <div className="welcome-section">
                <h1>Hospital Governance</h1>
                <p>Welcome, Administrator {userInfo?.username}. Real-time clinical AI auditing.</p>
            </div>

            <div className="stats-grid">
                {cards.map((card, i) => (
                    <div key={i} className="stat-card glass-card">
                        <div className="stat-icon" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
                            {card.icon}
                        </div>
                        <div className="stat-info">
                            <h3>{card.value}</h3>
                            <p>{card.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-content-grid">
                <div className="glass-card chart-card">
                    <div className="card-header">
                        <h2>Risk Activity by Doctor</h2>
                    </div>
                    <div className="chart-list">
                        {stats?.doctor_breakdown?.map((doc, idx) => (
                            <div key={idx} className="bar-item">
                                <div className="bar-labels">
                                    <span className="doc-name">{doc.doctor__username}</span>
                                    <span className="doc-count">{doc.high_risk} High Risk Rx</span>
                                </div>
                                <div className="bar-bg">
                                    <div 
                                        className="bar-fill" 
                                        style={{ width: `${(doc.high_risk / (stats.total_prescriptions || 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card audit-action-card">
                    <h3>Compliance Tools</h3>
                    <p>Access the full audit trail and system lifecycle logs.</p>
                    <button className="btn-primary" onClick={() => navigate('/audit-timeline')}>
                        View Detailed Audit Logs <ChevronRight size={18} />
                    </button>
                    
                    <div className="system-status">
                        <div className="status-item">
                            <ShieldCheck size={18} color="#10B981" />
                            <span>AI Core Operational</span>
                        </div>
                        <div className="status-item">
                            <ShieldCheck size={18} color="#10B981" />
                            <span>Database Integrity Secure</span>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .welcome-section { margin-bottom: 30px; }
                .welcome-section h1 { font-size: 2rem; font-weight: 700; color: var(--text-main); }
                .welcome-section p { color: var(--text-secondary); margin-top: 5px; }

                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px; }
                .stat-card { padding: 25px; display: flex; align-items: center; gap: 20px; }
                .stat-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
                .stat-info h3 { font-size: 1.5rem; font-weight: 800; line-height: 1; margin-bottom: 4px; }
                .stat-info p { font-size: 0.8rem; font-weight: 700; color: #888; text-transform: uppercase; }

                .dashboard-content-grid { display: grid; grid-template-columns: 1fr 380px; gap: 30px; }
                .chart-card { padding: 30px; }
                .chart-card h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 30px; }
                .chart-list { display: flex; flex-direction: column; gap: 25px; }
                .bar-item { width: 100%; }
                .bar-labels { display: flex; justify-content: space-between; margin-bottom: 8px; }
                .doc-name { font-weight: 700; font-size: 0.95rem; }
                .doc-count { font-size: 0.85rem; color: #888; font-weight: 600; }
                .bar-bg { height: 10px; background: #F3F4F6; border-radius: 5px; overflow: hidden; }
                .bar-fill { height: 100%; background: var(--primary-color); border-radius: 5px; }

                .audit-action-card { padding: 30px; display: flex; flex-direction: column; gap: 20px; }
                .audit-action-card h3 { font-size: 1.1rem; font-weight: 700; }
                .audit-action-card p { color: #666; font-size: 0.9rem; line-height: 1.5; }
                .system-status { margin-top: 20px; display: flex; flex-direction: column; gap: 12px; padding-top: 20px; border-top: 1px solid #f0f0f0; }
                .status-item { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; font-weight: 700; color: #555; }

                .loading-state { height: 400px; display: flex; align-items: center; justify-content: center; color: var(--primary-color); }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                @media (max-width: 1100px) { .dashboard-content-grid { grid-template-columns: 1fr; } }
            ` }} />
        </div>
    );
};

export default AdminDashboard;
