import React from 'react';
import { Table as AntTable, Tag, Button, Space } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

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
}

const Table = ({ onNavigate, purchases }: TableProps) => {
  const getPaymentTag = (payment: string) => {
    const colorMap: Record<string, string> = {
      Paid: 'success',
      Pending: 'warning',
      Partial: 'processing',
    };
    return <Tag color={colorMap[payment] || 'default'}>{payment}</Tag>;
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
            icon={<DeleteOutlined />}
            onClick={() => onNavigate('form', { ...record, mode: 'edit' })}
            title="Delete"
          >
          
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <AntTable
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
