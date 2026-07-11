export default function Dashboard({ userName, userRole, ticketCount, userTicketCount, acceptedCount, openCount, onLogout }) {
  const isAdmin = userRole === 'admin'

  return (
    <div className="dashboard-shell compact">
      <div className="dashboard-head">
        <div>
          <p className="page-label">Care Flow</p>
          <div className="dashboard-title-row">
            <h1>{isAdmin ? `Welcome back, ${userName || 'Admin'}` : `Welcome back, ${userName || 'User'}`}</h1>
            {isAdmin && <span className="admin-badge">Admin</span>}
          </div>
          <p>
            {isAdmin
              ? 'Review incoming care requests and accept them as quickly as possible.'
              : 'Raise your support ticket and track its progress from your dashboard.'}
          </p>
        </div>
        <button className="secondary-button" type="button" onClick={onLogout}>
          Logout
        </button>
      </div>

      <div className="dashboard-stats dashboard-stats-grid">
        <article>
          <h3>{ticketCount}</h3>
          <p>All tickets</p>
        </article>
        <article>
          <h3>{userTicketCount}</h3>
          <p>{isAdmin ? 'Admin visible' : 'Your tickets'}</p>
        </article>
        <article>
          <h3>{openCount}</h3>
          <p>{isAdmin ? 'Open / pending' : 'Open requests'}</p>
        </article>
        <article>
          <h3>{acceptedCount}</h3>
          <p>{isAdmin ? 'Accepted tickets' : 'Resolved for you'}</p>
        </article>
      </div>
    </div>
  )
}
