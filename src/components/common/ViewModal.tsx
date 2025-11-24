import React from 'react';
import { Modal as CustomModal } from '../ui/Modal';
import { Button } from 'antd';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(advancedFormat);

export interface ViewField {
  label: string;
  value: any;
  render?: (value: any) => React.ReactNode;
}

interface ViewModalProps {
  open: boolean;
  title: string;
  fields: ViewField[];
  onClose: () => void;
}

const formatDate = (dateString?: string | null): string => {
  if (!dateString) return '-';
  try {
    return dayjs(dateString).format('MMM Do, YYYY; hh:mm A');
  } catch {
    return '-';
  }
};

const formatValue = (value: any): string => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
};

export const ViewModal: React.FC<ViewModalProps> = ({
  open,
  title,
  fields,
  onClose,
}) => {
  return (
    <CustomModal
      open={open}
      title={title}
      onClose={onClose}
      actions={
        <Button
          type="primary"
          onClick={onClose}
          style={{
            backgroundColor: 'var(--brand)',
            borderColor: 'var(--brand)',
          }}
        >
          Close
        </Button>
      }
    >
      <div className="space-y-4">
        {fields.map((field, index) => {
          const displayValue = field.render
            ? field.render(field.value)
            : formatValue(field.value);

          return (
            <div
              key={index}
              className="flex flex-col gap-1 pb-4 border-b border-[var(--glass-border)] last:border-b-0"
            >
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                {field.label}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                {displayValue}
              </div>
            </div>
          );
        })}
      </div>
    </CustomModal>
  );
};

// Helper function to create date field
export const createDateField = (label: string, value: string | null | undefined): ViewField => ({
  label,
  value,
  render: formatDate,
});

// Helper function to create text field
export const createTextField = (label: string, value: any): ViewField => ({
  label,
  value,
});

