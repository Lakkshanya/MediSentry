import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';

const Login = () => {
    const { login, isLoading, userToken, userInfo } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (userToken && userInfo) { navigate('/'); }
    }, [userToken, userInfo, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(email, password);
        if (result.success) {
            navigate('/');
        } else {
            if (result.errorType === 'UNVERIFIED') {
                navigate(`/verify-email?email=${encodeURIComponent(email)}`);
            } else {
                setError(result.message);
            }
        }
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
                .centered-form { width: 100%; max-width: 400px; }

                .form-group-compact { margin-bottom: 15px; }
                .form-group-compact label { display: block; font-size: 0.85rem; font-weight: 800; color: #000; margin-bottom: 8px; letter-spacing: 0.5px; }
                .input-box-compact { display: flex; align-items: center; gap: 12px; background: #FAFAFA; border: 1.5px solid #EAEAEA; border-radius: 12px; padding: 12px 16px; }
                .input-box-compact input { flex: 1; border: none; background: none; font-size: 1rem; color: #333; font-weight: 600; outline: none; }
                .eye-btn-compact { background: none; color: #999; cursor: pointer; border: none; }

                .forgot-password-row-compact { text-align: right; margin-top: -10px; margin-bottom: 20px; }
                .forgot-password-row-compact a { font-size: 0.95rem; font-weight: 700; color: #28005C; text-decoration: none; }

                .primary-btn-compact { width: 100%; background: #28005C; color: white; padding: 15px; border-radius: 40px; font-size: 1.1rem; font-weight: 700; margin-bottom: 20px; cursor: pointer; border: none; box-shadow: 0 8px 16px rgba(40, 0, 92, 0.1); transition: all 0.3s ease; }
                .primary-btn-compact.loading { opacity: 0.85; cursor: wait; animation: pulse 1.5s ease-in-out infinite; }
                .btn-loader-wrapper { display: flex; align-items: center; justify-content: center; gap: 12px; }
                .btn-spinner { animation: spin 0.8s linear infinite; width: 22px; height: 22px; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse {
                    0% { box-shadow: 0 8px 16px rgba(40, 0, 92, 0.1); }
                    50% { box-shadow: 0 8px 32px rgba(40, 0, 92, 0.3); }
                    100% { box-shadow: 0 8px 16px rgba(40, 0, 92, 0.1); }
                }

                .divider-compact { text-align: center; position: relative; margin-bottom: 20px; }
                .divider-compact::before { content: ''; position: absolute; left: 0; top: 50%; width: 100%; height: 1px; background: #EAEAEA; }
                .divider-compact span { position: relative; background: white; padding: 0 15px; font-size: 0.85rem; color: #999; font-weight: 700; }

                .google-btn-compact { width: 100%; background: white; color: #000; padding: 12px; border-radius: 40px; font-size: 1rem; font-weight: 700; border: 1.5px solid #28005C; display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 25px; cursor: pointer; }
                
                .footer-compact { text-align: center; font-size: 1rem; color: #666; font-weight: 600; }
                .footer-compact a { color: #28005C; font-weight: 800; text-decoration: none; }
                .error-alert-compact { padding: 12px; background: #FEE2E2; color: #B91C1C; border-radius: 10px; margin-bottom: 15px; font-size: 0.9rem; font-weight: 700; text-align: center; }
            `}</style>

            <div className="full-width-header">
                <div className="header-content">
                    <img src="/assets/Logo.png" alt="Logo" className="header-logo" />
                    <h1>Welcome back.</h1>
                    <p>Sign in to continue to MediSentry AI</p>
                </div>
            </div>

            <div className="web-form-container">
                <div className="centered-form">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group-compact">
                            <label>EMAIL ADDRESS</label>
                            <div className="input-box-compact">
                                <Mail size={18} color="#999" />
                                <input type="email" placeholder="e.g. doctor@medisentry.ai" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                        </div>

                        <div className="form-group-compact">
                            <label>PASSWORD</label>
                            <div className="input-box-compact">
                                <Lock size={18} color="#999" />
                                <input type={showPassword ? "text" : "password"} placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                <button type="button" className="eye-btn-compact" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="forgot-password-row-compact">
                            <Link to="/forgot-password">Forgot Password?</Link>
                        </div>

                        {error && <div className="error-alert-compact">{error}</div>}

                        <button className={`primary-btn-compact ${isLoading ? 'loading' : ''}`} type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <div className="btn-loader-wrapper">
                                    <Loader2 className="btn-spinner" />
                                    <span>Signing in...</span>
                                </div>
                            ) : 'Login'}
                        </button>

                        <div className="divider-compact"><span>or continue with</span></div>

                        <button className="google-btn-compact" type="button">
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{width: '20px'}} /> Google
                        </button>

                        <div className="footer-compact">
                            New to MediSentry? <Link to="/signup">Create Account</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
