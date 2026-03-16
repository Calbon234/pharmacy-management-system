export const formatCurrency = (amount, currency = 'KES') => `${currency} ${Number(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
export const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
export const formatDateTime = (date) => date ? new Date(date).toLocaleString('en-KE') : '—';
export const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
export const truncate = (str, n = 30) => str?.length > n ? str.slice(0, n) + '…' : str;
