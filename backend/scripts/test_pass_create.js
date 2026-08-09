require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const API_BASE = 'http://localhost:5000/api/v1';

async function test() {
  const loginRes = await axios.post(`${API_BASE}/auth/login`, { email: 'admin@proconnect.in', password: 'admin' });
  const token = loginRes.data.data.accessToken;

  try {
    const res = await axios.post(`${API_BASE}/gate-passes`, {
      name: 'Pass-Test-1',
      gate: 'Gate A',
      companyId: 'cmp_company_1',
      siteId: 'site_site_1',
    }, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Pass Create Success:', res.data);
  } catch (err) {
    console.error('Pass Create Error:', err.response?.data || err.message);
  }
}
test();
