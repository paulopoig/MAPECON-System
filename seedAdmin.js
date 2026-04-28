require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./db');

async function createSuperAdmin() {
    try {
        console.log("🌱 Forging the Master Key...");
        
        // 1. Scramble the default password
        const defaultPassword = "password123"; 
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

        // 2. Insert the Super Admin into the vault
        const newUser = await pool.query(
            `INSERT INTO users (full_name, designation, department, area, email, password, role, company_branch) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING full_name, email`,
            [
                "Paulo Danque", // full_name
                "IT Business Partner",   // designation
                "OTD Department",        // department
                "Manila",                // area
                "paulodanque.mapecon@gmail.com",     // email
                hashedPassword,          // password
                "Super Admin",           // role
                "Manila"                 // company_branch
            ]
        );

        console.log("✨ Super Admin successfully injected into the vault!");
        console.log("👤 Name:", newUser.rows[0].full_name);
        console.log("📧 Email:", newUser.rows[0].email);
        console.log("🔑 Password:", defaultPassword);
        
    } catch (err) {
        console.error("❌ Error generating admin:", err.message);
    } finally {
        // Close the database connection so the script finishes cleanly
        pool.end(); 
    }
}

createSuperAdmin();