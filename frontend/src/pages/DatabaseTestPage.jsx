/**
 * DatabaseTestPage — Development Database Inspection Interface
 * Route: /dev/database
 * Direct visual inspection of Express API → PostgreSQL connection & all 24 smartgate schema tables.
 */
import React, { useState, useEffect } from 'react';
import { Database, Table, RefreshCw, CheckCircle2, AlertTriangle, Layers, Key, Hash, FileText } from 'lucide-react';
import AppLayout from '@layouts/AppLayout';
import Card from '@components/data-display/Card';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';

const DatabaseTestPage = () => {
  const [dbData, setDbData] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableDetails, setTableDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDatabaseInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/test/database');
      const data = await res.json();
      if (res.ok && data.connected) {
        setDbData(data);
        if (data.tables && data.tables.length > 0 && !selectedTable) {
          fetchTableDetails(data.tables[0].name);
        }
      } else {
        setError(data.error || 'Failed to connect to PostgreSQL database.');
      }
    } catch (err) {
      setError('Unable to reach Express backend test API endpoint.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTableDetails = async (tableName) => {
    setSelectedTable(tableName);
    setTableLoading(true);
    try {
      const res = await fetch(`/api/test/database/${tableName}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setTableDetails(data);
      } else {
        setTableDetails(null);
      }
    } catch (err) {
      setTableDetails(null);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseInfo();
  }, []);

  return (
    <AppLayout
      title="PostgreSQL Schema & Table Inspector"
      subtitle="Development test interface for verifying Express API → PostgreSQL gtm_smartgate_demo integration"
      actions={
        <Button variant="secondary" size="sm" onClick={fetchDatabaseInfo} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Metadata
        </Button>
      }
    >
      {/* Connection Header Card */}
      <Card className="mb-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-lg)',
                background: error ? '#FFEBEE' : '#E8F5E9',
                color: error ? '#D32F2F' : '#2E7D32',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Database size={24} />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h4 className="fw-bold mb-0 text-dark">
                  DATABASE: {dbData?.database || 'gtm_smartgate_demo'}
                </h4>
                <Badge variant={error ? 'danger' : 'success'}>
                  {error ? 'DISCONNECTED' : 'CONNECTED'}
                </Badge>
              </div>
              <div className="text-secondary small mt-1">
                Schema: <code>{dbData?.schema || 'smartgate'}</code> • Total Tables:{' '}
                <strong>{dbData?.totalTables || 0} / 24</strong> • Environment: <code>development</code>
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-light text-dark border p-2 small">
              Host: localhost:5432
            </span>
          </div>
        </div>
      </Card>

      {error ? (
        <div className="alert alert-danger p-3 mb-4" role="alert">
          <div className="fw-bold mb-1"><AlertTriangle size={18} className="me-2" /> Database Connection Error</div>
          <div>{error}</div>
        </div>
      ) : null}

      <div className="row g-4">
        {/* Left Sidebar: 24 Tables Navigation List */}
        <div className="col-12 col-lg-4 col-xl-3">
          <Card title="Schema Tables (24)" subtitle="Click to inspect columns & sample rows">
            {loading ? (
              <div className="p-4 text-center text-muted">Loading table metadata...</div>
            ) : (
              <div className="d-flex flex-column gap-1" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {dbData?.tables?.map((tbl) => (
                  <button
                    key={tbl.name}
                    type="button"
                    onClick={() => fetchTableDetails(tbl.name)}
                    className={`btn text-start d-flex align-items-center justify-content-between p-2 rounded-2 ${
                      selectedTable === tbl.name ? 'btn-primary text-white' : 'btn-light border-0 text-dark'
                    }`}
                  >
                    <div className="d-flex align-items-center gap-2 text-truncate me-2">
                      <Table size={16} />
                      <span className="fw-semibold small text-truncate">{tbl.name}</span>
                    </div>
                    <span
                      className={`badge rounded-pill ${
                        selectedTable === tbl.name ? 'bg-white text-primary' : 'bg-secondary text-white'
                      }`}
                      style={{ fontSize: '10px' }}
                    >
                      {tbl.rowCount} rows
                    </span>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Content Area: Columns & Sample Data Inspector */}
        <div className="col-12 col-lg-8 col-xl-9">
          {tableLoading ? (
            <Card>
              <div className="p-5 text-center text-muted">Loading table columns and sample data...</div>
            </Card>
          ) : tableDetails ? (
            <div className="d-flex flex-column gap-4">
              {/* Table Column Schema Definition */}
              <Card
                title={`Table: smartgate.${tableDetails.table}`}
                subtitle={`Total Rows: ${tableDetails.rowCount} • Columns: ${tableDetails.columns?.length || 0}`}
              >
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Column Name</th>
                        <th>Data Type</th>
                        <th>Nullable</th>
                        <th>Primary Key</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableDetails.columns?.map((col, idx) => (
                        <tr key={col.name}>
                          <td className="text-muted">{idx + 1}</td>
                          <td className="fw-bold text-dark">
                            <code>{col.name}</code>
                          </td>
                          <td>
                            <Badge variant="info">{col.type}</Badge>
                          </td>
                          <td>
                            <span className={`badge ${col.nullable ? 'bg-light text-dark border' : 'bg-warning text-dark'}`}>
                              {col.nullable ? 'NULL' : 'NOT NULL'}
                            </span>
                          </td>
                          <td>
                            {col.primaryKey ? (
                              <span className="badge bg-primary text-white">
                                <Key size={10} className="me-1" /> PRIMARY KEY
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Sample Rows Data Preview */}
              <Card title={`Sample Rows (First ${tableDetails.sampleRows?.length || 0})`}>
                {tableDetails.sampleRows?.length > 0 ? (
                  <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table className="table table-striped table-bordered align-middle mb-0" style={{ fontSize: '12px' }}>
                      <thead className="table-dark">
                        <tr>
                          {tableDetails.columns?.map((col) => (
                            <th key={col.name} className="text-nowrap">{col.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableDetails.sampleRows.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {tableDetails.columns?.map((col) => (
                              <td key={col.name} className="text-nowrap">
                                {row[col.name] !== null && row[col.name] !== undefined ? (
                                  typeof row[col.name] === 'object' ? (
                                    JSON.stringify(row[col.name])
                                  ) : (
                                    String(row[col.name])
                                  )
                                ) : (
                                  <span className="text-muted fst-italic">NULL</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted">No records found in this table.</div>
                )}
              </Card>
            </div>
          ) : (
            <Card>
              <div className="p-5 text-center text-muted">Select a table from the left list to inspect columns and sample rows.</div>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default DatabaseTestPage;
