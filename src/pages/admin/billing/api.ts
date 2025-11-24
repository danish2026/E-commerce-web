import apiClient from '../../../api/apiClient';
import { API } from '../../../api/api';

export interface PurchaseItem {
  id?: string;
  item: string;
  description?: string;
  quantity: number;
  price: number;
  total: number;
  createdAt?: string;
  updatedAt?: string;
}

// Get all purchase items
export const fetchPurchaseItems = async (): Promise<PurchaseItem[]> => {
  const response = await apiClient.get(API.PURCHASE_ITEM);
  return response.data;
}

// Get single purchase item by ID
export const fetchPurchaseItemById = async (id: string): Promise<PurchaseItem> => {
  const response = await apiClient.get(`${API.PURCHASE_ITEM}/${id}`);
  return response.data;
}

// Create a purchase item
export const createPurchaseItem = async (item: Omit<PurchaseItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<PurchaseItem> => {
  const response = await apiClient.post(API.PURCHASE_ITEM, item);
  return response.data;
}

// Create multiple purchase items
export const createMultiplePurchaseItems = async (items: Omit<PurchaseItem, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<PurchaseItem[]> => {
  const promises = items.map(item => createPurchaseItem(item));
  return Promise.all(promises);
}

// Update a purchase item
export const updatePurchaseItem = async (id: string, item: Partial<Omit<PurchaseItem, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PurchaseItem> => {
  const response = await apiClient.put(`${API.PURCHASE_ITEM}/${id}`, item);
  return response.data;
}

// Delete a purchase item
export const deletePurchaseItem = async (id: string): Promise<void> => {
  await apiClient.delete(`${API.PURCHASE_ITEM}/${id}`);
}