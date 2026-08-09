(async () => {
  try {
    console.log('1. Attempting login as Apollo Admin...');
    const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@apollotyres.com', password: 'admin123' })
    }).then(r => r.json());
    console.log('Login Response:', JSON.stringify(loginRes, null, 2));

    const token = loginRes.data.accessToken;

    console.log('\n2. Querying employees with JWT Bearer Token...');
    const empRes = await fetch('http://localhost:5000/api/v1/employees', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    console.log('Employees (Tenant Scoped):', empRes.data ? empRes.data.length : 0, 'records');

    console.log('\n3. Unauthenticated request test (Expected 401):');
    const unauthRes = await fetch('http://localhost:5000/api/v1/employees').then(r => r.json());
    console.log('Unauth Response:', JSON.stringify(unauthRes, null, 2));

    console.log('\n4. Cross-Tenant ID Request Test (Expected 403 or filtered):');
    const compRes = await fetch('http://localhost:5000/api/v1/companies/cmp_gbHJdmfr', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    console.log('Cross Tenant Response:', JSON.stringify(compRes, null, 2));

  } catch (err) {
    console.error(err);
  }
})();
