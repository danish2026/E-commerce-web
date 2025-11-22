import { TableProps } from 'antd';
import React, { useState } from 'react'
import { EyeOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { fetchBilling } from './api';

const Table = ({}:TableProps) => {
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 640 : false);
    const [isTablet, setIsTablet] = useState(typeof window !== 'undefined' ? window.innerWidth <= 1024 : false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<any | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
  return (
    <div
    className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70'>
      <div 
          className="bg-[var(--surface-1)] rounded-lg shadow-xl max-w-md w-full mx-4 border border-[var(--glass-border)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <ExclamationCircleOutlined className="text-red-600 dark:text-red-400 text-xl" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  Delete Purchase
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Are you sure you want to delete this purchase?
                </p>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}

export default Table