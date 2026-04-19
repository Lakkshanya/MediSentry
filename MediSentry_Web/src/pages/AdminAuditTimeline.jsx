import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { History as HistoryIcon, Search, Loader2, ChevronLeft, ChevronRight, ShieldCheck, Clock, User, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminAuditTimeline = () => {
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPharmacist, setSelectedPharmacist] = useState('ALL');
    const navigate = useNavigate();

    const fetchAuditLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/prescriptions/audit/');
            setAuditLogs(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    const pharmacists = ['ALL', ...new Set(auditLogs.map(log => log.actor))];

    const filteredLogs = selectedPharmacist === 'ALL' 
        ? auditLogs 
        : auditLogs.filter(log => log.actor === selectedPharmacist);

    const getStatusColor = (action) => {
        if (!action) return '#6B7280';
        if (action.includes('APPROVE')) return '#10B981';
        if (action.includes('REJECT')) return '#EF4444';
        if (action.includes('FLAG')) return '#F59E0B';
        return '#6B7280';
    };

    return (
        <Layout>
            <div className="audit-timeline-page">
                <div className="page-header">
                    <button onClick={() => navigate(-1)} className="back-btn">
                        <ChevronLeft size={20} /> Back to Dashboard
                    </button>
                    <h1>System Audit Trail</h1>
                    <p>Transparent blockchain-inspired clinical verification ledger.</p>
                </div>

                <div className="timeline-container glass-card">
                    <div className="timeline-header">
                        <h2>Event Log {selectedPharmacist !== 'ALL' && ` - ${selectedPharmacist}`}</h2>
                        <div className="timeline-actions">
                            <div className="pharmacist-filter">
                                <Filter size={16} />
                                <select 
                                    value={selectedPharmacist} 
                                    onChange={(e) => setSelectedPharmacist(e.target.value)}
                                >
                                    {pharmacists.map(p => <option key={p} value={p}>{p === 'ALL' ? 'All Personnel' : p}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="timeline-list">
                        {loading ? (
                            <div className="loading-state">
                                <Loader2 className="animate-spin" size={40} />
                                <p>Reconstructing audit history...</p>
                            </div>
                        ) : filteredLogs.length === 0 ? (
                            <div className="empty-state">
                                <HistoryIcon size={64} color="#ccc" />
                                <p>No events found for this selection.</p>
                            </div>
                        ) : (
                            filteredLogs.map((log) => (
                                <div key={log.id} className="timeline-item">
                                    <div className="timeline-marker">
                                        <div className="marker-line"></div>
                                        <div className="marker-dot" style={{ backgroundColor: getStatusColor(log.action) }}></div>
                                    </div>
                                    <div className="timeline-content glass-card">
                                        <div className="log-top">
                                            <div className="log-type">
                                                <ShieldCheck size={16} color={getStatusColor(log.action)} />
                                                <span className="type-label">{log.action?.replace(/_/g, ' ') || 'SYSTEM EVENT'}</span>
                                                <span className="log-id">LOG #{log.id}</span>
                                            </div>
                                            <span className="log-time">{new Date(log.timestamp).toLocaleString()}</span>
                                        </div>
                                        
                                        <div className="log-body">
                                            <h3>{log.patient_name ? log.patient_name : `Rx #${log.rx_id}`}</h3>
                                            <p>{log.details?.comment || (log.action === 'PRESCRIPTION_SUBMITTED' ? 'Patient prescription entered into system.' : 'No comment provided.')}</p>
                                            
                                            <div className="log-meta">
                                                <div className="meta-bit">
                                                    <User size={14} />
                                                    <span>{
                                                        log.actor_role?.toUpperCase() === 'DOCTOR' ? 'Doctor' : 
                                                        (log.actor_role?.toUpperCase() === 'PHARMACIST' ? 'Pharmacist' : 
                                                        (log.actor_role?.toUpperCase() === 'ADMIN' ? 'Administrator' : 'Personnel'))
                                                    }: {log.actor}</span>
                                                </div>
                                                <div className="meta-bit">
                                                    <Clock size={14} />
                                                    <span>Action: {log.action}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="log-footer">
                                            <button onClick={() => navigate(`/prescription-detail/${log.rx_id}`)}>
                                                View Source Artifact <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{ __html: `
                    .back-btn { background: none; color: var(--primary-color); font-weight: 700; display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
                    .page-header h1 { font-size: 2.2rem; font-weight: 700; }
                    .page-header p { color: var(--text-secondary); }

                    .timeline-container { margin-top: 40px; padding: 0; min-height: 600px; }
                    .timeline-header { padding: 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0f0f0; }
                    .timeline-header h2 { font-size: 1.2rem; font-weight: 700; }
                    .timeline-actions { display: flex; gap: 15px; }
                    .pharmacist-filter { background: #F3F4F6; display: flex; align-items: center; padding: 0 15px; border-radius: 8px; gap: 10px; border: 1.5px solid #E5E7EB; }
                    .pharmacist-filter select { background: none; border: none; font-size: 0.85rem; height: 44px; width: 220px; font-weight: 700; color: #28005C; outline: none; cursor: pointer; }
                    .icon-btn { width: 36px; height: 36px; border-radius: 8px; background: white; border: 1.5px solid #E5E7EB; color: #666; display: flex; align-items: center; justify-content: center; }

                    .timeline-list { padding: 40px; }
                    .timeline-item { display: flex; gap: 30px; position: relative; margin-bottom: 30px; }
                    .timeline-marker { width: 20px; display: flex; flex-direction: column; align-items: center; }
                    .marker-line { position: absolute; top: 0; bottom: -30px; width: 2px; background: #E5E7EB; left: 9px; }
                    .timeline-item:last-child .marker-line { display: none; }
                    .marker-dot { width: 20px; height: 20px; border-radius: 50%; border: 4px solid white; z-index: 2; box-shadow: 0 0 0 2px #E5E7EB; }

                    .timeline-content { flex: 1; padding: 20px; }
                    .log-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
                    .log-type { display: flex; align-items: center; gap: 10px; }
                    .type-label { font-weight: 800; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; color: #555; }
                    .log-id { font-size: 0.75rem; color: #999; font-weight: 600; }
                    .log-time { font-size: 0.8rem; color: #999; font-weight: 600; }

                    .log-body h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; }
                    .log-body p { font-size: 0.95rem; color: #666; margin-bottom: 12px; }
                    .log-meta { display: flex; gap: 20px; }
                    .meta-bit { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: #888; font-weight: 600; }

                    .log-footer { margin-top: 15px; border-top: 1px solid #f0f0f0; padding-top: 15px; text-align: right; }
                    .log-footer button { background: none; color: var(--primary-color); font-weight: 700; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 5px; }

                    .loading-state { padding: 100px; text-align: center; color: var(--primary-color); display: flex; flex-direction: column; align-items: center; gap: 15px; }
                    .animate-spin { animation: spin 1s linear infinite; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                ` }} />
            </div>
        </Layout>
    );
};

export default AdminAuditTimeline;
