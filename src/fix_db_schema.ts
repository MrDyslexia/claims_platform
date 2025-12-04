import { syncDatabase } from './db/sequelize';

async function main() {
    try {
        console.log('Starting database schema update...');
        await syncDatabase({ alter: true });
        console.log('Database schema updated successfully.');
    } catch (error) {
        console.error('Error updating database schema:', error);
        process.exit(1);
    }
    process.exit(0);
}

main();
