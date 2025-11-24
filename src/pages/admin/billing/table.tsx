import { Table, Button, Modal, Space, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';
import { EyeOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { PurchaseItem, deletePurchaseItem } from './api';

interface TableProps {
  data: PurchaseItem[];
  loading?: boolean;
  onNavigate?: (path: string, data?: any) => void;
  onDelete?: () => void;
  pagination?: any;
}

const PurchaseItemTable: React.FC<TableProps> = ({ 
  data, 
  loading = false, 
  onNavigate,
  onDelete,
  pagination 
}) => {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<PurchaseItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (item: PurchaseItem) => {
    setItemToDelete(item);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete?.id) return;

    try {
      setIsDeleting(true);
      await deletePurchaseItem(itemToDelete.id);
      message.success('Purchase item deleted successfully');
      setDeleteModalVisible(false);
      setItemToDelete(null);
      if (onDelete) {
        onDelete();
      }
    } catch (error: any) {
      console.error('Error deleting purchase item:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete purchase item';
      message.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };

  const columns: ColumnsType<PurchaseItem> = [
    {
      title: 'Item',
      dataIndex: 'item',
      key: 'item',
      render: (text: string) => <span style={{ color: 'var(--text-primary)' }}>{text}</span>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <span style={{ color: 'var(--text-secondary)' }}>
          {text || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>No description</span>}
        </span>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      render: (quantity: number) => (
        <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
          {quantity}
        </Tag>
      ),
    },
    {
      title: 'Unit Price',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (price: number) => (
        <span style={{ color: 'var(--text-primary)' }}>
          ₹ {price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      render: (total: number) => (
        <span style={{ fontWeight: 'bold', color: 'var(--brand)' }}>
          ₹ {total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (_: any, record: PurchaseItem) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => onNavigate?.('view', record)}
            style={{ color: 'var(--brand)' }}
          >
            View
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onNavigate?.('form', { ...record, mode: 'edit' })}
            style={{ color: 'var(--brand)' }}
          >
            Edit
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={pagination}
        className="bg-surface-1"
        style={{ backgroundColor: 'var(--surface-1)' }}
      />

      <Modal
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={cancelDelete}
        confirmLoading={isDeleting}
        okText="Delete"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
        title={
          <div className="flex items-center gap-3">
            <ExclamationCircleOutlined className="text-red-600 text-xl" />
            <span>Delete Purchase Item</span>
          </div>
        }
      >
        <p>Are you sure you want to delete the purchase item <strong>"{itemToDelete?.item}"</strong>?</p>
        <p className="text-sm text-[var(--text-secondary)] mt-2">This action cannot be undone.</p>
      </Modal>
    </>
  );
};

export default PurchaseItemTable;
