import {  Space, Spin, Select, Modal, Form, message, Checkbox } from 'antd';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { PlusOutlined, UserAddOutlined, SafetyOutlined } from '@ant-design/icons';
import { fetchPermissions, Permission, fetchModules, fetchRoles, createRole, createRolePermission, bulkCreatePermissions, Role } from './api';
import Table from './table';

const { Option } = Select;

const Permissions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [searchText, setSearchText] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('');
  const [modules, setModules] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  
  // Modal states
  const [addRoleModalVisible, setAddRoleModalVisible] = useState(false);
  const [addRolePermissionModalVisible, setAddRolePermissionModalVisible] = useState(false);
  const [createPermissionModalVisible, setCreatePermissionModalVisible] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  
  // Form instances
  const [addRoleForm] = Form.useForm();
  const [addRolePermissionForm] = Form.useForm();
  const [createPermissionForm] = Form.useForm();

  // Standard actions for permissions
  const STANDARD_ACTIONS = ['create', 'view', 'edit', 'delete'];

  // Available modules in the system
  const AVAILABLE_MODULES = [
    'users',
    'products',
    'categories',
    'purchase',
    'purchase-item',
    'sales',
    'order-item',
    'invoice',
    'billing',
  ];

  // Get all unique modules
  const allModules = Array.from(new Set([...AVAILABLE_MODULES, ...modules])).sort();

  // Load permissions with server-side pagination and filtering
  const loadPermissions = async () => {
    try {
      setLoading(true);
      const response = await fetchPermissions(
        currentPage,
        pageSize,
        searchText || undefined,
        moduleFilter || undefined,
        actionFilter || undefined
      );
      
      setPermissions(response.data);
      setTotal(response.meta.total);
    } catch (error: any) {
      console.error('Error loading permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadModulesData = async () => {
      try {
        const fetchedModules = await fetchModules();
        setModules(fetchedModules);
      } catch (error) {
        console.error('Error loading modules:', error);
      }
    };
    loadModulesData();
    
    const loadRolesAndPermissions = async () => {
      try {
        const fetchedRoles = await fetchRoles();
        setRoles(fetchedRoles);
        // Load all permissions for role permission assignment
        const response = await fetchPermissions(1, 1000);
        setAllPermissions(response.data);
      } catch (error) {
        console.error('Error loading roles/permissions:', error);
      }
    };
    loadRolesAndPermissions();
  }, []);

  useEffect(() => {
    loadPermissions();
  }, [currentPage, pageSize, searchText, moduleFilter, actionFilter]);

  const handleNavigate = (path: string, data?: any) => {
    if (path === 'form') {
      navigate('/permissions/form', { state: data });
    } else if (path === 'view') {
      navigate('/permissions/view', { state: data });
    }
  };

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
    }
  };

  const handlePageSizeChange = (current: number, size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Handle Add Role
  const handleAddRole = async (values: { name: string; description?: string }) => {
    try {
      await createRole(values);
      message.success('Role created successfully!');
      setAddRoleModalVisible(false);
      addRoleForm.resetFields();
      // Reload roles
      const fetchedRoles = await fetchRoles();
      setRoles(fetchedRoles);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create role';
      message.error(errorMessage);
    }
  };

  // Handle Add Role Permission
  const handleAddRolePermission = async (values: { roleId: string; permissionIds: string[] }) => {
    try {
      await createRolePermission(values);
      message.success('Role permissions assigned successfully!');
      setAddRolePermissionModalVisible(false);
      addRolePermissionForm.resetFields();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to assign role permissions';
      message.error(errorMessage);
    }
  };

  // Handle Create Permission (with role and module selection)
  const handleCreatePermission = async (values: { roleId: string; module: string; actions: string[] }) => {
    try {
      // First, create the permissions for the module
      const createdPermissions = await bulkCreatePermissions({
        module: values.module,
        actions: values.actions,
      });
      
      // Then, assign them to the role
      if (createdPermissions.length > 0) {
        await createRolePermission({
          roleId: values.roleId,
          permissionIds: createdPermissions.map(p => p.id),
        });
      }
      
      message.success('Permissions created and assigned to role successfully!');
      setCreatePermissionModalVisible(false);
      createPermissionForm.resetFields();
      loadPermissions(); // Reload permissions table
      // Reload all permissions for the dropdown
      const response = await fetchPermissions(1, 1000);
      setAllPermissions(response.data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create permissions';
      message.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen gap-[30px] bg-bg-secondary p-7">
      <div className="max-w-7xl mx-auto">
        <div className="bg-surface-1 rounded-2xl shadow-card p-8 mb-6 border border-[var(--glass-border)]">
          <Space size="middle" className="w-full" direction="vertical">
            <Space size="middle" className="w-full" wrap>
              <Input
                placeholder="Search by module, action, or description"
                style={{ width: 550, height: '40px' }}
                // allowClear
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
                // onPressEnter={() => {
                //   setCurrentPage(1);
                //   loadPermissions();
                // }}
              />
              <Select
                placeholder="Filter by Module"
                style={{ width: 230, height: '40px' }}
                allowClear
                value={moduleFilter || undefined}
                onChange={(value) => {
                  setModuleFilter(value || '');
                  setCurrentPage(1);
                }}
              >
                {allModules.map((module) => (
                  <Option key={module} value={module}>
                    {module.charAt(0).toUpperCase() + module.slice(1)}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="Filter by Action"
                style={{ width: 230, height: '40px' }}
                allowClear
                value={actionFilter || undefined}
                onChange={(value) => {
                  setActionFilter(value || '');
                  setCurrentPage(1);
                }}
              >
                {STANDARD_ACTIONS.map((action) => (
                  <Option key={action} value={action}>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </Option>
                ))}
              </Select>
              <Button
                // type="primary"
                icon={<UserAddOutlined />}
                onClick={() => setAddRoleModalVisible(true)}
                // size="large"
                style={{
                  height: '40px',
                  backgroundColor: 'var(--brand)',
                  borderColor: 'var(--brand)',
                }}
              >
                Add Role
              </Button>
              <Button
                // type="primary"
                icon={<SafetyOutlined />}
                onClick={() => setAddRolePermissionModalVisible(true)}
                // size="large"
                style={{
                  height: '40px',
                  backgroundColor: 'var(--brand)',
                  borderColor: 'var(--brand)',
                }}
              >
                Add Role Permission
              </Button>
              <Button
                // type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreatePermissionModalVisible(true)}
                // size="large"
                style={{
                  height: '40px',
                  backgroundColor: 'var(--brand)',
                  borderColor: 'var(--brand)',
                }}
              >
                Create Permission
              </Button>
            </Space>
          </Space>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            data={permissions}
            loading={loading}
            onNavigate={handleNavigate}
            onDelete={loadPermissions}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              onChange: handlePageChange,
              onShowSizeChange: handlePageSizeChange,
              showSizeChanger: true,
              showTotal: (total: number) => `Total ${total} permissions`,
            }}
          />
        )}
      </div>

      {/* Add Role Modal */}
      <Modal
        title="Add Role"
        open={addRoleModalVisible}
        onCancel={() => {
          setAddRoleModalVisible(false);
          addRoleForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={addRoleForm}
          layout="vertical"
          onFinish={handleAddRole}
        >
          <Form.Item
            name="name"
            label="Role Name"
            rules={[{ required: true, message: 'Please enter role name' }]}
          >
            <Input placeholder="Enter role name"  />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <Input type="textarea"   placeholder="Enter role description (optional)" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                // type="primary"
                // htmlType="submit"
                style={{
                  backgroundColor: 'var(--brand)',
                  borderColor: 'var(--brand)',
                }}
              >
                Create Role
              </Button>
              <Button onClick={() => {
                setAddRoleModalVisible(false);
                addRoleForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Role Permission Modal */}
      <Modal
        title="Add Role Permission"
        open={addRolePermissionModalVisible}
        onCancel={() => {
          setAddRolePermissionModalVisible(false);
          addRolePermissionForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={addRolePermissionForm}
          layout="vertical"
          onFinish={handleAddRolePermission}
        >
          <Form.Item
            name="roleId"
            label="Role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select
              placeholder="Select a role"
              size="large"
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
              options={roles.map((role) => ({
                value: role.id,
                label: role.name,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="permissionIds"
            label="Permissions"
            rules={[{ required: true, message: 'Please select at least one permission' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select permissions"
              size="large"
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
              options={allPermissions.map((permission) => ({
                value: permission.id,
                label: `${permission.module} - ${permission.action}`,
              }))}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                // type="primary"
                // htmlType="submit"
                style={{
                  backgroundColor: 'var(--brand)',
                  borderColor: 'var(--brand)',
                }}
              >
                Assign Permissions
              </Button>
              <Button onClick={() => {
                setAddRolePermissionModalVisible(false);
                addRolePermissionForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Permission Modal */}
      <Modal
        title="Create Permission"
        open={createPermissionModalVisible}
        onCancel={() => {
          setCreatePermissionModalVisible(false);
          createPermissionForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={createPermissionForm}
          layout="vertical"
          onFinish={handleCreatePermission}
        >
          <Form.Item
            name="roleId"
            label="Role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select
              placeholder="Select a role"
              size="large"
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
              options={roles.map((role) => ({
                value: role.id,
                label: role.name,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="module"
            label="Module"
            rules={[{ required: true, message: 'Please select a module' }]}
          >
            <Select
              placeholder="Select a module"
              size="large"
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
              options={allModules.map((module) => ({
                value: module,
                label: module.charAt(0).toUpperCase() + module.slice(1),
              }))}
            />
          </Form.Item>
          <Form.Item
            name="actions"
            label="Actions"
            rules={[{ required: true, message: 'Please select at least one action' }]}
          >
            <Checkbox.Group>
              <div className="space-y-2">
                {STANDARD_ACTIONS.map((action) => (
                  <div key={action}>
                    <Checkbox value={action}>
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </Checkbox>
                  </div>
                ))}
              </div>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                // type="primary"
                // htmlType="submit"
                style={{
                  backgroundColor: 'var(--brand)',
                  borderColor: 'var(--brand)',
                }}
              >
                Create Permission
              </Button>
              <Button onClick={() => {
                setCreatePermissionModalVisible(false);
                createPermissionForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Permissions;
