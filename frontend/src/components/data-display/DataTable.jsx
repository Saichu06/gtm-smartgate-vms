/**
 * DataTable Component
 * Enterprise Data Table with toolbar controls, column rendering, and pagination footer.
 */
import React from 'react';
import EmptyState from '@components/feedback/EmptyState';

const DataTable = ({
  columns = [],
  data = [],
  toolbar,
  pagination,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items to show in this view.',
  onRowClick,
}) => {
  return (
    <div className="table-wrapper">
      {toolbar && <div className="table-toolbar">{toolbar}</div>}
      
      {data.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key || col.header} style={{ width: col.width, textAlign: col.align || 'left' }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                style={onRowClick ? { cursor: 'pointer' } : {}}
              >
                {columns.map((col) => (
                  <td key={col.key || col.header} style={{ textAlign: col.align || 'left' }}>
                    {col.render ? col.render(row, rowIndex) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {pagination && <div className="table-pagination">{pagination}</div>}
    </div>
  );
};

export default DataTable;
