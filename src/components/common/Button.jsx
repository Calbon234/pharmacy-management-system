// Reusable button with variants: primary, secondary, danger, ghost
export default function Button({ children, variant = "primary", size = "md", ...props }) {
  return <button className={`btn btn-${variant} btn-${size}`} {...props}>{children}</button>;
}
