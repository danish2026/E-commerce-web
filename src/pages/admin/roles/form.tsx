import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Card, Space, message, Checkbox, Spin } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useRoleTranslation } from '../../../hooks/useRoleTranslation';
import {
  createRole,
  updateRole,
  fetchRoleById,
  fetchRolePermissionsByRole,
  fetchAllPermissions,
  fetchModules,
  bulkUpdateRolePermissions,
  getApiErrorMessage,
  Permission,
  Role,
} from './api';

const { TextArea } = Input;

// Standard actions for permissions
const STANDARD_ACTIONS = ['create', 'view', 'edit', 'delete'];

interface RoleFormData {
  id?: string;
  name: string;
  description?: string;
  mode?: 'add' | 'edit';
}

const RoleForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useRoleTranslation();
  const existingRole = location.state as RoleFormData | null;
  const isEditMode = !!existingRole?.id;
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [modules, setModules] = useState<string[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedModules, setSelectedModules] = useState<Record<string, string[]>>({});
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [rolePermissions, setRolePermissions] = useState<any[]>([]);

  // Load modules and permissions on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        const [fetchedModules, fetchedPermissions] = await Promise.all([
          fetchModules(),
          fetchAllPermissions(),
        ]);
        setModules(fetchedModules);
        setAllPermissions(fetchedPermissions);
      } catch (error) {
        console.error('Error loading data:', error);
        message.error(getApiErrorMessage(error, t.failedToFetch));
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  // Load role data and permissions when editing
  useEffect(() => {
    const loadRoleData = async () => {
      if (!isEditMode || !existingRole?.id) return;

      try {
        setLoadingData(true);
        const [role, rolePerms] = await Promise.all([
          fetchRoleById(existingRole.id),
          fetchRolePermissionsByRole(existingRole.id),
        ]);

        // Set form values
        form.setFieldsValue({
          name: role.name,
          description: role.description,
        });

        // Group permissions by module and action
        const modulesMap: Record<string, string[]> = {};
        rolePerms.forEach((rp) => {
          if (rp.permission && rp.permission.module && rp.permission.action) {
            const module = rp.permission.module;
            const action = rp.permission.action;
            if (!modulesMap[module]) {
              modulesMap[module] = [];
            }
            if (!modulesMap[module].includes(action)) {
              modulesMap[module].push(action);
            }
          }
        });
        setSelectedModules(modulesMap);
        setRolePermissions(rolePerms);
      } catch (error) {
        console.error('Error loading role data:', error);
        message.error(getApiErrorMessage(error, t.failedToFetch));
      } finally {
        setLoadingData(false);
      }
    };

    loadRoleData();
  }, [isEditMode, existingRole?.id, form, t]);

  // Get all unique modules (from fetched modules and available modules)
  const allModules = React.useMemo(() => {
    const availableModules = [
      'users',
      'products',
      'categories',
      'purchase',
      'purchase-item',
      'sales',
      'order-item',
      'invoice',
      'billing',
      'permissions',
      'roles',
    ];
    return Array.from(new Set([...availableModules, ...modules])).sort();
  }, [modules]);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      // Get all selected permissions across all modules
      const allSelectedActions: Array<{ module: string; action: string }> = [];
      Object.keys(selectedModules).forEach((module) => {
        selectedModules[module].forEach((action) => {
          allSelectedActions.push({ module, action });
        });
      });

      // Find permission IDs for selected permissions
      const permissionIds: string[] = [];
      allSelectedActions.forEach(({ module, action }) => {
        const permission = allPermissions.find(
          (p) => p.module === module && p.action === action
        );
        if (permission) {
          permissionIds.push(permission.id);
        }
      });

      if (isEditMode && existingRole?.id) {
        // Update existing role
        await updateRole(existingRole.id, {
          name: values.name,
          description: values.description,
        });

        // Update role permissions
        await bulkUpdateRolePermissions(existingRole.id, permissionIds);

        message.success(t.roleUpdated);
        if (permissionIds.length > 0) {
          message.success(t.permissionsUpdated);
        }
      } else {
        // Create new role
        const newRole = await createRole({
          name: values.name,
          description: values.description,
        });

        // Assign permissions to new role
        if (permissionIds.length > 0) {
          await bulkUpdateRolePermissions(newRole.id, permissionIds);
        }

        message.success(t.roleCreated);
        if (permissionIds.length > 0) {
          message.success(t.permissionsUpdated);
        }
      }

      navigate('/roles');
    } catch (error) {
      console.error('Error saving role:', error);
      message.error(getApiErrorMessage(error, t.failedToSave));
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Validation failed:', errorInfo);
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-bg-secondary p-7 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gap-[30px] bg-bg-secondary p-7">
      <div className="max-w-7xl mx-auto">
        <Card className="bg-surface-1 rounded-2xl shadow-card border border-[var(--glass-border)]">
          <div className="mb-6">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/roles')}
              className="mb-4"
            >
              {t.back}
            </Button>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {isEditMode ? t.editRole : t.createNewRole}
            </h1>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            className="space-y-6"
          >
            <Form.Item
              name="name"
              label={t.nameLabel}
              rules={[{ required: true, message: t.nameRequired }]}
            >
              <Input placeholder={t.namePlaceholder} size="large" />
            </Form.Item>

            <Form.Item name="description" label={t.descriptionLabel}>
              <TextArea
                placeholder={t.descriptionPlaceholder}
                rows={4}
                size="large"
              />
            </Form.Item>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
                {t.assignPermissionsToRole}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                {t.selectedPermissions}: {Object.values(selectedModules).flat().length}
              </p>

              {loadingPermissions ? (
                <div className="flex justify-center py-8">
                  <Spin size="large" />
                </div>
              ) : (
                <div className="max-h-[600px] overflow-y-auto space-y-4 border border-[var(--glass-border)] rounded-lg p-4 bg-[var(--surface-2)]">
                  {allModules.map((module) => {
                    const moduleActions = selectedModules[module] || [];
                    const hasAnySelected = moduleActions.length > 0;
                    const allSelected = moduleActions.length === STANDARD_ACTIONS.length;

                    return (
                      <div
                        key={module}
                        className={`p-4 border rounded-lg ${
                          hasAnySelected
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-[var(--glass-border)] bg-[var(--surface-1)]'
                        }`}
                      >
                        <div className="flex items-center mb-3">
                          <Checkbox
                            checked={allSelected}
                            indeterminate={hasAnySelected && !allSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedModules({
                                  ...selectedModules,
                                  [module]: [...STANDARD_ACTIONS],
                                });
                              } else {
                                const newModules = { ...selectedModules };
                                delete newModules[module];
                                setSelectedModules(newModules);
                              }
                            }}
                          >
                            <span className="font-semibold text-lg ml-2">
                              {module.charAt(0).toUpperCase() + module.slice(1)}
                            </span>
                            {hasAnySelected && (
                              <span className="ml-2 text-green-600 dark:text-green-400">
                                ✓ {moduleActions.length} {t.action}(s) selected
                              </span>
                            )}
                          </Checkbox>
                        </div>
                        <Checkbox.Group
                          value={moduleActions}
                          onChange={(checkedValues) => {
                            if (checkedValues.length === 0) {
                              const newModules = { ...selectedModules };
                              delete newModules[module];
                              setSelectedModules(newModules);
                            } else {
                              setSelectedModules({
                                ...selectedModules,
                                [module]: checkedValues as string[],
                              });
                            }
                          }}
                          className="ml-6"
                        >
                          <div className="grid grid-cols-2 gap-2">
                            {STANDARD_ACTIONS.map((action) => (
                              <Checkbox key={action} value={action}>
                                {action.charAt(0).toUpperCase() + action.slice(1)}
                              </Checkbox>
                            ))}
                          </div>
                        </Checkbox.Group>
                      </div>
                    );
                  })}
                </div>
              )}

              {allModules.length === 0 && !loadingPermissions && (
                <div className="text-center py-8 text-[var(--text-secondary)]">
                  {t.noPermissionsAvailable}
                </div>
              )}
            </div>

            <Form.Item className="mt-8">
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                  style={{
                    backgroundColor: 'var(--brand)',
                    borderColor: 'var(--brand)',
                  }}
                >
                  {isEditMode ? t.update : t.create}
                </Button>
                <Button onClick={() => navigate('/roles')}>
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

export default RoleForm;

