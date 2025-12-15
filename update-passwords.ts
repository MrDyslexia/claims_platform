import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

async function updatePasswords() {
    const hash = await bcrypt.hash('password123', 10);
    console.log('Generated hash:', hash);
    
    // Verify it works
    const isValid = await bcrypt.compare('password123', hash);
    console.log('Verification:', isValid);
    
    // Connect to database
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'sharp',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'denuncias_app'
    });
    
    try {
        // Update all example.com users
        const [result] = await connection.execute(
            `UPDATE usuario SET pass_hash = ? WHERE email LIKE '%@example.com'`,
            [hash]
        );
        console.log('Updated rows:', (result as any).affectedRows);
    } catch (error) {
        console.error('Error updating passwords:', error);
    } finally {
        await connection.end();
    }
}

updatePasswords();
