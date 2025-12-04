import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Card, Space, message, Select, Checkbox } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { usePermissionTranslation } from '../../../hooks/usePermissionTranslation';
import { createPermission, bulkCreatePermissions, updatePermission, Permission, fetchModules } from './api';

const { Option } = Select;
const { TextArea } = Input;

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

const PermissionForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = usePermissionTranslation();
  const existingPermission = location.state as Permission | null;
  const isEditMode = !!existingPermission;
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState<string[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(!isEditMode);

  // Load modules
  useEffect(() => {
    const loadModules = async () => {
      try {
        const fetchedModules = await fetchModules();
        setModules(fetchedModules);
      } catch (error) {
        console.error('Error loading modules:', error);
      }
    };
    loadModules();
  }, []);

  // Load existing permission data if in edit mode
  useEffect(() => {
    if (existingPermission) {
      setSelectedModule(existingPermission.module);
      setSelectedActions([existingPermission.action]);
      form.setFieldsValue({
        module: existingPermission.module,
        action: existingPermission.action,
        description: existingPermission.description,
      });
    }
  }, [existingPermission, form]);

  // Get all unique modules
  const allModules = Array.from(new Set([...AVAILABLE_MODULES, ...modules])).sort();

  const onFinish = async () => {
    try {
      setLoading(true);

      if (isBulkMode && !isEditMode) {
        // Bulk create mode
        if (!selectedModule) {
          message.error(t.moduleRequired);
          return;
        }
        if (selectedActions.length === 0) {
          message.error(t.selectAtLeastOneAction);
          return;
        }

        await bulkCreatePermissions({
          module: selectedModule,
          actions: selectedActions,
        });
        message.success(t.permissionsCreated);
      } else {
        // Single create or edit mode
        const values = await form.validateFields();
        
        if (isEditMode && existingPermission?.id) {
          await updatePermission(existingPermission.id, {
            module: values.module,
            action: values.action,
            description: values.description,
          });
          message.success(t.permissionUpdated);
        } else {
          await createPermission({
            module: values.module,
            action: values.action,
            description: values.description,
          });
          message.success(t.permissionCreated);
        }
      }
      
      navigate('/permissions');
    } catch (error: any) {
      console.error('Error saving permission:', error);
      const errorMessage = error.response?.data?.message || error.message || t.failedToSave;
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-secondary p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/permissions')}
          className="mb-6"
        >
          {t.backToPermissionsList}
        </Button>

        <Card
          title={<h2 className="text-2xl font-bold p-4 mt-[20px] m-0" style={{ color: 'var(--text-primary)' }}>
            {isEditMode ? t.editPermission : t.createNewPermission}
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
          {!isEditMode && (
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBulkMode}
                  onChange={(e) => setIsBulkMode(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-[var(--text-primary)]">
                  {t.bulkCreate}
                </span>
              </label>
            </div>
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            {isBulkMode && !isEditMode ? (
              <>
                <Form.Item
                  label={t.moduleLabel}
                  name="module"
                  rules={[{ required: true, message: t.moduleRequired }]}
                >
                  <Select
                    placeholder={t.modulePlaceholder}
                    size="large"
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
                    label={t.actionsLabel}
                    name="actions"
                    rules={[{ required: true, message: t.selectAtLeastOneAction }]}
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
              </>
            ) : (
              <>
                <Form.Item
                  label={t.moduleLabel}
                  name="module"
                  rules={[{ required: true, message: t.moduleRequired }]}
                >
                  <Select
                    placeholder={t.modulePlaceholder}
                    size="large"
                    showSearch
                    optionFilterProp="label"
                    filterOption={(input, option) =>
                      (option?.label as string)
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={allModules.map((module) => ({
                      value: module,
                      label: module.charAt(0).toUpperCase() + module.slice(1),
                    }))}
                  />
                </Form.Item>

                <Form.Item
                  label={t.actionLabel}
                  name="action"
                  rules={[{ required: true, message: t.actionRequired }]}
                >
                  <Select
                    placeholder={t.actionPlaceholder}
                    size="large"
                    showSearch
                    optionFilterProp="label"
                    filterOption={(input, option) =>
                      (option?.label as string)
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={STANDARD_ACTIONS.map((action) => ({
                      value: action,
                      label: action.charAt(0).toUpperCase() + action.slice(1),
                    }))}
                  />
                </Form.Item>

                <Form.Item label={t.descriptionLabel} name="description">
                  <TextArea
                    rows={4}
                    placeholder={t.descriptionPlaceholder}
                    className="resize-none"
                    size="large"
                  />
                </Form.Item>
              </>
            )}

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
                >
                  {isEditMode ? t.updatePermission : t.createPermission}
                </Button>
                <Button
                  onClick={() => navigate('/permissions')}
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

export default PermissionForm;

