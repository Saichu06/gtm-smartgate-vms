const express = require('express');
const router = express.Router();

// Example route
router.get('/test', (req, res) => {
  res.send('Login route working!');
});

// POST /getLoginInfo
router.post('/getLoginInfo', async (req, res) => {
  const { user_name, password, role } = req.body;

  try {
    console.log("enter get login info", req.body);
    // Use parameterized query to prevent SQL injection AND a.active = TRUE 
    const result = await req.db.query(
      `SELECT a.*, b.code AS rolecode
       FROM user_details a
       JOIN roleinfos b ON a.role_id = b.id
       WHERE a.user_name = $1
      AND a.password = $2 AND a.active = TRUE` ,
      [user_name, password]
    );

    if (result.rows.length > 0) {
      res.json({ result: "Success", data: result.rows });
    } else {
      res.json({ result: "Failure" });
    }
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.post('/getLoginPreviliges', async (req, res) => {
  const { usercode, role, schema } = req.body;
  // 👆 Pass schema dynamically (e.g., "smartgate", "tenant1")

  try {
    console.log("enter get login privileges", req.body);
    // Use parameterized query to prevent SQL injection
    const result = await req.db.query(
      `SELECT a.*, 
              b.code AS rolecode, 
              b.name AS rolename, 
              c.comp_type
       FROM user_details a
       JOIN roleinfos b 
         ON a.role_id = b.id
       LEFT JOIN company_details c 
         ON a.comp_id = c.id
       WHERE a.user_code = $1
         AND a.active = TRUE`,
      [usercode]
    );

    if (result.rows.length > 0) {
      res.json({ result: "Success", data: result.rows });
    } else {
      res.json({ result: "Failure" });
    }
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
