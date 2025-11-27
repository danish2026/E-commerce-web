import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Card, Space, message, Select, Divider } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { createEmployee, getApiErrorMessage, updateEmployee, getRoles, Employee } from './api';

const { Option } = Select;

interface EmployeeFormData {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  permissionsRoleId?: string;
  permissionsRoleName?: string;
  password?: string;
  confirmPassword?: string;
  mode?: 'add' | 'edit';
}

const FormComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<{ id: string; name: string; description?: string }[]>([]);
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

  // Map enum value back to role name for the form
  const mapEnumToRoleName = (enumValue: string): string => {
    if (!enumValue) return '';
    
    // Find matching role by name (case-insensitive)
    const matchingRole = roles.find(
      (role) => role.name.toUpperCase().replace(/\s+/g, '_') === enumValue.toUpperCase()
    );
    
    if (matchingRole) {
      return matchingRole.name;
    }
    
    // Fallback: try to find by common mappings
    const enumToNameMap: { [key: string]: string } = {
      'SUPER_ADMIN': 'Super Admin',
      'SALES_MANAGER': 'Sales Manager',
      'SALES_MAN': 'Sales Man',
    };
    
    return enumToNameMap[enumValue.toUpperCase()] || enumValue;
  };

  useEffect(() => {
    if (formData && isEditMode && roles.length > 0) {
      const existingRoleId =
        formData.permissionsRoleId ||
        roles.find(
          (role) =>
            role.name.toUpperCase().replace(/\s+/g, '_') === formData.role.toUpperCase(),
        )?.id;
      const roleName = formData.permissionsRoleName || mapEnumToRoleName(formData.role);
      form.setFieldsValue({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        permissionsRoleId: existingRoleId,
        permissionsRoleName: roleName,
      });
    }
  }, [formData, isEditMode, form, roles]);

  // Map role name from permissions module to Role enum value
  const mapRoleToEnum = (roleName: string): string => {
    if (!roleName) {
      console.warn('No role name provided, defaulting to SALES_MAN');
      return 'SALES_MAN';
    }
    
    // Normalize the role name: trim, uppercase and replace spaces with underscores
    const normalized = roleName.trim().toUpperCase().replace(/\s+/g, '_').replace(/-/g, '_');
    
    // Valid enum values
    const validRoles = ['SUPER_ADMIN', 'SALES_MANAGER', 'SALES_MAN'];
    
    // Check if normalized value matches a valid enum exactly
    if (validRoles.includes(normalized)) {
      return normalized;
    }
    
    // Try to match common variations and partial matches
    const roleMap: { [key: string]: string } = {
      'ADMIN': 'SUPER_ADMIN',
      'SUPERADMIN': 'SUPER_ADMIN',
      'SUPER ADMIN': 'SUPER_ADMIN',
      'MANAGER': 'SALES_MANAGER',
      'SALESMANAGER': 'SALES_MANAGER',
      'SALES MANAGER': 'SALES_MANAGER',
      'SALESMAN': 'SALES_MAN',
      'SALES MAN': 'SALES_MAN',
      'SALES': 'SALES_MAN',
    };
    
    // Check direct mapping
    if (roleMap[normalized]) {
      return roleMap[normalized];
    }
    
    // Try partial matching
    if (normalized.includes('ADMIN') || normalized.includes('SUPER')) {
      return 'SUPER_ADMIN';
    }
    if (normalized.includes('MANAGER')) {
      return 'SALES_MANAGER';
    }
    if (normalized.includes('SALES') || normalized.includes('MAN')) {
      return 'SALES_MAN';
    }
    
    // Default fallback
    return 'SALES_MAN';
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      // Validate password match for create mode
      if (!isEditMode && values.password !== values.confirmPassword) {
        message.error('Passwords do not match');
        return;
      }

      const selectedRole =
        roles.find((role) => role.id === values.permissionsRoleId) ||
        roles.find((role) => role.name === values.permissionsRoleName);
      if (!selectedRole?.id) {
        message.error('Please select a valid role');
        return;
      }

      const roleName = selectedRole.name || values.permissionsRoleName || values.role;
      const roleEnumValue = mapRoleToEnum(roleName);

      if (isEditMode && formData?.id) {
        // Update existing employee
        const updateData: any = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          role: roleEnumValue,
          permissionsRoleId: selectedRole.id,
          permissionsRoleName: roleName,
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
          role: roleEnumValue,
          permissionsRoleId: selectedRole.id,
          permissionsRoleName: roleName,
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
    <div className="min-h-screen bg-bg-secondary p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/employees')}
          className="mb-6"
        >
          Back to Employees List
        </Button>

        <Card
          title={<h2 className="text-2xl font-bold p-4 mt-[20px] m-0" style={{ color: 'var(--text-primary)' }}>
            {isEditMode ? 'Edit Employee' : 'Create New Employee'}
          </h2>}
          headStyle={{ 
            backgroundColor: 'var(--surface-1)', 
            color: 'var(--text-primary)',
            padding: '16px 24px', 
            margin: '-24px -24px 24px -24px', 
            width: 'calc(100% + 48px)',
            borderRadius: '8px 8px 0 0',
            borderBottom: '1px solid var(--glass-border)'
          }}
          className="shadow-card bg-surface-1"
          style={{ boxShadow: 'var(--card-shadow)', overflow: 'hidden', backgroundColor: 'var(--surface-1)', borderColor: 'var(--glass-border)', border: '1px solid var(--glass-border)' }}
          bodyStyle={{ backgroundColor: 'var(--surface-1)' }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            {/* Personal Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label="First Name"
                  name="firstName"
                  rules={[{ required: true, message: 'Please enter first name' }]}
                >
                  <Input placeholder="Enter first name" size="large" />
                </Form.Item>

                <Form.Item
                  label="Last Name"
                  name="lastName"
                  rules={[{ required: true, message: 'Please enter last name' }]}
                >
                  <Input placeholder="Enter last name" size="large" />
                </Form.Item>
              </div>
            </div>

            <Divider className="my-6" />

            {/* Contact Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter a valid email' },
                  ]}
                >
                  <Input placeholder="Enter email" type="email" size="large" />
                </Form.Item>

                <Form.Item
                  label="Phone"
                  name="phone"
                  rules={[
                    { pattern: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, message: 'Please enter a valid phone number' }
                  ]}
                >
                  <Input placeholder="Enter phone number" size="large" />
                </Form.Item>
              </div>
            </div>

            <Divider className="my-6" />

            {/* Role Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Role & Access
              </h3>
              <Form.Item
                label="Role"
                name="permissionsRoleId"
                rules={[{ required: true, message: 'Please select a role' }]}
              >
                <Select
                  placeholder="Select a role"
                  loading={rolesLoading}
                  showSearch
                  size="large"
                  optionFilterProp="children"
                  onChange={(value: string) => {
                    const selected = roles.find((role) => role.id === value);
                    form.setFieldsValue({
                      permissionsRoleId: value,
                      permissionsRoleName: selected?.name,
                    });
                  }}
                >
                  {roles.map((role) => (
                    <Option key={role.id} value={role.id}>
                      {role.name}
                      {role.description && ` - ${role.description}`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="permissionsRoleName" hidden>
                <Input type="hidden" />
              </Form.Item>
            </div>

            <Divider className="my-6" />

            {/* Password Section */}
            {!isEditMode && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Password
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[
                      { required: true, message: 'Please enter password' },
                      { min: 6, message: 'Password must be at least 6 characters' },
                    ]}
                  >
                    <Input.Password placeholder="Enter password" size="large" />
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
                    <Input.Password placeholder="Confirm password" size="large" />
                  </Form.Item>
                </div>
              </div>
            )}

            {isEditMode && (
              <>
                <Divider className="my-6" />
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Change Password (Optional)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                      label="New Password"
                      name="password"
                      rules={[
                        { min: 6, message: 'Password must be at least 6 characters' },
                      ]}
                    >
                      <Input.Password placeholder="Enter new password (leave blank to keep current)" size="large" />
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
                      <Input.Password placeholder="Confirm new password" size="large" />
                    </Form.Item>
                  </div>
                </div>
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
                  style={{ 
                    backgroundColor: 'var(--brand)', 
                    borderColor: 'var(--brand)',
                  }}
                >
                  {isEditMode ? 'Update Employee' : 'Create Employee'}
                </Button>
                <Button
                  onClick={() => navigate('/employees')}
                  size="large"
                >
                  Cancel
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
