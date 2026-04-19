import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../services/api';
import { Loader2 } from 'lucide-react';

const EmailVerification = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const inputRefs = useRef([]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const emailParam = params.get('email');
        if (emailParam) setEmail(emailParam);
    }, [location]);

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

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        const fullOtp = otp.join('');
        if (fullOtp.length !== 6) return setError('Please enter the 6-digit code.');
        
        setIsLoading(true);
        setError('');
        try {
            await verifyEmail(email, fullOtp);
            alert('Email verified successfully! You can now login.');
            navigate('/login');
        } catch (e) {
            setError(e.message || 'Verification failed. Please check the code.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-web-page-compact">
            <style>{`
                .auth-web-page-compact { height: 100vh; background: #FFFFFF; display: flex; flex-direction: column; font-family: 'Inria Serif', serif; overflow: hidden; }
                .full-width-header { width: 100%; background: #28005C; color: white; padding: 25px 20px; text-align: center; border-bottom-left-radius: 40px; border-bottom-right-radius: 40px; }
                .header-logo { width: 40px; height: 40px; margin-bottom: 5px; }
                .full-width-header h1 { font-size: 2.2rem; font-weight: 800; margin-bottom: 2px; line-height: 1.1; }
                .full-width-header p { font-size: 1rem; opacity: 0.9; margin: 0; }

                .web-form-container { flex: 1; padding: 20px; display: flex; justify-content: center; align-items: center; }
                .centered-form { width: 100%; max-width: 500px; text-align: center; }

                .verification-img-v2 { width: 180px; height: auto; margin: 0 auto 20px auto; display: block; object-fit: contain; }

                .otp-title { font-size: 1.1rem; font-weight: 800; color: #000; margin-bottom: 25px; letter-spacing: 1px; display: flex; justify-content: center; align-items: center; gap: 8px; }

                .otp-input-container { display: flex; justify-content: center; gap: 15px; margin-bottom: 35px; }
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

                .primary-btn-compact { width: 100%; max-width: 400px; background: #28005C; color: white; padding: 18px; border-radius: 40px; font-size: 1.2rem; font-weight: 700; margin-bottom: 25px; border: none; cursor: pointer; box-shadow: 0 10px 20px rgba(40, 0, 92, 0.15); align-self: center; position: relative; overflow: hidden; transition: all 0.3s ease; }
                .primary-btn-compact.loading { opacity: 0.85; cursor: wait; animation: pulse 1.5s ease-in-out infinite; }
                .btn-loader-wrapper { display: flex; align-items: center; justify-content: center; gap: 12px; }
                .btn-spinner { animation: spin 0.8s linear infinite; width: 22px; height: 22px; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse {
                    0% { box-shadow: 0 10px 20px rgba(40, 0, 92, 0.15); }
                    50% { box-shadow: 0 10px 40px rgba(40, 0, 92, 0.4); }
                    100% { box-shadow: 0 10px 20px rgba(40, 0, 92, 0.15); }
                }
                
                .footer-v3 { font-size: 1.1rem; color: #666; font-weight: 600; }
                .text-btn { background: none; color: #28005C; font-weight: 800; border: none; cursor: pointer; font-family: inherit; font-size: inherit; margin-left: 5px; }
                .error-alert-compact { padding: 12px; background: #FEE2E2; color: #B91C1C; border-radius: 12px; margin-bottom: 25px; font-size: 0.95rem; font-weight: 700; text-align: center; max-width: 400px; margin-left: auto; margin-right: auto; }
            `}</style>

            <div className="full-width-header">
                <div className="header-content">
                    <img src="/assets/Logo.png" alt="Logo" className="header-logo" />
                    <h1>Verify Email</h1>
                    <p>Enter the 6-digit code sent to your email</p>
                </div>
            </div>

            <div className="web-form-container">
                <div className="centered-form">
                    
                    <img src="/assets/ForgetVerfication.png" alt="Email Verification" className="verification-img-v2" />

                    <div className="otp-title">
                        VERIFICATION CODE
                    </div>
                    
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
                            />
                        ))}
                    </div>

                    {error && <div className="error-alert-compact">{error}</div>}

                    <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                      <button 
                        className={`primary-btn-compact ${isLoading ? 'loading' : ''}`} 
                        onClick={handleSubmit} 
                        disabled={isLoading}
                      >
                          {isLoading ? (
                            <div className="btn-loader-wrapper">
                              <Loader2 className="btn-spinner" />
                              <span>Verifying Account...</span>
                            </div>
                          ) : 'Verify Account'}
                      </button>
                      
                      <div className="footer-v3">
                          Didn't receive the code? <button type="button" className="text-btn">Resend</button>
                      </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailVerification;
