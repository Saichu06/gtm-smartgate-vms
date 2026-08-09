const pool = require('../src/config/database');
const siteRepo = require('../src/repositories/site.repository');
require('dotenv').config({ path: '../.env' });

async function test() {
  try {
    const res = await siteRepo.create({
      code: 'TEST-12',
      name: 'Test Site Facility',
      address: '123 Test St',
      city: 'Chennai',
      state: 'TN',
      pincode: 600001,
      companyId: 1
    });
    console.log('Site Repo Create Result:', res);
  } catch (err) {
    console.error('Site Repo Create Error:', err);
  } finally {
    pool.end();
  }
}
test();
