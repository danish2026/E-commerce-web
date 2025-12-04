import { useState, useEffect, useCallback } from 'react';
import { Space, message, Spin } from 'antd';
import RangePicker from '../../../components/ui/RangePicker';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { DataTable, TableColumn } from '../../../components/common/DataTable';
import { FormModal, FormField } from '../../../components/common/FormModal';
import { ViewModal, ViewField, createDateField, createTextField } from '../../../components/common/ViewModal';
import LanguageSelector from '../../../components/purchase/LanguageSelector';
import { useCategoryTranslation } from '../../../hooks/useCategoryTranslation';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
  getApiErrorMessage,
  CategoryDto,
} from './CategoryService';

// const { RangePicker } = DatePicker;

interface CategoryDisplay {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const Categories = () => {
  const { t, translate } = useCategoryTranslation();
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [categories, setCategories] = useState<CategoryDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDisplay | null>(null);
  const [viewingCategory, setViewingCategory] = useState<CategoryDisplay | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Fetch categories from API
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const searchParam = searchText.trim() || undefined;
      
      // Format dates as YYYY-MM-DD for API
      const fromDateParam = dateRange && dateRange[0] 
        ? dateRange[0].format('YYYY-MM-DD') 
        : undefined;
      const toDateParam = dateRange && dateRange[1] 
        ? dateRange[1].format('YYYY-MM-DD') 
        : undefined;
      
      const response = await fetchCategories(
        searchParam, 
        fromDateParam, 
        toDateParam
      );
      
      // Transform API data to display format
      const transformedCategories: CategoryDisplay[] = response.map((item: CategoryDto) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));
      
      // Store all categories and handle pagination client-side
      setCategories(transformedCategories);
      setTotal(transformedCategories.length);
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error(getApiErrorMessage(error, t.failedToFetch));
    } finally {
      setLoading(false);
    }
  }, [searchText, dateRange, t]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchText, dateRange]);

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const handlePageSizeChange = (current: number, size: number) => {
    setCurrentPage(current);
    setPageSize(size);
  };

  // Form Modal Handlers
  const handleOpenFormModal = (category?: CategoryDisplay) => {
    if (category) {
      setEditingCategory(category);
    } else {
      setEditingCategory(null);
    }
    setFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setFormModalOpen(false);
    setEditingCategory(null);
  };

  const handleFormSubmit = async (values: Record<string, any>) => {
    try {
      setFormLoading(true);
      if (editingCategory) {
        await updateCategory(editingCategory.id, values as { name?: string; description?: string | null });
        message.success(t.categoryUpdated);
      } else {
        await createCategory(values as { name: string; description?: string | null });
        message.success(t.categoryCreated);
      }
      handleCloseFormModal();
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      message.error(getApiErrorMessage(error, t.failedToSave));
      throw error; // Re-throw to prevent modal from closing
    } finally {
      setFormLoading(false);
    }
  };

  // View Modal Handlers
  const handleOpenViewModal = async (category: CategoryDisplay) => {
    try {
      // Fetch full category details
      const fullCategory = await getCategoryById(category.id);
      setViewingCategory({
        id: fullCategory.id,
        name: fullCategory.name,
        description: fullCategory.description,
        createdAt: fullCategory.createdAt,
        updatedAt: fullCategory.updatedAt,
      });
      setViewModalOpen(true);
    } catch (error) {
      console.error('Error fetching category details:', error);
      message.error(getApiErrorMessage(error, t.failedToFetchDetails));
    }
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setViewingCategory(null);
  };

  // Delete Handler
  const handleDelete = async (category: CategoryDisplay): Promise<void> => {
    await deleteCategory(category.id);
  };

  // Table Columns
  const columns: TableColumn<CategoryDisplay>[] = [
    {
      key: 'name',
      title: t.categoryName,
      dataIndex: 'name',
    },
    {
      key: 'description',
      title: t.description,
      dataIndex: 'description',
      render: (value) => value || '-',
      hideOnTablet: true,
    },
    {
      key: 'createdAt',
      title: t.createdAt,
      dataIndex: 'createdAt',
      render: (value) => {
        if (!value) return '-';
        try {
          return dayjs(value).format('MMM Do, YYYY');
        } catch {
          return '-';
        }
      },
      hideOnMobile: true,
      hideOnTablet: true,
    },
  ];

  // Form Fields
  const formFields: FormField[] = [
    {
      name: 'name',
      label: t.categoryNameLabel,
      type: 'text',
      required: true,
      placeholder: t.categoryNamePlaceholder,
    },
    {
      name: 'description',
      label: t.descriptionLabel,
      type: 'textarea',
      required: false,
      placeholder: t.descriptionPlaceholder,
    },
  ];

  // View Fields
  const getViewFields = (category: CategoryDisplay | null): ViewField[] => {
    if (!category) return [];
    
    return [
      createTextField(t.categoryName, category.name),
      createTextField(t.description, category.description || '-'),
      createDateField(t.createdAt, category.createdAt),
      createDateField(t.updatedAt, category.updatedAt),
    ];
  };

  return (
    <div className="min-h-screen bg-bg-secondary p-7">
      <div className="max-w-7xl mx-auto">
        <div className="bg-surface-1 rounded-2xl shadow-card p-8 mb-6 border border-[var(--glass-border)]">
          <Space size="middle" className="w-full" direction="vertical">
            <Space size="middle" className="w-full" wrap>
              {/* <LanguageSelector /> */}
              <Input
                placeholder={t.searchPlaceholder}
                icon={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 500, height: '40px' }}
              />
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
                format="YYYY-MM-DD"
                placeholder={[t.startDate, t.endDate]}
                style={{ width: 300, height: '40px' }}
              />
              <Button
                icon={<PlusOutlined />}
                onClick={() => handleOpenFormModal()}
                style={{
                  height: '40px',
                  width: '200px',
                  backgroundColor: 'var(--brand)',
                  borderColor: 'var(--brand)',
                }}
              >
                {t.addCategory}
              </Button>
            </Space>
          </Space>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <DataTable
            data={categories.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
            columns={columns}
            onView={handleOpenViewModal}
            onEdit={handleOpenFormModal}
            onDelete={handleDelete}
            onDeleteSuccess={loadCategories}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              onChange: handlePageChange,
              onShowSizeChange: handlePageSizeChange,
              showSizeChanger: true,
              showTotal: (total) => translate('totalCategories', { count: total }),
            }}
            emptyMessage={t.noCategoriesFound}
            getRowId={(record) => record.id}
            deleteConfirmMessage={(record) => translate('deleteCategoryConfirm', { name: record.name })}
            deleteTitle={t.deleteCategoryTitle}
          />
        )}

        {/* Form Modal */}
        <FormModal
          open={formModalOpen}
          title={editingCategory ? t.editCategory : t.addNewCategory}
          fields={formFields}
          initialValues={editingCategory || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseFormModal}
          submitButtonText={editingCategory ? t.updateCategory : t.createCategory}
          loading={formLoading}
        />

        {/* View Modal */}
        <ViewModal
          open={viewModalOpen}
          title={t.categoryDetails}
          fields={getViewFields(viewingCategory)}
          onClose={handleCloseViewModal}
        />
      </div>
    </div>
  );
};

export default Categories;
