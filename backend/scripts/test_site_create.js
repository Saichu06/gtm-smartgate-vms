require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const API_BASE = 'http://localhost:5000/api/v1';

async function test() {
  const loginRes = await axios.post(`${API_BASE}/auth/login`, { email: 'admin@proconnect.in', password: 'admin' });
  const token = loginRes.data.data.accessToken;

  try {
    const res = await axios.post(`${API_BASE}/sites`, {
      code: 'TEST-12',
      name: 'Test Site Facility',
      address: '123 Test St',
      city: 'Chennai',
      state: 'TN',
      pincode: 600001,
      companyId: 'cmp_company_1'
    }, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Site Create Success:', res.data);
  } catch (err) {
    console.error('Site Create Error:', err.response?.data || err.message);
  }
}
test();
