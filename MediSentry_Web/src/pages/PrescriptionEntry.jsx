import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { Plus, X, AlertCircle, Loader2, ChevronRight, Stethoscope } from 'lucide-react';

const PrescriptionEntry = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [patientName, setPatientName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('Male');
    const [allergies, setAllergies] = useState([]);
    const [conditions, setConditions] = useState([]);
    const [drugInput, setDrugInput] = useState('');
    const [customAllergy, setCustomAllergy] = useState('');
    const [customCondition, setCustomCondition] = useState('');
    const [drugs, setDrugs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // For handling existing modifications
    const [prescriptionId, setPrescriptionId] = useState(null);
    const [patientId, setPatientId] = useState(null);

    const allergyOptions = ['Penicillin', 'Sulfa', 'Peanuts', 'Latex', 'Aspirin'];
    const conditionOptions = ['Diabetes', 'Hypertension', 'Pregnant', 'Asthma', 'Kidney Disease'];

    useEffect(() => {
        if (location.state?.existingRx) {
            const rx = location.state.existingRx;
            setPrescriptionId(rx.id);
            setPatientId(rx.patient);
            
            // patientName passed from previous screen because it's not always embedded perfectly inside rx
            setPatientName(location.state?.patientName || rx.patient_details?.name || rx.patient_name || '');
            
            setAge(String(rx.patient_details?.age || ''));
            setGender(rx.patient_details?.gender || 'Male');
            setConditions(rx.patient_details?.medical_conditions || []);
            setAllergies(rx.patient_details?.allergies || []);
            
            if (rx.drugs) {
                setDrugs(rx.drugs.map(d => ({
                    drug_name: d.drug_details?.name || d.drug_name || d.name,
                    dosage: d.dosage || '10mg',
                    frequency: d.frequency || 'Daily'
                })));
            }
        }
    }, [location.state]);

    const toggleSelection = (list, setList, item) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const addDrug = () => {
        if (!drugInput.trim()) return;
        setDrugs([...drugs, { drug_name: drugInput.trim(), dosage: '10mg', frequency: 'Daily' }]);
        setDrugInput('');
    };

    const removeDrug = (index) => {
        setDrugs(drugs.filter((_, i) => i !== index));
    };

    const handleAnalyze = async () => {
        if (!patientName || !age || drugs.length < 1) {
            alert('Please provide Patient Name, Age, and at least one Drug.');
            return;
        }

        setIsLoading(true);
        try {
            let pid = patientId;
            const patientPayload = {
                name: patientName,
                age: parseInt(age),
                gender: gender,
                medical_conditions: conditions,
                allergies: allergies
            };
            
            if (pid) {
                await api.patch(`/patients/${pid}/`, patientPayload);
            } else {
                const patientRes = await api.post('/patients/', patientPayload);
                pid = patientRes.data.id;
                setPatientId(pid);
            }

            const prescriptionData = {
                patient: pid,
                drugs: drugs
            };
            
            let presRes;
            if (prescriptionId) {
                presRes = await api.patch(`/prescriptions/${prescriptionId}/`, prescriptionData);
            } else {
                presRes = await api.post('/prescriptions/', prescriptionData);
                setPrescriptionId(presRes.data.id);
            }

            const analysisRes = await api.post('/analytics/predict/', {
                drugs: drugs.map(d => d.drug_name),
                medical_conditions: conditions,
                allergies: allergies
            });

            navigate('/risk-result', {
                state: {
                    prescription: presRes.data,
                    analysis: analysisRes.data,
                    patientName: patientName
                }
            });

        } catch (error) {
            console.error(error);
            alert('Analysis Failed. Check network or inputs.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <div className="prescription-entry">
                <div className="page-header">
                    <div className="header-icon">
                        <img src="/assets/Logo.png" alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                    </div>
                    <div>
                        <h1>New Prescription</h1>
                        <p>Analyze clinical risks with high-precision AI</p>
                    </div>
                </div>

                <div className="entry-grid">
                    <div className="entry-main">
                        <div className="glass-card section-card">
                            <h2>Patient Information</h2>
                            <div className="form-row">
                                <div className="input-group full">
                                    <label>Patient Full Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="Enter name"
                                        value={patientName}
                                        onChange={(e) => setPatientName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="input-group auto">
                                    <label>Age</label>
                                    <input 
                                        type="number" 
                                        placeholder="Years"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                    />
                                </div>
                                <div className="input-group auto">
                                    <label>Gender</label>
                                    <div className="gender-selector">
                                        <button 
                                            className={gender === 'Male' ? 'active' : ''} 
                                            onClick={() => setGender('Male')}
                                        >M</button>
                                        <button 
                                            className={gender === 'Female' ? 'active' : ''} 
                                            onClick={() => setGender('Female')}
                                        >F</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card section-card">
                            <h2>Medical History</h2>
                            <div className="chips-section">
                                <label>Medical Conditions</label>
                                <div className="chips-container">
                                    {conditionOptions.map(opt => (
                                        <button 
                                            key={opt}
                                            className={`chip ${conditions.includes(opt) ? 'active' : ''}`}
                                            onClick={() => toggleSelection(conditions, setConditions, opt)}
                                        >{opt}</button>
                                    ))}
                                </div>
                                <div className="add-custom">
                                    <input 
                                        type="text" 
                                        placeholder="Add other condition..."
                                        value={customCondition}
                                        onChange={(e) => setCustomCondition(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (setConditions([...conditions, customCondition]), setCustomCondition(''))}
                                    />
                                    <button onClick={() => { if(customCondition) { setConditions([...conditions, customCondition]); setCustomCondition(''); } }}>
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="chips-section">
                                <label>Allergies</label>
                                <div className="chips-container">
                                    {allergyOptions.map(opt => (
                                        <button 
                                            key={opt}
                                            className={`chip ${allergies.includes(opt) ? 'active' : ''}`}
                                            onClick={() => toggleSelection(allergies, setAllergies, opt)}
                                        >{opt}</button>
                                    ))}
                                </div>
                                <div className="add-custom">
                                    <input 
                                        type="text" 
                                        placeholder="Add other allergy..."
                                        value={customAllergy}
                                        onChange={(e) => setCustomAllergy(e.target.value)}
                                    />
                                    <button onClick={() => { if(customAllergy) { setAllergies([...allergies, customAllergy]); setCustomAllergy(''); } }}>
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="entry-side">
                        <div className="glass-card section-card drugs-card">
                            <h2>Prescribed Drugs</h2>
                            <div className="add-drug-input">
                                <input 
                                    type="text" 
                                    placeholder="Drug name (e.g. Warfarin)"
                                    value={drugInput}
                                    onChange={(e) => setDrugInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addDrug()}
                                />
                                <button className="add-btn" onClick={addDrug}>
                                    <Plus size={20} />
                                </button>
                            </div>

                            <div className="drugs-list">
                                {drugs.length === 0 ? (
                                    <div className="empty-drugs">
                                        <AlertCircle size={32} color="#ccc" />
                                        <p>No drugs added yet</p>
                                    </div>
                                ) : (
                                    drugs.map((d, i) => (
                                        <div key={i} className="drug-item">
                                            <div className="drug-info">
                                                <span className="name">{d.drug_name}</span>
                                                <span className="dosage">{d.dosage} • {d.frequency}</span>
                                            </div>
                                            <button className="remove-btn" onClick={() => removeDrug(i)}>
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <button 
                            className="btn-primary analyze-btn-standalone" 
                            onClick={handleAnalyze}
                            disabled={isLoading || drugs.length === 0}
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : <>Analyze Clinical Risk <ChevronRight size={20} /></>}
                        </button>
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{ __html: `
                    .prescription-entry {
                        max-width: 1200px;
                        margin: 0 auto;
                    }
                    .page-header {
                        display: flex;
                        align-items: center;
                        gap: 20px;
                        margin-bottom: 40px;
                    }
                    .header-icon {
                        width: 64px;
                        height: 64px;
                        background: var(--primary-gradient);
                        border-radius: 16px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: var(--shadow-md);
                    }
                    .page-header h1 { font-size: 2.2rem; font-weight: 700; color: var(--text-main); }
                    .page-header p { color: var(--text-secondary); font-size: 1.1rem; }

                    .entry-grid {
                        display: grid;
                        grid-template-columns: 1fr 400px;
                        gap: 30px;
                        align-items: start;
                    }
                    .section-card {
                        padding: 30px;
                        margin-bottom: 30px;
                    }
                    .section-card h2 {
                        font-size: 1.25rem;
                        font-weight: 700;
                        margin-bottom: 25px;
                        color: var(--primary-color);
                        border-bottom: 2px solid #f0f0f0;
                        padding-bottom: 10px;
                    }
                    .form-row {
                        display: flex;
                        gap: 20px;
                        margin-bottom: 20px;
                    }
                    .input-group {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                    }
                    .input-group.full { flex: 1; }
                    .input-group.auto { width: auto; }
                    .input-group label { font-weight: 700; font-size: 0.9rem; color: #555; }
                    .input-group input {
                        padding: 12px 16px;
                        background: #F9FAFB;
                        border: 1.5px solid #E5E7EB;
                        border-radius: 12px;
                        font-size: 1rem;
                    }
                    .input-group input:focus { border-color: var(--primary-color); background: white; }

                    .gender-selector {
                        display: flex;
                        background: #F9FAFB;
                        padding: 4px;
                        border-radius: 12px;
                        border: 1.5px solid #E5E7EB;
                    }
                    .gender-selector button {
                        padding: 8px 20px;
                        border-radius: 8px;
                        background: none;
                        font-weight: 700;
                        color: #666;
                    }
                    .gender-selector button.active {
                        background: var(--primary-color);
                        color: white;
                    }

                    .chips-section {
                        margin-bottom: 25px;
                    }
                    .chips-section label {
                        display: block;
                        font-weight: 700;
                        font-size: 0.9rem;
                        color: #555;
                        margin-bottom: 12px;
                    }
                    .chips-container {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 10px;
                        margin-bottom: 15px;
                    }
                    .chip {
                        padding: 8px 16px;
                        background: white;
                        border: 1.5px solid #E5E7EB;
                        border-radius: 20px;
                        font-size: 0.85rem;
                        font-weight: 600;
                        transition: var(--transition);
                    }
                    .chip:hover { border-color: var(--primary-color); }
                    .chip.active {
                        background: var(--primary-light);
                        border-color: var(--primary-color);
                        color: var(--primary-color);
                    }
                    .add-custom {
                        display: flex;
                        gap: 10px;
                        max-width: 300px;
                    }
                    .add-custom input {
                        flex: 1;
                        padding: 8px 12px;
                        border-radius: 10px;
                        border: 1.2px solid #ddd;
                        font-size: 0.85rem;
                    }
                    .add-custom button {
                        width: 36px;
                        height: 36px;
                        background: var(--primary-color);
                        color: white;
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .drugs-card { height: fit-content; }
                    .add-drug-input {
                        display: flex;
                        gap: 10px;
                        margin-bottom: 25px;
                    }
                    .add-drug-input input {
                        flex: 1;
                        padding: 12px 16px;
                        background: #F9FAFB;
                        border: 1.5px solid #E5E7EB;
                        border-radius: 12px;
                    }
                    .add-btn {
                        width: 48px;
                        height: 48px;
                        background: var(--primary-color);
                        color: white;
                        border-radius: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .drugs-list {
                        min-height: 200px;
                        margin-bottom: 25px;
                    }
                    .empty-drugs {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                        padding: 40px;
                        color: #999;
                    }
                    .drug-item {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 15px;
                        background: #F9FAFB;
                        border-left: 4px solid var(--accent-color);
                        border-radius: 12px;
                        margin-bottom: 12px;
                    }
                    .drug-info { display: flex; flex-direction: column; }
                    .drug-info .name { font-weight: 700; color: var(--text-main); font-size: 1.05rem; }
                    .drug-info .dosage { font-size: 0.85rem; color: #666; }
                    .remove-btn { color: #EF4444; background: none; padding: 5px; }
                    
                    .analyze-btn-standalone { 
                        width: 100%; 
                        font-size: 1.2rem; 
                        padding: 20px; 
                        background: #28005C; 
                        color: white; 
                        border-radius: 40px; 
                        font-weight: 800;
                        margin-top: 30px;
                        box-shadow: 0 10px 20px rgba(40, 0, 92, 0.2);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 15px;
                        transition: all 0.3s ease;
                    }
                    .analyze-btn-standalone:hover:not(:disabled) {
                        background: #3B0085;
                        transform: translateY(-2px);
                        box-shadow: 0 15px 30px rgba(40, 0, 92, 0.3);
                    }
                    .analyze-btn-standalone:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }

                    @media (max-width: 1024px) {
                        .entry-grid { grid-template-columns: 1fr; }
                        .drugs-card { position: static; }
                    }
                ` }} />
            </div>
        </Layout>
    );
};

export default PrescriptionEntry;
