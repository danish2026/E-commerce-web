import axios from "axios";

const fetchInvoices = async () => {
    const response = await axios.get('http://localhost:3000/invoices');
    return response.data;
}

export default fetchInvoices;