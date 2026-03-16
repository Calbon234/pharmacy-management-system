/** Generic sortable, paginated data table */
export default function Table({ columns, data, loading, emptyMessage = 'No data found' }) {
  if (loading) return <div className="table-skeleton" />
  if (!data?.length) return <p className="table-empty">{emptyMessage}</p>
  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>{columns.map(col => <th key={col.key}>{col.label}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i}>
              {columns.map(col => (
                <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
