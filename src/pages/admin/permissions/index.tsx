import {  Space, Spin, Select, Modal, Form, message, Checkbox, Button as AntButton } from 'antd';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate ,useLocation} from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { PlusOutlined, UserAddOutlined, SafetyOutlined } from '@ant-design/icons';
import LanguageSelector from '../../../components/purchase/LanguageSelector';
import { usePermissionTranslation } from '../../../hooks/usePermissionTranslation';
import { fetchPermissions, Permission, fetchModules, fetchRoles, createRole, createRolePermission, bulkCreatePermissions, Role } from './api';
import Table from './table';

const { Option } = Select;

const Permissions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, translate } = usePermissionTranslation();
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
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  
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

  // Memoize permission options for Select component
  const permissionOptions = useMemo(() => {
    console.log('Computing permission options from allPermissions:', allPermissions.length);
    const options = allPermissions
      .filter((permission) => permission && permission.id && permission.module && permission.action)
      .map((permission) => ({
        value: permission.id,
        label: `${permission.module} - ${permission.action}`,
      }));
    console.log('Permission options computed:', options.length);
    if (options.length > 0) {
      console.log('First option sample:', options[0]);
    }
    return options;
  }, [allPermissions]);

  // Function to fetch all permissions by paginating through all pages
  const fetchAllPermissions = async (): Promise<Permission[]> => {
    const permissionsList: Permission[] = [];
    let currentPage = 1;
    const limit = 100; // API max limit
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await fetchPermissions(currentPage, limit);
        if (Array.isArray(response.data)) {
          permissionsList.push(...response.data);
          // Check if there are more pages
          hasMore = response.meta.hasNext || (currentPage < response.meta.totalPages);
          currentPage++;
        } else {
          console.error('Invalid response format:', response);
          break;
        }
      } catch (error: any) {
        console.error(`Error fetching permissions page ${currentPage}:`, error);
        break;
      }
    }

    return permissionsList;
  };

  // Function to reload all permissions
  const reloadAllPermissions = async () => {
    try {
      setLoadingPermissions(true);
      const allPerms = await fetchAllPermissions();
      console.log('All permissions fetched:', allPerms.length);
      setAllPermissions(allPerms);
      console.log('Permissions reloaded:', allPerms.length);
    } catch (error: any) {
      console.error('Error reloading permissions:', error);
      setAllPermissions([]);
    } finally {
      setLoadingPermissions(false);
    }
  };

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
        setLoadingPermissions(true);
        const fetchedRoles = await fetchRoles();
        setRoles(fetchedRoles);
        console.log('Roles loaded:', fetchedRoles.length);
        
        // Load all permissions for role permission assignment using pagination
        const allPerms = await fetchAllPermissions();
        console.log('All permissions fetched:', allPerms.length);
        
        if (allPerms.length > 0) {
          console.log('First permission sample:', allPerms[0]);
          console.log('Permission keys:', Object.keys(allPerms[0]));
        }
        
        setAllPermissions(allPerms);
        console.log('All permissions state updated:', allPerms.length, 'permissions');
      } catch (error: any) {
        console.error('Error loading roles/permissions:', error);
        console.error('Error response:', error.response);
        console.error('Error details:', error.response?.data || error.message);
        console.error('Error stack:', error.stack);
        message.error('Failed to load permissions. Please refresh the page.');
        setAllPermissions([]);
      } finally {
        setLoadingPermissions(false);
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
      message.success(t.roleCreated);
      setAddRoleModalVisible(false);
      addRoleForm.resetFields();
      // Reload roles
      const fetchedRoles = await fetchRoles();
      setRoles(fetchedRoles);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || t.failedToCreateRole;
      message.error(errorMessage);
    }
  };

  // Handle Add Role Permission
  const handleAddRolePermission = async (values: { roleId: string; permissionIds: string[] }) => {
    try {
      await createRolePermission(values);
      message.success(t.rolePermissionsAssigned);
      setAddRolePermissionModalVisible(false);
      addRolePermissionForm.resetFields();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || t.failedToAssignRolePermissions;
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
      
      message.success(t.permissionsCreatedAndAssigned);
      setCreatePermissionModalVisible(false);
      createPermissionForm.resetFields();
      loadPermissions(); // Reload permissions table
      // Reload all permissions for the dropdown
      await reloadAllPermissions();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || t.failedToCreatePermissions;
      message.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen gap-[30px] bg-bg-secondary p-7">
      <div className="max-w-7xl mx-auto">
        <div className="bg-surface-1 rounded-2xl shadow-card p-8 mb-6 border border-[var(--glass-border)]">
          <Space size="middle" className="w-full" direction="vertical">
            <Space size="middle" className="w-full" wrap>
              {/* <LanguageSelector /> */}
              <Input
                placeholder={t.searchPlaceholder}
                style={{ width: 550, height: '40px' }}
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <Select
                placeholder={t.filterByModule}
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
                placeholder={t.filterByAction}
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
                icon={<UserAddOutlined />}
                onClick={() => setAddRoleModalVisible(true)}
                style={{
                  height: '40px',
                  backgroundColor: 'var(--brand)',
                  borderColor: 'var(--brand)',
                }}
              >
                {t.addRole}
              </Button>
              <Button
                icon={<SafetyOutlined />}
                onClick={() => setAddRolePermissionModalVisible(true)}
                style={{
                  height: '40px',
                  backgroundColor: 'var(--brand)',
                  borderColor: 'var(--brand)',
                }}
              >
                {t.addRolePermission}
              </Button>
              <Button
                icon={<PlusOutlined />}
                onClick={() => setCreatePermissionModalVisible(true)}
                style={{
                  height: '40px',
                  backgroundColor: 'var(--brand)',
                  borderColor: 'var(--brand)',
                }}
              >
                {t.createPermission}
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
              showTotal: (total: number) => translate('totalPermissions', { count: total }),
            }}
          />
        )}
      </div>

      {/* Add Role Modal */}
      <Modal
        title={t.addRole}
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
            label={t.roleName}
            rules={[{ required: true, message: t.roleNameRequired }]}
          >
            <Input placeholder={t.roleNamePlaceholder}  />
          </Form.Item>
          <Form.Item
            name="description"
            label={t.roleDescription}
          >
            <Input type="textarea"   placeholder={t.roleDescriptionPlaceholder} />
          </Form.Item>
          <Form.Item>
            <Space>
              <AntButton
                type="primary"
                htmlType="submit"
                style={{
                  backgroundColor: 'var(--brand)',
                  borderColor: 'var(--brand)',
                }}
              >
                {t.createRole}
              </AntButton>
              <AntButton onClick={() => {
                setAddRoleModalVisible(false);
                addRoleForm.resetFields();
              }}>
                {t.cancel}
              </AntButton>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Role Permission Modal */}
      <Modal
        title={t.addRolePermission}
        open={addRolePermissionModalVisible}
        onCancel={() => {
          setAddRolePermissionModalVisible(false);
          addRolePermissionForm.resetFields();
        }}
        afterOpenChange={(open) => {
          // Reload permissions when modal opens if we don't have any
          if (open && allPermissions.length === 0 && !loadingPermissions) {
            console.log('Modal opened with no permissions, reloading...');
            reloadAllPermissions();
          }
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
            label={t.roleLabel}
            rules={[{ required: true, message: t.roleRequired }]}
          >
            <Select
              placeholder={t.rolePlaceholder}
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
            label={t.permissionsLabel}
            rules={[{ required: true, message: t.selectAtLeastOnePermission }]}
          >
            <Select
              mode="multiple"
              placeholder={t.permissionsPlaceholder}
              size="large"
              showSearch
              loading={loadingPermissions}
              notFoundContent={loadingPermissions ? <Spin size="small" /> : 'No permissions found'}
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
              options={permissionOptions}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <AntButton
                type="primary"
                htmlType="submit"
                style={{
                  backgroundColor: 'var(--brand)',
                  borderColor: 'var(--brand)',
                }}
              >
                {t.assignPermissions}
              </AntButton>
              <AntButton onClick={() => {
                setAddRolePermissionModalVisible(false);
                addRolePermissionForm.resetFields();
              }}>
                {t.cancel}
              </AntButton>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Permission Modal */}
      <Modal
        title={t.createPermission}
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
            label={t.roleLabel}
            rules={[{ required: true, message: t.roleRequired }]}
          >
            <Select
              placeholder={t.rolePlaceholder}
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
            label={t.moduleLabel}
            rules={[{ required: true, message: t.moduleRequired }]}
          >
            <Select
              placeholder={t.modulePlaceholder}
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
            label={t.actionsLabel}
            rules={[{ required: true, message: t.selectAtLeastOneAction }]}
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
              <AntButton
                type="primary"
                htmlType="submit"
                style={{
                  backgroundColor: 'var(--brand)',
                  borderColor: 'var(--brand)',
                }}
              >
                {t.createPermission}
              </AntButton>
              <AntButton onClick={() => {
                setCreatePermissionModalVisible(false);
                createPermissionForm.resetFields();
              }}>
                {t.cancel}
              </AntButton>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Permissions;
