/** Date, currency, and quantity formatters used throughout the app */
import { format } from 'date-fns'

export const formatDate    = (d) => format(new Date(d), 'dd MMM yyyy')
export const formatDateTime= (d) => format(new Date(d), 'dd MMM yyyy, HH:mm')
export const formatCurrency= (n, currency = 'KES') =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency }).format(n)
export const formatQuantity= (n, unit = 'units') => `${n} ${unit}`
