const express = require('express');
const router = express.Router();
const request = require('request');
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

// ==========================================
// GET GATE PRIVILEGES
// ==========================================

router.get('/getGatePreviliges', async (req, res) => {

    try {

        const query = `
            SELECT *
            FROM gate_privileges
        `;

        const result = await req.db.query(query);

        return res.json(result.rows);

    } catch (err) {

        console.error(
            'Error getting gate privileges:',
            err
        );

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});


// ==========================================
// GET PENDING PASS DETAILS
// ==========================================

router.post('/getPendinPassDetails', async (req, res) => {

    try {

        const { compid, siteid } = req.body;

        const query = `
            SELECT
                a.*,
                b.visitor_desc,
                z.pass_code,
                d.mulcomp_name,
                e.company_name
            FROM visitor_trans a
            JOIN visitor_masters b
                ON a.visitors_type = b.id
            LEFT JOIN multicompany_details d
                ON a.mulcomp_id = d.id
            LEFT JOIN company_details e
                ON a.comp_id = e.id
            LEFT JOIN pass_details z
                ON a.pass_id = z.id
            WHERE a.comp_id = $1
              AND a.site_id = $2
              AND a.status = 'CheckedIn'
        `;

        const result = await req.db.query(
            query,
            [compid, siteid]
        );

        return res.json(result.rows);

    } catch (err) {

        console.error(
            'Error getting pending pass details:',
            err
        );

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});


// ==========================================
// PERMANENT EMPLOYEE UPDATE RELEASE DETAILS
// ==========================================

router.post(
    '/permanent_emp_updateReleaseDetails',
    async (req, res) => {

        const client = await req.db.connect();

        try {

            const {
                userdata,
                compid,
                siteid
            } = req.body;


            await client.query('BEGIN');


            // ------------------------------------------
            // 1. Update visitor transaction
            // ------------------------------------------

            const updateQuery = `
                UPDATE visitor_trans
                SET
                    guest_type = 1,
                    status = 'CheckedOut',
                    checkout_date = CURRENT_TIMESTAMP
                WHERE comp_id = $1
                  AND site_id = $2
                  AND id = $3
                RETURNING *
            `;


            const updateResult = await client.query(
                updateQuery,
                [
                    compid,
                    siteid,
                    userdata.id
                ]
            );


            if (updateResult.rows.length === 0) {

                await client.query('ROLLBACK');

                return res.json({
                    result: 'Failure',
                    message: 'Visitor transaction not found'
                });
            }


            // ------------------------------------------
            // 2. Get updated visitor information
            // ------------------------------------------

            const insertdata =
                updateResult.rows[0];


            // ------------------------------------------
            // 3. Check permanent employee
            // ------------------------------------------

            const checkEmployeeQuery = `
                SELECT COUNT(*) AS total
                FROM permanent_employee
                WHERE mobile_no = $1
                  AND visitor_name = $2
                  AND site_id = $3
                  AND comp_id = $4
            `;


            const employeeCheckResult =
                await client.query(
                    checkEmployeeQuery,
                    [
                        insertdata.mobile_no,
                        insertdata.visitor_name,
                        insertdata.site_id,
                        insertdata.comp_id
                    ]
                );


            const existingCount = parseInt(
                employeeCheckResult.rows[0].total,
                10
            );


            // ------------------------------------------
            // 4. Insert permanent employee if not exists
            // ------------------------------------------

            if (existingCount === 0) {

                const insertEmployeeQuery = `
                    INSERT INTO permanent_employee
                    (
                        mobile_no,
                        visitor_name,
                        coming_from,
                        persontomeet,
                        visitors_type,
                        image_type,
                        image_path,
                        image_name,
                        idproof_type,
                        idproof_path,
                        idproof_name,
                        laptop,
                        model,
                        serial_no,
                        vehicle_type,
                        vehicle_no,
                        pass_id,
                        checkout_date,
                        status,
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
                        $8,
                        $9,
                        $10,
                        $11,
                        $12,
                        $13,
                        $14,
                        $15,
                        $16,
                        $17,
                        CURRENT_TIMESTAMP,
                        'CheckedOut',
                        $18,
                        $19
                    )
                `;


                await client.query(
                    insertEmployeeQuery,
                    [
                        insertdata.mobile_no,
                        insertdata.visitor_name,
                        insertdata.coming_from,
                        insertdata.persontomeet,
                        insertdata.visitors_type,
                        insertdata.image_type,
                        insertdata.image_path,
                        insertdata.image_name,
                        insertdata.idproof_type,
                        insertdata.idproof_path,
                        insertdata.idproof_name,
                        insertdata.laptop,
                        insertdata.model,
                        insertdata.serial_no,
                        insertdata.vehicle_type,
                        insertdata.vehicle_no,
                        insertdata.pass_id,
                        insertdata.site_id,
                        insertdata.comp_id
                    ]
                );
            }


            // ------------------------------------------
            // 5. Get remaining pending passes
            // ------------------------------------------

            const pendingPassQuery = `
                SELECT
                    a.*,
                    b.visitor_desc,
                    c.pass_code,
                    d.mulcomp_name
                FROM visitor_trans a
                JOIN visitor_masters b
                    ON a.visitors_type = b.id
                JOIN pass_details c
                    ON a.pass_id = c.id
                LEFT JOIN multicompany_details d
                    ON a.mulcomp_id = d.id
                WHERE a.comp_id = $1
                  AND a.site_id = $2
                  AND a.status = 'CheckedIn'
            `;


            const pendingPassResult =
                await client.query(
                    pendingPassQuery,
                    [compid, siteid]
                );


            await client.query('COMMIT');


            return res.json(
                pendingPassResult.rows
            );


        } catch (err) {

            await client.query('ROLLBACK');

            console.error(
                'Error releasing permanent employee:',
                err
            );

            return res.status(500).json({
                result: 'Error',
                message: 'Database error'
            });

        } finally {

            client.release();
        }
    }
);

// ==========================================
// CHECK-IN STATUS
// ==========================================

router.post('/CheckInStatus', async (req, res) => {

    try {

        const { phoneData } = req.body;

        const query = `
            UPDATE permanent_employee
            SET
                checkin_date = CURRENT_TIMESTAMP,
                checkout_date = NULL,
                status = 'CheckedIn'
            WHERE mobile_no = $1
        `;

        const result = await req.db.query(
            query,
            [phoneData.phoneno]
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
            'Error updating check-in status:',
            err
        );

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});


// ==========================================
// CHECK-OUT STATUS
// ==========================================

router.post('/CheckoutStatus', async (req, res) => {

    try {

        const { phonedt } = req.body;

        const query = `
            UPDATE permanent_employee
            SET
                checkout_date = CURRENT_TIMESTAMP,
                status = 'CheckedOut'
            WHERE mobile_no = $1
        `;

        const result = await req.db.query(
            query,
            [phonedt.phoneno]
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
            'Error updating check-out status:',
            err
        );

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});

// ==========================================
// GET PHONE DETAILS
// ==========================================

router.post('/GetPhoneDetails', async (req, res) => {

    try {

        const {
            phoneValue,
            siteid,
            comp
        } = req.body;

        const query = `
            SELECT *
            FROM permanent_employee
            WHERE mobile_no = $1
              AND site_id = $2
              AND comp_id = $3
        `;

        const result = await req.db.query(
            query,
            [
                phoneValue.phoneno,
                siteid,
                comp
            ]
        );

        return res.json(result.rows);

    } catch (err) {

        console.error(
            'Error getting phone details:',
            err
        );

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});


// ==========================================
// GET PHONE DATA
// ==========================================

router.post('/getPhoneData', async (req, res) => {

    try {

        const {
            phoneValue,
            siteid,
            comp
        } = req.body;

        const query = `
            SELECT *
            FROM permanent_employee
            WHERE mobile_no = $1
              AND site_id = $2
              AND comp_id = $3
        `;

        const result = await req.db.query(
            query,
            [
                phoneValue.phoneno,
                siteid,
                comp
            ]
        );

        return res.json(result.rows);

    } catch (err) {

        console.error(
            'Error getting phone data:',
            err
        );

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});


// ==========================================
// UPDATE RELEASE DETAILS
// ==========================================

router.post('/updateReleaseDetails', async (req, res) => {

    try {

        const {
            userdata,
            compid,
            siteid
        } = req.body;


        // ------------------------------------------
        // 1. Update visitor transaction
        // ------------------------------------------

        const updateQuery = `
            UPDATE visitor_trans
            SET
                guest_type = 0,
                status = 'CheckedOut',
                checkout_date = CURRENT_TIMESTAMP
            WHERE comp_id = $1
              AND site_id = $2
              AND id = $3
        `;


        const updateResult = await req.db.query(
            updateQuery,
            [
                compid,
                siteid,
                userdata.id
            ]
        );


        if (updateResult.rowCount === 0) {

            return res.json({
                result: 'Failure',
                message: 'Visitor transaction not found'
            });
        }


        // ------------------------------------------
        // 2. Get remaining checked-in visitors
        // ------------------------------------------

        const pendingQuery = `
            SELECT
                a.*,
                b.visitor_desc,
                c.pass_code,
                d.mulcomp_name
            FROM visitor_trans a
            JOIN visitor_masters b
                ON a.visitors_type = b.id
            JOIN pass_details c
                ON a.pass_id = c.id
            LEFT JOIN multicompany_details d
                ON a.mulcomp_id = d.id
            WHERE a.comp_id = $1
              AND a.site_id = $2
              AND a.status = 'CheckedIn'
        `;


        const result = await req.db.query(
            pendingQuery,
            [
                compid,
                siteid
            ]
        );


        return res.json(result.rows);


    } catch (err) {

        console.error(
            'Error updating release details:',
            err
        );

        return res.status(500).json({
            result: 'Error',
            message: 'Database error'
        });
    }
});


// ==========================================
// VISITOR DATA INSERTION / CHECK-IN
// ==========================================

router.post('/visitordatainsertion', async (req, res) => {

    const client = await req.db.connect();

    try {

        const {
            fromdata,
            imagepath,
            idproofpath,
            siteid,
            comp,
            mobiledata
        } = req.body;


        const laptop =
            fromdata.laptop === true ||
            fromdata.laptop === 'true'
                ? 1
                : 0;


        await client.query('BEGIN');


        // ==========================================
        // 1. Update visitor_details
        // ==========================================

        const updateVisitorQuery = `
            UPDATE visitor_details
            SET
                visitor_name = $1,
                coming_from = $2,
                persontomeet = $3,
                visitors_type = $4,
                image_path = $5,
                idproof_path = $6,
                laptop = $7,
                model = $8,
                serial_no = $9,
                vehicle_type = $10,
                vehicle_no = $11,
                pass_id = $12,
                checkin_date = CURRENT_TIMESTAMP,
                status = 'CheckedIn'
            WHERE site_id = $13
              AND comp_id = $14
              AND mobile_no = $15
        `;


        await client.query(
            updateVisitorQuery,
            [
                fromdata.visitor_name,
                fromdata.coming_from,
                fromdata.emp_id,
                fromdata.visitors_type,
                imagepath,
                idproofpath,
                laptop,
                laptop ? fromdata.model : null,
                laptop ? fromdata.serial_no : null,
                fromdata.vehicle_type,
                fromdata.vehicle_no,
                fromdata.pass_id,
                siteid,
                comp,
                mobiledata
            ]
        );


        // ==========================================
        // 2. Insert visitor transaction
        // ==========================================

        let transactionResult;


        if (
            fromdata.company_name !== undefined &&
            fromdata.company_name !== null &&
            fromdata.company_name !== ''
        ) {

            const insertTransactionQuery = `
                INSERT INTO visitor_trans
                (
                    mobile_no,
                    visitor_name,
                    coming_from,
                    persontomeet,
                    visitors_type,
                    image_path,
                    idproof_path,
                    laptop,
                    model,
                    serial_no,
                    vehicle_type,
                    vehicle_no,
                    pass_id,
                    checkin_date,
                    status,
                    site_id,
                    comp_id,
                    mulcomp_id
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
                    CURRENT_TIMESTAMP,
                    'CheckedIn',
                    $14,
                    $15,
                    $16
                )
                RETURNING *
            `;


            transactionResult = await client.query(
                insertTransactionQuery,
                [
                    mobiledata,
                    fromdata.visitor_name,
                    fromdata.coming_from,
                    fromdata.emp_id,
                    fromdata.visitors_type,
                    imagepath,
                    idproofpath,
                    laptop,
                    laptop ? fromdata.model : null,
                    laptop ? fromdata.serial_no : null,
                    fromdata.vehicle_type,
                    fromdata.vehicle_no,
                    fromdata.pass_id,
                    siteid,
                    comp,
                    fromdata.company_name
                ]
            );

        } else {

            const insertTransactionQuery = `
                INSERT INTO visitor_trans
                (
                    mobile_no,
                    visitor_name,
                    coming_from,
                    persontomeet,
                    visitors_type,
                    image_path,
                    idproof_path,
                    laptop,
                    model,
                    serial_no,
                    vehicle_type,
                    vehicle_no,
                    pass_id,
                    checkin_date,
                    status,
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
                    $8,
                    $9,
                    $10,
                    $11,
                    $12,
                    $13,
                    CURRENT_TIMESTAMP,
                    'CheckedIn',
                    $14,
                    $15
                )
                RETURNING *
            `;


            transactionResult = await client.query(
                insertTransactionQuery,
                [
                    mobiledata,
                    fromdata.visitor_name,
                    fromdata.coming_from,
                    fromdata.emp_id,
                    fromdata.visitors_type,
                    imagepath,
                    idproofpath,
                    laptop,
                    laptop ? fromdata.model : null,
                    laptop ? fromdata.serial_no : null,
                    fromdata.vehicle_type,
                    fromdata.vehicle_no,
                    fromdata.pass_id,
                    siteid,
                    comp
                ]
            );
        }


        // ==========================================
        // 3. Get visitor details
        // ==========================================

        const visitorQuery = `
            SELECT
                a.*,
                b.mulcomp_name,
                c.company_name
            FROM visitor_details a
            LEFT JOIN multicompany_details b
                ON a.mulcomp_id = b.id
            LEFT JOIN company_details c
                ON a.comp_id = c.id
            WHERE a.mobile_no = $1
              AND a.site_id = $2
              AND a.comp_id = $3
        `;


        const visitorResult = await client.query(
            visitorQuery,
            [
                mobiledata,
                siteid,
                comp
            ]
        );


        await client.query('COMMIT');


        // ==========================================
        // 4. Send response
        // ==========================================

        return res.json({
            status: 'Success',
            otp: transactionResult.rows[0],
            data: visitorResult.rows
        });


    } catch (err) {

        await client.query('ROLLBACK');

        console.error(
            'Error during visitor data insertion:',
            err
        );

        return res.status(500).json({
            status: 'Error',
            message: 'Database error'
        });

    } finally {

        client.release();
    }
});


// ==========================================
// SET VISITOR ENTRY
// ==========================================

router.post('/setVisitorentry', async (req, res) => {

    const client = await req.db.connect();

    try {

        const {
            fromdata,
            imgdata,
            idimgdata,
            siteid,
            compid,
            mobiledata,
            otpdata
        } = req.body;


        const noOfVisitors =
            fromdata.no_of_visitors === 'yes' ||
            fromdata.no_of_visitors === true
                ? 1
                : 0;


        await client.query('BEGIN');


        // ==========================================
        // 1. Update visitor_details
        // ==========================================

        const updateQuery = `
            UPDATE visitor_details
            SET
                visitor_name = $1,
                coming_from = $2,
                persontomeet = $3,
                visitors_type = $4,
                image_path = $5,
                idproof_path = $6,
                no_of_visitors = $7,
                model = $8,
                serial_no = $9,
                no_of_persons = $10,
                vis_luggage = $11,
                pass_id = $12,
                mob_model = $13,
                checkin_date = CURRENT_TIMESTAMP,
                status = 'CheckedIn'
            WHERE site_id = $14
              AND comp_id = $15
              AND mobile_no = $16
              AND otp = $17
            RETURNING *
        `;


        const updateResult = await client.query(
            updateQuery,
            [
                fromdata.visitor_name,
                fromdata.coming_from,
                fromdata.persontomeet,
                fromdata.visitortype,
                imgdata,
                idimgdata,
                noOfVisitors,
                fromdata.lapmodel_no,
                fromdata.lapserial_no,
                fromdata.noofperson,
                fromdata.luggage,
                fromdata.pass_type,
                fromdata.mobmodel_no,
                siteid,
                compid,
                mobiledata,
                otpdata
            ]
        );


        // ==========================================
        // Visitor / OTP validation
        // ==========================================

        if (updateResult.rows.length === 0) {

            await client.query('ROLLBACK');

            return res.status(400).json({
                Result: 'Failure',
                message: 'Visitor details not found or OTP is invalid'
            });
        }


        // ==========================================
        // 2. Insert visitor transaction
        // ==========================================

        let transactionResult;


        // ------------------------------------------
        // Company / Multi-company visitor
        // ------------------------------------------

        if (
            fromdata.company_name !== undefined &&
            fromdata.company_name !== null &&
            fromdata.company_name !== ''
        ) {

            const insertQuery = `
                INSERT INTO visitor_trans
                (
                    mobile_no,
                    visitor_name,
                    coming_from,
                    persontomeet,
                    visitors_type,
                    image_path,
                    idproof_path,
                    no_of_visitors,
                    model,
                    serial_no,
                    no_of_persons,
                    vis_luggage,
                    pass_id,
                    mob_model,
                    checkin_date,
                    status,
                    site_id,
                    comp_id,
                    mulcomp_id
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
                    CURRENT_TIMESTAMP,
                    'CheckedIn',
                    $15,
                    $16,
                    $17
                )
                RETURNING *
            `;


            transactionResult = await client.query(
                insertQuery,
                [
                    mobiledata,
                    fromdata.visitor_name,
                    fromdata.coming_from,
                    fromdata.persontomeet,
                    fromdata.visitortype,
                    imgdata,
                    idimgdata,
                    noOfVisitors,
                    fromdata.lapmodel_no,
                    fromdata.lapserial_no,
                    fromdata.noofperson,
                    fromdata.luggage,
                    fromdata.pass_type,
                    fromdata.mobmodel_no,
                    siteid,
                    compid,
                    fromdata.company_name
                ]
            );

        }

        // ------------------------------------------
        // Normal visitor
        // ------------------------------------------

        else {

            const insertQuery = `
                INSERT INTO visitor_trans
                (
                    mobile_no,
                    visitor_name,
                    coming_from,
                    persontomeet,
                    visitors_type,
                    image_path,
                    idproof_path,
                    no_of_visitors,
                    model,
                    serial_no,
                    no_of_persons,
                    vis_luggage,
                    pass_id,
                    mob_model,
                    checkin_date,
                    status,
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
                    $8,
                    $9,
                    $10,
                    $11,
                    $12,
                    $13,
                    $14,
                    CURRENT_TIMESTAMP,
                    'CheckedIn',
                    $15,
                    $16
                )
                RETURNING *
            `;


            transactionResult = await client.query(
                insertQuery,
                [
                    mobiledata,
                    fromdata.visitor_name,
                    fromdata.coming_from,
                    fromdata.persontomeet,
                    fromdata.visitortype,
                    imgdata,
                    idimgdata,
                    noOfVisitors,
                    fromdata.lapmodel_no,
                    fromdata.lapserial_no,
                    fromdata.noofperson,
                    fromdata.luggage,
                    fromdata.pass_type,
                    fromdata.mobmodel_no,
                    siteid,
                    compid
                ]
            );
        }


        // ==========================================
        // 3. Get visitor information
        // ==========================================

        const visitorQuery = `
            SELECT
                a.*,
                b.mulcomp_name,
                c.company_name
            FROM visitor_details a
            LEFT JOIN multicompany_details b
                ON a.mulcomp_id = b.id
            LEFT JOIN company_details c
                ON a.comp_id = c.id
            WHERE a.mobile_no = $1
              AND a.site_id = $2
              AND a.comp_id = $3
        `;


        const visitorResult = await client.query(
            visitorQuery,
            [
                mobiledata,
                siteid,
                compid
            ]
        );


        await client.query('COMMIT');


        // ==========================================
        // 4. Response
        // ==========================================

        return res.json({
            status: 'Success',
            otp: transactionResult.rows[0],
            data: visitorResult.rows
        });


    } catch (err) {

        await client.query('ROLLBACK');

        console.error(
            'Error setting visitor entry:',
            err
        );

        return res.status(500).json({
            Result: 'Error',
            message: 'Database error'
        });

    } finally {

        client.release();
    }
});

// ==========================================
// SUBMIT MOBILE NUMBER
// ==========================================

router.post('/submitmobnumber', async (req, res) => {

    const client = await req.db.connect();

    try {

        const {
            fromdata,
            company_name,
            siteid,
            comp
        } = req.body;


        // ------------------------------------------
        // Generate 4 digit OTP
        // ------------------------------------------

        const custotp = Math.floor(
            1000 + Math.random() * 9000
        );


        await client.query('BEGIN');


        // ------------------------------------------
        // 1. Check visitor_details
        // ------------------------------------------

        const visitorQuery = `
            SELECT COUNT(id) AS otpcount
            FROM visitor_details
            WHERE mobile_no = $1
              AND comp_id = $2
              AND site_id = $3
        `;


        const visitorResult = await client.query(
            visitorQuery,
            [
                fromdata,
                comp,
                siteid
            ]
        );


        const otpCount = parseInt(
            visitorResult.rows[0].otpcount,
            10
        );


        // ==========================================
        // EXISTING VISITOR
        // ==========================================

        if (otpCount > 0) {


            // ------------------------------------------
            // 2. Check whether visitor is already checked in
            // ------------------------------------------

            const checkedInQuery = `
                SELECT COUNT(id) AS mobilenumcount
                FROM visitor_trans
                WHERE mobile_no = $1
                  AND comp_id = $2
                  AND site_id = $3
                  AND status = 'CheckedIn'
            `;


            const checkedInResult =
                await client.query(
                    checkedInQuery,
                    [
                        fromdata,
                        comp,
                        siteid
                    ]
                );


            const mobileNumCount = parseInt(
                checkedInResult.rows[0].mobilenumcount,
                10
            );


            // ------------------------------------------
            // Already checked in
            // ------------------------------------------

            if (mobileNumCount > 0) {

                await client.query('ROLLBACK');

                return res.status(200).json({
                    status: 'Already Exists'
                });
            }


            // ------------------------------------------
            // 3. Generate new OTP
            // ------------------------------------------

            const updateQuery = `
                UPDATE visitor_details
                SET
                    otp = $1,
                    otp_date = CURRENT_TIMESTAMP
                WHERE mobile_no = $2
                  AND site_id = $3
                  AND comp_id = $4
            `;


            await client.query(
                updateQuery,
                [
                    custotp,
                    fromdata,
                    siteid,
                    comp
                ]
            );


            await client.query('COMMIT');


            // ------------------------------------------
            // Send OTP
            // ------------------------------------------

            // SMS sending should be handled here
            // using your SMS service.


            return res.status(200).json({
                status: 'Success',
                otp: custotp
            });
        }


        // ==========================================
        // NEW VISITOR
        // ==========================================

        let insertQuery;
        let insertValues;


        if (
            company_name !== undefined &&
            company_name !== null &&
            company_name !== ''
        ) {

            // ------------------------------------------
            // New visitor with multi-company
            // ------------------------------------------

            insertQuery = `
                INSERT INTO visitor_details
                (
                    mobile_no,
                    otp,
                    mulcomp_id,
                    otp_date,
                    site_id,
                    comp_id
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    CURRENT_TIMESTAMP,
                    $4,
                    $5
                )
            `;


            insertValues = [
                fromdata,
                custotp,
                company_name,
                siteid,
                comp
            ];

        } else {

            // ------------------------------------------
            // New normal visitor
            // ------------------------------------------

            insertQuery = `
                INSERT INTO visitor_details
                (
                    mobile_no,
                    otp,
                    otp_date,
                    site_id,
                    comp_id
                )
                VALUES
                (
                    $1,
                    $2,
                    CURRENT_TIMESTAMP,
                    $3,
                    $4
                )
            `;


            insertValues = [
                fromdata,
                custotp,
                siteid,
                comp
            ];
        }


        await client.query(
            insertQuery,
            insertValues
        );


        await client.query('COMMIT');


        // ------------------------------------------
        // Send OTP
        // ------------------------------------------

        // SMS sending should be handled here
        // using your SMS service.


        return res.status(200).json({
            status: 'Success',
            otp: custotp
        });


    } catch (err) {

        await client.query('ROLLBACK');

        console.error(
            'Error submitting mobile number:',
            err
        );

        return res.status(500).json({
            status: 'Error',
            message: 'Database error'
        });

    } finally {

        client.release();
    }
});

// ==========================================
// SUBMIT MOBILE NUMBER
// ==========================================

router.post('/submitmobilenumber', async (req, res) => {

    try {

        const {
            fromdata,
            company_name,
            siteid,
            comp
        } = req.body;


        // ------------------------------------------
        // Generate 4 digit OTP
        // ------------------------------------------

        const custotp = Math.floor(
            1000 + Math.random() * 9000
        );


        // ------------------------------------------
        // Insert visitor details
        // ------------------------------------------

        let query;
        let values;


        if (
            company_name !== undefined &&
            company_name !== null &&
            company_name !== ''
        ) {

            // ------------------------------------------
            // Multi-company visitor
            // ------------------------------------------

            query = `
                INSERT INTO visitor_details
                (
                    mobile_no,
                    otp,
                    mulcomp_id,
                    otp_date,
                    site_id,
                    comp_id
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    CURRENT_TIMESTAMP,
                    $4,
                    $5
                )
                RETURNING *
            `;


            values = [
                fromdata,
                custotp,
                company_name,
                siteid,
                comp
            ];

        } else {

            // ------------------------------------------
            // Normal visitor
            // ------------------------------------------

            query = `
                INSERT INTO visitor_details
                (
                    mobile_no,
                    otp,
                    otp_date,
                    site_id,
                    comp_id
                )
                VALUES
                (
                    $1,
                    $2,
                    CURRENT_TIMESTAMP,
                    $3,
                    $4
                )
                RETURNING *
            `;


            values = [
                fromdata,
                custotp,
                siteid,
                comp
            ];
        }


        const result = await req.db.query(
            query,
            values
        );


        if (result.rows.length === 0) {

            return res.status(500).json({
                status: 'Failure',
                message: 'Unable to create visitor OTP'
            });
        }


        // ------------------------------------------
        // Send OTP SMS
        // ------------------------------------------

        /*
            SMS sending will be handled separately.

            Example:

            await sendOtpSms(
                fromdata,
                custotp
            );
        */


        return res.status(200).json({
            status: 'Success',
            otp: custotp
        });


    } catch (err) {

        console.error(
            'Error submitting mobile number:',
            err
        );

        return res.status(500).json({
            status: 'Error',
            message: 'Database error'
        });
    }
});


// ==========================================
// RESEND MOBILE OTP
// ==========================================

router.post('/resendmobnumber', async (req, res) => {

    try {

        const {
            fromdata,
            company_name,
            siteid,
            comp
        } = req.body;


        // ------------------------------------------
        // Generate new 4 digit OTP
        // ------------------------------------------

        const custotp = Math.floor(
            1000 + Math.random() * 9000
        );


        // ------------------------------------------
        // Check existing visitor
        // ------------------------------------------

        const checkQuery = `
            SELECT COUNT(id) AS otpcount
            FROM visitor_details
            WHERE mobile_no = $1
              AND comp_id = $2
              AND site_id = $3
        `;


        const checkResult = await req.db.query(
            checkQuery,
            [
                fromdata,
                comp,
                siteid
            ]
        );


        const otpCount = parseInt(
            checkResult.rows[0].otpcount,
            10
        );


        // ==========================================
        // EXISTING VISITOR
        // ==========================================

        if (otpCount > 0) {

            const updateQuery = `
                UPDATE visitor_details
                SET
                    otp = $1,
                    otp_date = CURRENT_TIMESTAMP
                WHERE mobile_no = $2
                  AND site_id = $3
                  AND comp_id = $4
            `;


            const updateResult = await req.db.query(
                updateQuery,
                [
                    custotp,
                    fromdata,
                    siteid,
                    comp
                ]
            );


            if (updateResult.rowCount === 0) {

                return res.status(500).json({
                    status: 'Failure',
                    message: 'Unable to update OTP'
                });
            }


            // ------------------------------------------
            // Send OTP SMS
            // ------------------------------------------

            // await sendOtpSms(fromdata, custotp);


            return res.status(200).json({
                status: 'Success',
                otp: custotp
            });
        }


        // ==========================================
        // NEW VISITOR
        // ==========================================

        let insertQuery;
        let insertValues;


        if (
            company_name !== undefined &&
            company_name !== null &&
            company_name !== ''
        ) {

            // ------------------------------------------
            // Multi-company visitor
            // ------------------------------------------

            insertQuery = `
                INSERT INTO visitor_details
                (
                    mobile_no,
                    otp,
                    mulcomp_id,
                    otp_date,
                    site_id,
                    comp_id
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    CURRENT_TIMESTAMP,
                    $4,
                    $5
                )
                RETURNING *
            `;


            insertValues = [
                fromdata,
                custotp,
                company_name,
                siteid,
                comp
            ];

        } else {

            // ------------------------------------------
            // Normal visitor
            // ------------------------------------------

            insertQuery = `
                INSERT INTO visitor_details
                (
                    mobile_no,
                    otp,
                    otp_date,
                    site_id,
                    comp_id
                )
                VALUES
                (
                    $1,
                    $2,
                    CURRENT_TIMESTAMP,
                    $3,
                    $4
                )
                RETURNING *
            `;


            insertValues = [
                fromdata,
                custotp,
                siteid,
                comp
            ];
        }


        const insertResult = await req.db.query(
            insertQuery,
            insertValues
        );


        if (insertResult.rows.length === 0) {

            return res.status(500).json({
                status: 'Failure',
                message: 'Unable to create visitor OTP'
            });
        }


        // ------------------------------------------
        // Send OTP SMS
        // ------------------------------------------

        // await sendOtpSms(fromdata, custotp);


        return res.status(200).json({
            status: 'Success',
            otp: custotp
        });


    } catch (err) {

        console.error(
            'Error resending mobile OTP:',
            err
        );

        return res.status(500).json({
            status: 'Error',
            message: 'Database error'
        });
    }
});

router.post('/resendmobilenumber', async (req, res) => {

    const {
        fromdata,
        company_name,
        siteid,
        comp
    } = req.body;

    try {

        console.log("Resend OTP Request:", req.body);

        // Generate 4 digit OTP
        const custotp = Math.floor(1000 + Math.random() * 9000);

        /*
         * Check whether visitor already exists
         */
        const visitorResult = await req.db.query(
            `SELECT COUNT(id) AS otpcount
             FROM visitor_details
             WHERE mobile_no = $1
               AND comp_id = $2
               AND site_id = $3`,
            [fromdata, comp, siteid]
        );

        const otpCount = parseInt(visitorResult.rows[0].otpcount);

        /*
         * Existing visitor
         */
        if (otpCount > 0) {

            /*
             * Update OTP
             */
            const updateResult = await req.db.query(
                `UPDATE visitor_details
                 SET otp = $1,
                     otp_date = CURRENT_TIMESTAMP
                 WHERE mobile_no = $2
                   AND site_id = $3
                   AND comp_id = $4`,
                [
                    custotp,
                    fromdata,
                    siteid,
                    comp
                ]
            );

            /*
             * Send OTP SMS
             *
             * Keep SMS credentials in environment/configuration.
             */
            const smsUrl =
                `http://sms.hosticia.in/sendsms` +
                `?uname=${process.env.SMS_USERNAME}` +
                `&pwd=${process.env.SMS_PASSWORD}` +
                `&senderid=${process.env.SMS_SENDER_ID}` +
                `&to=${fromdata}` +
                `&msg=Your%20Verification%20code%20is%20${custotp}` +
                `&route=T`;

            request(
                {
                    uri: smsUrl
                },
                function (error, response, body) {

                    if (error) {
                        console.error("SMS Error:", error);

                        return res.status(500).json({
                            status: "Failure",
                            message: "Unable to send OTP"
                        });
                    }

                    if (response && response.statusCode < 400) {

                        return res.status(200).json({
                            status: "Success",
                            otp: custotp
                        });

                    } else {

                        return res.status(500).json({
                            status: "Failure",
                            message: "SMS service failed"
                        });
                    }
                }
            );

            return;
        }

        /*
         * Visitor does not exist
         * Create new visitor_details record
         */

        if (company_name !== null &&
            company_name !== undefined &&
            company_name !== '') {

            await req.db.query(
                `INSERT INTO visitor_details
                (
                    mobile_no,
                    otp,
                    mulcomp_id,
                    otp_date,
                    site_id,
                    comp_id
                )
                VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5)`,
                [
                    fromdata,
                    custotp,
                    company_name,
                    siteid,
                    comp
                ]
            );

        } else {

            await req.db.query(
                `INSERT INTO visitor_details
                (
                    mobile_no,
                    otp,
                    otp_date,
                    site_id,
                    comp_id
                )
                VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4)`,
                [
                    fromdata,
                    custotp,
                    siteid,
                    comp
                ]
            );
        }

        /*
         * Send OTP
         */
        const smsUrl =
            `http://sms.hosticia.in/sendsms` +
            `?uname=${process.env.SMS_USERNAME}` +
            `&pwd=${process.env.SMS_PASSWORD}` +
            `&senderid=${process.env.SMS_SENDER_ID}` +
            `&to=${fromdata}` +
            `&msg=Your%20Verification%20code%20is%20${custotp}` +
            `&route=T`;

        request(
            {
                uri: smsUrl
            },
            function (error, response, body) {

                if (error) {

                    console.error("SMS Error:", error);

                    return res.status(500).json({
                        status: "Failure",
                        message: "Unable to send OTP"
                    });
                }

                if (response && response.statusCode < 400) {

                    return res.status(200).json({
                        status: "Success",
                        otp: custotp
                    });

                } else {

                    return res.status(500).json({
                        status: "Failure",
                        message: "SMS service failed"
                    });
                }
            }
        );

    } catch (err) {

        console.error(
            "Error in resendmobilenumber:",
            err
        );

        res.status(500).json({
            status: "Failure",
            message: "Database error"
        });
    }
});

router.post('/getVisitorReport', async (req, res) => {

    try {

        const visitorInfo = req.body.visitorInfo || {};

        const compid = visitorInfo.compid;
        const siteid = visitorInfo.siteid;
        const fromDate = visitorInfo.Fromdate;
        const toDate = visitorInfo.Todate;


        // ------------------------------------------
        // Base Query
        // ------------------------------------------

        let query = `
            SELECT
                a.*,
                b.visitor_desc,
                z.pass_code,
                d.mulcomp_name
            FROM visitor_trans a

            JOIN visitor_masters b
                ON a.visitors_type = b.id

            LEFT JOIN multicompany_details d
                ON a.mulcomp_id = d.id

            LEFT JOIN pass_details z
                ON a.pass_id = z.id

            WHERE a.comp_id = $1
        `;


        const params = [compid];
        let paramIndex = 2;


        // ------------------------------------------
        // Site Filter
        // ------------------------------------------

        if (
            siteid !== null &&
            siteid !== undefined &&
            siteid !== ''
        ) {

            query += `
                AND a.site_id = $${paramIndex}
            `;

            params.push(siteid);
            paramIndex++;
        }


        // ------------------------------------------
        // Date Filters
        // ------------------------------------------

        if (
            fromDate !== null &&
            fromDate !== undefined &&
            fromDate !== '' &&

            toDate !== null &&
            toDate !== undefined &&
            toDate !== ''
        ) {

            query += `
                AND DATE(a.checkin_date)
                    BETWEEN $${paramIndex}
                    AND $${paramIndex + 1}
            `;

            params.push(fromDate);
            params.push(toDate);

            paramIndex += 2;

        }

        else if (
            fromDate !== null &&
            fromDate !== undefined &&
            fromDate !== ''
        ) {

            query += `
                AND DATE(a.checkin_date) = $${paramIndex}
            `;

            params.push(fromDate);
            paramIndex++;

        }

        else if (
            toDate !== null &&
            toDate !== undefined &&
            toDate !== ''
        ) {

            query += `
                AND DATE(a.checkin_date) = $${paramIndex}
            `;

            params.push(toDate);
            paramIndex++;
        }


        // ------------------------------------------
        // Order
        // ------------------------------------------

        query += `
            ORDER BY a.checkin_date DESC
        `;


        console.log("Visitor Report Query:", query);
        console.log("Visitor Report Params:", params);


        // ------------------------------------------
        // Execute PostgreSQL Query
        // ------------------------------------------

        const result = await req.db.query(
            query,
            params
        );


        return res.status(200).json(result.rows);


    } catch (err) {

        console.error(
            "Error getting visitor report:",
            err
        );

        return res.status(500).json({
            status: "Failure",
            message: "Database error"
        });
    }
});

// ==========================================
// SUBMIT OTP
// ==========================================

router.post('/submitotp', async (req, res) => {

    const {
        mob_num,
        siteid,
        comp,
        otp
    } = req.body;

    try {

        console.log("Submit OTP Request:", req.body);


        // ------------------------------------------
        // Check OTP
        // ------------------------------------------

        const result = await req.db.query(
            `
            SELECT *
            FROM visitor_details
            WHERE mobile_no = $1
              AND otp = $2
              AND site_id = $3
              AND comp_id = $4
            `,
            [
                mob_num,
                otp,
                siteid,
                comp
            ]
        );


        // ------------------------------------------
        // Invalid OTP / Data
        // ------------------------------------------

        if (result.rows.length === 0) {

            return res.status(200).json({
                status: "Invalid Data"
            });
        }


        // ------------------------------------------
        // Check OTP expiry
        // ------------------------------------------

        const otpDate = result.rows[0].otp_date;

        const currentTime = new Date();

        const otpTime = new Date(otpDate);

        const timeDifference =
            currentTime.getTime() - otpTime.getTime();

        const diffMinutes =
            Math.round(timeDifference / 60000);


        // ------------------------------------------
        // OTP Expired
        // ------------------------------------------

        if (diffMinutes > 5) {

            return res.status(200).json({
                status: "OTP Expired"
            });
        }


        // ------------------------------------------
        // OTP Valid
        // ------------------------------------------

        return res.status(200).json({
            status: "Success"
        });


    } catch (err) {

        console.error(
            "Error submitting OTP:",
            err
        );

        return res.status(500).json({
            status: "Failure",
            message: "Database error"
        });
    }
});


// ==========================================
// SUBMIT MOBILE OTP
// ==========================================

router.post('/submitmobotp', async (req, res) => {

    const {
        mobnum,
        siteid,
        comp,
        otp
    } = req.body;

    try {

        console.log("Submit Mobile OTP Request:", req.body);

        // ------------------------------------------
        // Check OTP
        // ------------------------------------------

        const result = await req.db.query(
            `
            SELECT *
            FROM visitor_details
            WHERE mobile_no = $1
              AND otp = $2
              AND site_id = $3
              AND comp_id = $4
            `,
            [
                mobnum,
                otp,
                siteid,
                comp
            ]
        );


        // ------------------------------------------
        // Invalid OTP / Data
        // ------------------------------------------

        if (result.rows.length === 0) {

            return res.status(200).json({
                status: "Invalid Data"
            });
        }


        // ------------------------------------------
        // Check OTP expiry
        // ------------------------------------------

        const otpDate = new Date(
            result.rows[0].otp_date
        );

        const currentTime = new Date();

        const timeDifference =
            currentTime.getTime() -
            otpDate.getTime();

        const diffMinutes =
            Math.round(timeDifference / 60000);


        // ------------------------------------------
        // OTP Expired
        // ------------------------------------------

        if (diffMinutes > 5) {

            return res.status(200).json({
                status: "OTP Expired"
            });
        }


        // ------------------------------------------
        // OTP Valid
        // ------------------------------------------

        return res.status(200).json({
            status: "Success"
        });


    } catch (err) {

        console.error(
            "Error submitting mobile OTP:",
            err
        );

        return res.status(500).json({
            status: "Failure",
            message: "Database error"
        });
    }
});


// ==========================================
// GET EMPLOYEE
// ==========================================

router.post('/getemployee', async (req, res) => {

    const {
        siteid,
        comp
    } = req.body;

    try {

        const result = await req.db.query(
            `
            SELECT
                id,
                employee_name
            FROM employee_details
            WHERE site_id = $1
              AND comp_id = $2
            `,
            [
                siteid,
                comp
            ]
        );

        return res.status(200).json(result.rows);

    } catch (err) {

        console.error(
            "Error getting employees:",
            err
        );

        return res.status(500).json({
            status: "Failure",
            message: "Database error"
        });
    }
});


// ==========================================
// GET EMPLOYEE BOOKING
// ==========================================

router.post('/getemployeebooking', async (req, res) => {

    const {
        siteid,
        comp,
        usercode
    } = req.body;

    try {

        const result = await req.db.query(
            `
            SELECT *
            FROM employee_details
            WHERE site_id = $1
              AND comp_id = $2
              AND employee_code <> $3
            `,
            [
                siteid,
                comp,
                usercode
            ]
        );

        return res.status(200).json(result.rows);

    } catch (err) {

        console.error(
            "Error getting employee booking list:",
            err
        );

        return res.status(500).json({
            status: "Failure",
            message: "Database error"
        });
    }
});


// ==========================================
// GET VENDOR LIST
// ==========================================

router.post('/getvendorlist', async (req, res) => {

    const {
        siteid,
        comp
    } = req.body;

    try {

        const result = await req.db.query(
            `
            SELECT *
            FROM visitor_masters
            WHERE site_id = $1
              AND comp_id = $2
            `,
            [
                siteid,
                comp
            ]
        );

        return res.status(200).json(result.rows);

    } catch (err) {

        console.error(
            "Error getting vendor list:",
            err
        );

        return res.status(500).json({
            status: "Failure",
            message: "Database error"
        });
    }
});


// ==========================================
// GET PASS DETAILS
// ==========================================

router.post('/getpassdetails', async (req, res) => {

    const {
        siteid,
        comp,
        mobiledata,
        visitortypeid
    } = req.body;

    try {

        console.log(
            "Visitor Type ID:",
            visitortypeid
        );

        const result = await req.db.query(
            `
            SELECT
                id,
                pass_code
            FROM pass_details
            WHERE site_id = $1
              AND comp_id = $2
              AND passcategory_id = $3
              AND id NOT IN
              (
                  SELECT pass_id
                  FROM visitor_trans
                  WHERE site_id = $1
                    AND comp_id = $2
                    AND pass_id IS NOT NULL
                    AND status = 'CheckedIn'
              )
            `,
            [
                siteid,
                comp,
                visitortypeid
            ]
        );

        return res.status(200).json(result.rows);

    } catch (err) {

        console.error(
            "Error getting pass details:",
            err
        );

        return res.status(500).json({
            status: "Failure",
            message: "Database error"
        });
    }
});


// ==========================================
// GET VISITOR DETAILS
// ==========================================

router.post('/visitordetails', async (req, res) => {

    const {
        siteid,
        comp,
        mobiledata,
        usercode
    } = req.body;

    try {

        const result = await req.db.query(
            `
            SELECT
                a.visitors_type,
                a.visitor_name,
                a.image_path AS "imageAsDataUrl",
                a.idproof_path AS "idproofimageAsDataUrls",
                a.coming_from,
                a.persontomeet,
                a.vehicle_type,
                a.laptop,
                a.model,
                a.serial_no,
                a.vehicle_no,
                a.pass_id,
                a.mulcomp_id,
                c.privileges_id

            FROM visitor_details a

            JOIN user_details b
                ON b.user_code = $4
               AND b.site_id = $1
               AND b.comp_id = $2

            JOIN gateuser_details c
                ON c.site_id = $1
               AND c.comp_id = $2
               AND c.user_id = b.id

            WHERE a.mobile_no = $3
              AND a.site_id = $1
              AND a.comp_id = $2
            `,
            [
                siteid,
                comp,
                mobiledata,
                usercode
            ]
        );

        return res.status(200).json(result.rows);

    } catch (err) {

        console.error(
            "Error getting visitor details:",
            err
        );

        return res.status(500).json({
            status: "Failure",
            message: "Database error"
        });
    }
});

// ==========================================
// GET VISITOR TRANSACTION DETAILS
// ==========================================

router.post('/visdetails', async (req, res) => {

    const {
        siteid,
        compid,
        mobiledata
    } = req.body;

    try {

        const result = await req.db.query(
            `
            SELECT *
            FROM visitor_trans
            WHERE site_id = $1
              AND comp_id = $2
              AND mobile_no = $3
              AND guest_type = 1
            ORDER BY checkin_date DESC
            `,
            [
                siteid,
                compid,
                mobiledata
            ]
        );

        return res.status(200).json(result.rows);

    } catch (err) {

        console.error(
            "Error getting visitor transaction details:",
            err
        );

        return res.status(500).json({
            status: "Failure",
            message: "Database error"
        });
    }
});


// ==========================================
// SET VISITOR ADDITIONAL DETAILS
// ==========================================

router.post('/setVisitoraddDetails', async (req, res) => {

    const {
        fromdata,
        compid,
        siteid,
        imgdata,
        person,
        visitortype,
        comingfrom,
        pass
    } = req.body;

    try {

        console.log(
            "New visitor entry:",
            req.body
        );

        const query = `
            INSERT INTO visitor_trans
            (
                mobile_no,
                visitor_name,
                coming_from,
                image_path,
                vis_luggage,
                model,
                serial_no,
                mob_model,
                persontomeet,
                visitors_type,
                pass_id,
                checkin_date,
                status,
                comp_id,
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
                $9,
                $10,
                $11,
                CURRENT_TIMESTAMP,
                'CheckedIn',
                $12,
                $13
            )
        `;

        const values = [
            fromdata.addmobile_no,
            fromdata.addvisitor_name,
            comingfrom,
            imgdata,
            fromdata.addluggage,
            fromdata.addlapmodel_no,
            fromdata.addlapserial_no,
            fromdata.addmobmodel_no,
            person,
            visitortype,
            pass,
            compid,
            siteid
        ];

        await req.db.query(
            query,
            values
        );

        return res.status(200).json({
            Result: "Success"
        });

    } catch (err) {

        console.error(
            "Error adding visitor details:",
            err
        );

        return res.status(500).json({
            Result: "Failure",
            message: "Database error"
        });
    }
});


// ==========================================
// GET TITLE DETAILS
// ==========================================

router.post('/GetTitledetails', async (req, res) => {

    const {
        siteid,
        comp
    } = req.body;

    try {

        const result = await req.db.query(
            `
            SELECT
                welcome_msg,
                comp_type,
                logo_path
            FROM company_details
            WHERE id = $1
            `,
            [comp]
        );

        return res.status(200).json(
            result.rows
        );

    } catch (err) {

        console.error(
            "Error getting title details:",
            err
        );

        return res.status(500).json({
            status: "Failure",
            message: "Database error"
        });
    }
});


// ==========================================
// GET ADMIN COMPANY REPORT
// ==========================================

router.post('/getAdminCompanyReport', async (req, res) => {

    const {
        siteid,
        comp
    } = req.body;

    try {

        const result = await req.db.query(
            `
            SELECT *
            FROM multicompany_details
            WHERE comp_id = $1
              AND site_id = $2
            `,
            [
                comp,
                siteid
            ]
        );

        return res.status(200).json(
            result.rows
        );

    } catch (err) {

        console.error(
            "Error getting admin company report:",
            err
        );

        return res.status(500).json({
            status: "Failure",
            message: "Database error"
        });
    }
});


// ==========================================
// SET MULTI COMPANY DETAILS
// ==========================================

router.post('/setMultiCompanyDetails', async (req, res) => {

    const { compDetails } = req.body;

    const compactive =
        compDetails.active === true ? 1 : 0;

    try {

        // Check duplicate
        const checkResult = await req.db.query(
            `
            SELECT *
            FROM multicompany_details
            WHERE mulcomp_code = $1
              AND site_id = $2
              AND comp_id = $3
            `,
            [
                compDetails.mulcomp_code,
                compDetails.siteid,
                compDetails.compid
            ]
        );

        if (checkResult.rows.length > 0) {

            return res.status(200).json({
                result: "Already Exists"
            });
        }


        // Insert
        const insertResult = await req.db.query(
            `
            INSERT INTO multicompany_details
            (
                mulcomp_code,
                mulcomp_name,
                level,
                mobile_no,
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
                $7
            )
            RETURNING *
            `,
            [
                compDetails.mulcomp_code,
                compDetails.mulcomp_name,
                compDetails.level,
                compDetails.mobile_no,
                compactive,
                compDetails.siteid,
                compDetails.compid
            ]
        );


        return res.status(200).json({
            result: "Success",
            data: insertResult.rows
        });

    } catch (err) {

        console.error(
            "Error adding multi company:",
            err
        );

        return res.status(500).json({
            result: "Failure",
            message: "Database error"
        });
    }
});


// ==========================================
// EDIT MULTI COMPANY
// ==========================================

router.post('/EditMultiCompany', async (req, res) => {

    const {
        companyid
    } = req.body;

    try {

        const result = await req.db.query(
            `
            SELECT *
            FROM multicompany_details
            WHERE id = $1
            `,
            [companyid]
        );

        return res.status(200).json(
            result.rows
        );

    } catch (err) {

        console.error(
            "Error getting multi company:",
            err
        );

        return res.status(500).json({
            result: "Failure",
            message: "Database error"
        });
    }
});


// ==========================================
// UPDATE MULTI COMPANY DETAILS
// ==========================================

router.post('/UpdateMultiCompanyDetails', async (req, res) => {

    const {
        compDetails
    } = req.body;

    const compactive =
        compDetails.active === true ? 1 : 0;

    try {

        const result = await req.db.query(
            `
            UPDATE multicompany_details
            SET
                mulcomp_name = $1,
                level = $2,
                mobile_no = $3,
                active = $4
            WHERE mulcomp_code = $5
              AND site_id = $6
              AND comp_id = $7
            RETURNING *
            `,
            [
                compDetails.mulcomp_name,
                compDetails.level,
                compDetails.mobile_no,
                compactive,
                compDetails.mulcomp_code,
                compDetails.siteid,
                compDetails.compid
            ]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                result: "Not Found"
            });
        }


        return res.status(200).json(
            result.rows
        );

    } catch (err) {

        console.error(
            "Error updating multi company:",
            err
        );

        return res.status(500).json({
            result: "Failure",
            message: "Database error"
        });
    }
});


// ==========================================
// GET VISITOR MASTER REPORT
// ==========================================

router.post('/getVisitorMasterReport', async (req, res) => {

    const {
        siteid,
        comp
    } = req.body;

    try {

        const result = await req.db.query(
            `
            SELECT *
            FROM visitor_masters
            WHERE comp_id = $1
              AND site_id = $2
            `,
            [
                comp,
                siteid
            ]
        );

        return res.status(200).json(result.rows);

    } catch (err) {

        console.error(
            "Error getting visitor master report:",
            err
        );

        return res.status(500).json({
            status: "Failure",
            message: "Database error"
        });
    }
});


// ==========================================
// SET VISITOR DETAILS
// ==========================================

router.post('/setVisitorDetails', async (req, res) => {

    const {
        visitorDetails
    } = req.body;

    const compactive =
        visitorDetails.active === true ? 1 : 0;

    try {

        console.log(
            "Visitor Details:",
            visitorDetails
        );

        // ------------------------------------------
        // Check duplicate
        // ------------------------------------------

        const checkResult = await req.db.query(
            `
            SELECT *
            FROM visitor_masters
            WHERE visitor_code = $1
              AND site_id = $2
              AND comp_id = $3
            `,
            [
                visitorDetails.visitor_code,
                visitorDetails.siteid,
                visitorDetails.compid
            ]
        );

        if (checkResult.rows.length > 0) {

            return res.status(200).json({
                result: "Already Exists"
            });
        }


        // ------------------------------------------
        // Insert
        // ------------------------------------------

        const insertResult = await req.db.query(
            `
            INSERT INTO visitor_masters
            (
                visitor_code,
                visitor_desc,
                time_count,
                hrs_count,
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
                $7
            )
            RETURNING *
            `,
            [
                visitorDetails.visitor_code,
                visitorDetails.visitor_desc,
                visitorDetails.allot_time,
                visitorDetails.allot_hrs,
                compactive,
                visitorDetails.siteid,
                visitorDetails.compid
            ]
        );

        return res.status(200).json({
            result: "Success",
            data: insertResult.rows
        });

    } catch (err) {

        console.error(
            "Error adding visitor details:",
            err
        );

        return res.status(500).json({
            result: "Failure",
            message: "Database error"
        });
    }
});

// ==========================================
// EDIT VISITOR COMPANY
// ==========================================

router.post('/EditVisitorCompany', async (req, res) => {

    const {
        visitid
    } = req.body;

    try {

        const result = await req.db.query(
            `
            SELECT *
            FROM visitor_masters
            WHERE id = $1
            `,
            [visitid]
        );

        return res.status(200).json(
            result.rows
        );

    } catch (err) {

        console.error(
            "Error getting visitor details:",
            err
        );

        return res.status(500).json({
            status: "Failure",
            message: "Database error"
        });
    }
});


// ==========================================
// UPDATE VISITOR DETAILS
// ==========================================

router.post('/UpdateVisitorDetails', async (req, res) => {

    const {
        visitorDetails
    } = req.body;

    const compactive =
        visitorDetails.active === true ? 1 : 0;

    try {

        const result = await req.db.query(
            `
            UPDATE visitor_masters
            SET
                visitor_desc = $1,
                time_count = $2,
                hrs_count = $3,
                active = $4
            WHERE visitor_code = $5
              AND site_id = $6
              AND comp_id = $7
            RETURNING *
            `,
            [
                visitorDetails.visitor_desc,
                visitorDetails.allot_time,
                visitorDetails.allot_hrs,
                compactive,
                visitorDetails.visitor_code,
                visitorDetails.siteid,
                visitorDetails.compid
            ]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                result: "Not Found"
            });
        }

        return res.status(200).json(
            result.rows
        );

    } catch (err) {

        console.error(
            "Error updating visitor details:",
            err
        );

        return res.status(500).json({
            result: "Failure",
            message: "Database error"
        });
    }
});


// ==========================================
// GET MULTI COMPANY LIST
// ==========================================

router.post('/getMultiCompanyList', async (req, res) => {

    const {
        siteid,
        compid
    } = req.body;

    try {

        const result = await req.db.query(
            `
            SELECT *
            FROM multicompany_details
            WHERE active = 1
              AND site_id = $1
              AND comp_id = $2
            `,
            [
                siteid,
                compid
            ]
        );

        return res.status(200).json(result.rows);

    } catch (err) {

        console.error(
            "Error getting multi company list:",
            err
        );

        return res.status(500).json({
            status: "Failure",
            message: "Database error"
        });
    }
});


// ==========================================
// GET VISITOR MASTER LIST
// ==========================================

router.post('/getVisitorMasterList', async (req, res) => {

    const {
        siteid,
        compid
    } = req.body;

    try {

        const result = await req.db.query(
            `
            SELECT *
            FROM visitor_masters
            WHERE active = 1
              AND site_id = $1
              AND comp_id = $2
            `,
            [
                siteid,
                compid
            ]
        );

        return res.status(200).json(result.rows);

    } catch (err) {

        console.error(
            "Error getting visitor master list:",
            err
        );

        return res.status(500).json({
            status: "Failure",
            message: "Database error"
        });
    }
});


// ==========================================
// GET COMPANY LOGO
// ==========================================

router.post('/getComplogo', async (req, res) => {

    const {
        compid
    } = req.body;

    try {

        const result = await req.db.query(
            `
            SELECT
                logo_path,
                comp_type
            FROM company_details
            WHERE id = $1
            `,
            [compid]
        );

        return res.status(200).json(result.rows);

    } catch (err) {

        console.error(
            "Error getting company logo:",
            err
        );

        return res.status(500).json({
            status: "Failure",
            message: "Database error"
        });
    }
});


// ==========================================
// GET USER DETAILS
// ==========================================

router.post('/getuserdetails', async (req, res) => {

    const {
        usercode
    } = req.body;

    try {

        const result = await req.db.query(
            `
            SELECT user_name
            FROM user_details
            WHERE user_code = $1
            `,
            [usercode]
        );

        return res.status(200).json(result.rows);

    } catch (err) {

        console.error(
            "Error getting user details:",
            err
        );

        return res.status(500).json({
            status: "Failure",
            message: "Database error"
        });
    }
});


// ==========================================
// GET EMPLOYEE DETAILS
// ==========================================

router.post('/getemployedetails', async (req, res) => {

    const {
        compid,
        siteid
    } = req.body;

    try {

        // ------------------------------------------
        // Employee Details
        // ------------------------------------------

        const employeeResult = await req.db.query(
            `
            SELECT *
            FROM employee_details
            WHERE site_id = $1
              AND comp_id = $2
            `,
            [
                siteid,
                compid
            ]
        );


        // ------------------------------------------
        // Resource Details
        // ------------------------------------------

        const resourceResult = await req.db.query(
            `
            SELECT *
            FROM resource_masters
            WHERE site_id = $1
              AND comp_id = $2
            `,
            [
                siteid,
                compid
            ]
        );


        // ------------------------------------------
        // Response
        // ------------------------------------------

        return res.status(200).json({
            empdetails: employeeResult.rows,
            resource: resourceResult.rows
        });

    } catch (err) {

        console.error(
            "Error getting employee details:",
            err
        );

        return res.status(500).json({
            status: "Failure",
            message: "Database error"
        });
    }
});


// ==========================================
// INSERT CONFERENCE BOOKING
// ==========================================

router.post('/insertconferencebooking', async (req, res) => {

    const {
        compid,
        siteid,
        fromdata,
        arraydata = [],
        dates,
        usercode
    } = req.body;

    try {

        console.log(
            "Insert conference booking:",
            fromdata
        );

        // ------------------------------------------
        // Validate required values
        // ------------------------------------------

        if (!compid || !siteid || !dates || !fromdata) {

            return res.status(400).json({
                Result: "Failure",
                message: "Required booking details are missing"
            });
        }


        // ------------------------------------------
        // Convert date
        // ------------------------------------------

        const bookingDate = new Date(dates)
            .toISOString()
            .split('T')[0];


        const startTime = fromdata.start_timing;
        const endTime = fromdata.end_timing;


        // ------------------------------------------
        // Check Conference Room Availability
        // ------------------------------------------
        //
        // Old code checks:
        //
        // 1. New start inside existing booking
        // 2. New end inside existing booking
        // 3. Existing start inside new booking
        // 4. Existing end inside new booking
        //
        // PostgreSQL can handle all of this with:
        //
        // existing_start < new_end
        // AND existing_end > new_start
        //
        // ------------------------------------------

        const availabilityResult = await req.db.query(
            `
            SELECT COUNT(*) AS total
            FROM conference_details
            WHERE name_of_resource = $1
              AND is_deleted = 0
              AND date = $2
              AND start_time::time < $4::time
              AND end_time::time > $3::time
            `,
            [
                fromdata.name_of_resource,
                bookingDate,
                startTime,
                endTime
            ]
        );


        if (parseInt(availabilityResult.rows[0].total, 10) > 0) {

            return res.status(200).json({
                Result: "Not Available"
            });
        }


        // ------------------------------------------
        // Get existing booking count
        // ------------------------------------------

        const countResult = await req.db.query(
            `
            SELECT COUNT(*) AS total
            FROM conference_details
            WHERE comp_id = $1
              AND site_id = $2
              AND is_deleted = 0
            `,
            [
                compid,
                siteid
            ]
        );


        const bookingCount =
            parseInt(countResult.rows[0].total, 10);


        // ------------------------------------------
        // Get Company Code
        // ------------------------------------------

        const companyResult = await req.db.query(
            `
            SELECT company_code
            FROM company_details
            WHERE id = $1
            `,
            [compid]
        );


        if (companyResult.rows.length === 0) {

            return res.status(404).json({
                Result: "Failure",
                message: "Company not found"
            });
        }


        const companyCode =
            companyResult.rows[0].company_code;


        // ------------------------------------------
        // Generate Booking Code
        // ------------------------------------------

        const bookingCode =
            `${companyCode}_CONF_ROOM_${bookingCount + 1}`;


        // ------------------------------------------
        // External Vendor Details
        // ------------------------------------------

        const externalVendorName =
            fromdata.external_vendor_name || null;

        const externalPersonCount =
            fromdata.no_of_external_person || null;


        const requiredProjector =
            fromdata.required_projector === 'Yes'
                ? 1
                : 0;


        // ------------------------------------------
        // Insert Conference Booking
        // ------------------------------------------

        const insertResult = await req.db.query(
            `
            INSERT INTO conference_details
            (
                name_of_resource,
                department_req,
                emp_id,
                type_of_meetting,
                externeal_vendor_name,
                no_of_external,
                total_no_member,
                req_projector,
                date,
                start_time,
                status,
                comp_id,
                site_id,
                booking_code,
                user_code,
                reason,
                end_time,
                is_deleted
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
                $10::timestamp,
                'Request',
                $11,
                $12,
                $13,
                $14,
                $15,
                $16::timestamp,
                0
            )
            RETURNING id
            `,
            [
                fromdata.name_of_resource,
                fromdata.department_requested,
                fromdata.employee_iD,
                fromdata.type_of_meeting,
                externalVendorName,
                externalPersonCount,
                fromdata.total_no_of_members,
                requiredProjector,
                bookingDate,
                `${bookingDate} ${startTime}`,
                compid,
                siteid,
                bookingCode,
                usercode,
                fromdata.reason,
                `${bookingDate} ${endTime}`
            ]
        );


        // ------------------------------------------
        // Insert Other Services
        // ------------------------------------------

        for (const service of arraydata) {

            await req.db.query(
                `
                INSERT INTO conf_other_service_details
                (
                    Services,
                    time,
                    no_of_count,
                    booking_code,
                    comp_id,
                    site_id,
                    is_deleted
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    0
                )
                `,
                [
                    service.services,
                    service.timing,
                    service.count,
                    bookingCode,
                    compid,
                    siteid
                ]
            );
        }


        // ------------------------------------------
        // Get Admin Alert Emails
        // ------------------------------------------

        const adminEmailResult = await req.db.query(
            `
            SELECT email
            FROM employee_details
            WHERE site_id = $1
              AND comp_id = $2
              AND admin_alert = 1
              AND email IS NOT NULL
              AND email <> ''
            `,
            [
                siteid,
                compid
            ]
        );


        // ------------------------------------------
        // Get IT Alert Emails
        // ------------------------------------------

        const itEmailResult = await req.db.query(
            `
            SELECT email
            FROM employee_details
            WHERE site_id = $1
              AND comp_id = $2
              AND it_alert = 1
              AND email IS NOT NULL
              AND email <> ''
            `,
            [
                siteid,
                compid
            ]
        );


        const ccEmails = [
            ...adminEmailResult.rows.map(x => x.email),
            ...itEmailResult.rows.map(x => x.email)
        ];


        // ------------------------------------------
        // Get Booking Details
        // ------------------------------------------

        const bookingResult = await req.db.query(
            `
            SELECT
                a.*,
                b.employee_name,
                b.email,
                c.room_name
            FROM conference_details a

            JOIN employee_details b
                ON a.emp_id = b.id
               AND a.comp_id = $1
               AND a.site_id = $2
               AND a.is_deleted = 0
               AND a.booking_code = $3

            JOIN resource_masters c
                ON a.name_of_resource = c.id

            WHERE a.booking_code = $3
            `,
            [
                compid,
                siteid,
                bookingCode
            ]
        );


        if (bookingResult.rows.length === 0) {

            return res.status(500).json({
                Result: "Failure",
                message: "Booking created but booking details could not be retrieved"
            });
        }


        const booking = bookingResult.rows[0];


        // ------------------------------------------
        // Email
        // ------------------------------------------
        //
        // IMPORTANT:
        // Do not hard-code SMTP credentials here.
        // Read them from environment/config.
        // ------------------------------------------

        const transporter = nodeMailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });


        const mailOptions = {
            from: process.env.SMTP_USER,

            to: booking.email,

            cc: ccEmails,

            subject: 'Conference Room Booking Confirmation',

            html: `
                <h3>
                    Dear ${booking.employee_name},
                </h3>

                <br/>

                As per your request, below is your Booking Details

                <ul>
                    <li>
                        Room Name: ${booking.room_name}
                    </li>

                    <li>
                        Start Time: ${booking.start_time}
                    </li>

                    <li>
                        End Time: ${booking.end_time}
                    </li>
                </ul>

                <br/>

                Thanks & Regards,
                <br/>
                Front Office
            `
        };


        // ------------------------------------------
        // Send Email
        // ------------------------------------------

        try {

            await transporter.sendMail(
                mailOptions
            );

        } catch (mailError) {

            console.error(
                "Conference booking email failed:",
                mailError
            );

            // Booking is already successful.
            // Don't tell frontend booking failed
            // just because email failed.
        }


        // ------------------------------------------
        // Final Response
        // ------------------------------------------

        return res.status(200).json({
            Result: "Success",
            bookingCode: bookingCode,
            data: booking
        });


    } catch (err) {

        console.error(
            "Error inserting conference booking:",
            err
        );

        return res.status(500).json({
            Result: "Failure",
            message: "Database error"
        });
    }
});

router.post('/insertconferencebookingwithoutservice', async (req, res) => {

    const {
        compid,
        siteid,
        fromdata,
        dates,
        usercode
    } = req.body;

    try {

        if (!compid || !siteid || !dates || !fromdata) {
            return res.status(400).json({
                Result: "Failure",
                message: "Required booking details are missing"
            });
        }

        // -----------------------------------------
        // Booking date/time
        // -----------------------------------------

        const bookingDate = new Date(dates)
            .toISOString()
            .split('T')[0];

        const startTime = fromdata.start_timing;
        const endTime = fromdata.end_timing;


        // -----------------------------------------
        // Check room availability
        // -----------------------------------------

        const availabilityResult = await req.db.query(
            `
            SELECT COUNT(*) AS total
            FROM conference_details
            WHERE name_of_resource = $1
              AND is_deleted = 0
              AND date = $2
              AND start_time::time < $4::time
              AND end_time::time > $3::time
            `,
            [
                fromdata.name_of_resource,
                bookingDate,
                startTime,
                endTime
            ]
        );


        if (parseInt(availabilityResult.rows[0].total, 10) > 0) {

            return res.status(200).json({
                Result: "Not Available"
            });
        }


        // -----------------------------------------
        // Get booking count
        // -----------------------------------------

        const countResult = await req.db.query(
            `
            SELECT COUNT(*) AS total
            FROM conference_details
            WHERE comp_id = $1
              AND site_id = $2
              AND is_deleted = 0
            `,
            [compid, siteid]
        );


        const bookingCount =
            parseInt(countResult.rows[0].total, 10);


        // -----------------------------------------
        // Get company code
        // -----------------------------------------

        const companyResult = await req.db.query(
            `
            SELECT company_code
            FROM company_details
            WHERE id = $1
            `,
            [compid]
        );


        if (companyResult.rows.length === 0) {

            return res.status(404).json({
                Result: "Failure",
                message: "Company not found"
            });
        }


        // -----------------------------------------
        // Generate booking code
        // -----------------------------------------

        const bookingCode =
            `${companyResult.rows[0].company_code}_CONF_ROOM_${bookingCount + 1}`;


        // -----------------------------------------
        // External vendor details
        // -----------------------------------------

        const externalVendorName =
            fromdata.external_vendor_name || null;

        const externalPersonCount =
            fromdata.no_of_external_person || null;

        const requiredProjector =
            fromdata.required_projector === "Yes"
                ? 1
                : 0;


        // -----------------------------------------
        // Insert conference booking
        // -----------------------------------------

        await req.db.query(
            `
            INSERT INTO conference_details
            (
                name_of_resource,
                department_req,
                emp_id,
                type_of_meetting,
                externeal_vendor_name,
                no_of_external,
                total_no_member,
                req_projector,
                date,
                start_time,
                status,
                comp_id,
                site_id,
                booking_code,
                user_code,
                reason,
                end_time,
                is_deleted
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
                $10::timestamp,
                'Request',
                $11,
                $12,
                $13,
                $14,
                $15,
                $16::timestamp,
                0
            )
            `,
            [
                fromdata.name_of_resource,
                fromdata.department_requested,
                fromdata.employee_iD,
                fromdata.type_of_meeting,
                externalVendorName,
                externalPersonCount,
                fromdata.total_no_of_members,
                requiredProjector,
                bookingDate,
                `${bookingDate} ${startTime}`,
                compid,
                siteid,
                bookingCode,
                usercode,
                fromdata.reason,
                `${bookingDate} ${endTime}`
            ]
        );


        // -----------------------------------------
        // Get admin alert emails
        // -----------------------------------------

        const adminResult = await req.db.query(
            `
            SELECT email
            FROM employee_details
            WHERE site_id = $1
              AND comp_id = $2
              AND admin_alert = 1
              AND email IS NOT NULL
              AND email <> ''
            `,
            [siteid, compid]
        );


        const ccEmails =
            adminResult.rows.map(row => row.email);


        // -----------------------------------------
        // Get booking details
        // -----------------------------------------

        const bookingResult = await req.db.query(
            `
            SELECT
                a.*,
                b.employee_name,
                b.email,
                c.room_name
            FROM conference_details a

            JOIN employee_details b
                ON a.emp_id = b.id

            JOIN resource_masters c
                ON a.name_of_resource = c.id

            WHERE a.comp_id = $1
              AND a.site_id = $2
              AND a.booking_code = $3
              AND a.is_deleted = 0
            `,
            [
                compid,
                siteid,
                bookingCode
            ]
        );


        if (bookingResult.rows.length === 0) {

            return res.status(500).json({
                Result: "Failure",
                message: "Booking created but details could not be retrieved"
            });
        }


        const booking = bookingResult.rows[0];


        // -----------------------------------------
        // Send email
        // -----------------------------------------

        const transporter = nodeMailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });


        const mailOptions = {
            from: process.env.SMTP_USER,

            to: booking.email,

            cc: ccEmails,

            subject: "Conference Room Booking Confirmation",

            html: `
                <h3>Dear ${booking.employee_name},</h3>

                <br/>

                As per your request, below is your Booking Details

                <ul>
                    <li>
                        Room Name: ${booking.room_name}
                    </li>

                    <li>
                        Start Time: ${booking.start_time}
                    </li>

                    <li>
                        End Time: ${booking.end_time}
                    </li>
                </ul>

                <br/>

                Thanks & Regards,
                <br/>
                Front Office
            `
        };


        try {

            await transporter.sendMail(mailOptions);

        } catch (mailError) {

            console.error(
                "Email sending failed:",
                mailError
            );

            // Booking is already created.
            // Email failure should not mark booking as failed.
        }


        // -----------------------------------------
        // Success
        // -----------------------------------------

        return res.status(200).json({
            Result: "Success",
            bookingCode: bookingCode,
            data: booking
        });


    } catch (err) {

        console.error(
            "insertconferencebookingwithoutservice error:",
            err
        );

        return res.status(500).json({
            Result: "Failure",
            message: "Database error"
        });
    }
});

router.post('/getdatedetails', async (req, res) => {

    const {
        compid,
        siteid,
        usercode
    } = req.body;

    try {

        const result = await req.db.query(
            `
            SELECT *
            FROM conference_details
            WHERE comp_id = $1
              AND is_deleted = 0
              AND user_code = $2
              AND site_id = $3
            `,
            [
                compid,
                usercode,
                siteid
            ]
        );

        return res.json(result.rows);

    } catch (err) {

        console.error(
            'getdatedetails error:',
            err
        );

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});


router.post('/getresoucrdata', async (req, res) => {

    const {
        compid,
        siteid
    } = req.body;

    try {

        const result = await req.db.query(
            `
            SELECT *
            FROM resource_masters
            WHERE comp_id = $1
              AND site_id = $2
            `,
            [
                compid,
                siteid
            ]
        );

        return res.json(result.rows);

    } catch (err) {

        console.error(
            'getresoucrdata error:',
            err
        );

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});


router.post('/insertresoucr', async (req, res) => {

    const {
        compid,
        siteid,
        formdata
    } = req.body;

    try {

        // -----------------------------------------
        // Check whether room code already exists
        // -----------------------------------------

        const existingResult = await req.db.query(
            `
            SELECT COUNT(id) AS total
            FROM resource_masters
            WHERE comp_id = $1
              AND site_id = $2
              AND room_code = $3
            `,
            [
                compid,
                siteid,
                formdata.room_code
            ]
        );


        const total =
            parseInt(existingResult.rows[0].total, 10);


        if (total > 0) {

            return res.status(200).json({
                Result: 'Already Exists'
            });
        }


        // -----------------------------------------
        // Convert projector availability
        // -----------------------------------------

        const projectorAvailable =
            formdata.projector_availabe === true
                ? 1
                : 0;


        // -----------------------------------------
        // Insert resource
        // -----------------------------------------

        await req.db.query(
            `
            INSERT INTO resource_masters
            (
                room_name,
                char_in_rooms,
                projector_availabe,
                comp_id,
                site_id,
                room_code
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6
            )
            `,
            [
                formdata.room_name,
                formdata.char_in_rooms,
                projectorAvailable,
                compid,
                siteid,
                formdata.room_code
            ]
        );


        return res.status(200).json({
            Result: 'Success'
        });


    } catch (err) {

        console.error(
            'insertresoucr error:',
            err
        );

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});


router.post('/editresoursemaster', async (req, res) => {

    const {
        compid,
        siteid,
        id
    } = req.body;

    try {

        const result = await req.db.query(
            `
            SELECT *
            FROM resource_masters
            WHERE comp_id = $1
              AND site_id = $2
              AND id = $3
            `,
            [
                compid,
                siteid,
                id
            ]
        );

        return res.json(result.rows);

    } catch (err) {

        console.error(
            'editresoursemaster error:',
            err
        );

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});

// ==========================================
// UPDATE RESOURCE
// ==========================================

router.post('/updateresource', async (req, res) => {

    const {
        compid,
        siteid,
        id,
        formdata
    } = req.body;

    try {

        const projectorAvailable =
            formdata.projector_availabe === true ? 1 : 0;

        const result = await req.db.query(
            `
            UPDATE resource_masters
            SET
                room_name = $1,
                char_in_rooms = $2,
                projector_availabe = $3
            WHERE comp_id = $4
              AND site_id = $5
              AND id = $6
            `,
            [
                formdata.room_name,
                formdata.char_in_rooms,
                projectorAvailable,
                compid,
                siteid,
                id
            ]
        );

        return res.status(200).json({
            Result: 'Success'
        });

    } catch (err) {

        console.error(
            'updateresource error:',
            err
        );

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});


// ==========================================
// GET CONFERENCE RESOURCE REPORT
// ==========================================

router.post('/getcon_resource', async (req, res) => {

    const {
        conferenceInfo
    } = req.body;

    try {

        console.log(
            "Conference Report:",
            conferenceInfo
        );

        const result = await req.db.query(
            `
            SELECT
                a.*,
                b.employee_name,
                b.mobile_no,
                b.email,
                d.room_name
            FROM conference_details a

            JOIN employee_details b
                ON a.emp_id = b.id

            JOIN resource_masters d
                ON d.id = a.name_of_resource

            WHERE a.is_deleted = 0
              AND a.comp_id = $1
              AND a.site_id = $2
              AND DATE(a.date) >= $3
              AND DATE(a.date) <= $4
            `,
            [
                conferenceInfo.compid,
                conferenceInfo.siteid,
                conferenceInfo.Fromdate,
                conferenceInfo.Todate
            ]
        );

        return res.status(200).json(result.rows);

    } catch (err) {

        console.error(
            'getcon_resource error:',
            err
        );

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});


// ==========================================
// GET CONFERENCE EDIT DETAILS
// ==========================================

router.post('/geteditdetails', async (req, res) => {

    const {
        compid,
        siteid,
        code
    } = req.body;

    try {

        // -----------------------------------------
        // Old code was doing JSON.parse(codes)
        // -----------------------------------------
        //
        // If frontend sends:
        // "code": "\"ABC_CONF_ROOM_1\""
        //
        // this handles it.
        //
        // If frontend sends:
        // "code": "ABC_CONF_ROOM_1"
        //
        // JSON.parse would fail, so we handle
        // both formats.
        // -----------------------------------------

        let bookingCode = code;

        if (typeof bookingCode === 'string') {

            try {
                bookingCode = JSON.parse(bookingCode);
            } catch (e) {
                // Already a normal string
            }
        }


        // -----------------------------------------
        // Get conference booking
        // -----------------------------------------

        const conferenceResult = await req.db.query(
            `
            SELECT
                a.*,
                b.employee_name,
                b.mobile_no,
                b.email
            FROM conference_details a

            JOIN employee_details b
                ON a.emp_id = b.id

            WHERE a.is_deleted = 0
              AND a.comp_id = $1
              AND a.site_id = $2
              AND a.booking_code = $3
            `,
            [
                compid,
                siteid,
                bookingCode
            ]
        );


        // -----------------------------------------
        // Get additional services
        // -----------------------------------------

        const serviceResult = await req.db.query(
            `
            SELECT
                Services AS services,
                time AS timing,
                no_of_count AS count
            FROM conf_other_service_details
            WHERE is_deleted = 0
              AND comp_id = $1
              AND site_id = $2
              AND booking_code = $3
            `,
            [
                compid,
                siteid,
                bookingCode
            ]
        );


        // -----------------------------------------
        // Preserve old response
        // -----------------------------------------

        if (serviceResult.rows.length > 0) {

            return res.status(200).json({
                data1: conferenceResult.rows,
                data2: serviceResult.rows,
                result: 'success'
            });

        }


        return res.status(200).json({
            data1: conferenceResult.rows,
            result: 'failure'
        });


    } catch (err) {

        console.error(
            'geteditdetails error:',
            err
        );

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});

// ==========================================
// EDIT CONFERENCE BOOKING
// ==========================================

router.post('/editconferencebooking', async (req, res) => {

    const {
        compid,
        siteid,
        fromdata,
        arraydata = [],
        dates,
        usercode,
        code
    } = req.body;

    try {

        // -----------------------------------------
        // Parse booking code/date if frontend
        // sends them as JSON strings
        // -----------------------------------------

        let bookingCode = code;
        let bookingDateValue = dates;

        try {
            if (typeof bookingCode === 'string') {
                bookingCode = JSON.parse(bookingCode);
            }
        } catch (e) {
            // Already a normal string
        }

        try {
            if (typeof bookingDateValue === 'string') {
                bookingDateValue = JSON.parse(bookingDateValue);
            }
        } catch (e) {
            // Already a normal date string
        }


        // -----------------------------------------
        // Format date
        // -----------------------------------------

        const bookingDate = new Date(bookingDateValue)
            .toISOString()
            .split('T')[0];


        const startTime = fromdata.start_timing;
        const endTime = fromdata.end_timing;


        // -----------------------------------------
        // Check room availability
        //
        // IMPORTANT:
        // Exclude the booking currently being edited.
        // -----------------------------------------

        const availabilityResult = await req.db.query(
            `
            SELECT COUNT(*) AS total
            FROM conference_details
            WHERE name_of_resource = $1
              AND is_deleted = 0
              AND date = $2
              AND booking_code <> $3
              AND start_time::time < $5::time
              AND end_time::time > $4::time
            `,
            [
                fromdata.name_of_resource,
                bookingDate,
                bookingCode,
                startTime,
                endTime
            ]
        );


        const conflictCount =
            parseInt(
                availabilityResult.rows[0].total,
                10
            );


        if (conflictCount > 0) {

            return res.status(200).json({
                Result: 'Not Available'
            });
        }


        // -----------------------------------------
        // Prepare values
        // -----------------------------------------

        const requiredProjector =
            fromdata.required_projector === 'Yes'
                ? 1
                : 0;


        const externalVendorName =
            fromdata.external_vendor_name || null;


        const externalPersonCount =
            fromdata.no_of_external_person || null;


        // -----------------------------------------
        // Update conference booking
        // -----------------------------------------

        const updateResult = await req.db.query(
            `
            UPDATE conference_details
            SET
                name_of_resource = $1,
                department_req = $2,
                emp_id = $3,
                type_of_meetting = $4,
                externeal_vendor_name = $5,
                no_of_external = $6,
                total_no_member = $7,
                req_projector = $8,
                date = $9,
                start_time = $10::timestamp,
                status = 'Request',
                reason = $11,
                end_time = $12::timestamp,
                user_code = $13
            WHERE booking_code = $14
              AND is_deleted = 0
              AND comp_id = $15
              AND site_id = $16
            `,
            [
                fromdata.name_of_resource,
                fromdata.department_requested,
                fromdata.employee_iD,
                fromdata.type_of_meeting,
                externalVendorName,
                externalPersonCount,
                fromdata.total_no_of_members,
                requiredProjector,
                bookingDate,
                `${bookingDate} ${startTime}`,
                fromdata.reason,
                `${bookingDate} ${endTime}`,
                usercode,
                bookingCode,
                compid,
                siteid
            ]
        );


        if (updateResult.rowCount === 0) {

            return res.status(404).json({
                Result: 'Failure',
                message: 'Booking not found'
            });
        }


        // -----------------------------------------
        // Get Admin alert emails
        // -----------------------------------------

        const adminEmailResult = await req.db.query(
            `
            SELECT email
            FROM employee_details
            WHERE site_id = $1
              AND comp_id = $2
              AND admin_alert = 1
              AND email IS NOT NULL
              AND email <> ''
            `,
            [
                siteid,
                compid
            ]
        );


        // -----------------------------------------
        // Get IT alert emails
        // -----------------------------------------

        const itEmailResult = await req.db.query(
            `
            SELECT email
            FROM employee_details
            WHERE site_id = $1
              AND comp_id = $2
              AND it_alert = 1
              AND email IS NOT NULL
              AND email <> ''
            `,
            [
                siteid,
                compid
            ]
        );


        const ccEmails = [
            ...adminEmailResult.rows.map(
                row => row.email
            ),
            ...itEmailResult.rows.map(
                row => row.email
            )
        ];


        // -----------------------------------------
        // Delete existing services
        // -----------------------------------------

        await req.db.query(
            `
            DELETE FROM conf_other_service_details
            WHERE booking_code = $1
              AND comp_id = $2
              AND site_id = $3
            `,
            [
                bookingCode,
                compid,
                siteid
            ]
        );


        // -----------------------------------------
        // Insert updated services
        // -----------------------------------------

        for (const service of arraydata) {

            await req.db.query(
                `
                INSERT INTO conf_other_service_details
                (
                    Services,
                    time,
                    no_of_count,
                    booking_code,
                    comp_id,
                    site_id,
                    is_deleted
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    0
                )
                `,
                [
                    service.services,
                    service.timing,
                    service.count,
                    bookingCode,
                    compid,
                    siteid
                ]
            );
        }


        // -----------------------------------------
        // Get updated booking details
        // -----------------------------------------

        const bookingResult = await req.db.query(
            `
            SELECT
                a.*,
                b.employee_name,
                b.email,
                c.room_name
            FROM conference_details a

            JOIN employee_details b
                ON a.emp_id = b.id

            JOIN resource_masters c
                ON a.name_of_resource = c.id

            WHERE a.comp_id = $1
              AND a.site_id = $2
              AND a.booking_code = $3
              AND a.is_deleted = 0
            `,
            [
                compid,
                siteid,
                bookingCode
            ]
        );


        if (bookingResult.rows.length === 0) {

            return res.status(404).json({
                Result: 'Failure',
                message: 'Updated booking details not found'
            });
        }


        const booking = bookingResult.rows[0];


        // -----------------------------------------
        // Send confirmation email
        // -----------------------------------------

        const transporter = nodeMailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,

            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });


        const mailOptions = {

            from: process.env.SMTP_USER,

            to: booking.email,

            cc: ccEmails,

            subject:
                'Conference Room Booking Confirmation',

            html: `
                <h3>
                    Dear ${booking.employee_name},
                </h3>

                <br/>

                As per your request, below is your
                Booking Details

                <ul>

                    <li>
                        Room Name:
                        ${booking.room_name}
                    </li>

                    <li>
                        Start Time:
                        ${booking.start_time}
                    </li>

                    <li>
                        End Time:
                        ${booking.end_time}
                    </li>

                </ul>

                <br/>

                Thanks & Regards,
                <br/>

                Front Office
            `
        };


        // -----------------------------------------
        // Email should not make booking fail
        // -----------------------------------------

        try {

            await transporter.sendMail(
                mailOptions
            );

        } catch (mailError) {

            console.error(
                'Conference booking email failed:',
                mailError
            );
        }


        // -----------------------------------------
        // Final response
        // -----------------------------------------

        return res.status(200).json({
            Result: 'Success'
        });


    } catch (err) {

        console.error(
            'editconferencebooking error:',
            err
        );

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});

// ==========================================
// EDIT CONFERENCE BOOKING WITHOUT SERVICE
// ==========================================

router.post('/editconferencebookingwithoutservice', async (req, res) => {

    const {
        compid,
        siteid,
        fromdata,
        dates,
        code
    } = req.body;

    try {

        // -----------------------------------------
        // Parse date and booking code
        // -----------------------------------------

        let bookingDateValue = dates;
        let bookingCode = code;

        try {
            if (typeof bookingDateValue === 'string') {
                bookingDateValue = JSON.parse(bookingDateValue);
            }
        } catch (e) {
            // Already a normal date value
        }

        try {
            if (typeof bookingCode === 'string') {
                bookingCode = JSON.parse(bookingCode);
            }
        } catch (e) {
            // Already a normal booking code
        }


        // -----------------------------------------
        // Format date
        // -----------------------------------------

        const bookingDate = new Date(bookingDateValue)
            .toISOString()
            .split('T')[0];


        const startTime = fromdata.start_timing;
        const endTime = fromdata.end_timing;


        // -----------------------------------------
        // Check room availability
        //
        // Exclude the booking currently being edited
        // -----------------------------------------

        const availabilityResult = await req.db.query(
            `
            SELECT COUNT(*) AS total
            FROM conference_details
            WHERE name_of_resource = $1
              AND is_deleted = 0
              AND date = $2
              AND booking_code <> $3
              AND start_time::time < $5::time
              AND end_time::time > $4::time
            `,
            [
                fromdata.name_of_resource,
                bookingDate,
                bookingCode,
                startTime,
                endTime
            ]
        );


        const conflictCount =
            parseInt(
                availabilityResult.rows[0].total,
                10
            );


        // -----------------------------------------
        // Room is not available
        // -----------------------------------------

        if (conflictCount > 0) {

            return res.status(200).json({
                Result: 'Not Available'
            });
        }


        // -----------------------------------------
        // Projector
        // -----------------------------------------

        const requiredProjector =
            fromdata.required_projector === 'Yes'
                ? 1
                : 0;


        // -----------------------------------------
        // Update conference booking
        // -----------------------------------------

        const updateResult = await req.db.query(
            `
            UPDATE conference_details
            SET
                name_of_resource = $1,
                department_req = $2,
                emp_id = $3,
                type_of_meetting = $4,
                externeal_vendor_name = $5,
                no_of_external = $6,
                total_no_member = $7,
                req_projector = $8,
                date = $9,
                start_time = $10::timestamp,
                status = 'Request',
                reason = $11,
                end_time = $12::timestamp
            WHERE booking_code = $13
              AND is_deleted = 0
              AND comp_id = $14
              AND site_id = $15
            `,
            [
                fromdata.name_of_resource,
                fromdata.department_requested,
                fromdata.employee_iD,
                fromdata.type_of_meeting,
                fromdata.external_vendor_name || null,
                fromdata.no_of_external_person || null,
                fromdata.total_no_of_members,
                requiredProjector,
                bookingDate,
                `${bookingDate} ${startTime}`,
                fromdata.reason,
                `${bookingDate} ${endTime}`,
                bookingCode,
                compid,
                siteid
            ]
        );


        if (updateResult.rowCount === 0) {

            return res.status(404).json({
                Result: 'Failure',
                message: 'Booking not found'
            });
        }


        // -----------------------------------------
        // Get Admin Alert Emails
        // -----------------------------------------

        const adminEmailResult = await req.db.query(
            `
            SELECT email
            FROM employee_details
            WHERE site_id = $1
              AND comp_id = $2
              AND admin_alert = 1
              AND email IS NOT NULL
              AND email <> ''
            `,
            [
                siteid,
                compid
            ]
        );


        const ccEmails =
            adminEmailResult.rows.map(
                row => row.email
            );


        // -----------------------------------------
        // Get updated booking details
        // -----------------------------------------

        const bookingResult = await req.db.query(
            `
            SELECT
                a.*,
                b.employee_name,
                b.email,
                c.room_name
            FROM conference_details a

            JOIN employee_details b
                ON a.emp_id = b.id

            JOIN resource_masters c
                ON a.name_of_resource = c.id

            WHERE a.comp_id = $1
              AND a.site_id = $2
              AND a.booking_code = $3
              AND a.is_deleted = 0
            `,
            [
                compid,
                siteid,
                bookingCode
            ]
        );


        if (bookingResult.rows.length === 0) {

            return res.status(404).json({
                Result: 'Failure',
                message: 'Updated booking details not found'
            });
        }


        const booking = bookingResult.rows[0];


        // -----------------------------------------
        // Send email
        // -----------------------------------------

        const transporter = nodeMailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,

            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });


        const mailOptions = {

            from: process.env.SMTP_USER,

            to: booking.email,

            cc: ccEmails,

            subject:
                'Conference Room Booking Confirmation',

            html: `
                <h3>
                    Dear ${booking.employee_name},
                </h3>

                <br/>

                As per your request, below is your
                Booking Details

                <ul>

                    <li>
                        Room Name:
                        ${booking.room_name}
                    </li>

                    <li>
                        Start Time:
                        ${booking.start_time}
                    </li>

                    <li>
                        End Time:
                        ${booking.end_time}
                    </li>

                </ul>

                <br/>

                Thanks & Regards,
                <br/>

                Front Office
            `
        };


        // -----------------------------------------
        // Email failure should not fail the update
        // -----------------------------------------

        try {

            await transporter.sendMail(
                mailOptions
            );

        } catch (mailError) {

            console.error(
                'Conference booking email failed:',
                mailError
            );
        }


        // -----------------------------------------
        // Final response
        // -----------------------------------------

        return res.status(200).json({
            Result: 'Success'
        });


    } catch (err) {

        console.error(
            'editconferencebookingwithoutservice error:',
            err
        );

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});

router.post('/getconferenceReport', async (req, res) => {

    const { visitorInfo } = req.body;

    try {

        const params = [
            visitorInfo.compid
        ];

        let query = `
            SELECT
                a.*,
                b.employee_name,
                b.mobile_no,
                b.email,
                d.room_name
            FROM conference_details a

            JOIN employee_details b
                ON a.emp_id = b.id

            JOIN resource_masters d
                ON a.name_of_resource = d.id

            WHERE a.comp_id = $1
              AND a.is_deleted = 0
        `;

        // Site filter
        if (
            visitorInfo.siteid !== null &&
            visitorInfo.siteid !== undefined &&
            visitorInfo.siteid !== ''
        ) {
            params.push(visitorInfo.siteid);
            query += ` AND a.site_id = $${params.length}`;
        }

        // From date
        if (
            visitorInfo.Fromdate !== null &&
            visitorInfo.Fromdate !== undefined &&
            visitorInfo.Fromdate !== ''
        ) {
            params.push(visitorInfo.Fromdate);
            query += ` AND DATE(a.current_date) >= $${params.length}`;
        }

        // To date
        if (
            visitorInfo.Todate !== null &&
            visitorInfo.Todate !== undefined &&
            visitorInfo.Todate !== ''
        ) {
            params.push(visitorInfo.Todate);
            query += ` AND DATE(a.current_date) <= $${params.length}`;
        }

        query += ` ORDER BY a.current_date DESC`;

        const result = await req.db.query(query, params);

        return res.json(result.rows);

    } catch (err) {

        console.error(
            'getconferenceReport error:',
            err
        );

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});


router.post('/getcompanyimg', async (req, res) => {

    const { compid } = req.body;

    try {

        const result = await req.db.query(
            `
            SELECT logo_path
            FROM company_details
            WHERE id = $1
            `,
            [compid]
        );

        return res.json(result.rows);

    } catch (err) {

        console.error(
            'getcompanyimg error:',
            err
        );

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});

// ==========================================
// GET VEHICLE ENTRY REPORT
// ==========================================

router.post('/getvehicleenryReport', async (req, res) => {

    const { visitorInfo } = req.body;

    try {

        const compid = visitorInfo.compid;

        const siteid =
            visitorInfo.siteid === null ||
            visitorInfo.siteid === undefined ||
            visitorInfo.siteid === ''
                ? null
                : visitorInfo.siteid;

        const fromDate =
            visitorInfo.Fromdate === null ||
            visitorInfo.Fromdate === undefined ||
            visitorInfo.Fromdate === ''
                ? null
                : visitorInfo.Fromdate;

        const toDate =
            visitorInfo.Todate === null ||
            visitorInfo.Todate === undefined ||
            visitorInfo.Todate === ''
                ? null
                : visitorInfo.Todate;


        // -----------------------------------------
        // Base query
        // -----------------------------------------

        let query = `
            SELECT *
            FROM vehicle_entry
            WHERE comp_id = $1
        `;

        const params = [compid];


        // -----------------------------------------
        // Site filter
        // -----------------------------------------

        if (siteid !== null) {

            params.push(siteid);

            query += `
                AND site_id = $${params.length}
            `;
        }


        // -----------------------------------------
        // From date
        // -----------------------------------------

        if (fromDate !== null) {

            params.push(fromDate);

            query += `
                AND DATE(vehicleIn_date) >= $${params.length}
            `;
        }


        // -----------------------------------------
        // To date
        // -----------------------------------------

        if (toDate !== null) {

            params.push(toDate);

            query += `
                AND DATE(vehicleIn_date) <= $${params.length}
            `;
        }


        // -----------------------------------------
        // Execute PostgreSQL query
        // -----------------------------------------

        const result = await req.db.query(
            query,
            params
        );


        // -----------------------------------------
        // Response
        // -----------------------------------------

        return res.json(result.rows);


    } catch (err) {

        console.error(
            'getvehicleenryReport error:',
            err
        );

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});

// ==========================================
// INSERT VEHICLE RESOURCE DETAILS
// ==========================================

router.post('/insertvehicleresourcedetails', async (req, res) => {

    const {
        imgdata,
        formdata,
        compid,
        siteid,
        usercode
    } = req.body;

    try {

        const dates = new Date(formdata.date)
            .toISOString()
            .split('T')[0];

        const insuranceDate =
            formdata.insurance_date === '' ||
            formdata.insurance_date === null ||
            formdata.insurance_date === undefined
                ? null
                : new Date(formdata.insurance_date)
                    .toISOString()
                    .split('T')[0];


        // Combine date + time
        const vehicleDateTime =
            `${dates} ${formdata.time}`;


        const result = await req.db.query(
            `
            INSERT INTO vehicle_entry
            (
                vehicle_type,
                vehicle_number,
                date,
                time,
                driver_name,
                no_of_pass,
                status,
                comp_id,
                site_id,
                licence_no,
                mobile_no,
                rc_no,
                insurance_date,
                pollution_certi,
                fc_no,
                from_loc,
                logis_name,
                img_vehicle,
                user_code
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                'In',
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
                $17,
                $18
            )
            `,
            [
                formdata.vehicle_type,
                formdata.vehicle_number,
                dates,
                vehicleDateTime,
                formdata.driver_name,
                formdata.no_of_pass,
                compid,
                siteid,
                formdata.driver_license,
                formdata.driver_cellno,
                formdata.rc_nubmer,
                insuranceDate,
                formdata.pollution_certificate,
                formdata.fc_nubmer,
                formdata.from_location,
                formdata.Logistics_name,
                imgdata,
                usercode
            ]
        );


        return res.status(200).json({
            Result: 'Success'
        });


    } catch (err) {

        console.error(
            'insertvehicleresourcedetails error:',
            err
        );

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});


// ==========================================
// UPDATE VEHICLE RESOURCE DETAILS
// ==========================================

router.post('/updatevehicleresourcedetails', async (req, res) => {

    const {
        imgdata,
        formdata,
        compid,
        siteid,
        id,
        usercode
    } = req.body;

    try {

        const dates = new Date(formdata.date)
            .toISOString()
            .split('T')[0];

        const insuranceDate =
            formdata.insurance_date === '' ||
            formdata.insurance_date === null ||
            formdata.insurance_date === undefined
                ? null
                : new Date(formdata.insurance_date)
                    .toISOString()
                    .split('T')[0];


        // Combine date + time
        const vehicleDateTime =
            `${dates} ${formdata.time}`;


        const result = await req.db.query(
            `
            UPDATE vehicle_entry
            SET
                vehicle_type = $1,
                vehicle_number = $2,
                date = $3,
                time = $4,
                driver_name = $5,
                no_of_pass = $6,
                status = 'Out',
                img_vehicle = $7,
                user_code = $8,
                licence_no = $9,
                mobile_no = $10,
                rc_no = $11,
                insurance_date = $12,
                pollution_certi = $13,
                fc_no = $14,
                from_loc = $15,
                logis_name = $16
            WHERE comp_id = $17
              AND site_id = $18
              AND id = $19
            `,
            [
                formdata.vehicle_type,
                formdata.vehicle_number,
                dates,
                vehicleDateTime,
                formdata.driver_name,
                formdata.no_of_pass,
                imgdata,
                usercode,
                formdata.driver_license,
                formdata.driver_cellno,
                formdata.rc_nubmer,
                insuranceDate,
                formdata.pollution_certificate,
                formdata.fc_nubmer,
                formdata.from_location,
                formdata.Logistics_name,
                compid,
                siteid,
                id
            ]
        );


        if (result.rowCount === 0) {

            return res.status(404).json({
                Result: 'Failure',
                message: 'Vehicle entry not found'
            });
        }


        return res.status(200).json({
            Result: 'Success'
        });


    } catch (err) {

        console.error(
            'updatevehicleresourcedetails error:',
            err
        );

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});

// ==========================================
// GET VEHICLE EDIT DATA
// ==========================================

router.post('/getvehicleeditdata', async (req, res) => {

    const {
        id,
        compid,
        siteid
    } = req.body;

    try {

        const result = await req.db.query(
            `
            SELECT *
            FROM vehicle_entry
            WHERE id = $1
              AND site_id = $2
              AND comp_id = $3
            `,
            [
                id,
                siteid,
                compid
            ]
        );

        return res.json(result.rows);

    } catch (err) {

        console.error(
            'getvehicleeditdata error:',
            err
        );

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});


// ==========================================
// GET VEHICLE RESOURCE
// ==========================================

router.post('/getvehicle_resource', async (req, res) => {

    const {
        vehicleInfo
    } = req.body;

    try {

        const result = await req.db.query(
            `
            SELECT *
            FROM vehicle_entry
            WHERE DATE(vehiclein_date) >= $1
              AND DATE(vehiclein_date) <= $2
              AND comp_id = $3
              AND site_id = $4
            `,
            [
                vehicleInfo.Fromdate,
                vehicleInfo.Todate,
                vehicleInfo.compid,
                vehicleInfo.siteid
            ]
        );

        return res.json(result.rows);

    } catch (err) {

        console.error(
            'getvehicle_resource error:',
            err
        );

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});


// ==========================================
// INSERT VEHICLE MASTER DETAILS
// ==========================================

router.post('/insertvehicledetails', async (req, res) => {

    const {
        formdata,
        compid,
        siteid
    } = req.body;

    try {

        const insuranceDate =
            formdata.insurance_date === '' ||
            formdata.insurance_date === null ||
            formdata.insurance_date === undefined
                ? null
                : formdata.insurance_date;


        await req.db.query(
            `
            INSERT INTO vehicle_master
            (
                vehicle_no,
                vehicle_type,
                vehicle_model,
                no_of_seat,
                rc_no,
                fc_no,
                insurance_date,
                driver_name,
                driver_con_number,
                owner_name,
                owner_con_number,
                email,
                comp_id,
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
                $9,
                $10,
                $11,
                $12,
                $13,
                $14
            )
            `,
            [
                formdata.vehicle_no,
                formdata.vehicle_type,
                formdata.vehicle_model,
                formdata.no_of_seat,
                formdata.rc_no,
                formdata.fc_no,
                insuranceDate,
                formdata.driver_name,
                formdata.driver_con_number,
                formdata.owner_name,
                formdata.owner_con_number,
                formdata.email,
                compid,
                siteid
            ]
        );

        return res.status(200).json({
            Result: 'Success'
        });

    } catch (err) {

        console.error(
            'insertvehicledetails error:',
            err
        );

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});


// ==========================================
// CHANGE PASSWORD
// ==========================================

router.post('/Changepass', async (req, res) => {

    const {
        formdata,
        usercode
    } = req.body;

    try {

        const result = await req.db.query(
            `
            UPDATE user_details
            SET password = $1
            WHERE user_code = $2
              AND password = $3
            RETURNING id
            `,
            [
                formdata.password1,
                usercode,
                formdata.password
            ]
        );


        if (result.rowCount === 1) {

            return res.status(200).json({
                Result: 'Success'
            });
        }


        return res.status(200).json({
            Result: 'Incorrect Password'
        });


    } catch (err) {

        console.error(
            'Changepass error:',
            err
        );

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});

// ==========================================
// CHANGE VEHICLE DRIVER NAME
// ==========================================

router.post('/changename', async (req, res) => {

    const {
        formdata,
        compid,
        siteid
    } = req.body;

    try {

        const result = await req.db.query(
            `
            SELECT driver_name
            FROM vehicle_master
            WHERE comp_id = $1
              AND site_id = $2
              AND vehicle_no = $3
            `,
            [
                compid,
                siteid,
                formdata.vehicle_number
            ]
        );

        return res.json(result.rows);

    } catch (err) {

        console.error('changename error:', err);

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});


// ==========================================
// GET VEHICLE MASTER REPORT
// ==========================================

router.post('/getvehiclemasterreport', async (req, res) => {

    const {
        compid,
        siteid
    } = req.body;

    try {

        const result = await req.db.query(
            `
            SELECT *
            FROM vehicle_master
            WHERE comp_id = $1
              AND site_id = $2
            `,
            [
                compid,
                siteid
            ]
        );

        return res.json(result.rows);

    } catch (err) {

        console.error('getvehiclemasterreport error:', err);

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});


// ==========================================
// GET VEHICLE MASTER EDIT DETAILS
// ==========================================

router.post('/getvehiclemasteredit', async (req, res) => {

    const {
        compid,
        siteid,
        id
    } = req.body;

    try {

        const result = await req.db.query(
            `
            SELECT *
            FROM vehicle_master
            WHERE id = $1
              AND comp_id = $2
              AND site_id = $3
            `,
            [
                id,
                compid,
                siteid
            ]
        );

        return res.json(result.rows);

    } catch (err) {

        console.error('getvehiclemasteredit error:', err);

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});


// ==========================================
// UPDATE VEHICLE MASTER DETAILS
// ==========================================

router.post('/updatevehicledetails', async (req, res) => {

    const {
        formdata,
        compid,
        siteid,
        id
    } = req.body;

    try {

        await req.db.query(
            `
            UPDATE vehicle_master
            SET
                vehicle_no = $1,
                vehicle_type = $2,
                vehicle_model = $3,
                no_of_seat = $4,
                rc_no = $5,
                fc_no = $6,
                insurance_date = $7,
                driver_name = $8,
                driver_con_number = $9,
                owner_name = $10,
                owner_con_number = $11,
                email = $12
            WHERE comp_id = $13
              AND site_id = $14
              AND id = $15
            `,
            [
                formdata.vehicle_no,
                formdata.vehicle_type,
                formdata.vehicle_model,
                formdata.no_of_seat,
                formdata.rc_no,
                formdata.fc_no,
                formdata.insurance_date || null,
                formdata.driver_name,
                formdata.driver_con_number,
                formdata.owner_name,
                formdata.owner_con_number,
                formdata.email,
                compid,
                siteid,
                id
            ]
        );

        return res.status(200).json({
            Result: 'Success'
        });

    } catch (err) {

        console.error('updatevehicledetails error:', err);

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});


// ==========================================
// GET VEHICLE CHAT ONE DETAIL
// Last 7 days - In / Out vehicle count
// ==========================================

router.post('/getvehiclechatonedetail', async (req, res) => {

    const {
        compid,
        siteid
    } = req.body;

    try {

        const result = await req.db.query(
            `
            WITH dates AS
            (
                SELECT
                    CURRENT_DATE - INTERVAL '6 days' AS vehicle_date

                UNION ALL

                SELECT
                    CURRENT_DATE - INTERVAL '5 days'

                UNION ALL

                SELECT
                    CURRENT_DATE - INTERVAL '4 days'

                UNION ALL

                SELECT
                    CURRENT_DATE - INTERVAL '3 days'

                UNION ALL

                SELECT
                    CURRENT_DATE - INTERVAL '2 days'

                UNION ALL

                SELECT
                    CURRENT_DATE - INTERVAL '1 day'

                UNION ALL

                SELECT
                    CURRENT_DATE
            )

            SELECT
                TO_CHAR(d.vehicle_date, 'YYYY-MM-DD') AS date,

                COUNT(v.id) FILTER (
                    WHERE v.status = 'In'
                ) AS in_count,

                COUNT(v.id) FILTER (
                    WHERE v.status = 'Out'
                ) AS out_count

            FROM dates d

            LEFT JOIN vehicle_entry v
                ON DATE(v.vehicleIn_date) = d.vehicle_date
                AND v.site_id = $1
                AND v.comp_id = $2

            GROUP BY d.vehicle_date

            ORDER BY d.vehicle_date
            `,
            [
                siteid,
                compid
            ]
        );

        const dates = result.rows.map(row => ({
            date: row.date
        }));

        const indatadetails = result.rows.map(row => ({
            count: Number(row.in_count),
            vehicleIn_date: row.date
        }));

        const outdatadetails = result.rows.map(row => ({
            count: Number(row.out_count),
            vehicleIn_date: row.date
        }));

        return res.json({
            indatadetails,
            outdatadetails,
            dates
        });

    } catch (err) {

        console.error(
            'getvehiclechatonedetail error:',
            err
        );

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});

// ==========================================
// GET VEHICLE PIE CHART DETAILS
// ==========================================

router.post('/getpiechartdetail', async (req, res) => {

    const {
        compid,
        siteid,
        typedata
    } = req.body;

    try {

        const vehicleTypes = typedata.map(item => item.name);

        if (vehicleTypes.length === 0) {
            return res.json([]);
        }

        const result = await req.db.query(
            `
            SELECT
                COUNT(id) AS count,
                vehicle_type
            FROM vehicle_entry
            WHERE status = 'In'
              AND site_id = $1
              AND comp_id = $2
              AND vehicle_type = ANY($3::text[])
            GROUP BY vehicle_type
            ORDER BY vehicle_type
            `,
            [
                siteid,
                compid,
                vehicleTypes
            ]
        );

        return res.json(result.rows);

    } catch (err) {

        console.error(
            'getpiechartdetail error:',
            err
        );

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});

router.post('/getpiechartdetail', async (req, res) => {

    const {
        compid,
        siteid,
        typedata
    } = req.body;

    try {

        if (!typedata || typedata.length === 0) {
            return res.json([]);
        }

        const vehicleTypes = typedata.map(item => item.name);

        const result = await req.db.query(
            `
            SELECT
                t.vehicle_type,
                COUNT(v.id) AS count
            FROM UNNEST($1::text[]) AS t(vehicle_type)
            LEFT JOIN vehicle_entry v
                ON v.vehicle_type = t.vehicle_type
                AND v.status = 'In'
                AND v.site_id = $2
                AND v.comp_id = $3
            GROUP BY t.vehicle_type
            `,
            [
                vehicleTypes,
                siteid,
                compid
            ]
        );

        return res.json(result.rows);

    } catch (err) {

        console.error(
            'getpiechartdetail error:',
            err
        );

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});


// ==========================================
// VEHICLE LINE CHART
// 12 MONTHS - IN / OUT
// ==========================================

router.post('/linechart', async (req, res) => {

    const {
        compid,
        siteid
    } = req.body;

    try {

        const result = await req.db.query(
            `
            WITH months AS
            (
                SELECT
                    generate_series(
                        DATE '2019-01-01',
                        DATE '2019-12-01',
                        INTERVAL '1 month'
                    ) AS month_date
            )

            SELECT
                TO_CHAR(m.month_date, 'YYYY-MM') AS month,

                COUNT(v.id) FILTER (
                    WHERE v.status = 'In'
                ) AS monthin,

                COUNT(v.id) FILTER (
                    WHERE v.status = 'Out'
                ) AS monthout

            FROM months m

            LEFT JOIN vehicle_entry v
                ON DATE_TRUNC(
                    'month',
                    v.vehicleIn_date
                ) = m.month_date

                AND v.site_id = $1
                AND v.comp_id = $2

            GROUP BY m.month_date

            ORDER BY m.month_date
            `,
            [
                siteid,
                compid
            ]
        );

        const monthin = result.rows.map(row =>
            Number(row.monthin)
        );

        const monthouts = result.rows.map(row =>
            Number(row.monthout)
        );

        return res.json({
            monthin,
            monthouts
        });

    } catch (err) {

        console.error(
            'linechart error:',
            err
        );

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});

router.post('/linechart', async (req, res) => {

    const {
        compid,
        siteid
    } = req.body;

    try {

        const result = await req.db.query(
            `
            WITH months AS
            (
                SELECT generate_series(
                    DATE_TRUNC('year', CURRENT_DATE),
                    DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '11 months',
                    INTERVAL '1 month'
                ) AS month_date
            )

            SELECT
                TO_CHAR(m.month_date, 'YYYY-MM') AS month,

                COUNT(v.id) FILTER (
                    WHERE v.status = 'In'
                ) AS monthin,

                COUNT(v.id) FILTER (
                    WHERE v.status = 'Out'
                ) AS monthout

            FROM months m

            LEFT JOIN vehicle_entry v
                ON DATE_TRUNC(
                    'month',
                    v.vehicleIn_date
                ) = m.month_date
                AND v.site_id = $1
                AND v.comp_id = $2

            GROUP BY m.month_date

            ORDER BY m.month_date
            `,
            [
                siteid,
                compid
            ]
        );

        return res.json({
            monthin: result.rows.map(x => Number(x.monthin)),
            monthouts: result.rows.map(x => Number(x.monthout))
        });

    } catch (err) {

        console.error('linechart error:', err);

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});


// ==========================================
// GET VIEW RESOURCE DATA
// ==========================================

router.post('/getviewresourcedata', async (req, res) => {

    const {
        compid,
        siteid,
        code
    } = req.body;

    try {

        const conferenceResult = await req.db.query(
            `
            SELECT *
            FROM conference_details
            WHERE booking_code = $1
              AND site_id = $2
              AND comp_id = $3
            `,
            [
                code,
                siteid,
                compid
            ]
        );

        const serviceResult = await req.db.query(
            `
            SELECT *
            FROM conf_other_service_details
            WHERE is_deleted = 0
              AND booking_code = $1
              AND site_id = $2
              AND comp_id = $3
            `,
            [
                code,
                siteid,
                compid
            ]
        );

        return res.json({
            data1: conferenceResult.rows,
            data2: serviceResult.rows
        });

    } catch (err) {

        console.error(
            'getviewresourcedata error:',
            err
        );

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});


// ==========================================
// GET DEPARTMENT
// ==========================================

router.post('/department', async (req, res) => {

    const {
        compid,
        siteid,
        formdata
    } = req.body;

    try {

        const result = await req.db.query(
            `
            SELECT department
            FROM employee_details
            WHERE id = $1
              AND site_id = $2
              AND comp_id = $3
            `,
            [
                formdata.employee_iD,
                siteid,
                compid
            ]
        );

        return res.json(result.rows);

    } catch (err) {

        console.error(
            'department error:',
            err
        );

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});


// ==========================================
// DOUGHNUT CHART
// ==========================================

router.post('/doughnutChart', async (req, res) => {

    const {
        compid,
        siteid
    } = req.body;

    try {

        const result = await req.db.query(
            `
            SELECT
                r.room_name,
                COUNT(c.id) AS total
            FROM resource_masters r

            LEFT JOIN conference_details c
                ON c.name_of_resource = r.id
                AND c.site_id = $1
                AND c.comp_id = $2
                AND c.is_deleted = 0

            WHERE r.site_id = $1
              AND r.comp_id = $2

            GROUP BY
                r.id,
                r.room_name

            ORDER BY
                r.id
            `,
            [
                siteid,
                compid
            ]
        );

        const resourcename = result.rows.map(
            row => row.room_name
        );

        const resourcedata = result.rows.map(
            row => Number(row.total)
        );

        return res.json({
            resourcename,
            resourcedata
        });

    } catch (err) {

        console.error(
            'doughnutChart error:',
            err
        );

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});

// ==========================================
// GET VIEW VEHICLE DATA
// ==========================================

router.post('/getviewVehicledata', async (req, res) => {

    const {
        compid,
        id
    } = req.body;

    try {

        const result = await req.db.query(
            `
            SELECT *
            FROM vehicle_entry
            WHERE id = $1
              AND comp_id = $2
            `,
            [
                id,
                compid
            ]
        );

        return res.json(result.rows);

    } catch (err) {

        console.error(
            'getviewVehicledata error:',
            err
        );

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});


// ==========================================
// GET CONFERENCE BAR CHART DATA
// ==========================================

router.post('/getconferencebarchatdata', async (req, res) => {

    const {
        compid,
        siteid
    } = req.body;

    try {

        const result = await req.db.query(
            `
            SELECT
                e.department,
                COUNT(c.id) AS total

            FROM
            (
                SELECT DISTINCT department
                FROM employee_details
                WHERE site_id = $1
                  AND comp_id = $2
                  AND department IS NOT NULL
            ) e

            LEFT JOIN conference_details c
                ON c.department_req = e.department
                AND c.site_id = $1
                AND c.comp_id = $2
                AND c.is_deleted = 0

            GROUP BY
                e.department

            ORDER BY
                e.department
            `,
            [
                siteid,
                compid
            ]
        );

        const department = result.rows.map(
            row => row.department
        );

        const countdata = result.rows.map(
            row => Number(row.total)
        );

        return res.json({
            department,
            countdata
        });

    } catch (err) {

        console.error(
            'getconferencebarchatdata error:',
            err
        );

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});


// ==========================================
// DELETE CALENDAR DETAILS
// ==========================================

router.post('/DeletecalenderDetails', async (req, res) => {

    const {
        code,
        compid,
        siteid
    } = req.body;

    const client = await req.db.connect();

    try {

        await client.query('BEGIN');

        // Delete conference booking logically
        await client.query(
            `
            UPDATE conference_details
            SET is_deleted = 1
            WHERE comp_id = $1
              AND site_id = $2
              AND booking_code = $3
            `,
            [
                compid,
                siteid,
                code
            ]
        );

        // Delete associated services logically
        const serviceResult = await client.query(
            `
            UPDATE conf_other_service_details
            SET is_deleted = 1
            WHERE comp_id = $1
              AND site_id = $2
              AND booking_code = $3
            `,
            [
                compid,
                siteid,
                code
            ]
        );

        await client.query('COMMIT');

        return res.json(serviceResult.rows);

    } catch (err) {

        await client.query('ROLLBACK');

        console.error(
            'DeletecalenderDetails error:',
            err
        );

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });

    } finally {

        client.release();
    }
});


// ==========================================
// GET VISITOR DETAILS FOR BAR CHART
// Last 7 days
// ==========================================

router.post('/getvisitordetailsforbarchart', async (req, res) => {

    const {
        compid,
        siteid
    } = req.body;

    try {

        const result = await req.db.query(
            `
            WITH dates AS
            (
                SELECT generate_series(
                    CURRENT_DATE - INTERVAL '6 days',
                    CURRENT_DATE,
                    INTERVAL '1 day'
                )::date AS visit_date
            )

            SELECT
                TO_CHAR(d.visit_date, 'YYYY-MM-DD') AS date,
                COUNT(v.id) AS count

            FROM dates d

            LEFT JOIN visitor_trans v
                ON DATE(v.checkin_date) = d.visit_date
                AND v.site_id = $1
                AND v.comp_id = $2

            GROUP BY d.visit_date
            ORDER BY d.visit_date
            `,
            [
                siteid,
                compid
            ]
        );

        const dates = result.rows.map(row => ({
            date: row.date
        }));

        const vistitorin = result.rows.map(row => ({
            count: Number(row.count),
            checkin_date: row.date
        }));

        return res.json({
            vistitorin,
            dates
        });

    } catch (err) {

        console.error(
            'getvisitordetailsforbarchart error:',
            err
        );

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});

// ==========================================
// VISITOR DOUGHNUT CHART DATA
// ==========================================

router.post('/doughnutChartdata', async (req, res) => {

    const {
        compid,
        siteid
    } = req.body;

    try {

        const result = await req.db.query(
            `
            SELECT
                vm.visitor_code,
                COUNT(vt.id) AS total

            FROM visitor_masters vm

            LEFT JOIN visitor_trans vt
                ON vt.visitors_type = vm.id
                AND vt.site_id = $1
                AND vt.comp_id = $2

            WHERE vm.site_id = $1
              AND vm.comp_id = $2

            GROUP BY
                vm.id,
                vm.visitor_code

            ORDER BY
                vm.id
            `,
            [
                siteid,
                compid
            ]
        );

        const visitortype = result.rows.map(
            row => row.visitor_code
        );

        const visitorcount = result.rows.map(
            row => Number(row.total)
        );

        return res.json({
            data1: visitorcount,
            visitortype: visitortype,
            data: result.rows
        });

    } catch (err) {

        console.error(
            'doughnutChartdata error:',
            err
        );

        return res.status(500).json({
            Result: 'Failure',
            message: 'Database error'
        });
    }
});

router.route('/GetSingleVechileDetails').post(async function (req, res) {

    const VechileData = req.body.VechileData;
    const siteid = req.body.siteid;
    const compid = req.body.comp;

    try {

        const result = await req.db.query(
            `
            SELECT *
            FROM employee_details
            WHERE vechile_no = $1
              AND site_id = $2
              AND comp_id = $3
            `,
            [
                VechileData.vechileno,
                siteid,
                compid
            ]
        );

        res.json(result.rows);

    } catch (err) {

        console.error('GetSingleVechileDetails error:', err);

        res.status(500).json({
            Result: 'Failure'
        });
    }
});

router.route('/GetEmployeevechileDetails').post(async function (req, res) {

    const vechileobj = req.body.vechileobj;

    try {

        const result = await req.db.query(
            `
            SELECT *
            FROM employee_details
            WHERE vechile_no = $1
              AND site_id = $2
              AND comp_id = $3
              AND active = 1
              AND vechile = 1
            `,
            [
                vechileobj[0].vechile_no,
                vechileobj[0].site_id,
                vechileobj[0].comp_id
            ]
        );

        res.json(result.rows);

    } catch (err) {

        console.error('GetEmployeevechileDetails error:', err);

        res.status(500).json({
            Result: 'Failure'
        });
    }
});

router.route('/VechileCheckIn').post(async function (req, res) {

    const vechileobj = req.body.vechileobj;

    const client = await req.db.connect();

    try {

        await client.query('BEGIN');

        const currentDate = new Date();

        await client.query(
            `
            UPDATE employee_details
            SET status = 'CheckedIn'
            WHERE vechile_no = $1
              AND site_id = $2
              AND comp_id = $3
              AND active = 1
              AND vechile = 1
            `,
            [
                vechileobj[0].vechile_no,
                vechileobj[0].site_id,
                vechileobj[0].comp_id
            ]
        );

        const result = await client.query(
            `
            INSERT INTO emp_vehicledetails
            (
                emp_id,
                checkin_date,
                site_id,
                comp_id
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4
            )
            RETURNING *
            `,
            [
                vechileobj[0].id,
                currentDate,
                vechileobj[0].site_id,
                vechileobj[0].comp_id
            ]
        );

        await client.query('COMMIT');

        res.json(result.rows);

    } catch (err) {

        await client.query('ROLLBACK');

        console.error('VechileCheckIn error:', err);

        res.status(500).json({
            Result: 'Failure'
        });

    } finally {

        client.release();
    }
});

router.route('/VechileCheckOut').post(async function (req, res) {

    const vechileobj = req.body.vechileobj;

    const client = await req.db.connect();

    try {

        await client.query('BEGIN');

        const currentDate = new Date();

        await client.query(
            `
            UPDATE employee_details
            SET status = 'CheckedOut'
            WHERE vechile_no = $1
              AND site_id = $2
              AND comp_id = $3
              AND active = 1
              AND vechile = 1
            `,
            [
                vechileobj[0].vechile_no,
                vechileobj[0].site_id,
                vechileobj[0].comp_id
            ]
        );

        const result = await client.query(
            `
            UPDATE emp_vehicledetails
            SET checkout_date = $1
            WHERE id = (
                SELECT id
                FROM emp_vehicledetails
                WHERE emp_id = $2
                  AND site_id = $3
                  AND comp_id = $4
                  AND checkout_date IS NULL
                ORDER BY id DESC
                LIMIT 1
            )
            RETURNING *
            `,
            [
                currentDate,
                vechileobj[0].id,
                vechileobj[0].site_id,
                vechileobj[0].comp_id
            ]
        );

        await client.query('COMMIT');

        res.json(result.rows);

    } catch (err) {

        await client.query('ROLLBACK');

        console.error('VechileCheckOut error:', err);

        res.status(500).json({
            Result: 'Failure'
        });

    } finally {

        client.release();
    }
});


router.route('/getEmployeevechileReport').post(async function (req, res) {

    const visitorInfo = req.body.visitorInfo;

    try {

        const result = await req.db.query(
            `
            SELECT
                a.*,
                b.checkin_date,
                b.checkout_date

            FROM employee_details a

            JOIN emp_vehicledetails b
                ON a.id = b.emp_id
               AND a.site_id = b.site_id
               AND a.comp_id = b.comp_id

            WHERE b.checkin_date::date >= $1
              AND b.checkin_date::date <= $2
              AND b.site_id = $3
              AND b.comp_id = $4

            ORDER BY b.checkin_date DESC
            `,
            [
                visitorInfo.Fromdate,
                visitorInfo.Todate,
                visitorInfo.siteid,
                visitorInfo.compid
            ]
        );

        res.json(result.rows);

    } catch (err) {

        console.error('getEmployeevechileReport error:', err);

        res.status(500).json({
            Result: 'Failure'
        });
    }
});

// EmpBooking Details
router.route('/InsertEmpBookingDetails').post(async function (req, res) {

    const empbookdetails = req.body.empbookdetails;

    const currentDate = new Date().toISOString().slice(0, 10);

    const bookingDate =
        empbookdetails.meeting_date === ''
            ? currentDate
            : empbookdetails.meeting_date;

    const client = await req.db.connect();

    try {

        await client.query('BEGIN');

        // Insert employee booking
        const bookingResult = await client.query(
            `
            INSERT INTO emp_bookingdetails
            (
                emp_code,
                visitor_name,
                coming_from,
                mobile_no,
                email,
                booking_date,
                persontomeet,
                no_of_person,
                visitors_type,
                site_id,
                comp_id
            )
            VALUES
            (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9, $10, $11
            )
            RETURNING id
            `,
            [
                empbookdetails.user_code,
                empbookdetails.visitor_name,
                empbookdetails.coming_from,
                empbookdetails.mobileno,
                empbookdetails.email,
                bookingDate,
                empbookdetails.persontomeet,
                empbookdetails.noofperson,
                empbookdetails.visitortype,
                empbookdetails.site_code,
                empbookdetails.comp_code
            ]
        );

        const empBookId = bookingResult.rows[0].id;

        // Insert visitor details
        const visitorResult = await client.query(
            `
            INSERT INTO visitor_details
            (
                visitor_name,
                coming_from,
                mobile_no,
                persontomeet,
                visitors_type,
                site_id,
                comp_id,
                empbook_id
            )
            VALUES
            (
                $1, $2, $3, $4,
                $5, $6, $7, $8
            )
            RETURNING *
            `,
            [
                empbookdetails.visitor_name,
                empbookdetails.coming_from,
                empbookdetails.mobileno,
                empbookdetails.persontomeet,
                empbookdetails.visitortype,
                empbookdetails.site_code,
                empbookdetails.comp_code,
                empBookId
            ]
        );

        await client.query('COMMIT');

        res.json(visitorResult.rows);

    } catch (err) {

        await client.query('ROLLBACK');

        console.error('InsertEmpBookingDetails error:', err);

        res.status(500).json({
            Result: 'Failure'
        });

    } finally {

        client.release();
    }
});

router.route('/updateEmployeeBookingDetails').post(async function (req, res) {

    const formdata = req.body.formdata;

    const currentDate = new Date().toISOString().slice(0, 10);

    const bookingDate =
        formdata.meeting_date === ''
            ? currentDate
            : formdata.meeting_date;

    const client = await req.db.connect();

    try {

        await client.query('BEGIN');

        // Update employee booking
        await client.query(
            `
            UPDATE emp_bookingdetails
            SET
                emp_code = $1,
                visitor_name = $2,
                coming_from = $3,
                mobile_no = $4,
                email = $5,
                booking_date = $6,
                persontomeet = $7,
                no_of_person = $8,
                visitors_type = $9,
                site_id = $10,
                comp_id = $11
            WHERE id = $12
              AND comp_id = $13
              AND site_id = $14
            `,
            [
                formdata.user_code,
                formdata.visitor_name,
                formdata.coming_from,
                formdata.mobileno,
                formdata.email,
                bookingDate,
                formdata.persontomeet,
                formdata.noofperson,
                formdata.visitortype,
                formdata.site_code,
                formdata.comp_code,
                formdata.id,
                formdata.comp_code,
                formdata.site_code
            ]
        );

        // Update corresponding visitor details
        const visitorResult = await client.query(
            `
            UPDATE visitor_details
            SET
                visitor_name = $1,
                coming_from = $2,
                mobile_no = $3,
                persontomeet = $4,
                visitors_type = $5,
                site_id = $6,
                comp_id = $7
            WHERE empbook_id = $8
              AND comp_id = $9
              AND site_id = $10
            RETURNING *
            `,
            [
                formdata.visitor_name,
                formdata.coming_from,
                formdata.mobileno,
                formdata.persontomeet,
                formdata.visitortype,
                formdata.site_code,
                formdata.comp_code,
                formdata.id,
                formdata.comp_code,
                formdata.site_code
            ]
        );

        await client.query('COMMIT');

        res.json(visitorResult.rows);

    } catch (err) {

        await client.query('ROLLBACK');

        console.error('updateEmployeeBookingDetails error:', err);

        res.status(500).json({
            Result: 'Failure'
        });

    } finally {

        client.release();
    }
});

router.route('/SingleEmployeeBookingReport').post(async function (req, res) {

    const usercode = req.body.usercode;
    const siteid = req.body.siteid;
    const compid = req.body.compid;

    try {

        const result = await req.db.query(
            `
            SELECT
                a.*,
                b.visitor_desc
            FROM emp_bookingdetails a
            JOIN visitor_masters b
                ON a.visitors_type = b.visitor_desc
               AND a.site_id = b.site_id
               AND a.comp_id = b.comp_id
            WHERE a.site_id = $1
              AND a.comp_id = $2
              AND a.emp_code = $3
            `,
            [
                siteid,
                compid,
                usercode
            ]
        );

        res.json(result.rows);

    } catch (err) {

        console.error('SingleEmployeeBookingReport error:', err);

        res.status(500).json({
            Result: 'Failure'
        });
    }
});

router.route('/getVisitorbookingReport').post(async function (req, res) {

    const usercode = req.body.usercode;
    const siteid = req.body.siteid;
    const compid = req.body.compid;

    const fromdate = req.body.formdate.Fromdate;
    const todate = req.body.formdate.Todate;

    try {

        const result = await req.db.query(
            `
            SELECT
                a.*,
                b.visitor_desc,
                c.employee_name
            FROM emp_bookingdetails a

            JOIN visitor_masters b
                ON a.visitors_type = b.visitor_desc
               AND a.site_id = b.site_id
               AND a.comp_id = b.comp_id

            JOIN employee_details c
                ON a.emp_code = c.employee_code
               AND a.site_id = c.site_id
               AND a.comp_id = c.comp_id

            WHERE a.site_id = $1
              AND a.comp_id = $2
              AND a.booking_date::date >= $3
              AND a.booking_date::date <= $4

            ORDER BY a.booking_date DESC
            `,
            [
                siteid,
                compid,
                fromdate,
                todate
            ]
        );

        res.json(result.rows);

    } catch (err) {

        console.error('getVisitorbookingReport error:', err);

        res.status(500).json({
            Result: 'Failure'
        });
    }
});

router.route('/getempAppointmentedit').post(async function (req, res) {

    const appointmentid = req.body.appointmentid;

    try {

        const result = await req.db.query(
            `
            SELECT *
            FROM emp_bookingdetails
            WHERE id = $1
            `,
            [
                appointmentid
            ]
        );

        res.json(result.rows);

    } catch (err) {

        console.error('getempAppointmentedit error:', err);

        res.status(500).json({
            Result: 'Failure'
        });
    }
});

module.exports = router;