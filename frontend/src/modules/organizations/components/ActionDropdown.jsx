/**
 * ActionDropdown — 3-dot contextual action menu for organization rows.
 * Actions: View, Edit, Suspend, Activate, View Details, Delete, Export.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  MoreHorizontal, Eye, Edit3, PauseCircle, PlayCircle,
  ExternalLink, Trash2, Download, UserPlus,
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
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isSuspended = organization?.status === 'Suspended';
  const hasData = (organization?.totalVisitors || 0) > 0;

  const handleAction = (fn) => {
    setOpen(false);
    fn && fn(organization);
  };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="icon-btn"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        title="More actions"
        aria-label="More actions"
      >
        <MoreHorizontal size={15} />
      </button>

      {open && (
        <div className="action-dropdown-menu" onClick={(e) => e.stopPropagation()}>
          <button className="action-dropdown-item" onClick={() => handleAction(onView)}>
            <Eye size={14} /> View Details
          </button>
          <button className="action-dropdown-item" onClick={() => handleAction(onEdit)}>
            <Edit3 size={14} /> Edit Organization
          </button>
          <button className="action-dropdown-item" onClick={() => handleAction(onCreateAdmin)}>
            <UserPlus size={14} /> Create Corporate Admin
          </button>
          <div className="action-dropdown-divider" />
          {isSuspended ? (
            <button className="action-dropdown-item text-success" onClick={() => handleAction(onActivate)}>
              <PlayCircle size={14} /> Activate
            </button>
          ) : (
            <button className="action-dropdown-item text-warning" onClick={() => handleAction(onSuspend)}>
              <PauseCircle size={14} /> Suspend
            </button>
          )}
          <button className="action-dropdown-item" onClick={() => handleAction(onExport)}>
            <Download size={14} /> Export Data
          </button>
          <div className="action-dropdown-divider" />
          <button
            className="action-dropdown-item text-danger"
            onClick={() => handleAction(onDelete)}
            disabled={hasData}
            title={hasData ? 'Cannot delete — organization contains visitor data' : ''}
            style={{ opacity: hasData ? 0.4 : 1, cursor: hasData ? 'not-allowed' : 'pointer' }}
          >
            <Trash2 size={14} /> Delete Organization
          </button>
        </div>
      )}
    </div>
  );
};

export default ActionDropdown;
