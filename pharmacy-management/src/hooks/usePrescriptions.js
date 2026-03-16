/** Prescriptions hook */
import { useState } from 'react'
import { useFetch } from './useFetch'
import { prescriptionService } from '@services/prescriptionService'

export function usePrescriptions() {
  const [filters, setFilters] = useState({ status: 'pending', page: 1 })
  const { data, loading, error, refetch } = useFetch(
    () => prescriptionService.getAll(filters),
    [filters]
  )
  return { prescriptions: data, loading, error, filters, setFilters, refetch }
}
