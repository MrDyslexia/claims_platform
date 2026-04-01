import { sequelize } from './db/sequelize';

async function main() {
    try {
        console.log('🚀 Iniciando actualización quirúrgica de la base de datos...');
        
        // 1. Agregar la columna involved_parties a la tabla denuncia si no existe
        console.log('Checking/adding involved_parties column to denuncia table...');
        await sequelize.query(`
            ALTER TABLE denuncia 
            ADD COLUMN IF NOT EXISTS involved_parties JSON NULL 
            AFTER comentario_satisfaccion;
        `);
        
        console.log('✅ Base de datos actualizada con éxito.');
    } catch (error: any) {
        // Si el IF NOT EXISTS no es soportado por la versión de MySQL (es < 8.0.19)
        if (error.code === 'ER_PARSE_ERROR' || error.message.includes('IF NOT EXISTS')) {
            try {
                console.log('Falló IF NOT EXISTS, intentando validación manual...');
                // Verificar si la columna existe
                const [results] = await sequelize.query("SHOW COLUMNS FROM denuncia LIKE 'involved_parties'");
                if (Array.isArray(results) && results.length === 0) {
                    await sequelize.query("ALTER TABLE denuncia ADD COLUMN involved_parties JSON NULL AFTER comentario_satisfaccion");
                    console.log('✅ Columna agregada exitosamente.');
                } else {
                    console.log('ℹ️ La columna already exists, no se realizaron cambios.');
                }
            } catch (innerError) {
                console.error('❌ Error crítico:', innerError);
                process.exit(1);
            }
        } else {
            console.error('❌ Error actualizando la base de datos:', error);
            process.exit(1);
        }
    }
    process.exit(0);
}

main();
