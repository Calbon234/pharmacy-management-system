// Debounced search input used in inventory, patients, prescriptions
export default function SearchBar({ placeholder, onChange }) {
  return <input className="search-bar" type="search" placeholder={placeholder} onChange={e => onChange(e.target.value)} />;
}
