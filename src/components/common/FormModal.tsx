import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Form, message } from 'antd';
import { Modal as CustomModal } from '../ui/Modal';

const { TextArea } = Input;

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'password';
  required?: boolean;
  placeholder?: string;
  rules?: any[];
}

interface FormModalProps {
  open: boolean;
  title: string;
  fields: FormField[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => Promise<void>;
  onCancel: () => void;
  submitButtonText?: string;
  loading?: boolean;
}

export const FormModal: React.FC<FormModalProps> = ({
  open,
  title,
  fields,
  initialValues,
  onSubmit,
  onCancel,
  submitButtonText = 'Submit',
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue(initialValues);
    } else if (open) {
      form.resetFields();
    }
  }, [open, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);
      await onSubmit(values);
      form.resetFields();
      setIsSubmitting(false);
    } catch (error: any) {
      if (error.errorFields) {
        // Validation errors are handled by form
        return;
      }
      console.error('Form submission error:', error);
      message.error('Failed to submit form');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const renderField = (field: FormField) => {
    const rules = [
      ...(field.rules || []),
      ...(field.required
        ? [{ required: true, message: `${field.label} is required` }]
        : []),
    ];

    if (field.type === 'textarea') {
      return (
        <Form.Item
          key={field.name}
          name={field.name}
          label={field.label}
          rules={rules}
        >
          <TextArea
            rows={4}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className="resize-none"
          />
        </Form.Item>
      );
    }

    return (
      <Form.Item
        key={field.name}
        name={field.name}
        label={field.label}
        rules={rules}
      >
        <Input
          type={field.type}
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
        />
      </Form.Item>
    );
  };

  return (
    <CustomModal
      open={open}
      title={title}
      onClose={handleCancel}
      actions={
        <>
          <Button onClick={handleCancel} disabled={isSubmitting || loading}>
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={isSubmitting || loading}
            style={{
              backgroundColor: 'var(--brand)',
              borderColor: 'var(--brand)',
            }}
          >
            {submitButtonText}
          </Button>
        </>
      }
    >
      <Form
        form={form}
        layout="vertical"
        className="space-y-4"
      >
        {fields.map((field) => renderField(field))}
      </Form>
    </CustomModal>
  );
};


