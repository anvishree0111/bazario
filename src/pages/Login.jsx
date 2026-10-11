import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import Logo from '../components/Logo'
import { useApp } from '../context/AppContext'
import { useSeller } from '../context/SellerContext'
import { api, setToken } from '../api/client'

export default function Login({ buyer = false }) {
  const navigate = useNavigate()
  const location = useLocation()
  const justRegistered = Boolean(location.state?.registered)
  const { setUser, setUserType } = useApp()
  const { syncFromAuth } = useSeller()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isBuyer = buyer

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return
    setError('')
    setSubmitting(true)

    try {
      if (isBuyer) {
        const data = await api.loginBuyer(email, password)
        setToken(data.token)
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name
        })
        setUserType('buyer')
        navigate('/interests')
      } else {
        const data = await api.loginSeller(email, password)
        setToken(data.token)
        setUser({
          id: data.seller.id,
          email: data.seller.email,
          name: data.seller.ownerName
        })
        setUserType('seller')
        syncFromAuth({
          email: data.seller.email,
          name: data.seller.ownerName,
          ownerName: data.seller.ownerName,
          shopName: data.seller.shopName
        })
        navigate('/seller/dashboard')
      }
    } catch (err) {
      // Credentials are always verified against MySQL — there is no
      // offline/local fallback that logs someone in without a real,
      // authenticated database account.
      setError(String(err?.message || 'Login failed. Please try again.'))
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
          <h1>{isBuyer ? 'Buyer' : 'Seller'} Login</h1>
          <p className="login-subtitle">
            {isBuyer
              ? 'Sign in to discover products tailored to your interests'
              : 'Sign in to manage your shop and orders'}
          </p>
          {justRegistered && (
            <p className="login-success">Account created — sign in to continue.</p>
          )}
          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="login-error">{error}</p>}
            <button type="submit" className="login-btn" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
            <p className="login-switch">
              New to Bazario?{' '}
              <Link to={isBuyer ? '/register' : '/register/seller'}>
                Create a {isBuyer ? 'Buyer' : 'Seller'} account
              </Link>
            </p>
            <p className="login-switch">
              Want to {isBuyer ? 'sell' : 'buy'}?{' '}
              <Link to={isBuyer ? '/login/seller' : '/login'}>
                Switch to {isBuyer ? 'Seller' : 'Buyer'} Login
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
        .login-success {
          color: #1e7e34;
          background: #eaf7ee;
          border: 1px solid #bfe8cb;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 0.9rem;
          margin-bottom: 20px;
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
          margin-top: 24px;
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
