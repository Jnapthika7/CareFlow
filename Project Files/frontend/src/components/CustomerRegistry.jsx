import { useMemo, useState } from 'react'

export default function CustomerRegistry({ customers, userRole, currentUserEmail, onAdd, onAccept, onReject, onDelete }) {
  const [form, setForm] = useState({ name: '', email: '', priority: 'Medium', notes: '' })
  const [formError, setFormError] = useState('')

  const openCount = useMemo(() => customers.filter((customer) => customer.status === 'Open').length, [customers])
  const myTickets = useMemo(
    () => customers.filter((customer) => customer.submittedBy === currentUserEmail),
    [customers, currentUserEmail]
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const isValidText = (value) => /[^\s.]/.test(value)

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmedName = form.name.trim()
    const trimmedNotes = form.notes.trim()
    if (!isValidText(trimmedName) || !isValidText(trimmedNotes)) {
      setFormError('Issue title and description are required.')
      return
    }

    setFormError('')
    onAdd({
      name: trimmedName,
      email: form.email.trim() || currentUserEmail,
      priority: form.priority,
      notes: trimmedNotes,
      status: 'Open'
    })
    setForm({ name: '', email: '', priority: 'Medium', notes: '' })
  }

  if (userRole === 'admin') {
    return (
      <section className="registry-section">
        <div className="registry-header">
          <div>
            <h2>Admin Ticket Queue</h2>
            <p>Review every request and accept it when the team is ready.</p>
          </div>
          <div className="registry-stats">
            <span>{customers.length} tickets</span>
            <span>{openCount} pending</span>
          </div>
        </div>

        <div className="registry-list">
          {customers.map((customer) => (
            <article key={customer.id} className="registry-card">
              <header>
                <div>
                  <h3>{customer.name}</h3>
                  <p>{customer.email}</p>
                </div>
                <div className="tag-row">
                  <span className={`tag status-${customer.status.replace(/\s+/g, '-').toLowerCase()}`}>{customer.status}</span>
                  <span className={`tag priority-${customer.priority.toLowerCase()}`}>{customer.priority}</span>
                </div>
              </header>
              <p>{customer.notes}</p>
              <div className="action-row">
                {customer.status === 'Open' ? (
                  <>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        onAccept(customer.id)
                      }}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className="secondary-button reject-button"
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        onReject(customer.id)
                      }}
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      className="secondary-button reject-button"
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        onDelete(customer.id)
                      }}
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <span className="status-note">{customer.status === 'Accepted' ? 'Accepted' : 'Rejected'}</span>
                    <button
                      type="button"
                      className="secondary-button reject-button"
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        onDelete(customer.id)
                      }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="registry-section">
      <div className="registry-header">
        <div>
          <h2>Raise a Support Ticket</h2>
          <p>Submit your issue and track it from your user dashboard.</p>
        </div>
        <div className="registry-stats">
          <span>{myTickets.length} your tickets</span>
          <span>{openCount} open</span>
        </div>
      </div>

      <form className="registry-form" onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="name">Issue Title</label>
          <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Brief issue summary" />
        </div>
        <div className="field-group">
          <label htmlFor="email">Contact Email</label>
          <input id="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter email" />
        </div>
        <div className="field-group">
          <label htmlFor="priority">Priority</label>
          <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
        <div className="field-group">
          <label htmlFor="notes">Describe the issue</label>
          <textarea id="notes" name="notes" value={form.notes} onChange={handleChange} placeholder="Tell us what help you need" rows="3" />
        </div>
        {formError && <p className="field-error">{formError}</p>}
        <button type="submit" className="primary-button">Raise Ticket</button>
      </form>

      <div className="registry-list">
        {myTickets.map((customer) => (
          <article key={customer.id} className="registry-card">
            <header>
              <div>
                <h3>{customer.name}</h3>
                <p>{customer.email}</p>
              </div>
              <div className="tag-row">
                <span className={`tag status-${customer.status.replace(/\s+/g, '-').toLowerCase()}`}>{customer.status}</span>
                <span className={`tag priority-${customer.priority.toLowerCase()}`}>{customer.priority}</span>
              </div>
            </header>
            <p>{customer.notes}</p>
            <div className="action-row">
              <button
                type="button"
                className="secondary-button reject-button"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  onDelete(customer.id)
                }}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
