import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  MoreHorizontal, Eye, Edit3, PauseCircle, PlayCircle,
  ExternalLink, Trash2, Download, UserPlus, X
} from 'lucide-react';

const ActionDropdown = ({
  organization,
  onView,
  onEdit,
  onSuspend,
  onActivate,
  onDelete,
  onCreateAdmin,
  onExport,
}) => {
  const [open, setOpen] = useState(false);

  const isSuspended = organization?.status === 'Suspended';
  const hasData = (organization?.totalVisitors || 0) > 0;

  const handleAction = (fn) => {
    setOpen(false);
    fn && fn(organization);
  };

  return (
    <>
      <button
        className="icon-btn"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        title="More actions"
        aria-label="More actions"
      >
        <MoreHorizontal size={15} />
      </button>

      {open &&
        ReactDOM.createPortal(
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(2px)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '340px',
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                animation: 'fadeIn 0.15s ease-out',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#F8FAFC',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>
                    {organization?.name || 'Organization Actions'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Code: {organization?.code || 'ORG'}</div>
                </div>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748B',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                  }}
                  onClick={() => setOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ padding: '8px' }}>
                <button
                  className="btn btn-ghost w-100 justify-content-start text-dark mb-1 py-2"
                  style={{ fontSize: '13px' }}
                  onClick={() => handleAction(onView)}
                >
                  <Eye size={15} className="text-primary me-2" /> View Organization Details
                </button>

                <button
                  className="btn btn-ghost w-100 justify-content-start text-dark mb-1 py-2"
                  style={{ fontSize: '13px' }}
                  onClick={() => handleAction(onEdit)}
                >
                  <Edit3 size={15} className="text-primary me-2" /> Edit Organization Configuration
                </button>

                <button
                  className="btn btn-ghost w-100 justify-content-start text-dark mb-1 py-2"
                  style={{ fontSize: '13px' }}
                  onClick={() => handleAction(onCreateAdmin)}
                >
                  <UserPlus size={15} className="text-info me-2" /> Provision Corporate Admin
                </button>

                <button
                  className="btn btn-ghost w-100 justify-content-start text-dark mb-1 py-2"
                  style={{ fontSize: '13px' }}
                  onClick={() => handleAction(onExport)}
                >
                  <Download size={15} className="text-secondary me-2" /> Export Audit & Master Data
                </button>

                <hr style={{ margin: '6px 0', borderColor: '#F1F5F9' }} />

                {isSuspended ? (
                  <button
                    className="btn btn-ghost w-100 justify-content-start text-success mb-1 py-2"
                    style={{ fontSize: '13px' }}
                    onClick={() => handleAction(onActivate)}
                  >
                    <PlayCircle size={15} className="me-2" /> Activate Organization Access
                  </button>
                ) : (
                  <button
                    className="btn btn-ghost w-100 justify-content-start text-warning mb-1 py-2"
                    style={{ fontSize: '13px' }}
                    onClick={() => handleAction(onSuspend)}
                  >
                    <PauseCircle size={15} className="me-2" /> Suspend Organization Access
                  </button>
                )}

                <button
                  className="btn btn-ghost w-100 justify-content-start text-danger py-2"
                  style={{ fontSize: '13px', opacity: hasData ? 0.5 : 1, cursor: hasData ? 'not-allowed' : 'pointer' }}
                  onClick={() => handleAction(onDelete)}
                  disabled={hasData}
                >
                  <Trash2 size={15} className="me-2" /> Delete Organization Record
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};


export default ActionDropdown;
