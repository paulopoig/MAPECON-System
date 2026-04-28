require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

// NEW: Import our security tools
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;

const auth = require('./authMiddleware'); // Our Bouncer
const { format } = require('date-fns');   // Our Date Formatter

const { generateSchedule } = require('./utils/scheduleGenerator');

app.use(cors());
app.use(express.json());

// Our Test Route
app.get('/', (req, res) => {
    res.send("Hello! The Contract Generator backend is officially alive!");
});

// ==========================================
// 🚨 NEW: SUPER ADMIN CREATE USER API 🚨
// ==========================================
app.post('/api/register', async (req, res) => {
    try {
        // 1. Catch the data coming from the frontend form
        const { full_name, designation, department, area, email, password, role, company_branch } = req.body;

        // 2. Check if the user already exists in the database
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: "Ay naku! This email is already registered." });
        }

        // 3. Scramble (Hash) the password
        const saltRounds = 10; // The standard level of scrambling
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 4. Save the new user to the database
        const newUser = await pool.query(
            `INSERT INTO users (full_name, designation, department, area, email, password, role, company_branch) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [full_name, designation, department, area, email, hashedPassword, role, company_branch || 'Manila']
        );

        // 5. Send a success message back!
        res.status(201).json({ 
            message: "Success! New employee account created.", 
            user: newUser.rows[0] 
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error during registration." });
    }
});

// ==========================================
// 🔐 NEW: USER LOGIN API 🔐
// ==========================================
app.post('/api/login', async (req, res) => {
    try {
        // 1. Catch what the user typed in the login form
        const { email, password } = req.body;

        // 2. Check if this email actually exists in our vault
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userResult.rows.length === 0) {
            // We give a vague error on purpose so hackers don't know if they guessed the email right
            return res.status(401).json({ error: "Invalid email or password." });
        }
        const user = userResult.rows[0]; // Extract the user's row from the database

        // 3. Check if the Super Admin disabled this account
        if (!user.is_active) {
            return res.status(403).json({ error: "Account disabled. Please contact the Super Admin." });
        }

        // 4. The Meat Grinder Test (Compare Passwords)
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        // 5. Create the VIP Digital ID Card (JWT Token)
        const token = jwt.sign(
            { 
                id: user.id, 
                role: user.role, 
                branch: user.company_branch, 
                name: user.full_name 
            },
            process.env.JWT_SECRET, // Our wax seal from the .env file
            { expiresIn: "8h" }     // Token expires after a standard 8-hour shift!
        );

        // 6. Give the user the token and let them in!
        res.status(200).json({
            message: "Login successful! Welcome back.",
            token: token,
            user: { id: user.id, name: user.full_name, role: user.role, branch: user.company_branch }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error during login." });
    }
});

// ==========================================
// 📄 NEW: CREATE CONTRACT API (PROTECTED) 📄
// ==========================================
app.post('/api/contracts', auth, async (req, res) => {
    // We use a 'client' from the pool so we can do a Transaction (All-or-Nothing)
    const client = await pool.connect(); 

    try {
        await client.query('BEGIN'); // Start the Transaction!

        const { 
            account_type, classification, customer_name, different_name, 
            tin, breakdate, base_duration, base_frequency, 
            areas_to_be_treated, survey_details, account_managers,
            services // This is an Array of services sent from the frontend
        } = req.body;

        const currentYear = format(new Date(), 'yyyy'); // Gets "2026"

        // ---------------------------------------------------------
        // LOGIC 1: Auto-Generate the Contract Number
        // ---------------------------------------------------------
        // Look for the last contract created this year for this specific account type
        const lastContractQuery = await client.query(
            `SELECT contract_number FROM contracts 
             WHERE account_type = $1 AND contract_number LIKE $2 
             ORDER BY id DESC LIMIT 1`,
            [account_type, `${currentYear}-%`]
        );

        let nextCount = 1; // Default to 1 if it's the first contract of the year
        if (lastContractQuery.rows.length > 0) {
            // Extract the number part from "2026-SS-0045" and add 1
            const lastNumberString = lastContractQuery.rows[0].contract_number.split('-')[2];
            nextCount = parseInt(lastNumberString) + 1;
        }

        // Format it to have leading zeros (e.g., 001, 046)
        const paddedCount = nextCount.toString().padStart(3, '0');
        const finalContractNumber = `${currentYear}-${account_type}-${paddedCount}`;

        // ========================================================
        // 🚨 NEW LOGIC: CALCULATE THE DATES AND TOTAL SERVICE 🚨
        // ========================================================
        const generatedSchedule = generateSchedule(breakdate, base_duration, base_frequency, account_type);
        const computedTotalService = generatedSchedule.length; // If it generated 4 dates, total service is 4!

        // ---------------------------------------------------------
        // LOGIC 2: Save to the Main Contracts Table
        // ---------------------------------------------------------
        const newContract = await client.query(
            `INSERT INTO contracts (
                contract_number, company_branch, account_type, classification, 
                customer_name, different_name, tin, breakdate, base_duration, 
                base_frequency, total_service, areas_to_be_treated, survey_details, account_managers
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
            [
                finalContractNumber, req.user.branch, account_type, classification, 
                customer_name, different_name, tin, breakdate, base_duration, 
                base_frequency, 
                computedTotalService, // <-- WE CHANGED THIS FROM 0!
                areas_to_be_treated, survey_details, account_managers
            ]
        );

        const newContractId = newContract.rows[0].id;

        // ---------------------------------------------------------
        // LOGIC 3: Loop through and Save the Services
        // ---------------------------------------------------------
        for (let service of services) {
            await client.query(
                `INSERT INTO contract_services (
                    contract_id, service_code, specific_duration, specific_frequency, print_description
                ) VALUES ($1, $2, $3, $4, $5)`,
                [
                    newContractId, service.service_code, 
                    service.specific_duration || base_duration, 
                    service.specific_frequency || base_frequency, 
                    service.print_description
                ]
            );
        }

        await client.query('COMMIT'); // Success! Lock the data into the vault permanently.
        
        res.status(201).json({ 
            message: "Contract Created Successfully!", 
            contract_number: finalContractNumber,
            contract_id: newContractId
        });

    } catch (err) {
        await client.query('ROLLBACK'); // Alert! Something broke. Undo everything!
        console.error(err.message);
        res.status(500).json({ error: "Failed to generate contract." });
    } finally {
        client.release(); // Return the connection to the pool
    }
});

// ==========================================
// 📄 GET ALL CONTRACTS API (PROTECTED) 📄
// ==========================================
app.get('/api/contracts', auth, async (req, res) => {
    try {
        // Fetch all contracts, but only for the user's branch!
        const allContracts = await pool.query(
            "SELECT id, contract_number, customer_name, account_type, created_at FROM contracts WHERE company_branch = $1 ORDER BY created_at DESC",
            [req.user.branch]
        );
        
        res.json(allContracts.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to fetch contracts from vault." });
    }
});


// ==========================================
// 📄 FETCH ONE API 📄
// ==========================================


// GET SINGLE CONTRACT
app.get('/api/contracts/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        
        // 1. Get the main contract details
        const contractResult = await pool.query("SELECT * FROM contracts WHERE id = $1", [id]);
        
        if (contractResult.rows.length === 0) {
            return res.status(404).json({ error: "Contract not found in vault." });
        }

        // 2. Get the services linked to this contract
        const servicesResult = await pool.query("SELECT * FROM contract_services WHERE contract_id = $1", [id]);

        res.json({
            ...contractResult.rows[0],
            services: servicesResult.rows
        });
    } catch (err) {
        console.error("DATABASE ERROR:", err.message); // <-- This helps us debug!
        res.status(500).json({ error: "Server error fetching details." });
    }
});


app.listen(PORT, async () => {
    console.log(`🚀 Server is running beautifully on http://localhost:${PORT}`);
    try {
        const client = await pool.connect();
        console.log("🗄️ Database connected successfully! Pasok mga suki!");
        client.release();
    } catch (err) {
        console.error("❌ Database connection failed.", err.stack);
    }
});