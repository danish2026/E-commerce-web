import React, { useState } from 'react';
import { Tag, Button, Space, message } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(advancedFormat);

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  customer: string;
  amount: string;
  status: string;
}

interface TableProps {
  onNavigate: (path: string, data?: any) => void;
  invoices: Invoice[];
  onDelete?: () => void;
  pagination?: TablePaginationConfig;
}

const PAGE_SIZE_OPTIONS = [5,10, 20, 50];


const Table = ({ onNavigate, invoices, onDelete, pagination }: TableProps) => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 640 : false);
  const [isTablet, setIsTablet] = useState(typeof window !== 'undefined' ? window.innerWidth <= 1024 : false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Invoice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

 
  
  const PAGE_SIZE_OPTIONS = [5,10, 20, 50];
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
      setIsTablet(window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDelete = (record: Invoice) => {
    if (!record.id) {
      message.error('Invalid invoice ID');
      return;
    }
    setItemToDelete(record);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete || !itemToDelete.id) {
      message.error('Invalid invoice ID');
      return;
    }
  };
  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };
// setIsDeleting(true);
// try {
//   console.log('Deleting invoice with ID:', itemToDelete.id);
//   await deleteInvoice(itemToDelete.id);
//   message.success('Invoice deleted successfully!');
//   setDeleteModalVisible(false);
//   setItemToDelete(null);
//   if (onDelete) {
//     onDelete();
//   }


  return (
    <div>

    </div>
  )
}

export default Table