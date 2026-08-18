const express = require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');

const DIR = './uploads';


// ==========================================
// MULTER CONFIGURATION
// ==========================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, DIR);
    },

    filename: (req, file, cb) => {

        const extension = path.extname(file.originalname);

        cb(
            null,
            file.fieldname + '-' + Date.now() + extension
        );
    }
});

const upload = multer({
    storage: storage
});


// ==========================================
// TEST ROUTE
// ==========================================

router.get('/test', (req, res) => {
    res.send('Master route working!');
});


// ==========================================
// ADD COMPANY
// ==========================================

router.post('/addCompany', upload.single('photo'), async (req, res) => {

    try {

        console.log('Enter addCompany');
        console.log('Request Body:', req.body);
        console.log('Uploaded File:', req.file);


        // ------------------------------------------
        // Company data
        // ------------------------------------------

        const data = req.body;


        // ------------------------------------------
        // Image
        // ------------------------------------------

        const imgdata = req.file
            ? req.file.filename
            : null;


        // ------------------------------------------
        // Check duplicate company
        // ------------------------------------------

        const checkQuery = `
            SELECT COUNT(*) AS compcount
            FROM company_details
            WHERE company_code = $1
        `;

        const companyResult = await req.db.query(
            checkQuery,
            [data.comp_code]
        );


        const companyCount = parseInt(
            companyResult.rows[0].compcount,
            10
        );


        if (companyCount === 1) {

            return res.json({
                result: 'Already Exists'
            });
        }


        // ------------------------------------------
        // Company Type
        // ------------------------------------------

        const compType =
            data.comp_type === 'true'
                ? 'Single'
                : 'Multiple';


        // ------------------------------------------
        // Insert Company
        // ------------------------------------------

        const insertQuery = `
            INSERT INTO company_details
            (
                company_code,
                company_name,
                registration_no,
                address1,
                address2,
                city,
                state,
                contact_person,
                contact_mobno,
                contact_email,
                landline,
                site_count,
                user_count,
                logo_path,
                pincode,
                welcome_msg,
                comp_type
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9,
                $10,
                $11,
                $12,
                $13,
                $14,
                $15,
                $16,
                $17
            )
        `;


        await req.db.query(
            insertQuery,
            [
                data.comp_code,
                data.comp_name,
                data.registration_no,
                data.address1,
                data.address2,
                data.city,
                data.state,
                data.contact_person,
                data.contact_mobno,
                data.contact_email,
                data.landline,
                data.site_count,
                data.user_count,
                imgdata,
                data.pincode,
                data.welcome_msg,
                compType
            ]
        );


        return res.json({
            result: 'Success'
        });

    }
    catch (err) {

        console.error('Error adding company:', err);

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});


// ==========================================
// GET COMPANY REPORT
// ==========================================

router.get('/getCompanyReport', async (req, res) => {

    try {

        const query = `
            SELECT *
            FROM company_details
        `;

        const result = await req.db.query(query);

        return res.json(result.rows);

    } catch (err) {

        console.error('Error fetching company report:', err);

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});



router.get('/getEmployeeDetails', async (req, res) => {

    try {

        const query = `
            SELECT *
            FROM employee_details
        `;

        const result = await req.db.query(query);

        return res.json(result.rows);

    } catch (err) {

        console.error('Error fetching company report:', err);

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});



// ==========================================
// EDIT COMPANY
// ==========================================

router.post('/EditCompany', async (req, res) => {

    try {

        const { compid } = req.body;

        const query = `
            SELECT *
            FROM company_details
            WHERE id = $1
        `;

        const result = await req.db.query(
            query,
            [compid]
        );

        return res.json(result.rows);

    } catch (err) {

        console.error('Error fetching company:', err);

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});

// ==========================================
// UPDATE COMPANY WITH PHOTO
// ==========================================

router.post('/UpdateCompany', upload.single('photo'), async (req, res) => {

    try {

        console.log('Enter UpdateCompany');
        console.log('Request Body:', req.body);
        console.log('Uploaded File:', req.file);

        const data = req.body;

        // Uploaded photo filename
        const imgdata = req.file
            ? req.file.filename
            : null;


        const updateQuery = `
            UPDATE company_details
            SET
                company_name = $1,
                registration_no = $2,
                address1 = $3,
                address2 = $4,
                city = $5,
                state = $6,
                contact_person = $7,
                contact_mobno = $8,
                contact_email = $9,
                pincode = $10,
                landline = $11,
                site_count = $12,
                user_count = $13,
                logo_path = $14,
                welcome_msg = $15,
                comp_type = $16
            WHERE company_code = $17
        `;


        const result = await req.db.query(
            updateQuery,
            [
                data.comp_name,
                data.registration_no,
                data.address1,
                data.address2,
                data.city,
                data.state,
                data.contact_person,
                data.contact_mobno,
                data.contact_email,
                data.pincode,
                data.landline,
                data.site_count,
                data.user_count,
                imgdata,
                data.welcome_msg,
                data.comp_type === 'true'
                    ? 'Single'
                    : 'Multiple',
                data.comp_code
            ]
        );


        if (result.rowCount > 0) {

            console.log('Company updated successfully');

            return res.json({
                result: 'Success'
            });
        }


        return res.json({
            result: 'Failure',
            message: 'Company not found'
        });


    } catch (err) {

        console.error('Error updating company:', err);

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});


// ==========================================
// UPDATE COMPANY WITHOUT PHOTO
// ==========================================

router.post('/UpdateCompanywithoutphoto', upload.single('photo'), async (req, res) => {

    try {

        console.log('Enter UpdateCompanywithoutphoto');
        console.log('Request Body:', req.body);

        const data = req.body;


        const updateQuery = `
            UPDATE company_details
            SET
                company_name = $1,
                registration_no = $2,
                address1 = $3,
                address2 = $4,
                city = $5,
                state = $6,
                contact_person = $7,
                contact_mobno = $8,
                contact_email = $9,
                pincode = $10,
                landline = $11,
                site_count = $12,
                user_count = $13,
                welcome_msg = $14,
                comp_type = $15
            WHERE company_code = $16
        `;


        const result = await req.db.query(
            updateQuery,
            [
                data.comp_name,
                data.registration_no,
                data.address1,
                data.address2,
                data.city,
                data.state,
                data.contact_person,
                data.contact_mobno,
                data.contact_email,
                data.pincode,
                data.landline,
                data.site_count,
                data.user_count,
                data.welcome_msg,
                data.comp_type === 'true'
                    ? 'Single'
                    : 'Multiple',
                data.comp_code
            ]
        );


        if (result.rowCount > 0) {

            console.log('Company updated successfully');

            return res.json({
                result: 'Success'
            });
        }


        return res.json({
            result: 'Failure',
            message: 'Company not found'
        });


    } catch (err) {

        console.error('Error updating company:', err);

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});

// ==========================================
// GET COMPANY CODE
// ==========================================

router.get('/getCompanyCode', async (req, res) => {

    try {

        const query = `
            SELECT *
            FROM company_details
            WHERE id NOT IN (
                SELECT comp_id
                FROM auto_prefixs
            )
        `;

        const result = await req.db.query(query);

        res.send(result.rows.length);

        return res.json(result.rows);

    } catch (err) {

        console.error('Error fetching company codes:', err);

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});


// ==========================================
// SET AUTO GENERATION DETAILS
// ==========================================

router.post('/setAutogenDetails', async (req, res) => {

    try {

        const { autogendata } = req.body;

        const query = `
            INSERT INTO auto_prefixs
            (
                comp_id,
                site_prefix,
                user_prefix,
                emp_prefix
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4
            )
            RETURNING *
        `;

        const result = await req.db.query(
            query,
            [
                autogendata.compid,
                autogendata.site_code,
                autogendata.user_code,
                autogendata.emp_code
            ]
        );

        return res.json(result.rows);

    } catch (err) {

        console.error('Error setting auto generation details:', err);

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});


// ==========================================
// GET AUTO PREFIX REPORT
// ==========================================

router.get('/getAutoPrefixReport', async (req, res) => {

    try {

        const query = `
            SELECT
                a.*,
                b.company_code,
                b.company_name
            FROM auto_prefixs a
            JOIN company_details b
                ON a.comp_id = b.id
        `;

        const result = await req.db.query(query);

        return res.json(result.rows);

    } catch (err) {

        console.error('Error fetching auto prefix report:', err);

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});

// ==========================================
// EDIT AUTO GENERATION DETAILS
// ==========================================

router.post('/EditAutoGenDetails', async (req, res) => {

    try {

        const { autoprefixid } = req.body;

        const query = `
            SELECT
                a.*,
                b.company_code
            FROM auto_prefixs a
            JOIN company_details b
                ON a.comp_id = b.id
            WHERE a.id = $1
        `;

        const result = await req.db.query(
            query,
            [autoprefixid]
        );

        return res.json(result.rows);

    } catch (err) {

        console.error('Error fetching auto generation details:', err);

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});


// ==========================================
// UPDATE AUTO GENERATION DETAILS
// ==========================================

router.post('/updateAutogenDetails', async (req, res) => {

    try {

        const { updatePrefixInfo } = req.body;

        const query = `
            UPDATE auto_prefixs
            SET
                site_prefix = $1,
                user_prefix = $2,
                emp_prefix = $3
            WHERE comp_id = (
                SELECT id
                FROM company_details
                WHERE company_code = $4
            )
        `;

        const result = await req.db.query(
            query,
            [
                updatePrefixInfo.site_code,
                updatePrefixInfo.user_code,
                updatePrefixInfo.emp_code,
                updatePrefixInfo.compid
            ]
        );

        if (result.rowCount > 0) {

            return res.json({
                result: 'Success'
            });
        }

        return res.json({
            result: 'Failure',
            message: 'Company prefix details not found'
        });

    } catch (err) {

        console.error('Error updating auto generation details:', err);

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});

// ==========================================
// GET COMPANY LIST
// ==========================================

router.get('/getCompanyList', async (req, res) => {

    try {

        const query = `
            SELECT *
            FROM company_details
            WHERE id IN (
                SELECT comp_id
                FROM auto_prefixs
            )
        `;

        const result = await req.db.query(query);

        return res.json(result.rows);

    } catch (err) {

        console.error('Error fetching company list:', err);

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});

// ==========================================
// GET SITE PREFIX DETAILS
// ==========================================

router.post('/getSitePrefixDetails', async (req, res) => {

    try {

        const { compid } = req.body;

        // Get company site count and prefix information
        const prefixQuery = `
            SELECT
                a.*,
                b.site_count
            FROM auto_prefixs a
            JOIN company_details b
                ON a.comp_id = b.id
            WHERE a.comp_id = $1
        `;

        const prefixResult = await req.db.query(
            prefixQuery,
            [compid]
        );

        if (prefixResult.rows.length === 0) {

            return res.json({
                result: 'Failure',
                message: 'Auto prefix details not found'
            });
        }

        // Get current number of stores
        const storeQuery = `
            SELECT COUNT(*) AS noofsite
            FROM store_details
            WHERE comp_id = $1
        `;

        const storeResult = await req.db.query(
            storeQuery,
            [compid]
        );

        const siteCount = parseInt(
            prefixResult.rows[0].site_count,
            10
        );

        const noOfSites = parseInt(
            storeResult.rows[0].noofsite,
            10
        );

        // Check site limit
        if (siteCount > noOfSites) {

            const storePrefix =
                prefixResult.rows[0].site_prefix +
                (noOfSites + 1);

            return res.json({
                result: 'Success',
                PrefixInfo: storePrefix
            });
        }

        return res.json({
            result: 'Limit Exceed'
        });

    } catch (err) {

        console.error(
            'Error getting site prefix details:',
            err
        );

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});


// ==========================================
// SET STORE DETAILS
// ==========================================

router.post('/setStoreDetails', async (req, res) => {

    try {

        const { siteDetails } = req.body;

        const active =
            siteDetails.includestore === true ||
                siteDetails.includestore === 'true'
                ? 1
                : 0;


        const insertQuery = `
            INSERT INTO store_details
            (
                site_code,
                site_name,
                address1,
                address2,
                city,
                state,
                contact_person,
                landline,
                contact_mobno,
                contact_email,
                pincode,
                comp_id,
                gstno,
                active
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9,
                $10,
                $11,
                $12,
                $13,
                $14
            )
            RETURNING *
        `;


        const result = await req.db.query(
            insertQuery,
            [
                siteDetails.site_code,
                siteDetails.site_name,
                siteDetails.address1,
                siteDetails.address2,
                siteDetails.city,
                siteDetails.state,
                siteDetails.contact_person,
                siteDetails.landline,
                siteDetails.contact_mobno,
                siteDetails.contact_email,
                siteDetails.pincode,
                siteDetails.comp_code,
                siteDetails.gstno,
                active
            ]
        );


        return res.json(result.rows);

    } catch (err) {

        console.error(
            'Error setting store details:',
            err
        );

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});


// ==========================================
// GET SITE REPORT
// ==========================================

router.get('/getSiteReport', async (req, res) => {

    try {

        const query = `
            SELECT
                a.*,
                b.company_code,
                b.company_name
            FROM store_details a
            JOIN company_details b
                ON a.comp_id = b.id
        `;

        const result = await req.db.query(query);

        return res.json(result.rows);

    } catch (err) {

        console.error(
            'Error getting site report:',
            err
        );

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});

// ==========================================
// GET ADMIN SITE REPORT
// ==========================================

router.post('/getAdminSiteReport', async (req, res) => {

    try {

        const { compid } = req.body;

        const query = `
            SELECT
                a.*,
                b.company_code,
                b.company_name
            FROM store_details a
            JOIN company_details b
                ON a.comp_id = b.id
            WHERE a.comp_id = $1
        `;

        const result = await req.db.query(
            query,
            [compid]
        );

        return res.json(result.rows);

    } catch (err) {

        console.error(
            'Error getting admin site report:',
            err
        );

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});

// ==========================================
// EDIT SITE
// ==========================================

router.post('/EditSite', async (req, res) => {

    try {

        const { siteid } = req.body;

        const query = `
            SELECT
                a.*,
                b.company_code
            FROM store_details a
            JOIN company_details b
                ON a.comp_id = b.id
            WHERE a.id = $1
        `;

        const result = await req.db.query(
            query,
            [siteid]
        );

        return res.json(result.rows);

    } catch (err) {

        console.error(
            'Error getting site details:',
            err
        );

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});

// ==========================================
// UPDATE STORE DETAILS
// ==========================================

router.post('/updateStoreDetails', async (req, res) => {

    try {

        const { sitedetails, compid } = req.body;

        const active =
            sitedetails.includestore === true ||
                sitedetails.includestore === 'true'
                ? 1
                : 0;


        const query = `
            UPDATE store_details
            SET
                site_name = $1,
                address1 = $2,
                address2 = $3,
                city = $4,
                state = $5,
                contact_person = $6,
                contact_mobno = $7,
                contact_email = $8,
                pincode = $9,
                landline = $10,
                gstno = $11,
                active = $12
            WHERE site_code = $13
              AND comp_id = $14
        `;


        const result = await req.db.query(
            query,
            [
                sitedetails.site_name,
                sitedetails.address1,
                sitedetails.address2,
                sitedetails.city,
                sitedetails.state,
                sitedetails.contact_person,
                sitedetails.contact_mobno,
                sitedetails.contact_email,
                sitedetails.pincode,
                sitedetails.landline,
                sitedetails.gstno,
                active,
                sitedetails.site_code,
                compid
            ]
        );


        if (result.rowCount > 0) {

            return res.json({
                result: 'Success'
            });
        }


        return res.json({
            result: 'Failure',
            message: 'Site not found'
        });

    } catch (err) {

        console.error(
            'Error updating store details:',
            err
        );

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});

// ==========================================
// SUPER ADMIN UPDATE STORE DETAILS
// ==========================================

router.post('/superadminupdateStoreDetails', async (req, res) => {

    try {

        const { sitedetails, compid } = req.body;

        const active =
            sitedetails.includestore === true ||
                sitedetails.includestore === 'true'
                ? 1
                : 0;


        const query = `
            UPDATE store_details
            SET
                site_name = $1,
                address1 = $2,
                address2 = $3,
                city = $4,
                state = $5,
                contact_person = $6,
                contact_mobno = $7,
                contact_email = $8,
                pincode = $9,
                landline = $10,
                gstno = $11,
                active = $12
            WHERE site_code = $13
              AND comp_id = (
                  SELECT id
                  FROM company_details
                  WHERE company_code = $14
              )
        `;

        const result = await req.db.query(
            query,
            [
                sitedetails.site_name,
                sitedetails.address1,
                sitedetails.address2,
                sitedetails.city,
                sitedetails.state,
                sitedetails.contact_person,
                sitedetails.contact_mobno,
                sitedetails.contact_email,
                sitedetails.pincode,
                sitedetails.landline,
                sitedetails.gstno,
                active,
                sitedetails.site_code,
                sitedetails.comp_code
            ]
        );


        if (result.rowCount > 0) {

            return res.json({
                result: 'Success'
            });
        }

        return res.json({
            result: 'Failure',
            message: 'Site not found'
        });

    } catch (err) {

        console.error(
            'Error updating store details:',
            err
        );

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});

// ==========================================
// GET USER REPORT
// ==========================================

router.get('/getUserReport', async (req, res) => {

    try {

        const query = `
            SELECT
                a.*,
                b.company_code,
                c.name AS rolename
            FROM user_details a
            JOIN company_details b
                ON a.comp_id = b.id
            JOIN roleinfos c
                ON a.role_id = c.id
            WHERE a.id != 1
              AND a.role_id NOT IN (6)
        `;

        const result = await req.db.query(query);

        return res.json(result.rows);

    } catch (err) {

        console.error(
            'Error getting user report:',
            err
        );

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});

// ==========================================
// GET USER PREFIX DETAILS
// ==========================================

router.post('/getUserPrefixdetails', async (req, res) => {

    try {

        const { compid } = req.body;


        // ------------------------------------------
        // Get user prefix and user limit
        // ------------------------------------------

        const prefixQuery = `
            SELECT
                a.*,
                b.user_count
            FROM auto_prefixs a
            JOIN company_details b
                ON a.comp_id = b.id
            WHERE a.comp_id = $1
        `;

        const prefixResult = await req.db.query(
            prefixQuery,
            [compid]
        );


        if (prefixResult.rows.length === 0) {

            return res.json({
                result: 'Failure',
                message: 'User prefix details not found'
            });
        }


        // ------------------------------------------
        // Get current user count
        // ------------------------------------------

        const userQuery = `
            SELECT COUNT(*) AS noofuser
            FROM user_details
            WHERE comp_id = $1
        `;

        const userResult = await req.db.query(
            userQuery,
            [compid]
        );


        const userCount = parseInt(
            prefixResult.rows[0].user_count,
            10
        );

        const noOfUsers = parseInt(
            userResult.rows[0].noofuser,
            10
        );


        // ------------------------------------------
        // Check user limit
        // ------------------------------------------

        if (userCount > noOfUsers) {

            const userPrefix =
                prefixResult.rows[0].user_prefix +
                (noOfUsers + 1);

            return res.json({
                result: 'Success',
                PrefixInfo: userPrefix
            });
        }


        return res.json({
            result: 'Limit Exceed'
        });

    } catch (err) {

        console.error(
            'Error getting user prefix details:',
            err
        );

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});

// ==========================================
// GET ROLE LIST
// ==========================================

router.get('/getRoleList', async (req, res) => {

    try {

        const query = `
            SELECT *
            FROM roleinfos
        `;

        const result = await req.db.query(query);

        return res.json(result.rows);

    } catch (err) {

        console.error('Error getting role list:', err);

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});

// ==========================================
// GET ROLE LIST 1
// ==========================================

router.post('/getRoleList1', async (req, res) => {

    try {

        const { compid } = req.body;


        // Get roles
        const roleQuery = `
            SELECT *
            FROM roleinfos
        `;

        const roleResult = await req.db.query(roleQuery);


        // Get company type
        const companyQuery = `
            SELECT comp_type
            FROM company_details
            WHERE id = $1
        `;

        const companyResult = await req.db.query(
            companyQuery,
            [compid]
        );


        return res.json({
            data: roleResult.rows,
            data1: companyResult.rows
        });

    } catch (err) {

        console.error('Error getting role list:', err);

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});


// ==========================================
// SET USER DETAILS
// ==========================================

router.post('/setUserDetails', async (req, res) => {

    try {

        const { userdetails } = req.body;


        const useractive =
            userdetails.active === true ||
                userdetails.active === 'true'
                ? 1
                : 0;


        const siteid =
            userdetails.site_code === null ||
                userdetails.site_code === undefined ||
                userdetails.site_code === ''
                ? null
                : userdetails.site_code;


        const query = `
            INSERT INTO user_details
            (
                user_code,
                user_name,
                password,
                role_id,
                mobile_no,
                email,
                comp_id,
                active,
                site_id
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9
            )
            RETURNING *
        `;


        const result = await req.db.query(
            query,
            [
                userdetails.user_code,
                userdetails.user_name,
                userdetails.password,
                userdetails.role_id,
                userdetails.mobileno,
                userdetails.email,
                userdetails.comp_code,
                useractive,
                siteid
            ]
        );


        return res.json(result.rows);

    } catch (err) {

        console.error('Error setting user details:', err);

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});


// ==========================================
// EDIT USER
// ==========================================

router.post('/EditUSer', async (req, res) => {

    try {

        const { userid } = req.body;

        const query = `
            SELECT
                a.*,
                b.company_code,
                c.name AS rolename,
                d.site_code,
                d.site_name
            FROM user_details a
            JOIN company_details b
                ON a.comp_id = b.id
            JOIN roleinfos c
                ON a.role_id = c.id
            LEFT JOIN store_details d
                ON a.site_id = d.id
            WHERE a.id = $1
        `;

        const result = await req.db.query(
            query,
            [userid]
        );

        return res.json(result.rows);

    } catch (err) {

        console.error('Error getting user details:', err);

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});


// ==========================================
// UPDATE USER DETAILS
// ==========================================

router.post('/updateUserDetails', async (req, res) => {

    try {

        const { userdetails } = req.body;

        const useractive =
            userdetails.active === true ||
                userdetails.active === 'true'
                ? 1
                : 0;

        const query = `
            UPDATE user_details
            SET
                user_name = $1,
                password = $2,
                mobile_no = $3,
                email = $4,
                active = $5
            WHERE user_code = $6
        `;

        const result = await req.db.query(
            query,
            [
                userdetails.user_name,
                userdetails.password,
                userdetails.mobileno,
                userdetails.email,
                useractive,
                userdetails.user_code
            ]
        );

        if (result.rowCount > 0) {

            return res.json({
                result: 'Success'
            });
        }

        return res.json({
            result: 'Failure',
            message: 'User not found'
        });

    } catch (err) {

        console.error('Error updating user details:', err);

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});


// ==========================================
// GET ADMIN USER REPORT
// ==========================================

router.post('/getAdminUserReport', async (req, res) => {

    try {

        const { compid } = req.body;

        const query = `
            SELECT
                a.*,
                b.company_code,
                c.name AS rolename,
                d.site_code,
                d.site_name
            FROM user_details a
            JOIN company_details b
                ON a.comp_id = b.id
            JOIN roleinfos c
                ON a.role_id = c.id
            JOIN store_details d
                ON a.site_id = d.id
            WHERE a.id != 1
              AND a.role_id NOT IN (6)
              AND a.comp_id = $1
        `;

        const result = await req.db.query(
            query,
            [compid]
        );

        return res.json(result.rows);

    } catch (err) {

        console.error('Error getting admin user report:', err);

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});



// ==========================================
// GET SITE LIST
// ==========================================

router.post('/getSiteList', async (req, res) => {

    try {

        const { compid } = req.body;

        const query = `
            SELECT *
            FROM store_details
            WHERE comp_id = $1
              AND active = 1
        `;

        const result = await req.db.query(
            query,
            [compid]
        );

        return res.json(result.rows);

    } catch (err) {

        console.error('Error getting site list:', err);

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});

// ==========================================
// SET REGIONAL USER DETAILS
// ==========================================

router.post('/setRegionalUserDetails', async (req, res) => {

    const client = await req.db.connect();

    try {

        const { userdetails } = req.body;

        const useractive =
            userdetails.active === true ||
                userdetails.active === 'true'
                ? 1
                : 0;

        const siteid =
            userdetails.site_code === null ||
                userdetails.site_code === undefined ||
                userdetails.site_code === ''
                ? null
                : userdetails.site_code;


        await client.query('BEGIN');


        // ------------------------------------------
        // Insert User
        // ------------------------------------------

        const userQuery = `
            INSERT INTO user_details
            (
                user_code,
                user_name,
                password,
                role_id,
                mobile_no,
                email,
                comp_id,
                active,
                site_id
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9
            )
            RETURNING id
        `;


        const userResult = await client.query(
            userQuery,
            [
                userdetails.user_code,
                userdetails.user_name,
                userdetails.password,
                userdetails.role_id,
                userdetails.mobileno,
                userdetails.email,
                userdetails.comp_code,
                useractive,
                siteid
            ]
        );


        const userId = userResult.rows[0].id;


        // ------------------------------------------
        // Insert User Privileges
        // ------------------------------------------

        const privileges =
            Array.isArray(userdetails.previlege)
                ? userdetails.previlege
                : [];


        for (const privilegeId of privileges) {

            const privilegeQuery = `
                INSERT INTO gateuser_details
                (
                    user_id,
                    privileges_id,
                    comp_id,
                    site_id
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4
                )
            `;


            await client.query(
                privilegeQuery,
                [
                    userId,
                    privilegeId,
                    userdetails.comp_code,
                    siteid
                ]
            );
        }


        await client.query('COMMIT');


        return res.json({
            result: 'Success',
            user_id: userId
        });


    } catch (err) {

        await client.query('ROLLBACK');

        console.error(
            'Error setting regional user details:',
            err
        );

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });

    } finally {

        client.release();
    }
});


// ==========================================
// EDIT REGIONAL USER
// ==========================================

router.post('/EditRegionalUSer', async (req, res) => {

    try {

        const { userid } = req.body;

        const query = `
            SELECT
                a.*,
                b.company_code,
                c.name AS rolename,
                d.site_code,
                d.site_name,
                e.privileges_id
            FROM user_details a
            JOIN company_details b
                ON a.comp_id = b.id
            JOIN roleinfos c
                ON a.role_id = c.id
            JOIN store_details d
                ON a.site_id = d.id
            JOIN gateuser_details e
                ON a.id = e.user_id
            WHERE a.id = $1
        `;


        const result = await req.db.query(
            query,
            [userid]
        );


        return res.json(result.rows);


    } catch (err) {

        console.error(
            'Error getting regional user details:',
            err
        );

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});


// ==========================================
// UPDATE REGIONAL USER DETAILS
// ==========================================

router.post('/updateRegionalUserDetails', async (req, res) => {

    const client = await req.db.connect();

    try {

        const { userdetails } = req.body;

        const useractive =
            userdetails.active === true ||
                userdetails.active === 'true'
                ? 1
                : 0;

        const siteid =
            userdetails.site_code === null ||
                userdetails.site_code === undefined ||
                userdetails.site_code === ''
                ? null
                : userdetails.site_code;


        const privileges =
            Array.isArray(userdetails.previlege)
                ? userdetails.previlege
                : [];


        await client.query('BEGIN');


        // ------------------------------------------
        // Update User
        // ------------------------------------------

        const updateUserQuery = `
            UPDATE user_details
            SET
                user_name = $1,
                password = $2,
                mobile_no = $3,
                email = $4,
                active = $5
            WHERE user_code = $6
        `;


        const userResult = await client.query(
            updateUserQuery,
            [
                userdetails.user_name,
                userdetails.password,
                userdetails.mobileno,
                userdetails.email,
                useractive,
                userdetails.user_code
            ]
        );


        if (userResult.rowCount === 0) {

            await client.query('ROLLBACK');

            return res.json({
                result: 'Failure',
                message: 'User not found'
            });
        }


        // ------------------------------------------
        // Get User ID
        // ------------------------------------------

        const userIdQuery = `
            SELECT id
            FROM user_details
            WHERE user_code = $1
        `;


        const userResultByCode = await client.query(
            userIdQuery,
            [userdetails.user_code]
        );


        const userId = userResultByCode.rows[0].id;


        // ------------------------------------------
        // Delete Existing Privileges
        // ------------------------------------------

        const deletePrivilegeQuery = `
            DELETE FROM gateuser_details
            WHERE user_id = $1
        `;


        await client.query(
            deletePrivilegeQuery,
            [userId]
        );


        // ------------------------------------------
        // Insert New Privileges
        // ------------------------------------------

        for (const privilegeId of privileges) {

            const insertPrivilegeQuery = `
                INSERT INTO gateuser_details
                (
                    user_id,
                    privileges_id,
                    comp_id,
                    site_id
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4
                )
            `;


            await client.query(
                insertPrivilegeQuery,
                [
                    userId,
                    privilegeId,
                    userdetails.comp_code,
                    siteid
                ]
            );
        }


        await client.query('COMMIT');


        return res.json({
            result: 'Success'
        });


    } catch (err) {

        await client.query('ROLLBACK');

        console.error(
            'Error updating regional user details:',
            err
        );

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });

    } finally {

        client.release();
    }
});


// ==========================================
// GET REGIONAL ADMIN USER REPORT
// ==========================================

router.post('/getRegionalAdminUserReport', async (req, res) => {

    try {

        const { siteid, compid } = req.body;

        const query = `
            SELECT
                a.*,
                b.company_code,
                c.name AS rolename,
                d.site_code,
                d.site_name
            FROM user_details a
            JOIN company_details b
                ON a.comp_id = b.id
            JOIN roleinfos c
                ON a.role_id = c.id
            JOIN store_details d
                ON a.site_id = d.id
            WHERE a.id != 1
              AND a.role_id NOT IN (3, 5, 6)
              AND a.site_id = $1
              AND a.comp_id = $2
        `;

        const result = await req.db.query(
            query,
            [siteid, compid]
        );

        return res.json(result.rows);

    } catch (err) {

        console.error(
            'Error getting regional admin user report:',
            err
        );

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});

// ==========================================
// GET EMPLOYEE REPORT
// ==========================================

router.post('/getEmployeeReport', async (req, res) => {

    try {

        const { compid, siteid } = req.body;

        const query = `
            SELECT *
            FROM employee_details
            WHERE comp_id = $1
              AND site_id = $2
        `;

        const result = await req.db.query(
            query,
            [compid, siteid]
        );

        return res.json(result.rows);

    } catch (err) {

        console.error(
            'Error getting employee report:',
            err
        );

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});


// ==========================================
// GET EMPLOYEE PREFIX
// ==========================================

router.post('/getEmployeePrefix', async (req, res) => {

    try {

        const { compid } = req.body;


        // ------------------------------------------
        // Get employee prefix
        // ------------------------------------------

        const prefixQuery = `
            SELECT *
            FROM auto_prefixs
            WHERE comp_id = $1
        `;

        const prefixResult = await req.db.query(
            prefixQuery,
            [compid]
        );


        if (prefixResult.rows.length === 0) {

            return res.json({
                result: 'Failure',
                message: 'Employee prefix details not found'
            });
        }


        // ------------------------------------------
        // Get current employee count
        // ------------------------------------------

        const employeeQuery = `
            SELECT COUNT(*) AS noofemp
            FROM employee_details
            WHERE comp_id = $1
        `;

        const employeeResult = await req.db.query(
            employeeQuery,
            [compid]
        );


        const noOfEmployees = parseInt(
            employeeResult.rows[0].noofemp,
            10
        );


        // ------------------------------------------
        // Generate employee prefix
        // ------------------------------------------

        const empPrefix =
            prefixResult.rows[0].emp_prefix +
            (noOfEmployees + 1);


        return res.json({
            result: 'Success',
            PrefixInfo: empPrefix
        });


    } catch (err) {

        console.error(
            'Error getting employee prefix:',
            err
        );

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});


// ==========================================
// SET EMPLOYEE DETAILS
// ==========================================

router.post('/setEmployeeDetails', async (req, res) => {

    const client = await req.db.connect();
    try {


        const { empdetails } = req.body;

        console.log(
            'empdetails insert:',
            empdetails
        );


        // ------------------------------------------
        // Convert Boolean values to 1 / 0
        // ------------------------------------------

        const empactive =
            empdetails.active === true ||
                empdetails.active === 'true'
                ? 1
                : 0;

        const vehicle =
            empdetails.vechile === true ||
                empdetails.vechile === 'true'
                ? 1
                : 0;

        const italert =
            empdetails.italert === true ||
                empdetails.italert === 'true'
                ? 1
                : 0;

        const adminalert =
            empdetails.adminalert === true ||
                empdetails.adminalert === 'true'
                ? 1
                : 0;


        await client.query('BEGIN');


        // ------------------------------------------
        // Insert Employee
        // ------------------------------------------

        const employeeQuery = `
            INSERT INTO employee_details
            (
                employee_code,
                employee_name,
                email,
                mobile_no,
                designation,
                department,
                active,
                vechile,
                vechile_type,
                vechile_no,
                site_id,
                comp_id,
                it_alert,
                admin_alert
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9,
                $10,
                $11,
                $12,
                $13,
                $14
            )
            RETURNING id
        `;


        const employeeResult = await client.query(
            employeeQuery,
            [
                empdetails.emp_code,
                empdetails.emp_name,
                empdetails.email,
                empdetails.mobileno,
                empdetails.designation,
                empdetails.department,
                empactive,
                vehicle,
                empdetails.vechiletype,
                empdetails.vechilenumber,
                empdetails.site_code,
                empdetails.comp_code,
                italert,
                adminalert
            ]
        );


        const employeeId =
            employeeResult.rows[0].id;


        // ------------------------------------------
        // Get Employee Role ID
        // ------------------------------------------

        const roleQuery = `
            SELECT id
            FROM roleinfos
            WHERE code = $1
        `;


        const roleResult = await client.query(
            roleQuery,
            ['EMP']
        );


        if (roleResult.rows.length === 0) {

            throw new Error(
                'EMP role not found in roleinfos'
            );
        }


        const roleId = roleResult.rows[0].id;


        // ------------------------------------------
        // Insert User Login Details
        // ------------------------------------------

        const userQuery = `
            INSERT INTO user_details
            (
                user_code,
                user_name,
                password,
                role_id,
                mobile_no,
                email,
                comp_id,
                active,
                site_id
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9
            )
            RETURNING id
        `;


        const userResult = await client.query(
            userQuery,
            [
                empdetails.emp_code,
                empdetails.username,
                empdetails.password,
                roleId,
                empdetails.mobileno,
                empdetails.email,
                empdetails.comp_code,
                empactive,
                empdetails.site_code
            ]
        );


        const userId =
            userResult.rows[0].id;


        await client.query('COMMIT');


        return res.json({
            result: 'Success',
            employee_id: employeeId,
            user_id: userId
        });


    } catch (err) {

        await client.query('ROLLBACK');

        console.error(
            'Error setting employee details:',
            err
        );

        return res.status(500).json({
            result: 'Error',
            message: err.message || 'Database error'
        });

    } finally {

        client.release();
    }
});


// ==========================================
// EDIT EMPLOYEE
// ==========================================

router.post('/EditEmployee', async (req, res) => {

    try {

        const { empid } = req.body;


        const query = `
            SELECT
                a.*,
                b.user_name,
                b.password
            FROM employee_details a
            JOIN user_details b
                ON a.employee_code = b.user_code
                AND a.site_id = b.site_id
                AND a.comp_id = b.comp_id
            WHERE a.id = $1
        `;


        const result = await req.db.query(
            query,
            [empid]
        );


        return res.json(result.rows);


    } catch (err) {

        console.error(
            'Error getting employee details:',
            err
        );

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});


// ==========================================
// UPDATE EMPLOYEE DETAILS
// ==========================================

router.post('/updateEmployeeDetails', async (req, res) => {

    try {

        const { empdata } = req.body;

        const empactive =
            empdata.active === true ||
                empdata.active === 'true'
                ? 1
                : 0;

        const vehicle =
            empdata.vechile === true ||
                empdata.vechile === 'true'
                ? 1
                : 0;

        const italert =
            empdata.italert === true ||
                empdata.italert === 'true'
                ? 1
                : 0;

        const adminalert =
            empdata.adminalert === true ||
                empdata.adminalert === 'true'
                ? 1
                : 0;


        const query = `
            UPDATE employee_details
            SET
                employee_name = $1,
                mobile_no = $2,
                email = $3,
                designation = $4,
                department = $5,
                active = $6,
                vechile = $7,
                vechile_no = $8,
                vechile_type = $9,
                it_alert = $10,
                admin_alert = $11
            WHERE employee_code = $12
        `;


        const result = await req.db.query(
            query,
            [
                empdata.emp_name,
                empdata.mobileno,
                empdata.email,
                empdata.designation,
                empdata.department,
                empactive,
                vehicle,
                empdata.vechilenumber,
                empdata.vechiletype,
                italert,
                adminalert,
                empdata.emp_code
            ]
        );


        if (result.rowCount > 0) {

            return res.json({
                result: 'Success'
            });
        }


        return res.json({
            result: 'Failure',
            message: 'Employee not found'
        });


    } catch (err) {

        console.error(
            'Error updating employee details:',
            err
        );

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});

// ==========================================
// GET GATE PASS REPORT
// ==========================================

router.post('/getGatePassReport', async (req, res) => {

    try {

        const { compid, siteid } = req.body;

        const query = `
            SELECT
                a.*,
                b.visitor_desc AS pass_category
            FROM pass_details a
            JOIN visitor_masters b
                ON a.passcategory_id = b.id
            WHERE a.comp_id = $1
              AND a.site_id = $2
        `;


        const result = await req.db.query(
            query,
            [compid, siteid]
        );


        return res.json(result.rows);


    } catch (err) {

        console.error(
            'Error getting gate pass report:',
            err
        );

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});

// ==========================================
// GET PASS CATEGORY
// ==========================================

router.get('/getPassCategory', async (req, res) => {

    try {

        const query = `
            SELECT *
            FROM passcategory_details
        `;


        const result = await req.db.query(query);


        return res.json(result.rows);


    } catch (err) {

        console.error(
            'Error getting pass categories:',
            err
        );

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});

// ==========================================
// SET PASS DETAILS
// ==========================================

router.post('/setPassDetails', async (req, res) => {

    try {

        const { passdetails } = req.body;

        const passactive =
            passdetails.active === true ||
                passdetails.active === 'true'
                ? 1
                : 0;


        // ------------------------------------------
        // Check duplicate pass
        // ------------------------------------------

        const checkQuery = `
            SELECT *
            FROM pass_details
            WHERE comp_id = $1
              AND site_id = $2
              AND pass_code = $3
        `;

        const checkResult = await req.db.query(
            checkQuery,
            [
                passdetails.comp_code,
                passdetails.site_code,
                passdetails.pass_code
            ]
        );


        if (checkResult.rows.length > 0) {

            return res.json({
                result: 'Already Exists'
            });
        }


        // ------------------------------------------
        // Insert Pass
        // ------------------------------------------

        const insertQuery = `
            INSERT INTO pass_details
            (
                pass_code,
                pass_desc,
                passcategory_id,
                info1,
                info2,
                active,
                site_id,
                comp_id
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8
            )
            RETURNING *
        `;


        const result = await req.db.query(
            insertQuery,
            [
                passdetails.pass_code,
                passdetails.pass_desc,
                passdetails.pass_category,
                passdetails.info1,
                passdetails.info2,
                passactive,
                passdetails.site_code,
                passdetails.comp_code
            ]
        );


        return res.json({
            result: 'Success',
            data: result.rows
        });


    } catch (err) {

        console.error(
            'Error setting pass details:',
            err
        );

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});

// ==========================================
// EDIT PASS
// ==========================================

router.post('/EditPass', async (req, res) => {

    try {

        const { passid } = req.body;

        const query = `
            SELECT
                a.*,
                b.visitor_desc AS pass_category
            FROM pass_details a
            JOIN visitor_masters b
                ON a.passcategory_id = b.id
            WHERE a.id = $1
        `;


        const result = await req.db.query(
            query,
            [passid]
        );


        return res.json(result.rows);


    } catch (err) {

        console.error(
            'Error getting pass details:',
            err
        );

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});


// ==========================================
// UPDATE PASS DETAILS
// ==========================================

router.post('/UpdatePassDetails', async (req, res) => {

    try {

        const { passdetails } = req.body;

        const passactive =
            passdetails.active === true ||
                passdetails.active === 'true'
                ? 1
                : 0;


        const query = `
            UPDATE pass_details
            SET
                pass_desc = $1,
                passcategory_id = $2,
                info1 = $3,
                info2 = $4,
                active = $5
            WHERE pass_code = $6
        `;


        const result = await req.db.query(
            query,
            [
                passdetails.pass_desc,
                passdetails.pass_category,
                passdetails.info1,
                passdetails.info2,
                passactive,
                passdetails.pass_code
            ]
        );


        if (result.rowCount > 0) {

            return res.json({
                result: 'Success'
            });
        }


        return res.json({
            result: 'Failure',
            message: 'Pass not found'
        });


    } catch (err) {

        console.error(
            'Error updating pass details:',
            err
        );

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});


module.exports = router;