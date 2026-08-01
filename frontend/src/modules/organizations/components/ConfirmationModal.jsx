/**
 * ConfirmationModal — Reusable confirmation dialog for destructive actions.
 * Used for Suspend, Activate, Delete operations on organizations.
 */
import React from 'react';
import { AlertTriangle, Trash2, PauseCircle, PlayCircle } from 'lucide-react';
import Modal from '@components/navigation/Modal';

const VARIANTS = {
  delete: {
    icon: Trash2,
    iconColor: '#D32F2F',
    iconBg: '#FEF2F2',
    confirmVariant: 'danger',
    title: 'Delete Organization',
    description: 'This action cannot be undone. All data associated with this organization will be permanently removed.',
  },
  suspend: {
    icon: PauseCircle,
    iconColor: '#ED6C02',
    iconBg: '#FFF7ED',
    confirmVariant: 'danger',
    title: 'Suspend Organization',
    description: 'This organization will be suspended. All users will lose access immediately. You can reactivate it at any time.',
  },
  activate: {
    icon: PlayCircle,
    iconColor: '#2E7D32',
    iconBg: '#F0FDF4',
    confirmVariant: 'primary',
    title: 'Activate Organization',
    description: 'This will restore full access to the organization and all its users.',
  },
};

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  type = 'delete',
  organizationName,
  loading = false,
}) => {
  const config = VARIANTS[type] || VARIANTS.delete;
  const Icon = config.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      confirmText={`Yes, ${type.charAt(0).toUpperCase() + type.slice(1)}`}
      cancelText="Cancel"
      confirmVariant={config.confirmVariant}
      loading={loading}
      title={config.title}
    >
      <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-lg)',
            background: config.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={22} color={config.iconColor} />
        </div>
        <div>
          <div style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-md)', marginBottom: 6 }}>
            {organizationName}
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            {config.description}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
