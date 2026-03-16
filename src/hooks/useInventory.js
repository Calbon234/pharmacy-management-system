import { useState, useEffect, useCallback } from 'react';
import { getInventory } from '../services/inventoryService';
export function useInventory(filters = {}) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetch = useCallback(async () => {
    try { setLoading(true); const { data } = await getInventory(filters); setInventory(data); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [JSON.stringify(filters)]);
  useEffect(() => { fetch(); }, [fetch]);
  return { inventory, loading, error, refetch: fetch };
}
