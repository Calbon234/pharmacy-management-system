/** Inventory-specific hook with filtering, pagination, low-stock flag */
import { useState } from 'react'
import { useFetch } from './useFetch'
import { inventoryService } from '@services/inventoryService'

export function useInventory() {
  const [filters, setFilters] = useState({ search: '', category: '', page: 1 })
  const { data, loading, error, refetch } = useFetch(
    () => inventoryService.getAll(filters),
    [filters]
  )
  return { inventory: data, loading, error, filters, setFilters, refetch }
}
