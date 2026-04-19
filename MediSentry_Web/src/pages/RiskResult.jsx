import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  ChevronLeft,
  ChevronRight,
  Info,
  Shield,
  Activity
} from 'lucide-react';

const RiskResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // De-structure state with safety
    const prescription = location.state?.prescription || {};
    const analysis = location.state?.analysis || {};
    const patientName = location.state?.patientName || 'Unknown Patient';
    
    const risk_level = (analysis?.risk_level || 'UNKNOWN').toUpperCase();
    const interactions = analysis?.interactions || [];
    
    const [isAcknowledged, setIsAcknowledged] = useState(false);
    const [justification, setJustification] = useState('');
    const [selectedAlternative, setSelectedAlternative] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const isHighRisk = risk_level === 'HIGH';
    const isMediumRisk = risk_level === 'MEDIUM';
    
    const safetyColor = isHighRisk ? '#FF3B30' : (isMediumRisk ? '#FF9500' : '#34C759');

    const [alternatives, setAlternatives] = useState(analysis.alternatives || []);
    const [loadingAlt, setLoadingAlt] = useState(false);

    // Safety check for critical state
    if (!location.state) {
        useEffect(() => { navigate('/'); }, []);
        return null;
    }

    const clinicalAlerts = analysis.clinical_alerts || [];

    useEffect(() => {
        const fetchAlternatives = async () => {
            // Only fetch for HIGH or MEDIUM risk if not already present
            if ((isHighRisk || isMediumRisk) && alternatives.length === 0) {
                setLoadingAlt(true);
                try {
                    // Robust Target Identification (Matched with Mobile strategy + clinical safety)
                    let target = null;
                    
                    // 1. Try to find the drug from interactions
                    if (interactions.length > 0) {
                        target = interactions[0].drug_a || interactions[0].drug_name;
                    } 
                    
                    // 2. If no interaction but HIGH risk, it's likely a Clinical Alert (Contraindication/Allergy)
                    if (!target && clinicalAlerts.length > 0) {
                        target = clinicalAlerts[0].drug;
                    }

                    // 3. Absolute Fallback: Use the first drug in the prescription
                    if (!target && prescription.drugs && prescription.drugs.length > 0) {
                        const firstDrug = prescription.drugs[0];
                        target = firstDrug.drug_details?.name || firstDrug.drug_name || firstDrug.name || (typeof firstDrug === 'string' ? firstDrug : null);
                    }

                    if (target) {
                        // Extract other drugs for interaction-aware alternatives
                        // We want to avoid anything that interacts with OTHER drugs in the rx
                        const allDrugsNames = (prescription.drugs || []).map(d => 
                            d.drug_details?.name || d.drug_name || d.name || (typeof d === 'string' ? d : '')
                        ).filter(Boolean);
                        
                        // "Others" are all drugs except the one we are replacing
                        const interactionOthers = allDrugsNames.filter(name => 
                            name.toLowerCase() !== target.toString().toLowerCase()
                        ).join(',');
                        
                        const res = await api.get(`/analytics/alternatives/${encodeURIComponent(target)}/`, {
                            params: { others: interactionOthers }
                        });
                        setAlternatives(res.data.alternatives || []);
                    }
                } catch (e) {
                    console.error("Failed to fetch alternatives", e);
                } finally {
                    setLoadingAlt(false);
                }
            }
        };
        fetchAlternatives();
    }, [isHighRisk, isMediumRisk, interactions, clinicalAlerts, prescription.drugs]);

    const handleConfirm = async () => {
        if (isHighRisk) {
            if (!isAcknowledged) { alert('Acknowledgement Required'); return; }
            if (!justification || justification.length < 50) { alert('Clinical justification required (Min 50 chars).'); return; }
        }

        setIsLoading(true);
        try {
            await api.patch(`/prescriptions/${prescription.id}/`, {
                status: 'PENDING',
                risk_level: risk_level,
                risk_analysis_result: analysis,
                is_high_risk_acknowledged: isAcknowledged,
                clinical_justification: justification,
                chosen_alternative: selectedAlternative?.name
            });
            navigate('/');
        } catch (e) {
            alert('Submission failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <div className="risk-result-v4">
                <style>{`
                    .risk-result-v4 { padding: 10px 40px 40px; max-width: 1400px; margin: 0 auto; }
                    .report-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px; }
                    .header-left { display: flex; align-items: center; gap: 20px; }
                    .brand-logo-img { width: 50px; height: 50px; }
                    .header-info h1 { font-size: 2.22rem; font-weight: 800; color: #28005C; }
                    .header-info p { color: #666; font-weight: 600; font-size: 1.1rem; }
                    
                    .hero-row-v4 { display: grid; grid-template-columns: 420px 1fr; gap: 30px; margin-bottom: 30px; }
                    
                    .risk-hero-card { background: white; border-radius: 30px; padding: 45px; border: 1.2px solid #EEE; box-shadow: 0 10px 40px rgba(0,0,0,0.03); text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; }
                    .visual-pulse-box { position: relative; width: 220px; height: 220px; margin-bottom: 30px; }
                    .pulse-ring-v3 { 
                        position: absolute; inset: -20px; border-radius: 50%; opacity: 0;
                        animation: pulse-ring-v3 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
                    }
                    @keyframes pulse-ring-v3 { 0% { transform: scale(0.7); opacity: 0.6; } 100% { transform: scale(1.1); opacity: 0; } }
                    .inner-circle-v3 { 
                        position: relative; width: 100%; height: 100%; border-radius: 50%; background: white; border: 8px solid; 
                        display: flex; flex-direction: column; align-items: center; justify-content: center;
                        box-shadow: inset 0 10px 20px rgba(0,0,0,0.05);
                    }
                    .risk-title-v3 { font-size: 1rem; font-weight: 800; color: #999; letter-spacing: 2px; }
                    .risk-value-v3 { font-size: 2.8rem; font-weight: 900; line-height: 1; margin: 5px 0; }
                    
                    .alt-long-section { background: white; border-radius: 30px; padding: 40px; border: 1.2px solid #EEE; box-shadow: 0 10px 40px rgba(0,0,0,0.03); display: flex; flex-direction: column; }
                    .alt-header-v3 { margin-bottom: 25px; border-bottom: 2px solid #F8F9FA; padding-bottom: 15px; display: flex; align-items: center; gap: 15px; }
                    .alt-header-v3 h2 { font-size: 1.6rem; font-weight: 900; color: #28005C; }
                    .alt-scroll-container { display: flex; flex-direction: column; gap: 15px; overflow-y: auto; max-height: 400px; padding: 10px 15px 10px 5px; scrollbar-width: thin; scrollbar-color: #E2E8F0 #F8F9FA; }
                    .alt-item-premium { 
                        width: 100%; background: #F8F9FA; padding: 20px 25px; border-radius: 22px; border: 2.5px solid transparent; 
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; display: flex; flex-direction: column; justify-content: center;
                    }
                    .alt-item-premium:hover { transform: translateY(-5px); border-color: #28005C; background: #FFF; box-shadow: 0 10px 20px rgba(40, 0, 92, 0.05); }
                    .alt-item-premium.active { background: #E9E1F5; border-color: #28005C; color: #28005C; transform: translateY(-5px); box-shadow: 0 15px 30px rgba(40, 0, 92, 0.1); }
                    .alt-item-premium h4 { font-size: 1.25rem; font-weight: 900; margin-bottom: 10px; }
                    .alt-item-premium p { font-size: 0.95rem; opacity: 0.9; line-height: 1.5; font-weight: 600; }

                    .protocol-card-v4 { background: #FFF; border-radius: 30px; padding: 40px; border: 2px dashed #FF3B30; margin-bottom: 30px; }
                    .protocol-card-v4 h2 { font-size: 1.5rem; font-weight: 900; color: #FF3B30; margin-bottom: 25px; }
                    .justification-area-v4 { 
                        width: 100%; height: 140px; background: #F9FAFB; border: 1.5px solid #E5E7EB; border-radius: 20px; 
                        padding: 20px; font-size: 1.05rem; font-family: inherit; margin-top: 20px; resize: none; transition: all 0.2s;
                    }
                    .justification-area-v4:focus { border-color: #FF3B30; background: white; outline: none; }

                    .submit-standalone-v4:disabled { opacity: 0.5; cursor: not-allowed; }

                    .action-buttons-v4 { display: flex; gap: 20px; align-items: center; width: 100%; }
                    
                    .modify-standalone-v4 {
                        flex: 1; padding: 22px; border-radius: 50px; background: white; color: #28005C; display: flex; align-items: center; justify-content: center; gap: 15px;
                        font-size: 1.4rem; font-weight: 800; cursor: pointer; transition: all 0.3s; border: 3px solid #28005C; box-shadow: 0 10px 20px rgba(40, 0, 92, 0.05);
                    }
                    .modify-standalone-v4:hover { transform: translateY(-4px); background: #F8F9FA; box-shadow: 0 20px 40px rgba(40, 0, 92, 0.1); }
                    
                    .submit-standalone-v4 { 
                        flex: 2; padding: 22px; border-radius: 50px; background: #28005C; color: white; display: flex; align-items: center; justify-content: center; gap: 15px;
                        font-size: 1.4rem; font-weight: 800; cursor: pointer; transition: all 0.3s; box-shadow: 0 20px 40px rgba(40, 0, 92, 0.2); border: none;
                    }
                `}</style>

                <div className="report-header">
                    <div className="header-left">
                        <img src="/assets/Logo.png" alt="Logo" className="brand-logo-img" />
                        <div className="header-info">
                            <h1>Risk Analysis Result</h1>
                            <p>Safety clearance for <strong>{patientName}</strong></p>
                        </div>
                    </div>
                </div>

                <div className="hero-row-v4">
                    <div className="risk-hero-card">
                        <div className="visual-pulse-box">
                            <div className="pulse-ring-v3" style={{ backgroundColor: safetyColor }}></div>
                            <div className="inner-circle-v3" style={{ borderColor: safetyColor }}>
                                <span className="risk-title-v3">SAFETY LEVEL</span>
                                <span className="risk-value-v3" style={{ color: safetyColor }}>{risk_level}</span>
                                <ShieldCheck size={40} color={safetyColor} />
                            </div>
                        </div>
                    </div>

                    <div className="alt-long-section">
                        <div className="alt-header-v3">
                            <Activity size={28} color="#28005C" />
                            <h2>Therapeutic Safety Alternatives</h2>
                        </div>
                        <div className="alt-scroll-container">
                            {loadingAlt ? (
                                <div style={{ padding: '20px 0', width: '100%', textAlign: 'center' }}>
                                    <Loader2 className="animate-spin" size={40} color="#28005C" />
                                    <p style={{marginTop:10, fontWeight:700, color:'#666'}}>Scanning clinical databases for safer substitutes...</p>
                                </div>
                            ) : alternatives.length > 0 ? (
                                <>
                                    {alternatives.map((alt, i) => (
                                        <div key={i} className={`alt-item-premium ${selectedAlternative?.name === alt.name ? 'active' : ''}`} onClick={() => setSelectedAlternative(alt)}>
                                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                                <h4>{alt.name}</h4>
                                                <CheckCircle size={24} style={{opacity: selectedAlternative?.name === alt.name ? 1 : 0.1}} />
                                            </div>
                                            <p>{alt.description || alt.reason}</p>
                                        </div>
                                    ))}
                                    <div className={`alt-item-premium ${selectedAlternative === 'ORIGINAL' ? 'active' : ''}`} onClick={() => setSelectedAlternative('ORIGINAL')}>
                                        <h4>Proceed with Original</h4>
                                        <p>Maintain the current combination despite the detected risk profile.</p>
                                    </div>
                                </>
                            ) : (
                                <div style={{ padding: '30px', background: '#F9FAFB', border: '1.5px dashed #D1D5DB', borderRadius: '22px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <p style={{ color: '#6B7280', fontWeight: 700, fontSize: '1.1rem' }}>No direct therapeutic substitutes found for this drug profile.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {isHighRisk && (
                    <div className="protocol-card-v4">
                        <h2>Clinical Justification Protocol</h2>
                        <label style={{ display: 'flex', gap: 15, cursor: 'pointer' }}>
                            <input type="checkbox" checked={isAcknowledged} onChange={(e) => setIsAcknowledged(e.target.checked)} style={{ width: 22, height: 22 }} />
                            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#333' }}>
                                I certify that this prescription is medically necessary and take responsibility for any adverse reactions.
                            </span>
                        </label>
                        <textarea 
                            className="justification-area-v4"
                            placeholder="Enter detailed clinical rationale for this specific patient (min 50 characters)..."
                            value={justification}
                            onChange={(e) => setJustification(e.target.value)}
                        ></textarea>
                        <div style={{ textAlign: 'right', marginTop: 10, fontWeight: 800, color: justification.length < 50 ? '#FF3B30' : '#34C759' }}>
                            {justification.length} / 50 characters
                        </div>
                    </div>
                )}

                <div className="action-buttons-v4">
                    <button 
                        className="modify-standalone-v4" 
                        onClick={() => navigate('/prescription-entry', { state: { existingRx: prescription, patientName } })}
                    >
                        <ChevronLeft size={28} /> Modify Entry
                    </button>

                    <button 
                        className="submit-standalone-v4" 
                        onClick={handleConfirm}
                        disabled={isLoading || (isHighRisk && (!isAcknowledged || justification.length < 50))}
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : <>Finalize Analysis & Submit Report <ChevronRight size={28} /></>}
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default RiskResult;
