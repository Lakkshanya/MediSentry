import React from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-page-v2">
      <style>{`
        .welcome-page-v2 { 
            min-height: 100vh; 
            background: #FFFFFF; 
            display: flex; 
            flex-direction: column; 
            font-family: 'Outfit', sans-serif; 
            overflow-x: hidden;
            position: relative;
        }

        /* Abstract Decorative Elements */
        .bg-blob {
            position: absolute;
            width: 600px;
            height: 600px;
            background: linear-gradient(135deg, rgba(40, 0, 92, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
            border-radius: 50%;
            filter: blur(80px);
            z-index: 0;
        }
        .blob-1 { top: -200px; right: -200px; }
        .blob-2 { bottom: -200px; left: -200px; }

        .welcome-nav {
            padding: 40px 80px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            z-index: 10;
        }
        .nav-logo-box { display: flex; align-items: center; gap: 15px; }
        .nav-logo-img { width: 45px; height: 45px; }
        .nav-brand-name { font-size: 1.8rem; font-weight: 900; color: #28005C; letter-spacing: 0; }

        .hero-section-v2 {
            flex: 1;
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            align-items: center;
            padding: 0 80px 60px;
            max-width: 1600px;
            margin: 0 auto;
            gap: 60px;
            z-index: 10;
        }

        .hero-text-content {
            padding-right: 40px;
        }
        .hero-badge {
            display: inline-flex;
            align-items: center;
            padding: 10px 24px;
            background: rgba(40, 0, 92, 0.06);
            border-radius: 100px;
            color: #28005C;
            font-weight: 800;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0;
            margin-bottom: 30px;
            border: 1px solid rgba(40, 0, 92, 0.1);
        }
        .hero-title-v2 {
            font-size: 5rem;
            line-height: 1.05;
            font-weight: 900;
            color: #000;
            margin-bottom: 30px;
            letter-spacing: 0;
        }
        .accent-text {
            background: linear-gradient(90deg, #28005C, #6D28D9);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .hero-desc-v2 {
            font-size: 1.4rem;
            line-height: 1.6;
            color: #555;
            margin-bottom: 50px;
            max-width: 600px;
            font-weight: 500;
        }

        .cta-group-v2 {
            display: flex;
            align-items: center;
            gap: 25px;
        }
        .primary-cta-v2 {
            background: #28005C;
            color: white;
            padding: 22px 45px;
            border-radius: 100px;
            font-size: 1.25rem;
            font-weight: 800;
            border: none;
            cursor: pointer;
            box-shadow: 0 20px 40px rgba(40, 0, 92, 0.2);
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .primary-cta-v2:hover {
            transform: scale(1.05) translateY(-5px);
            box-shadow: 0 30px 60px rgba(40, 0, 92, 0.3);
            background: #3B0085;
        }
        .secondary-cta-v2 {
            background: transparent;
            color: #28005C;
            font-weight: 800;
            font-size: 1.1rem;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 15px 25px;
            border-radius: 100px;
            transition: all 0.2s;
        }
        .secondary-cta-v2:hover {
            background: rgba(40, 0, 92, 0.05);
        }

        .hero-visual-v2 {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .main-illustration-box {
            width: 100%;
            height: 600px;
            background: #F8F9FF;
            border-radius: 40px;
            padding: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 40px 80px rgba(0,0,0,0.05);
            border: 2px solid #F0F0FF;
            overflow: hidden;
            position: relative;
        }
        .landing-img-v2 {
            width: auto;
            height: 110%;
            object-fit: contain;
            filter: drop-shadow(0 20px 40px rgba(0,0,0,0.1));
            transition: transform 0.5s ease;
        }
        .main-illustration-box:hover .landing-img-v2 {
            transform: scale(1.05) rotate(-2deg);
        }

        /* Floating Feature Cards */
        .floating-feature {
            position: absolute;
            background: white;
            padding: 20px 25px;
            border-radius: 20px;
            box-shadow: 0 15px 40px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 15px;
            z-index: 20;
            border: 1px solid #EEE;
            animation: float-v2 4s ease-in-out infinite;
        }
        @keyframes float-v2 {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
        }
        .feat-1 { top: 50px; right: -40px; animation-delay: 0s; }
        .feat-2 { bottom: 50px; left: -40px; animation-delay: 1s; }
        .feat-icon { width: 40px; height: 40px; border-radius: 12px; background: #E9E1F5; display: flex; align-items: center; justify-content: center; color: #28005C; font-weight: 900; }

        @media (max-width: 1200px) {
            .hero-title-v2 { font-size: 3.5rem; }
            .hero-section-v2 { padding: 0 40px 40px; grid-template-columns: 1fr; text-align: center; }
            .hero-text-content { padding-right: 0; display: flex; flex-direction: column; align-items: center; }
            .hero-desc-v2 { margin-left: auto; margin-right: auto; }
            .cta-group-v2 { justify-content: center; }
            .welcome-nav { padding: 30px 40px; }
            .main-illustration-box { height: 450px; }
            .feat-1, .feat-2 { display: none; }
        }
      `}</style>

      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>

      <nav className="welcome-nav">
        <div className="nav-logo-box">
          <img src="/assets/Logo.png" alt="Logo" className="nav-logo-img" />
          <span className="nav-brand-name">MediSentry AI</span>
        </div>
        <button className="secondary-cta-v2" onClick={() => navigate('/login')}>
          Portal Login
        </button>
      </nav>

      <main className="hero-section-v2">
        <div className="hero-text-content">
          <div className="hero-badge">Next-Generation Healthcare</div>
          <h1 className="hero-title-v2">
            Smarter <span className="accent-text">Medication</span> <br />
            Precise <span className="accent-text">Safety.</span>
          </h1>
          <p className="hero-desc-v2">
            Harnessing advanced clinical AI to audit prescriptions, prevent adverse drug events, and ensure patient safety with 99.9% analytical precision.
          </p>
          <div className="cta-group-v2">
            <button className="primary-cta-v2" onClick={() => navigate('/login')}>
              Launch Clinical Portal
            </button>
          </div>
        </div>

        <div className="hero-visual-v2">
          <div className="main-illustration-box">
            <img src="/assets/HomePage.png" alt="Clinical AI" className="landing-img-v2" />
          </div>
          
          <div className="floating-feature feat-1">
            <div className="feat-icon">AI</div>
            <div>
              <div style={{fontWeight: 800, fontSize: '0.9rem'}}>Real-time Audit</div>
              <div style={{fontSize: '0.8rem', color: '#666'}}>Scanning Interactions...</div>
            </div>
          </div>

          <div className="floating-feature feat-2">
            <div className="feat-icon">✓</div>
            <div>
              <div style={{fontWeight: 800, fontSize: '0.9rem'}}>Patient Secured</div>
              <div style={{fontSize: '0.8rem', color: '#666'}}>Verification Complete</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Welcome;
