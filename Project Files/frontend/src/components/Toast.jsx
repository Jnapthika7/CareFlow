export default function Toast({ message, type = 'info' }) {
  if (!message) return null

  const className = `toast ${type === 'error' ? 'toast-error' : 'toast-info'}`
  return <div className={className}>{message}</div>
}
