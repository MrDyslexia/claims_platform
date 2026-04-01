import { models } from './db/sequelize';

async function main() {
    try {
        const lastDenuncia = await models.Denuncia.findOne({
            order: [['created_at', 'DESC']]
        });
        
        if (lastDenuncia) {
            console.log('--- ÚLTIMA DENUNCIA ENCONTRADA ---');
            console.log('ID:', lastDenuncia.get('id'));
            console.log('Numero:', lastDenuncia.get('numero'));
            console.log('Descripción:', JSON.stringify(lastDenuncia.get('descripcion')));
            console.log('Involved Parties (Columna):', JSON.stringify(lastDenuncia.get('involved_parties')));
        } else {
            console.log('No se encontraron denuncias.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
    process.exit(0);
}

main();
