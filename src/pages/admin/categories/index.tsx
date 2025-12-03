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
      message.error(getApiErrorMessage(error, 'Failed to fetch categories'));
    } finally {
      setLoading(false);
    }
  }, [searchText, dateRange]);

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
        message.success('Category updated successfully!');
      } else {
        await createCategory(values as { name: string; description?: string | null });
        message.success('Category created successfully!');
      }
      handleCloseFormModal();
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      message.error(getApiErrorMessage(error, 'Failed to save category'));
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
      message.error(getApiErrorMessage(error, 'Failed to fetch category details'));
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
      title: 'Category Name',
      dataIndex: 'name',
    },
    {
      key: 'description',
      title: 'Description',
      dataIndex: 'description',
      render: (value) => value || '-',
      hideOnTablet: true,
    },
    {
      key: 'createdAt',
      title: 'Created At',
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
      label: 'Category Name',
      type: 'text',
      required: true,
      placeholder: 'Enter category name',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'Enter category description (optional)',
    },
  ];

  // View Fields
  const getViewFields = (category: CategoryDisplay | null): ViewField[] => {
    if (!category) return [];
    
    return [
      createTextField('Category Name', category.name),
      createTextField('Description', category.description || '-'),
      createDateField('Created At', category.createdAt),
      createDateField('Updated At', category.updatedAt),
    ];
  };

  return (
    <div className="min-h-screen bg-bg-secondary p-7">
      <div className="max-w-7xl mx-auto">
        <div className="bg-surface-1 rounded-2xl shadow-card p-8 mb-6 border border-[var(--glass-border)]">
          <Space size="middle" className="w-full" direction="vertical">
            <Space size="middle" className="w-full" wrap>
              <Input
                placeholder="Search by category name or description"
                icon={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 500, height: '40px' }}
                // allowClear
                // className="category-search-input"
              />
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
                format="YYYY-MM-DD"
                placeholder={['Start Date', 'End Date']}
                style={{ width: 300, height: '40px' }}
              />
              <Button
                // type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenFormModal()}
                // size="large"
                style={{
                  height: '40px',
                  width: '200px',
                  backgroundColor: 'var(--brand)',
                  borderColor: 'var(--brand)',
                }}
              >
                Add Category
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
              showTotal: (total) => `Total ${total} categories`,
            }}
            emptyMessage="No categories found. Click Add Category to create one."
            getRowId={(record) => record.id}
            deleteConfirmMessage={(record) => `Are you sure you want to delete the category "${record.name}"?`}
            deleteTitle="Delete Category"
          />
        )}

        {/* Form Modal */}
        <FormModal
          open={formModalOpen}
          title={editingCategory ? 'Edit Category' : 'Add New Category'}
          fields={formFields}
          initialValues={editingCategory || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseFormModal}
          submitButtonText={editingCategory ? 'Update Category' : 'Create Category'}
          loading={formLoading}
        />

        {/* View Modal */}
        <ViewModal
          open={viewModalOpen}
          title="Category Details"
          fields={getViewFields(viewingCategory)}
          onClose={handleCloseViewModal}
        />
      </div>
    </div>
  );
};

export default Categories;
