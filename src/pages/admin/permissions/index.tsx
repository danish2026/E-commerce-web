import React, { useState, useEffect } from 'react';
import { Button, message, Select, Checkbox, Form, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Modal } from '../../../components/ui/Modal';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchPermissions,
  fetchRoles,
  fetchModules,
  bulkCreatePermissions,
  createRole,
  createRolePermission,
  clearError,
} from '../../../store/slices/rolePermissionSlice';

const { Option } = Select;
const { TextArea } = Input;

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

// Standard actions for permissions
const STANDARD_ACTIONS = ['create', 'view', 'edit', 'delete'];

const Permissions = () => {
  const dispatch = useAppDispatch();
  const { permissions, roles, modules, loading, error } = useAppSelector(
    (state) => state.rolePermission
  );

  // Modal states
  const [createPermissionModalOpen, setCreatePermissionModalOpen] = useState(false);
  const [addRoleModalOpen, setAddRoleModalOpen] = useState(false);
  const [addRolePermissionModalOpen, setAddRolePermissionModalOpen] = useState(false);

  // Form instances
  const [createPermissionForm] = Form.useForm();
  const [addRoleForm] = Form.useForm();
  const [addRolePermissionForm] = Form.useForm();

  // State for create permission modal
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [selectedActions, setSelectedActions] = useState<string[]>([]);

  // State for add role permission modal
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);

  useEffect(() => {
    dispatch(fetchPermissions());
    dispatch(fetchRoles());
    dispatch(fetchModules());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Handle Create Permission
  const handleCreatePermission = async () => {
    try {
      const values = await createPermissionForm.validateFields();
      
      if (selectedActions.length === 0) {
        message.warning('Please select at least one action');
        return;
      }

      await dispatch(
        bulkCreatePermissions({
          module: selectedModule,
          actions: selectedActions,
        })
      ).unwrap();

      message.success('Permissions created successfully');
      setCreatePermissionModalOpen(false);
      createPermissionForm.resetFields();
      setSelectedModule('');
      setSelectedActions([]);
      dispatch(fetchPermissions());
      dispatch(fetchModules());
    } catch (error: any) {
      message.error(error || 'Failed to create permissions');
    }
  };

  // Handle Add Role
  const handleAddRole = async () => {
    try {
      const values = await addRoleForm.validateFields();
      
      await dispatch(
        createRole({
          name: values.name,
          description: values.description,
        })
      ).unwrap();

      message.success('Role created successfully');
      setAddRoleModalOpen(false);
      addRoleForm.resetFields();
      dispatch(fetchRoles());
    } catch (error: any) {
      message.error(error || 'Failed to create role');
    }
  };

  // Handle Add Role Permission
  const handleAddRolePermission = async () => {
    try {
      if (!selectedRoleId) {
        message.warning('Please select a role');
        return;
      }

      if (selectedPermissionIds.length === 0) {
        message.warning('Please select at least one permission');
        return;
      }

      await dispatch(
        createRolePermission({
          roleId: selectedRoleId,
          permissionIds: selectedPermissionIds,
        })
      ).unwrap();

      message.success('Role permissions created successfully');
      setAddRolePermissionModalOpen(false);
      addRolePermissionForm.resetFields();
      setSelectedRoleId('');
      setSelectedPermissionIds([]);
    } catch (error: any) {
      message.error(error || 'Failed to create role permissions');
    }
  };

  // Get permissions grouped by module
  const getPermissionsByModule = (moduleName: string) => {
    return permissions.filter((p) => p.module === moduleName);
  };

  // Get all unique modules from permissions
  const allModules = Array.from(new Set([...AVAILABLE_MODULES, ...modules])).sort();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">Permission Management</h1>
        <p className="text-text-secondary">Manage permissions, roles, and role permissions</p>
      </div>

      <div className="flex gap-4 mb-6">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreatePermissionModalOpen(true)}
          size="large"
        >
          Create Permission
        </Button>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setAddRoleModalOpen(true)}
          size="large"
        >
          Add Role
        </Button>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setAddRolePermissionModalOpen(true)}
          size="large"
        >
          Add Role Permission
        </Button>
      </div>

      {/* Create Permission Modal */}
      <Modal
        open={createPermissionModalOpen}
        title="Create Permission"
        description="Select a module and actions to create permissions"
        onClose={() => {
          setCreatePermissionModalOpen(false);
          createPermissionForm.resetFields();
          setSelectedModule('');
          setSelectedActions([]);
        }}
        actions={
          <>
            <Button
              onClick={() => {
                setCreatePermissionModalOpen(false);
                createPermissionForm.resetFields();
                setSelectedModule('');
                setSelectedActions([]);
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleCreatePermission}
              loading={loading}
              style={{
                backgroundColor: 'var(--brand)',
                borderColor: 'var(--brand)',
              }}
            >
              Create
            </Button>
          </>
        }
      >
        <Form form={createPermissionForm} layout="vertical">
          <Form.Item
            label="Module"
            name="module"
            rules={[{ required: true, message: 'Please select a module' }]}
          >
            <Select
              placeholder="Select a module"
              value={selectedModule}
              onChange={(value) => {
                setSelectedModule(value);
                setSelectedActions([]);
              }}
            >
              {allModules.map((module) => (
                <Option key={module} value={module}>
                  {module.charAt(0).toUpperCase() + module.slice(1)}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedModule && (
            <Form.Item
              label="Actions"
              name="actions"
              rules={[{ required: true, message: 'Please select at least one action' }]}
            >
              <div className="space-y-2">
                {STANDARD_ACTIONS.map((action) => (
                  <Checkbox
                    key={action}
                    checked={selectedActions.includes(action)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedActions([...selectedActions, action]);
                      } else {
                        setSelectedActions(selectedActions.filter((a) => a !== action));
                      }
                    }}
                  >
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </Checkbox>
                ))}
              </div>
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Add Role Modal */}
      <Modal
        open={addRoleModalOpen}
        title="Add Role"
        description="Create a new role with name and description"
        onClose={() => {
          setAddRoleModalOpen(false);
          addRoleForm.resetFields();
        }}
        actions={
          <>
            <Button
              onClick={() => {
                setAddRoleModalOpen(false);
                addRoleForm.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleAddRole}
              loading={loading}
              style={{
                backgroundColor: 'var(--brand)',
                borderColor: 'var(--brand)',
              }}
            >
              Create
            </Button>
          </>
        }
      >
        <Form form={addRoleForm} layout="vertical">
          <Form.Item
            label="Role Name"
            name="name"
            rules={[{ required: true, message: 'Please enter role name' }]}
          >
            <Input placeholder="Enter role name" />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <TextArea
              rows={4}
              placeholder="Enter role description"
              className="resize-none"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Role Permission Modal */}
      <Modal
        open={addRolePermissionModalOpen}
        title="Add Role Permission"
        description="Assign permissions to a role"
        onClose={() => {
          setAddRolePermissionModalOpen(false);
          addRolePermissionForm.resetFields();
          setSelectedRoleId('');
          setSelectedPermissionIds([]);
        }}
        actions={
          <>
            <Button
              onClick={() => {
                setAddRolePermissionModalOpen(false);
                addRolePermissionForm.resetFields();
                setSelectedRoleId('');
                setSelectedPermissionIds([]);
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleAddRolePermission}
              loading={loading}
              style={{
                backgroundColor: 'var(--brand)',
                borderColor: 'var(--brand)',
              }}
            >
              Assign
            </Button>
          </>
        }
      >
        <Form form={addRolePermissionForm} layout="vertical">
          <Form.Item
            label="Select Role"
            name="roleId"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select
              placeholder="Select a role"
              value={selectedRoleId}
              onChange={(value) => {
                setSelectedRoleId(value);
                setSelectedPermissionIds([]);
              }}
            >
              {roles.map((role) => (
                <Option key={role.id} value={role.id}>
                  {role.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedRoleId && (
            <Form.Item
              label="Select Permissions"
              name="permissionIds"
              rules={[{ required: true, message: 'Please select at least one permission' }]}
            >
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md p-4">
                {allModules.map((module) => {
                  const modulePermissions = getPermissionsByModule(module);
                  if (modulePermissions.length === 0) return null;

                  return (
                    <div key={module} className="mb-4">
                      <h4 className="font-semibold mb-2 text-text-primary">
                        {module.charAt(0).toUpperCase() + module.slice(1)}
                      </h4>
                      <div className="space-y-2">
                        {modulePermissions.map((permission) => (
                          <Checkbox
                            key={permission.id}
                            checked={selectedPermissionIds.includes(permission.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPermissionIds([
                                  ...selectedPermissionIds,
                                  permission.id,
                                ]);
                              } else {
                                setSelectedPermissionIds(
                                  selectedPermissionIds.filter((id) => id !== permission.id)
                                );
                              }
                            }}
                          >
                            {permission.action.charAt(0).toUpperCase() + permission.action.slice(1)}
                          </Checkbox>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default Permissions;

