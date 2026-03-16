// Loading spinner for async operations
export default function Spinner({ size = "md" }) {
  return <div className={`spinner spinner-${size}`} aria-label="Loading..." />;
}
