// Status badges: active, expired, low-stock, fulfilled, pending
export default function Badge({ label, type = "default" }) {
  return <span className={`badge badge-${type}`}>{label}</span>;
}
