/** Reusable Button with variants: primary, secondary, danger, ghost */
export default function Button({ children, variant = 'primary', loading, ...props }) {
  return (
    <button className={`btn btn--${variant}`} disabled={loading || props.disabled} {...props}>
      {loading ? <span className="spinner" /> : children}
    </button>
  )
}
