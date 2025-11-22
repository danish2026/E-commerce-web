import axios from 'axios';
import apiClient from '../../../api/apiClient';
import { API } from '../../../api/api';

export const fetchBilling = async () => {
    const response = await apiClient.get(`${API.BASEURL}/billing`);
    return response.data;
}

export const createBilling = async (billing:any) => {
    const response = await apiClient.post(`${API.BASEURL}/billing`, billing);
    return response.data;
}