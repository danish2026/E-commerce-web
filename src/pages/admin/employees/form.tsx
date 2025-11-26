import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Card, Space, message, Select } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { createEmployee, getApiErrorMessage, updateEmployee, getRoles } from './EmployeeService';

const { Option } = Select;

interface EmployeeFormData {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  password?: string;
  confirmPassword?: string;
  mode?: 'add' | 'edit';
}

interface Role {
  id: string;
  name: string;
  description?: string;
}

const FormComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const formData = location.state as EmployeeFormData | null;
  const isEditMode = formData?.mode === 'edit' || (formData?.id && formData?.mode !== 'add');

  // Fetch roles from permissions API
  useEffect(() => {
    const loadRoles = async () => {
      try {
        setRolesLoading(true);
        const data = await getRoles();
        setRoles(data);
      } catch (error) {
        console.error('Error fetching roles:', error);
        message.error(getApiErrorMessage(error, 'Failed to load roles'));
      } finally {
        setRolesLoading(false);
      }
    };
    loadRoles();
  }, []);

  useEffect(() => {
    if (formData && isEditMode) {
      form.setFieldsValue({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role, // This should be the roleName
      });
    }
  }, [formData, isEditMode, form]);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      // Validate password match for create mode
      if (!isEditMode && values.password !== values.confirmPassword) {
        message.error('Passwords do not match');
        return;
      }

      if (isEditMode && formData?.id) {
        // Update existing employee
        const updateData: any = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          role: 'SUPER_ADMIN', // Default enum value
          roleName: values.role, // Store the role name from permissions module
        };

        // Only include password if it's provided
        if (values.password) {
          if (values.password !== values.confirmPassword) {
            message.error('Passwords do not match');
            return;
          }
          updateData.password = values.password;
        }

        await updateEmployee(formData.id, updateData);
        message.success('Employee updated successfully!');
      } else {
        // Create new employee
        await createEmployee({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          role: values.role,
          password: values.password,
          confirmPassword: values.confirmPassword,
        });
        message.success('Employee created successfully!');
      }

      navigate('/employees');
    } catch (error: any) {
      console.error('Error saving employee:', error);
      message.error(getApiErrorMessage(error, 'Failed to save employee'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/employees')}
            className="mb-4"
          >
            Back to Employees
          </Button>
          <h1 className="text-2xl font-semibold text-text-primary">
            {isEditMode ? 'Edit Employee' : 'Add Employee'}
          </h1>
          <p className="text-text-secondary mt-1">
            {isEditMode ? 'Update employee information' : 'Create a new employee'}
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          className="max-w-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[{ required: true, message: 'Please enter first name' }]}
            >
              <Input placeholder="Enter first name" />
            </Form.Item>

            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[{ required: true, message: 'Please enter last name' }]}
            >
              <Input placeholder="Enter last name" />
            </Form.Item>
          </div>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select
              placeholder="Select a role"
              loading={rolesLoading}
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {roles.map((role) => (
                <Option key={role.id} value={role.name}>
                  {role.name}
                  {role.description && ` - ${role.description}`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="Enter email" type="email" />
          </Form.Item>

          <Form.Item
            label="Phone"
            name="phone"
            rules={[
              { pattern: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, message: 'Please enter a valid phone number' }
            ]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>

          {!isEditMode && (
            <>
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: 'Please enter password' },
                  { min: 6, message: 'Password must be at least 6 characters' },
                ]}
              >
                <Input.Password placeholder="Enter password" />
              </Form.Item>

              <Form.Item
                label="Confirm Password"
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Please confirm password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm password" />
              </Form.Item>
            </>
          )}

          {isEditMode && (
            <>
              <Form.Item
                label="New Password (optional)"
                name="password"
                rules={[
                  { min: 6, message: 'Password must be at least 6 characters' },
                ]}
              >
                <Input.Password placeholder="Enter new password (leave blank to keep current)" />
              </Form.Item>

              <Form.Item
                label="Confirm New Password"
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const password = getFieldValue('password');
                      if (!password || !value) {
                        return Promise.resolve();
                      }
                      if (password === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm new password" />
              </Form.Item>
            </>
          )}

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                size="large"
              >
                {isEditMode ? 'Update Employee' : 'Create Employee'}
              </Button>
              <Button onClick={() => navigate('/employees')} size="large">
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default FormComponent;

