import { sequelize } from './db/sequelize';

async function ensureColumn(columnName: string, definition: string) {
    const [results] = await sequelize.query(
        `SHOW COLUMNS FROM denuncia LIKE '${columnName}'`
    );

    if (Array.isArray(results) && results.length === 0) {
        await sequelize.query(
            `ALTER TABLE denuncia ADD COLUMN ${columnName} ${definition}`
        );
        console.log(`Column ${columnName} added successfully.`);
        return;
    }

    console.log(`Column ${columnName} already exists.`);
}

async function main() {
    try {
        console.log('Adding encrypted tracking clave columns to denuncia...');

        await ensureColumn('clave_ciphertext', 'TEXT NULL AFTER clave_salt');
        await ensureColumn(
            'clave_iv',
            'VARCHAR(255) NULL AFTER clave_ciphertext'
        );
        await ensureColumn('clave_tag', 'VARCHAR(255) NULL AFTER clave_iv');

        console.log('Encrypted tracking clave columns are ready.');
    } catch (error) {
        console.error('Error updating denuncia table:', error);
        process.exit(1);
    }

    process.exit(0);
}

main();
