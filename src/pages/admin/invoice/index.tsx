import { Button, DatePicker, Input, Space, Spin } from 'antd';
import { Dayjs } from 'dayjs';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Table } from 'lucide-react';


const { RangePicker } = DatePicker;

interface InvoiceDisplay {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  customer: string;
  amount: string;
  status: string;
}

const Invoice = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
   const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  // const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const handleNavigate = (path: string, data?: any) => {
    if (path === 'form') {
      navigate('/invoice/form', { state: data });
    } else if (path === 'view') {
      navigate('/invoice/view', { state: data });
    }
  };


  


  return (
    <div className='min-h-screen bg-bg-secondary p-7'>
      <div className='max-w-7xl mx-auto'>
        <div className='bg-surface-1 rounded-2xl shadow-card p-8 mb-6 border border-[var(--glass-border)]'>
          <Space size="middle" className="w-full" direction="vertical">
            <Space size="middle" className="w-full" wrap>
              <Input placeholder="Search by invoice number or customer name" prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 600, height: '40px' }} allowClear />
              <RangePicker value={dateRange} onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)} format="YYYY-MM-DD" placeholder={['Start Date', 'End Date']} style={{ width: 200, height: '40px' }} />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => handleNavigate('form', { mode: 'add' })} size="large" style={{ height: '40px', width: '200px', backgroundColor: 'var(--brand)', borderColor: 'var(--brand)' }}>Add Invoice</Button>
            </Space>
          </Space>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <Table 
          // onNavigate={handleNavigate} 
          // purchaseItems={filteredPurchaseItems} 
          // onDelete={loadPurchaseItems}
          // pagination={{
          //   current: currentPage,
          //   pageSize: pageSize,
          //   total: total,
          //   // onChange: handlePageChange,
          //   // onShowSizeChange: handlePageSizeChange,
          //   showSizeChanger: true,
          //   showTotal: (total) => `Total ${total} purchase items`,
          // }}
        />
         
          )}
      </div>
    </div>

  )
}

export default Invoice;