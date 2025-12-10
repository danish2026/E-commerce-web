import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Spin, message, Tag } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { useRoleTranslation } from '../../../hooks/useRoleTranslation';
import {
  fetchRoleById,
  fetchRolePermissionsByRole,
  getApiErrorMessage,
  Role,
} from './api';

dayjs.extend(advancedFormat);

const RoleView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useRoleTranslation();
  const roleData = location.state as Role | null;
  const [role, setRole] = useState<Role | null>(roleData);
  const [rolePermissions, setRolePermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadRoleData = async () => {
      if (!roleData?.id) {
        message.error('Role ID not provided');
        navigate('/roles');
        return;
      }

      try {
        setLoading(true);
        const [fetchedRole, fetchedPermissions] = await Promise.all([
          fetchRoleById(roleData.id),
          fetchRolePermissionsByRole(roleData.id),
        ]);
        setRole(fetchedRole);
        setRolePermissions(fetchedPermissions);
      } catch (error) {
        console.error('Error loading role data:', error);
        message.error(getApiErrorMessage(error, t.failedToFetch));
        navigate('/roles');
      } finally {
        setLoading(false);
      }
    };

    if (!role) {
      loadRoleData();
    } else {
      fetchRolePermissionsByRole(role.id)
        .then(setRolePermissions)
        .catch((error) => {
          console.error('Error loading permissions:', error);
        });
    }
  }, [roleData, role, navigate, t]);

  const formatDate = (value?: string) => {
    if (!value) return '-';
    try {
      return dayjs(value).format('MMM Do, YYYY; hh:mm A');
    } catch {
      return '-';
    }
  };

  // Group permissions by module
  const permissionsByModule = React.useMemo(() => {
    const grouped: Record<string, string[]> = {};
    rolePermissions.forEach((rp) => {
      if (rp.permission && rp.permission.module && rp.permission.action) {
        const module = rp.permission.module;
        const action = rp.permission.action;
        if (!grouped[module]) {
          grouped[module] = [];
        }
        if (!grouped[module].includes(action)) {
          grouped[module].push(action);
        }
      }
    });
    return grouped;
  }, [rolePermissions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-secondary p-7 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!role) {
    return null;
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
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                {t.roleDetails}
              </h1>
              <Button
                icon={<EditOutlined />}
                onClick={() => navigate('/roles/form', { state: { ...role, mode: 'edit' } })}
                style={{
                  backgroundColor: 'var(--brand)',
                  borderColor: 'var(--brand)',
                }}
              >
                {t.edit}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">
                {t.name}
              </h3>
              <p className="text-lg text-[var(--text-primary)]">{role.name}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">
                {t.description}
              </h3>
              <p className="text-[var(--text-primary)]">
                {role.description || t.noDescriptionProvided}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">
                {t.id}
              </h3>
              <p className="text-[var(--text-primary)] font-mono text-sm">{role.id}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">
                {t.createdAt}
              </h3>
              <p className="text-[var(--text-primary)]">{formatDate(role.createdAt)}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">
                {t.updatedAt}
              </h3>
              <p className="text-[var(--text-primary)]">{formatDate(role.updatedAt)}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-4">
                {t.permissions} ({Object.values(permissionsByModule).flat().length})
              </h3>
              {Object.keys(permissionsByModule).length === 0 ? (
                <p className="text-[var(--text-secondary)]">{t.noPermissionsAssigned}</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(permissionsByModule).map(([module, actions]) => (
                    <div
                      key={module}
                      className="p-4 border border-[var(--glass-border)] rounded-lg bg-[var(--surface-2)]"
                    >
                      <h4 className="font-semibold text-[var(--text-primary)] mb-2">
                        {module.charAt(0).toUpperCase() + module.slice(1)}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {actions.map((action) => (
                          <Tag key={action} color="blue">
                            {action.charAt(0).toUpperCase() + action.slice(1)}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RoleView;

