import { sequelize, models } from './src/db/sequelize';

async function run() {
    try {
        console.log('Listing roles...');
        const roles = await models.Rol.findAll();
        console.log('Roles found:', roles.map(r => ({ id: r.id, nombre: r.nombre })));

        const adminRole = roles.find(r => r.nombre.toLowerCase().includes('admin'));
        
        if (!adminRole) {
            console.error('No admin-like role found. Cannot assign permissions.');
            process.exit(1);
        }

        console.log(`Using admin role: ${adminRole.nombre} (ID: ${adminRole.id})`);

        const permissionsToCreate = [
            { codigo: 'CREATE_TIPO_DENUNCIA', nombre: 'Crear Tipo Denuncia' },
            { codigo: 'UPDATE_TIPO_DENUNCIA', nombre: 'Actualizar Tipo Denuncia' },
            { codigo: 'DELETE_TIPO_DENUNCIA', nombre: 'Eliminar Tipo Denuncia' },
            { codigo: 'CREATE_CATEGORIA_DENUNCIA', nombre: 'Crear Categoria Denuncia' },
            { codigo: 'UPDATE_CATEGORIA_DENUNCIA', nombre: 'Actualizar Categoria Denuncia' },
            { codigo: 'DELETE_CATEGORIA_DENUNCIA', nombre: 'Eliminar Categoria Denuncia' },
        ];

        for (const permData of permissionsToCreate) {
            const [perm, created] = await models.Permiso.findOrCreate({
                where: { codigo: permData.codigo },
                defaults: permData
            });
            
            if (created) {
                console.log(`Created permission: ${perm.nombre}`);
            } else {
                console.log(`Permission already exists: ${perm.nombre}`);
            }

            // Assign to admin
            const [rp, assigned] = await models.RolPermiso.findOrCreate({
                where: {
                    rol_id: adminRole.id,
                    permiso_id: perm.id
                }
            });

            if (assigned) {
                console.log(`Assigned ${perm.nombre} to ${adminRole.nombre}`);
            } else {
                console.log(`${perm.nombre} already assigned to ${adminRole.nombre}`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding permissions:', error);
        process.exit(1);
    }
}

run();
