import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import { Eye, EyeOff, Loader2, Mail, Lock, User, ChevronLeft } from 'lucide-react';

const Signup = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '', role: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleNextStep = (e) => {
        e.preventDefault();
        setError('');
        if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) { setError('Please fill all fields.'); return; }
        if (formData.password !== formData.confirmPassword) { setError('Passwords do not match.'); return; }
        setStep(2);
    };

    const handleRegister = async (role) => {
        setIsLoading(true);
        setError('');
        try {
            await registerUser({ ...formData, role: role });
            navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
        } catch (e) {
            const rawError = e.message || 'Registration failed';
            setError(rawError.toLowerCase().includes('email exists') ? 'Email already registered' : rawError);
        } finally { setIsLoading(false); }
    };

    return (
        <div className="auth-web-page-compact">
            <style>{`
                .auth-web-page-compact { height: 100vh; background: #FFFFFF; display: flex; flex-direction: column; font-family: 'Inria Serif', serif; overflow: hidden; }
                .full-width-header { width: 100%; background: #28005C; color: white; padding: 20px; text-align: center; border-bottom-left-radius: 40px; border-bottom-right-radius: 40px; }
                .header-logo { width: 45px; height: 45px; margin-bottom: 5px; }
                .full-width-header h1 { font-size: 2.2rem; font-weight: 800; margin-bottom: 2px; line-height: 1.1; }
                .full-width-header p { font-size: 1rem; opacity: 0.9; margin: 0; }

                .web-form-container { flex: 1; padding: 20px; display: flex; justify-content: center; align-items: center; }
                .centered-form { width: 100%; max-width: 440px; }

                .form-group-compact { margin-bottom: 12px; }
                .form-group-compact label { display: block; font-size: 0.85rem; font-weight: 800; color: #000; margin-bottom: 6px; letter-spacing: 0.5px; }
                .input-box-compact { display: flex; align-items: center; gap: 10px; background: #FAFAFA; border: 1.5px solid #EAEAEA; border-radius: 12px; padding: 10px 16px; }
                .input-box-compact input { flex: 1; border: none; background: none; font-size: 1rem; color: #333; font-weight: 600; outline: none; }
                .eye-btn-compact { background: none; color: #999; cursor: pointer; border: none; }

                .primary-btn-compact { width: 100%; background: #28005C; color: white; padding: 15px; border-radius: 40px; font-size: 1.1rem; font-weight: 700; margin-bottom: 20px; cursor: pointer; border: none; box-shadow: 0 8px 16px rgba(40, 0, 92, 0.1); transition: all 0.3s ease; }
                .divider-compact { text-align: center; position: relative; margin-bottom: 20px; }
                .divider-compact::before { content: ''; position: absolute; left: 0; top: 50%; width: 100%; height: 1px; background: #EAEAEA; }
                .divider-compact span { position: relative; background: white; padding: 0 15px; font-size: 0.85rem; color: #999; font-weight: 700; }
                .secondary-btn-compact { width: 100%; background: white; color: #28005C; padding: 14px; border-radius: 40px; font-size: 1rem; font-weight: 700; border: 1.5px solid #28005C; display: flex; align-items: center; justify-content: center; text-decoration: none; }

                .role-selection h2 { font-size: 1.5rem; font-weight: 800; margin-top: 5px; text-align: center; }
                .role-sub { font-size: 1rem; color: #666; margin-bottom: 25px; text-align: center; }
                .back-link { background: none; color: #28005C; font-weight: 800; font-size: 0.95rem; display: flex; align-items: center; gap: 8px; margin-bottom: 15px; cursor: pointer; border: none; }
                .role-grid { display: flex; flex-direction: column; gap: 15px; }
                .role-btn { display: flex; align-items: center; gap: 20px; background: #F8F9FA; border: 1.5px solid #EAEAEA; padding: 18px 25px; border-radius: 16px; transition: all 0.2s ease; cursor: pointer; width: 100%; }
                .role-btn:hover { border-color: #28005C; background: #F3F0F7; transform: translateX(5px); }
                .role-btn img { width: 45px; height: 40px; object-fit: contain; }
                .role-btn span { font-weight: 800; font-size: 1.1rem; color: #333; }
                .error-alert-compact { padding: 12px; background: #FEE2E2; color: #B91C1C; border-radius: 12px; margin-bottom: 20px; font-size: 0.9rem; font-weight: 700; text-align: center; }
            `}</style>

            <div className="full-width-header">
                <div className="header-content">
                    <img src="/assets/Logo.png" alt="Logo" className="header-logo" />
                    <h1>Create Account</h1>
                    <p>Join MediSentry AI for safe healthcare.</p>
                </div>
            </div>

            <div className="web-form-container">
                <div className="centered-form">
                    {step === 1 ? (
                        <form onSubmit={handleNextStep}>
                            <div className="form-group-compact">
                                <label>FULL NAME</label>
                                <div className="input-box-compact"><User size={18} color="#999" /><input type="text" placeholder="Dr. Jane Smith" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required /></div>
                            </div>
                            <div className="form-group-compact">
                                <label>EMAIL ADDRESS</label>
                                <div className="input-box-compact"><Mail size={18} color="#999" /><input type="email" placeholder="doctor@medisentry.ai" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required /></div>
                            </div>
                            <div className="form-group-compact">
                                <label>PASSWORD</label>
                                <div className="input-box-compact">
                                    <Lock size={18} color="#999" />
                                    <input type={showPassword ? "text" : "password"} placeholder="Enter password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                                    <button type="button" className="eye-btn-compact" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                </div>
                            </div>
                            <div className="form-group-compact">
                                <label>CONFIRM PASSWORD</label>
                                <div className="input-box-compact">
                                    <Lock size={18} color="#999" />
                                    <input type={showConfirmPassword ? "text" : "password"} placeholder="Re-enter password" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} required />
                                    <button type="button" className="eye-btn-compact" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                </div>
                            </div>
                            {error && <div className="error-alert-compact">{error}</div>}
                            <button className="primary-btn-compact" type="submit">Next</button>
                            <div className="divider-compact"><span>ALREADY HAVE AN ACCOUNT?</span></div>
                            <Link to="/login" className="secondary-btn-compact">Sign In</Link>
                        </form>
                    ) : (
                        <div className="role-selection">
                            <button className="back-link" onClick={() => setStep(1)}><ChevronLeft size={18}/> Back</button>
                            <h2>Select Your Role</h2>
                            <p className="role-sub">This determines your workspace</p>
                            <div className="role-grid">
                                <button className="role-btn" onClick={() => handleRegister('DOCTOR')}><img src="/assets/Doctor.png" alt="Doctor" /><span>Doctor</span></button>
                                <button className="role-btn" onClick={() => handleRegister('PHARMACIST')}><img src="/assets/Pharmassist.png" alt="Pharmacist" /><span>Pharmacist</span></button>
                                <button className="role-btn" onClick={() => handleRegister('ADMIN')}><img src="/assets/Admin.png" alt="Admin" /><span>Administrator</span></button>
                            </div>
                            {error && <div className="error-alert-compact">{error}</div>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Signup;
