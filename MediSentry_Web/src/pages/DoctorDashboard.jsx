import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { AlertCircle, Clock, FilePlus, Users, ArrowRight, Loader2, ClipboardList, Activity, Stethoscope, History as HistoryIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
    const { userInfo } = useContext(AuthContext);
    const [stats, setStats] = useState({ highRisk: 0, pending: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const fetchStats = async () => {
        try {
            const res = await api.get('/prescriptions/summary/');
            setStats({
                highRisk: res.data.high_risk || 0,
                pending: res.data.pending || 0
            });
        } catch (e) {
            console.error("Dashboard Fetch Error:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const statCards = [
        { title: 'High Risk Alerts', value: stats.highRisk, icon: <AlertCircle size={28} />, color: '#FF3B30', bg: 'rgba(255, 59, 48, 0.1)' },
        { title: 'Pending Reviews', value: stats.pending, icon: <Clock size={28} />, color: '#FF9500', bg: 'rgba(255, 149, 0, 0.1)' },
    ];

    return (
        <div className="doctor-dashboard-v2">
            <style>{`
                .doctor-dashboard-v2 { padding: 15px 40px 40px; max-width: 1400px; margin: 0 auto; }
                .greeting-banner { margin-bottom: 25px; }
                .greeting-banner h1 { font-size: 2.8rem; font-weight: 800; color: #28005C; margin-bottom: 4px; }
                .greeting-banner p { font-size: 1.25rem; color: #666; font-weight: 500; }

                .stats-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin-bottom: 50px; }
                .stat-card-premium { 
                    background: white; padding: 35px; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.03);
                    display: flex; align-items: center; gap: 25px; border: 1px solid #F0F0F0; transition: all 0.3s ease;
                }
                .stat-card-premium:hover { transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0,0,0,0.06); border-color: #28005C; }
                .icon-wrapper { width: 70px; height: 70px; border-radius: 20px; display: flex; align-items: center; justify-content: center; }
                .stat-details h3 { font-size: 2.22rem; font-weight: 800; color: #000; line-height: 1; }
                .stat-details p { font-size: 0.95rem; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-top: 5px; }

                .main-layout-grid { display: grid; grid-template-columns: 1fr 420px; gap: 40px; }
                
                .section-title { font-size: 1.6rem; font-weight: 800; color: #000; margin-bottom: 25px; display: flex; align-items: center; gap: 12px; }
                .section-title-logo { width: 30px; height: 30px; object-fit: contain; }
                
                .action-hub { display: grid; grid-template-columns: 1fr; gap: 25px; }
                .action-button-premium {
                    display: flex; align-items: center; gap: 30px; padding: 35px; border-radius: 24px; text-align: left;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; border: none; position: relative; overflow: hidden; width: 100%;
                }
                .action-button-premium.primary { background: #28005C; color: white; box-shadow: 0 20px 40px rgba(40, 0, 92, 0.2); }
                .action-button-premium.secondary { background: #F3F0F7; color: #28005C; border: 1.5px solid rgba(40, 0, 92, 0.1); }
                
                .action-button-premium:hover { transform: scale(1.02); }
                .action-button-premium.primary:hover { background: #3B0085; }
                .action-button-premium.secondary:hover { background: #E9E3F1; border-color: #28005C; }

                .action-icon-box { background: rgba(255,255,255,0.15); padding: 15px; border-radius: 20px; color: white; display: flex; align-items: center; justify-content: center; }
                .secondary .action-icon-box { background: white; color: #28005C; box-shadow: 0 8px 16px rgba(0,0,0,0.05); }
                .action-img { width: 45px; height: 45px; object-fit: contain; }
                
                .action-info-box { flex: 1; }
                .action-info-box h3 { font-size: 1.6rem; font-weight: 800; margin-bottom: 6px; }
                .action-info-box p { font-size: 1.05rem; opacity: 0.85; font-weight: 500; }

                .recent-alerts-pane { background: white; border-radius: 24px; padding: 35px; border: 1px solid #F0F0F0; box-shadow: 0 10px 30px rgba(0,0,0,0.02); height: 500px; display: flex; flex-direction: column; }
                .alerts-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
                .view-all-link { color: #28005C; font-weight: 800; font-size: 1rem; text-decoration: none; display: flex; align-items: center; gap: 5px; }
                
                .empty-alerts-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #999; gap: 15px; }
                .empty-alerts-state p { font-weight: 700; font-size: 1.1rem; }

                @media (max-width: 1100px) {
                    .main-layout-grid { grid-template-columns: 1fr; }
                    .doctor-dashboard-v2 { padding: 25px; }
                }
            `}</style>

            <div className="greeting-banner">
                <h1>Dr. {userInfo?.username || 'Pranav Rajesh'}</h1>
                <p>Your clinical workspace is ready for auditing.</p>
            </div>

            <div className="stats-container">
                {statCards.map((card, i) => (
                    <div key={i} className="stat-card-premium">
                        <div className="icon-wrapper" style={{ backgroundColor: card.bg, color: card.color }}>
                            {card.icon}
                        </div>
                        <div className="stat-details">
                            <h3>{card.value}</h3>
                            <p>{card.title}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="main-layout-grid">
                <div className="actions-column">
                    <div className="section-title">
                        <img src="/assets/Logo.png" alt="Logo" className="section-title-logo" />
                        <h2>Quick Actions</h2>
                    </div>
                    <div className="action-hub">
                        <div className="action-button-premium primary" onClick={() => navigate('/prescription-entry')}>
                            <div className="action-icon-box">
                                <img src="/assets/Logo.png" alt="Icon" className="action-img" style={{filter: 'brightness(0) invert(1)'}} />
                            </div>
                            <div className="action-info-box">
                                <h3>New Prescription</h3>
                                <p>Perform advanced cross-analysis of drugs and patient risk profiles.</p>
                            </div>
                            <ArrowRight size={28} />
                        </div>

                        <div className="action-button-premium secondary" onClick={() => navigate('/history')}>
                            <div className="action-icon-box">
                                <img src="/assets/Logo.png" alt="Icon" className="action-img" />
                            </div>
                            <div className="action-info-box">
                                <h3>History</h3>
                                <p>Access historical records of analyzed prescriptions and outcomes.</p>
                            </div>
                            <ArrowRight size={28} />
                        </div>
                    </div>
                </div>

                <div className="alerts-column">
                    <div className="alerts-header">
                        <div className="section-title" style={{marginBottom:0}}>
                            <img src="/assets/Logo.png" alt="Logo" className="section-title-logo" />
                            <h2>Clinical Feed</h2>
                        </div>
                    </div>
                    <div className="timeline-action-card">
                        <div className="timeline-card-content">
                            <HistoryIcon size={60} strokeWidth={1.5} color="#28005C" style={{opacity: 0.2, marginBottom: 20}} />
                            <h3>Prescription Timeline</h3>
                            <p>Access the unified audit trail of pharmacist reviews, interaction flags, and dispensing approvals.</p>
                            
                            <button className="timeline-large-btn" onClick={() => navigate('/notifications')}>
                                Open Prescription Timeline <ArrowRight size={22} />
                            </button>
                        </div>
                        
                        <div className="mini-feed">
                            <div className="feed-helper">
                                <div className="helper-pulse"></div>
                                <span>Monitored in Real-Time</span>
                            </div>
                        </div>
                    </div>
                </div>

                <style>{`
                    .timeline-action-card { 
                        background: white; border-radius: 30px; padding: 45px; border: 1.5px solid #F0F0F0; 
                        box-shadow: 0 15px 40px rgba(0,0,0,0.03); height: 500px; display: flex; flex-direction: column; justify-content: space-between;
                        position: relative; overflow: hidden;
                    }
                    .timeline-action-card::after { 
                        content: ''; position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; 
                        background: #F3F1FF; border-radius: 50%; z-index: 0; 
                    }
                    .timeline-card-content { position: relative; z-index: 1; text-align: center; }
                    .timeline-card-content h3 { font-size: 1.8rem; font-weight: 800; color: #111; margin-bottom: 12px; }
                    .timeline-card-content p { font-size: 1.1rem; color: #666; font-weight: 600; line-height: 1.6; margin-bottom: 35px; }
                    
                    .timeline-large-btn { 
                        width: 100%; padding: 22px; background: #28005C; color: white; border-radius: 20px; 
                        border: none; font-size: 1.2rem; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 15px;
                        cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 20px 40px rgba(40, 0, 92, 0.15);
                    }
                    .timeline-large-btn:hover { transform: translateY(-5px); background: #3B0085; box-shadow: 0 30px 60px rgba(40, 0, 92, 0.25); }
                    
                    .mini-feed { display: flex; justify-content: center; margin-top: 20px; }
                    .feed-helper { display: flex; align-items: center; gap: 10px; background: #F8F9FA; padding: 10px 20px; border-radius: 50px; border: 1px solid #EEE; }
                    .feed-helper span { font-size: 0.9rem; font-weight: 800; color: #666; text-transform: uppercase; letter-spacing: 1px; }
                    .helper-pulse { width: 10px; height: 10px; background: #34C759; border-radius: 50%; box-shadow: 0 0 0 rgba(52, 199, 89, 0.4); animation: pulse-green 2s infinite; }
                    @keyframes pulse-green { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 199, 89, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(52, 199, 89, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 199, 89, 0); } }
                `}</style>
            </div>
        </div>
    );
};

export default DoctorDashboard;
