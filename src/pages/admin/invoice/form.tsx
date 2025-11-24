import {  Form, Input, InputNumber, Select, DatePicker, Button, Card, Space, message  } from 'antd'
import React from 'react'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';



const InvoiceForm = () => {
  const navigate = useNavigate();
  // const [form] = Form.useForm();
  return (
    <div className='min-h-screen bg-bg-secondary p-8'>
      <div className='max-w-6xl mx-auto'>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/invoice')}
          className="mb-6"
        >
          Back to Invoice List
        </Button>

        <Card
          title={<h2 className="text-2xl font-bold p-4 mt-[20px] m-0" style={{ color: 'var(--text-primary)' }}></h2>}
          headStyle={{ 
            backgroundColor: 'var(--surface-1)', 
            color: 'var(--text-primary)',
            padding: '16px 24px', 
            margin: '-24px -24px 24px -24px', 
            width: 'calc(100% + 48px)',
            borderRadius: '8px 8px 0 0',
            borderBottom: '1px solid var(--glass-border)'
          }}
          className="shadow-card bg-surface-1 purchase-form-card"
          style={{ boxShadow: 'var(--card-shadow)', overflow: 'hidden', backgroundColor: 'var(--surface-1)', borderColor: 'var(--glass-border)', border: '1px solid var(--glass-border)' }}
          bodyStyle={{ backgroundColor: 'var(--surface-1)' }}
        >
           <Form
            // form={form}
            // layout="vertical"
            // onFinish={onFinish}
            // onFinishFailed={onFinishFailed}
            autoComplete="off"
            className="purchase-form"
          >
            <Form.Item
              label="Supplier"
              name="supplier"
              rules={[{ required: true, message: 'Please enter supplier name' }]}
            >
              <Input placeholder="Enter supplier name" size="large" />
            </Form.Item>
          </Form>
        </Card>
      </div>

    </div>
  )
}

export default InvoiceForm