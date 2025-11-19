import React from 'react';
import { Table as AntTable, Tag, Button, Space, Modal, message } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { deletePurchase, getApiErrorMessage } from './PurcherseService';

interface Purchase {
  id: string;
  supplier: string;
  buyer: string;
  gst: string;
  amount: string;
  quantity: string;
  payment: string;
  dueDate: string;
}

interface TableProps {
  onNavigate: (path: string, data?: any) => void;
  purchases: Purchase[];
  onDelete?: () => void;
}

const Table = ({ onNavigate, purchases, onDelete }: TableProps) => {
  const getPaymentTag = (payment: string) => {
    const colorMap: Record<string, string> = {
      Paid: 'success',
      Pending: 'warning',
      Partial: 'processing',
    };
    return <Tag color={colorMap[payment] || 'default'}>{payment}</Tag>;
  };

  const handleDelete = (record: Purchase) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this purchase?',
      content: `This will permanently delete the purchase for ${record.supplier}.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deletePurchase(record.id);
          message.success('Purchase deleted successfully!');
          if (onDelete) {
            onDelete();
          }
        } catch (error) {
          console.error('Error deleting purchase:', error);
          message.error(getApiErrorMessage(error, 'Failed to delete purchase'));
        }
      },
    });
  };

  const columns: ColumnsType<Purchase> = [
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
      sorter: (a, b) => a.supplier.localeCompare(b.supplier),
    },
    {
      title: 'Buyer',
      dataIndex: 'buyer',
      key: 'buyer',
      sorter: (a, b) => a.buyer.localeCompare(b.buyer),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: string) => `₹${amount}`,
      sorter: (a, b) => parseFloat(a.amount) - parseFloat(b.amount),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a, b) => parseFloat(a.quantity) - parseFloat(b.quantity),
    },
    {
      title: 'Payment',
      dataIndex: 'payment',
      key: 'payment',
      render: (payment: string) => getPaymentTag(payment),
      filters: [
        { text: 'Paid', value: 'Paid' },
        { text: 'Pending', value: 'Pending' },
        { text: 'Partial', value: 'Partial' },
      ],
      onFilter: (value, record) => record.payment === value,
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      sorter: (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => onNavigate('view', record)}
            title="View"
          >
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => onNavigate('form', { ...record, mode: 'edit' })}
            title="Edit"
          >
          
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            title="Delete"
          >
          
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-surface-1 rounded-lg shadow-card overflow-hidden">
      <AntTable
        className="purchase-table"
        columns={columns}
        dataSource={purchases}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} purchases`,
        }}
        locale={{
          emptyText: 'No purchases found. Click Add Purchase to create one.',
        }}
      />
    </div>
  );
};

export default Table;
