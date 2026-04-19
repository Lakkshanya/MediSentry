import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Loader2, Key, CheckCircle2, ChevronLeft } from 'lucide-react';
import api from '../services/api';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const inputRefs = useRef([]);

    const handleChange = (value, index) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Move to next input
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await api.post('/users/forgot-password/', { email });
            setStep(2);
        } catch (e) {
            setError(e.message || 'Failed to send recovery code.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        const fullOtp = otp.join('');
        if (fullOtp.length !== 6) return setError('Please enter the 6-digit code.');
        
        setIsLoading(true);
        setError('');
        try {
            await api.post('/users/reset-password/', { 
                email, 
                otp: fullOtp, 
                new_password: newPassword 
            });
            setStep(3);
        } catch (e) {
            setError(e.message || 'Password reset failed. Check your code.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-web-page">
            <style>{`
                .auth-web-page { min-height: 100vh; background: #FFFFFF; display: flex; flex-direction: column; font-family: 'Inria Serif', serif; }
                .full-width-header { width: 100%; background: #28005C; color: white; padding: 35px 20px; text-align: center; border-bottom-left-radius: 40px; border-bottom-right-radius: 40px; }
                .header-logo { width: 32px; height: 32px; margin-bottom: 12px; }
                .full-width-header h1 { font-size: 1.8rem; font-weight: 800; margin-bottom: 6px; }
                .full-width-header p { font-size: 1.1rem; opacity: 0.9; }

                .web-form-container { flex: 1; padding: 60px 20px; display: flex; justify-content: center; }
                .centered-form { width: 100%; max-width: 440px; }

                .form-group-v3 { margin-bottom: 25px; }
                .form-group-v3 label { display: block; font-size: 0.95rem; font-weight: 800; color: #000; margin-bottom: 12px; letter-spacing: 0.5px; }
                .input-box-v3 { display: flex; align-items: center; gap: 15px; background: #FAFAFA; border: 1.5px solid #EAEAEA; border-radius: 15px; padding: 15px 20px; transition: all 0.3s ease; }
                .input-box-v3 input { flex: 1; border: none; background: none; font-size: 1.1rem; color: #333; font-weight: 600; outline: none; }

                .primary-btn-v3 { width: 100%; background: #28005C; color: white; padding: 18px; border-radius: 40px; font-size: 1.2rem; font-weight: 700; margin-bottom: 30px; border: none; cursor: pointer; box-shadow: 0 10px 20px rgba(40, 0, 92, 0.15); transition: all 0.3s ease; }
                .primary-btn-v3:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(40, 0, 92, 0.2); }
                .back-link { background: none; color: #28005C; font-weight: 800; font-size: 1rem; display: flex; align-items: center; gap: 8px; margin-bottom: 20px; cursor: pointer; border: none; text-decoration: none; }
                .error-alert-v3 { padding: 15px; background: #FEE2E2; color: #B91C1C; border-radius: 12px; margin-bottom: 25px; font-size: 1rem; font-weight: 700; text-align: center; border-left: 5px solid #B91C1C; }
                .success-state { text-align: center; padding: 40px 0; }
                .success-state h2 { font-size: 2rem; color: #28005C; margin: 20px 0; font-weight: 800; }
                
                .otp-input-container { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 30px; }
                .otp-digit-input {
                    width: 55px;
                    height: 65px;
                    background: #FAFAFA;
                    border: 1.8px solid #EAEAEA;
                    border-radius: 15px;
                    font-size: 1.8rem;
                    text-align: center;
                    font-weight: 800;
                    color: #28005C;
                    outline: none;
                    transition: all 0.3s ease;
                }
                .otp-digit-input:focus { border-color: #28005C; background: #FFF; box-shadow: 0 0 0 4px rgba(40, 0, 92, 0.05); }

                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>

            <div className="full-width-header">
                <div className="header-content">
                    <img src="/assets/Logo.png" alt="Logo" className="header-logo" />
                    <h1>Lost Access?</h1>
                    <p>Recover your account safely.</p>
                </div>
            </div>

            <div className="web-form-container">
                <div className="centered-form">
                    {step === 1 && (
                        <form onSubmit={handleSendOTP}>
                            <Link to="/login" className="back-link"><ChevronLeft size={20}/> Back to Login</Link>
                            <div className="form-group-v3">
                                <label>EMAIL ADDRESS</label>
                                <div className="input-box-v3"><Mail size={20} color="#999" /><input type="email" placeholder="Your registered email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                            </div>
                            {error && <div className="error-alert-v3">{error}</div>}
                            <button className="primary-btn-v3" type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : 'Send Recovery Code'}</button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleReset}>
                            <button type="button" className="back-link" onClick={() => setStep(1)}><ChevronLeft size={20}/> Use different email</button>
                            
                            <label style={{display:'block', fontSize:'0.95rem', fontWeight:800, color:'#000', marginBottom:12, letterSpacing:'0.5px'}}>RECOVERY CODE</label>
                            <div className="otp-input-container">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        onChange={(e) => handleChange(e.target.value, index)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        className="otp-digit-input"
                                        autoFocus={index === 0}
                                        required
                                    />
                                ))}
                            </div>

                            <div className="form-group-v3">
                                <label>NEW PASSWORD</label>
                                <div className="input-box-v3"><Key size={20} color="#999" /><input type="password" placeholder="Create new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required /></div>
                            </div>
                            {error && <div className="error-alert-v3">{error}</div>}
                            <button className="primary-btn-v3" type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : 'Update Password'}</button>
                        </form>
                    )}

                    {step === 3 && (
                        <div className="success-state">
                            <CheckCircle2 color="#22C55E" size={80} style={{margin: '0 auto'}} />
                            <h2>Success!</h2>
                            <p style={{fontSize: '1.2rem', color: '#666', marginBottom: '30px'}}>Your password has been updated. You can now log in securely.</p>
                            <Link to="/login" className="primary-btn-v3" style={{display: 'block', textDecoration: 'none', textAlign: 'center'}}>Login Now</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
