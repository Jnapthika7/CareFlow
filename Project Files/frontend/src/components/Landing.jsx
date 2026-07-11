export default function Landing({ onLogin, onSignUp }) {
  return (
    <div className="landing-shell hero-shell">
      <div className="hero-card">
        <header className="hero-header">
          <div className="brand-mark">
            <span className="brand-icon">+</span>
            <div>
              <p className="brand-name">Care Flow</p>
              <p className="brand-tagline">Smart service for every customer.</p>
            </div>
          </div>
        </header>

        <div className="hero-body">
          <p className="badge-pill">Trusted care registry</p>
          <h1>Manage support requests faster, with a clean dashboard.</h1>
          <p className="hero-copy">
            Sign in to raise tickets, track progress, and let admins accept or reject requests from one simple platform.
          </p>
          <div className="landing-actions">
            <button type="button" className="primary-button" onClick={onLogin}>
              Login
            </button>
            <button type="button" className="secondary-button" onClick={onSignUp}>
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
