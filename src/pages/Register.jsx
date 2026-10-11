import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Logo from '../components/Logo'
import { api } from '../api/client'

export default function Register({ buyer = false }) {
  const navigate = useNavigate()
  const isBuyer = buyer

  const [name, setName] = useState('')
  const [shopName, setShopName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setSubmitting(true)
    try {
      if (isBuyer) {
        await api.registerBuyer({ name, email, password, confirmPassword })
      } else {
        await api.registerSeller({ shopName, ownerName, email, password, confirmPassword })
      }
      // Registration succeeded. Send the person to sign in with their new
      // account rather than auto-logging them in here — the account was
      // just created, so a real login confirms the credentials work.
      navigate(isBuyer ? '/login' : '/login/seller', {
        replace: true,
        state: { registered: true }
      })
    } catch (err) {
      setError(String(err?.message || 'Something went wrong. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <header className="login-header">
        <Link to="/">
          <Logo size={44} />
        </Link>
        <Link to="/" className="back-link">← Back</Link>
      </header>
      <main className="login-main">
        <div className="login-card">
          <h1>{isBuyer ? 'Buyer' : 'Seller'} Registration</h1>
          <p className="login-subtitle">
            {isBuyer
              ? 'Create an account to discover products tailored to your interests'
              : 'Create a shop account to start selling on Bazario'}
          </p>
          <form onSubmit={handleSubmit} className="login-form">
            {isBuyer ? (
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Shop name"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Owner name"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                />
              </>
            )}
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password (min. 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
            />
            {error && <p className="login-error">{error}</p>}
            <button type="submit" className="login-btn" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create Account'}
            </button>
            <p className="login-switch">
              Already have an account?{' '}
              <Link to={isBuyer ? '/login' : '/login/seller'}>Sign In</Link>
            </p>
            <p className="login-switch">
              Want to {isBuyer ? 'sell' : 'buy'}?{' '}
              <Link to={isBuyer ? '/register/seller' : '/register'}>
                Register as {isBuyer ? 'Seller' : 'Buyer'}
              </Link>
            </p>
          </form>
        </div>
      </main>
      <style>{`
        .login-page {
          min-height: 100vh;
          background: #f8f8f8;
        }
        .login-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: white;
          box-shadow: var(--shadow);
        }
        .back-link {
          color: #666;
          font-weight: 600;
          transition: color 0.2s;
        }
        .back-link:hover { color: #FF4800; }
        .login-main {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          min-height: calc(100vh - 80px);
        }
        .login-card {
          background: white;
          padding: 48px;
          border-radius: 16px;
          box-shadow: var(--shadow);
          width: 100%;
          max-width: 440px;
        }
        .login-card h1 {
          font-size: 1.75rem;
          margin-bottom: 8px;
          color: #FF4800;
        }
        .login-subtitle {
          color: #666;
          margin-bottom: 32px;
          font-size: 0.95rem;
        }
        .login-form input {
          width: 100%;
          padding: 14px 18px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 1rem;
          margin-bottom: 16px;
          font-family: inherit;
          transition: border-color 0.2s;
        }
        .login-form input:focus {
          outline: none;
          border-color: #FF4800;
        }
        .login-error {
          color: #c0392b;
          background: #fdecea;
          border: 1px solid #f5c6c2;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 0.9rem;
          margin-bottom: 16px;
        }
        .login-btn {
          width: 100%;
          padding: 16px;
          background: #FF4800;
          color: white;
          font-weight: 700;
          font-size: 1.05rem;
          border-radius: 10px;
          margin-top: 8px;
        }
        .login-btn:hover {
          background: #e03f00;
          transform: translateY(-1px);
        }
        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        .login-switch {
          margin-top: 16px;
          text-align: center;
          color: #666;
          font-size: 0.9rem;
        }
        .login-switch a {
          color: #FF4800;
          font-weight: 600;
        }
        .login-switch a:hover { text-decoration: underline; }
      `}</style>
    </div>
  )
}
