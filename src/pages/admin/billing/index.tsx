import { Button, DatePicker, Input, Select, Space, Table } from 'antd';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Billing = () => {
    const { RangePicker } = DatePicker;
    const navigate = useNavigate();

    const handleNavigate = (path: string, data?: any) => {
        if (path === 'form') {
            navigate('/billing/form', { state: data });
        } else if (path === 'view') {
            navigate('/billing/view', { state: data });
        }
    };

  
  return (
    <div className="min-h-screen gap-[30px] bg-bg-secondary p-7">
         <div className="max-w-7xl mx-auto">
        <div className="bg-surface-1 rounded-2xl shadow-card p-8 mb-6 border border-[var(--glass-border)]">
          <Space size="middle" className="w-full" direction="vertical">
            <Space size="middle" className="w-full" wrap>
              <Input
                placeholder="Search by supplier, buyer, amount, or quantity"
                style={{ width: 600, height: '40px' }}
                allowClear
              />
              <RangePicker
                // value={dateRange}
                // onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
                format="YYYY-MM-DD"
                placeholder={['Start Date', 'End Date']}
                style={{ width: 200 ,height: '40px'}}
              />
              <Button
                type="primary"
                // icon={<PlusOutlined />}
                onClick={() => handleNavigate('form', { mode: 'add' })}
                size="large"
                style={{
                  height: '40px',
                  width: '200px',
                  backgroundColor: 'var(--brand)',
                  borderColor: 'var(--brand)',
                }}
              >
                Add Purchase
              </Button>
            </Space>
          </Space>
        </div>

        {/* {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        ) : ( */}
          <Table 
            // onNavigate={handleNavigate} 
            // purchases={filteredPurchases} 
            // onDelete={loadPurchases}
            // pagination={{
            //   current: currentPage,
            //   pageSize: pageSize,
            //   total: total,
            //   onChange: handlePageChange,
            //   onShowSizeChange: handlePageSizeChange,
            //   showSizeChanger: true,
            //   showTotal: (total) => `Total ${total} purchases`,
            // }}
          />
        {/* )} */}
      </div>
    </div>
  )
}

export default Billing