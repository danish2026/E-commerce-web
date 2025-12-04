import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, InputNumber, Select, DatePicker, Button, Card, Space, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { createPurchase, getApiErrorMessage, mapPaymentStatusToEnum, updatePurchase } from './PurcherseService';
import { usePurchaseTranslation } from '../../../hooks/usePurchaseTranslation';


const { Option } = Select;

interface PurchaseFormData {
  id?: string;
  supplier: string;
  buyer: string;
  gst: string;
  amount: string;
  quantity: string;
  payment: string;
  dueDate: string;
  mode?: 'add' | 'edit';
}

const FormComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = usePurchaseTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const formData = location.state as PurchaseFormData | null;
  const isEditMode = formData?.mode === 'edit' || (formData?.id && formData?.mode !== 'add');

  // Calculate total amount when quantity, amount, or GST changes
  const calculateTotalAmount = () => {
    const quantity = form.getFieldValue('quantity');
    const amount = form.getFieldValue('amount');
    const gst = form.getFieldValue('gst');
    
    if (quantity && amount && gst !== undefined && gst !== null) {
      const baseAmount = amount * quantity;
      const calculatedTotal = baseAmount * (1 + gst / 100);
      setTotalAmount(calculatedTotal);
      form.setFieldsValue({ totalAmount: calculatedTotal });
    } else {
      setTotalAmount(null);
    }
  };

  useEffect(() => {
    if (formData && isEditMode) {
      const gstValue = formData.gst ? parseFloat(formData.gst) : undefined;
      const amountValue = formData.amount ? parseFloat(formData.amount) : undefined;
      const quantityValue = formData.quantity ? parseFloat(formData.quantity) : undefined;
      
      form.setFieldsValue({
        supplier: formData.supplier,
        buyer: formData.buyer,
        gst: gstValue,
        amount: amountValue,
        quantity: quantityValue,
        payment: formData.payment,
        dueDate: formData.dueDate ? dayjs(formData.dueDate) : null,
      });
      
      // Calculate total for edit mode
      if (quantityValue && amountValue && gstValue !== undefined) {
        const baseAmount = amountValue * quantityValue;
        const calculatedTotal = baseAmount * (1 + gstValue / 100);
        setTotalAmount(calculatedTotal);
        form.setFieldsValue({ totalAmount: calculatedTotal });
      }
    }
  }, [formData, isEditMode, form]);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      
      // Map payment status to enum
      const paymentStatus = mapPaymentStatusToEnum(values.payment);
      
      // Calculate total amount if not already calculated
      const quantity = values.quantity;
      const amount = values.amount;
      const gst = values.gst;
      const baseAmount = amount * quantity;
      const calculatedTotalAmount = baseAmount * (1 + gst / 100);
      
      // Format data for API
      const apiData = {
        supplier: values.supplier,
        buyer: values.buyer,
        gst: values.gst,
        amount: values.amount,
        quantity: values.quantity,
        paymentStatus: paymentStatus,
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : '',
        totalAmount: calculatedTotalAmount,
      };

      if (isEditMode && formData?.id) {
        // Update existing purchase
        await updatePurchase(formData.id, apiData);
        message.success(t.purchaseUpdated);
      } else {
        // Create new purchase
        await createPurchase(apiData);
        message.success(t.purchaseCreated);
      }
      
      navigate('/purchase');
    } catch (error) {
      console.error('Error saving purchase:', error);
      message.error(getApiErrorMessage(error, t.failedToSave));
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
    message.error(t.fillRequiredFields);
  };

  return (
    <div className="min-h-screen bg-bg-secondary p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/purchase')}
          className="mb-6"
        >
          {t.backToPurchaseList}
        </Button>

        <Card
          title={<h2 className="text-2xl font-bold p-4 mt-[20px] m-0" style={{ color: 'var(--text-primary)' }}>{isEditMode ? t.editPurchase : t.addNewPurchase}</h2>}
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
            form={form}
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            className="purchase-form"
          >
            <Form.Item
              label={t.supplierLabel}
              name="supplier"
              rules={[{ required: true, message: t.supplierRequired }]}
            >
              <Input placeholder={t.supplierPlaceholder} size="large" />
            </Form.Item>

            <Form.Item
              label={t.buyerLabel}
              name="buyer"
              rules={[{ required: true, message: t.buyerRequired }]}
            >
              <Input placeholder={t.buyerPlaceholder} size="large" />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={t.quantityLabel}
                name="quantity"
                rules={[
                  { required: true, message: t.quantityRequired },
                  { type: 'number', min: 1, message: t.quantityMin },
                ]}
              >
                <InputNumber
                  placeholder={t.quantityPlaceholder}
                  style={{ width: '100%' }}
                  size="large"
                  min={1}
                  onChange={calculateTotalAmount}
                />
              </Form.Item>

              <Form.Item
                label={t.paymentStatusLabel}
                name="payment"
                rules={[{ required: true, message: t.paymentStatusRequired }]}
              >
                <Select placeholder={t.paymentStatusPlaceholder} size="large">
                  <Option value="Paid">{t.paid}</Option>
                  <Option value="Pending">{t.pending}</Option>
                  <Option value="Partial">{t.partial}</Option>
                </Select>
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label={t.dueDateLabel}
              name="dueDate"
              rules={[{ required: true, message: t.dueDateRequired }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                size="large"
                format="YYYY-MM-DD"
                placeholder={t.dueDatePlaceholder}
              />
            </Form.Item>

            <Form.Item
                label={t.gstLabel}
                name="gst"
                rules={[
                  { required: true, message: t.gstRequired },
                  { type: 'number', min: 0, max: 100, message: t.gstRange },
                ]}
              >
                <InputNumber
                  placeholder={t.gstPlaceholder}
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                  max={100}
                  formatter={(value) => value !== undefined && value !== null ? `${value}%` : ''}
                  parser={(value) => {
                    const cleaned = value?.replace('%', '') || '';
                    const num = cleaned ? parseFloat(cleaned) : undefined;
                    return num as any;
                  }}
                  onChange={calculateTotalAmount}
                />
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={t.amountLabel}
                name="amount"
                rules={[
                  { required: true, message: t.amountRequired },
                  { type: 'number', min: 0, message: t.amountMin },
                ]}
              >
                <InputNumber
                  placeholder={t.amountPlaceholder}
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                  formatter={(value) => value !== undefined && value !== null ? `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                  parser={(value) => {
                    const cleaned = value?.replace(/₹\s?|(,*)/g, '') || '';
                    const num = cleaned ? parseFloat(cleaned) : undefined;
                    return num as any;
                  }}
                  onChange={calculateTotalAmount}
                />
              </Form.Item>

              <Form.Item
                label={t.totalAmountLabel}
                name="totalAmount"
              >
                <InputNumber
                  placeholder={t.totalAmountPlaceholder}
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                  disabled
                  value={totalAmount}
                  formatter={(value) => value !== undefined && value !== null ? `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                  parser={(value) => {
                    const cleaned = value?.replace(/₹\s?|(,*)/g, '') || '';
                    const num = cleaned ? parseFloat(cleaned) : undefined;
                    return num as any;
                  }}
                />
              </Form.Item>
            </div>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  size="large"
                  loading={loading}
                  style={{ 
                    backgroundColor: 'var(--brand)', 
                    borderColor: 'var(--brand)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--brand)';
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--brand)';
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  {isEditMode ? t.updatePurchase : t.createPurchase}
                </Button>
                <Button
                  onClick={() => navigate('/purchase')}
                  size="large"
                >
                  {t.cancel}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default FormComponent;
