import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Flag, 
  Lightbulb, 
  ChevronLeft,
  Loader2,
  User,
  AlertTriangle
} from 'lucide-react';

const VerificationDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { userInfo } = useContext(AuthContext);
    const { id } = useParams();
    
    const [prescription, setPrescription] = useState(location.state?.prescription || null);
    const [comment, setComment] = useState('');
    const [suggestion, setSuggestion] = useState('');
    const [flagReason, setFlagReason] = useState('Drug–drug interaction');
    const [activeAction, setActiveAction] = useState(null); // 'FLAG', 'SUGGEST', null
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!prescription && id) {
            const fetchRx = async () => {
                try {
                    const res = await api.get(`/prescriptions/${id}/`);
                    setPrescription(res.data);
                } catch (e) {
                    navigate('/');
                }
            };
            fetchRx();
        }
    }, [id, prescription, navigate]);

    if (!prescription) return <Layout><div className="loading-state"><Loader2 className="animate-spin" /></div></Layout>;

    const handleAction = async (actionType) => {
        setIsLoading(true);
        try {
            const data = {
                action: actionType,
                comment: actionType === 'SUGGEST' ? suggestion : comment,
                reason: actionType === 'FLAG' ? flagReason : ''
            };

            await api.post(`/prescriptions/${prescription.id}/verify/`, data);

            alert(`Prescription ${actionType.toLowerCase()} successfully.`);
            navigate('/');
        } catch (e) {
            alert('Failed to update prescription status.');
        } finally {
            setIsLoading(false);
        }
    };

    const riskColor = prescription.risk_level === 'HIGH' ? '#EF4444' : (prescription.risk_level === 'MEDIUM' ? '#F59E0B' : '#10B981');
    const riskBg = prescription.risk_level === 'HIGH' ? '#FEE2E2' : (prescription.risk_level === 'MEDIUM' ? '#FEF3C7' : '#D1FAE5');

    return (
        <Layout>
            <div className="verification-detail">
                <div className="page-header">
                    <button onClick={() => navigate(-1)} className="back-btn">
                        <ChevronLeft size={20} /> Back to Queue
                    </button>
                    <h1>Verification Review</h1>
                    <p>Analysis of Prescription #{prescription.id}</p>
                </div>

                <div className="detail-grid">
                    <div className="detail-main">
                        <div className="glass-card status-card" style={{ borderTop: `6px solid ${riskColor}` }}>
                            <div className="status-header">
                                <h2 style={{ color: riskColor }}>
                                    {prescription.risk_level === 'HIGH' ? <ShieldAlert /> : <CheckCircle />}
                                    AI Safety Insight: {prescription.risk_level} RISK
                                </h2>
                            </div>

                            {prescription.risk_level === 'HIGH' && (
                                <div className="justification-box">
                                    <label>PHYSICIAN JUSTIFICATION</label>
                                    <p className="just-text">"{prescription.clinical_justification || 'No clinical justification provided.'}"</p>
                                    {prescription.is_emergency_override && (
                                        <div className="emergency-alert">
                                            <AlertTriangle size={18} />
                                            <span><strong>EMERGENCY OVERRIDE:</strong> {prescription.emergency_reason}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="drugs-table-card">
                                <h3>Prescribed Drugs</h3>
                                <div className="drugs-list">
                                    {prescription.drugs?.map((d, i) => (
                                        <div key={i} className="drug-row">
                                            <div className="drug-name">{d.drug_details?.name || d.drug_name}</div>
                                            <div className="drug-meta">{d.dosage} • {d.frequency}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="glass-card section-card">
                            <h3>Patient & Provider</h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>PATIENT NAME</label>
                                    <p>{prescription.patient_name || `Patient #${prescription.patient}`}</p>
                                </div>
                                <div className="info-item">
                                    <label>PRESCRIBING DOCTOR</label>
                                    <p>{(prescription.doctor_name || '(? )').replace(/^Dr\.\s*/i, '')}</p>
                                    <span>{prescription.doctor_specialization || 'General Practice'}</span>
                                </div>
                                <div className="info-item">
                                    <label>CURRENT STATUS</label>
                                    <span className={`status-pill ${prescription.status.toLowerCase()}`}>{prescription.status}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="detail-side">
                        {userInfo?.role === 'PHARMACIST' ? (
                            <div className="glass-card pharmacist-actions">
                                <h3>Review Actions</h3>
                                
                                {!activeAction ? (
                                    <div className="action-buttons">
                                        <button className="action-btn flag" onClick={() => setActiveAction('FLAG')}>
                                            <Flag size={20} /> Flag for Risk
                                        </button>
                                        <button className="action-btn suggest" onClick={() => setActiveAction('SUGGEST')}>
                                            <Lightbulb size={20} /> Suggest Change
                                        </button>
                                        <div className="divider"></div>
                                        <button className="action-btn approve" onClick={() => handleAction('APPROVE')} disabled={isLoading}>
                                            <CheckCircle size={20} /> Approve
                                        </button>
                                        <button className="action-btn reject" onClick={() => handleAction('REJECT')} disabled={isLoading}>
                                            <XCircle size={20} /> Reject
                                        </button>
                                    </div>
                                ) : activeAction === 'FLAG' ? (
                                    <div className="action-form">
                                        <label>FLAG REASON</label>
                                        <select value={flagReason} onChange={(e) => setFlagReason(e.target.value)}>
                                            <option>Drug-drug interaction</option>
                                            <option>Allergy conflict</option>
                                            <option>Dose exceeds limit</option>
                                            <option>Better alternative exists</option>
                                        </select>
                                        <label>PHARMACIST NOTES</label>
                                        <textarea 
                                            placeholder="Add specific concerns..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                        ></textarea>
                                        <div className="form-btns">
                                            <button className="btn-outline" onClick={() => setActiveAction(null)}>Cancel</button>
                                            <button className="btn-primary" onClick={() => handleAction('FLAG')} disabled={isLoading}>Confirm Flag</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="action-form">
                                        <label>MODIFICATION SUGGESTION</label>
                                        <textarea 
                                            placeholder="Recommend alternative drug or dose adjustments..."
                                            value={suggestion}
                                            onChange={(e) => setSuggestion(e.target.value)}
                                            className="tall"
                                        ></textarea>
                                        <div className="form-btns">
                                            <button className="btn-outline" onClick={() => setActiveAction(null)}>Cancel</button>
                                            <button className="btn-primary" onClick={() => handleAction('SUGGEST')} disabled={isLoading}>Send Suggestion</button>
                                        </div>
                                    </div>
                                )}

                                {isLoading && (
                                    <div className="loading-overlay">
                                        <Loader2 className="animate-spin" />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="glass-card section-card">
                                <h3>Clinical Status</h3>
                                <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.6 }}>
                                    This prescription is currently <strong>{prescription.status}</strong>. 
                                    Review actions are restricted to pharmacy clinical staff to ensure medication safety compliance.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{ __html: `
                    .back-btn { background: none; color: var(--primary-color); font-weight: 700; display: flex; align-items: center; gap: 8px; margin-bottom: 15px; }
                    .page-header h1 { font-size: 2.2rem; font-weight: 700; margin-bottom: 5px; }
                    .page-header p { color: var(--text-secondary); }

                    .detail-grid { display: grid; grid-template-columns: 1fr 400px; gap: 30px; margin-top: 40px; }
                    
                    .status-card { padding: 30px; margin-bottom: 30px; }
                    .status-header h2 { font-size: 1.4rem; font-weight: 800; display: flex; align-items: center; gap: 12px; margin-bottom: 25px; }
                    
                    .justification-box { background: #F9FAFB; padding: 25px; border-radius: 12px; margin-bottom: 30px; border-left: 5px solid #DDD; }
                    .justification-box label { display: block; font-size: 0.75rem; font-weight: 800; color: #777; letter-spacing: 1px; margin-bottom: 12px; }
                    .just-text { font-style: italic; color: #333; font-size: 1.1rem; line-height: 1.6; margin-bottom: 15px; }
                    .emergency-alert { background: #FEE2E2; color: #B91C1C; padding: 12px 18px; border-radius: 8px; display: flex; align-items: center; gap: 10px; font-size: 0.9rem; }
                    
                    .drugs-table-card h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 20px; }
                    .drugs-list { display: flex; flex-direction: column; gap: 12px; }
                    .drug-row { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: white; border: 1.5px solid #E5E7EB; border-radius: 12px; }
                    .drug-name { font-weight: 700; color: var(--text-main); }
                    .drug-meta { color: #666; font-size: 0.9rem; }

                    .section-card { padding: 30px; }
                    .section-card h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 25px; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                    .info-item label { display: block; font-size: 0.75rem; font-weight: 700; color: #999; margin-bottom: 5px; }
                    .info-item p { font-weight: 700; color: var(--text-main); font-size: 1.1rem; }
                    .info-item span { font-size: 0.85rem; color: #666; }
                    .status-pill { display: inline-block; padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; }
                    .status-pill.pending { background: #F3F4F6; color: #4B5563; }
                    .status-pill.flagged { background: #FEE2E2; color: #EF4444; }
                    .status-pill.approved { background: #D1FAE5; color: #10B981; }

                    .pharmacist-actions { padding: 30px; position: sticky; top: 120px; }
                    .pharmacist-actions h3 { margin-bottom: 25px; }
                    .action-buttons { display: flex; flex-direction: column; gap: 15px; }
                    .action-btn { display: flex; align-items: center; gap: 12px; padding: 15px; border-radius: 12px; font-weight: 700; transition: var(--transition); }
                    .action-btn.flag { background: #FEE2E2; color: #B91C1C; }
                    .action-btn.suggest { background: #DBEAFE; color: #1E40AF; }
                    .action-btn.approve { background: #10B981; color: white; margin-top: 10px; }
                    .action-btn.reject { background: #111; color: white; }
                    .action-btn:hover { transform: translateY(-2px); filter: brightness(0.95); }
                    
                    .action-form { display: flex; flex-direction: column; gap: 15px; }
                    .action-form label { font-weight: 700; font-size: 0.85rem; color: #666; }
                    .action-form select, .action-form textarea { padding: 12px; border-radius: 10px; border: 1.5px solid #E5E7EB; }
                    .action-form textarea { height: 120px; resize: none; }
                    .action-form textarea.tall { height: 200px; }
                    .form-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
                    
                    .loading-overlay { display: flex; align-items: center; justify-content: center; padding: 40px; }
                    
                    @media (max-width: 1100px) { .detail-grid { grid-template-columns: 1fr; } .pharmacist-actions { position: static; } }
                ` }} />
            </div>
        </Layout>
    );
};

export default VerificationDetail;
