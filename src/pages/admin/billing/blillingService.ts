import axios from "axios";

export const fetchBilling = async () => {
    const response = await axios.get('http://localhost:3000/billing');
    return response.data;
}