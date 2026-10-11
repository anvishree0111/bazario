import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="landing">
      <header className="landing-header">
       <div className="logo-wrapper">
  <Logo size={350} />
</div>

      </header>
      <main className="landing-main">
        <h1 className="landing-title">Welcome to Bazario</h1>
        <p className="landing-subtitle">Sell Anytime, Buy Anytime</p>
        <p className="landing-question">What would you like to do today?</p>
        <div className="landing-buttons">
          <button
            className="landing-btn primary"
            onClick={() => navigate('/login')}
          >
            I want to Buy
          </button>
          <button
            className="landing-btn secondary"
            onClick={() => navigate('/login/seller')}
          >
            I want to Sell
          </button>
        </div>
        <p className="landing-register">
          New here?{' '}
          <a onClick={() => navigate('/register')}>Register as Buyer</a>
          {' '}or{' '}
          <a onClick={() => navigate('/register/seller')}>Register as Seller</a>
        </p>
      </main>
      <style>{`
        .landing {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(180deg, #fff 0%, #fff8f5 100%);
        }
        .landing-header {
          padding: 24px 32px;
        }
        .landing-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          text-align: center;
        }
        .landing-title {
          font-size: clamp(2rem, 5vw, 3.5rem);
          color: #FF4800;
          margin-bottom: 8px;
          animation: fadeUp 0.6s ease;
        }
        .landing-subtitle {
          font-size: 1.25rem;
          color: #666;
          margin-bottom: 48px;
          animation: fadeUp 0.6s ease 0.1s both;
        }
        .landing-question {
          font-size: 1.1rem;
          color: #333;
          margin-bottom: 32px;
          font-weight: 600;
          animation: fadeUp 0.6s ease 0.2s both;
        }
        .landing-buttons {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          justify-content: center;
          animation: fadeUp 0.6s ease 0.3s both;
        }
        .landing-btn {
          padding: 16px 40px;
          font-size: 1.1rem;
          font-weight: 700;
          border-radius: 12px;
          min-width: 200px;
        }
        .landing-btn.primary {
          background: #FF4800;
          color: white;
          box-shadow: 0 4px 16px rgba(255, 72, 0, 0.3);
        }
        .landing-btn.primary:hover {
          background: #e03f00;
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(255, 72, 0, 0.4);
        }
        .landing-btn.secondary {
          background: white;
          color: #FF4800;
          border: 2px solid #FF4800;
        }
        .landing-btn.secondary:hover {
          background: #fff5f0;
          transform: translateY(-2px);
        }
        .landing-register {
          margin-top: 28px;
          font-size: 0.95rem;
          color: #666;
          animation: fadeUp 0.6s ease 0.35s both;
        }
        .landing-register a {
          color: #FF4800;
          font-weight: 700;
          cursor: pointer;
        }
        .landing-register a:hover { text-decoration: underline; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 480px) {
          .landing-buttons { flex-direction: column; }
          .landing-btn { width: 100%; min-width: auto; }
        }
      `}</style>
    </div>
  )
}
