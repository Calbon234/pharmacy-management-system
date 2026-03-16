/** Debounced search input */
import { useState } from 'react'
import { useDebounce } from '@hooks/useDebounce'
import { useEffect } from 'react'

export default function SearchBar({ onSearch, placeholder = 'Search...' }) {
  const [value, setValue] = useState('')
  const debounced = useDebounce(value)
  useEffect(() => onSearch(debounced), [debounced])
  return (
    <input
      className="search-bar"
      type="search"
      value={value}
      onChange={e => setValue(e.target.value)}
      placeholder={placeholder}
    />
  )
}
