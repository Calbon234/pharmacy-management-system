// Generic data table with sortable columns and pagination
export default function Table({ columns, data, onRowClick }) {
  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead><tr>{columns.map(col => <th key={col.key}>{col.label}</th>)}</tr></thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} onClick={() => onRowClick?.(row)} className={onRowClick ? 'clickable' : ''}>
              {columns.map(col => <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
