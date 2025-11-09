import { Router } from 'express';
import { obtenerMetadataFormulario } from '../controllers/public.controller';

const router = Router();

router.get('/form-metadata', obtenerMetadataFormulario);

export default router;
