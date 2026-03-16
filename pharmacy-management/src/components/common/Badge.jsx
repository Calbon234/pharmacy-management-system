/** Status badges: success, warning, danger, info */
export default function Badge({ label, status = 'info' }) {
  return <span className={`badge badge--${status}`}>{label}</span>
}
