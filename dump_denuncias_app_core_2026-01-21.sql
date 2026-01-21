-- MySQL dump 10.13  Distrib 8.4.6, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: denuncias_app
-- ------------------------------------------------------
-- Server version	8.4.6

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `arquetipo`
--

DROP TABLE IF EXISTS `arquetipo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `arquetipo` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) NOT NULL COMMENT 'Código único del arquetipo: ADMIN, ANALISTA, SUPERVISOR, AUDITOR',
  `nombre` varchar(150) NOT NULL COMMENT 'Nombre descriptivo del arquetipo',
  `descripcion` text COMMENT 'Descripción detallada de las responsabilidades del arquetipo',
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  UNIQUE KEY `arquetipo_codigo` (`codigo`),
  UNIQUE KEY `codigo_2` (`codigo`),
  UNIQUE KEY `codigo_3` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `arquetipo`
--

LOCK TABLES `arquetipo` WRITE;
/*!40000 ALTER TABLE `arquetipo` DISABLE KEYS */;
INSERT INTO `arquetipo` VALUES (1,'ADMIN','Administrador','Acceso completo al sistema'),(2,'ANALISTA','Analista','Ver datos y generar reportes'),(3,'SUPERVISOR','Supervisor','Gestión de denuncias asignadas: ver, comentar, cambiar estado'),(4,'AUDITOR','Auditor','Acceso de solo lectura a todo el sistema'),(5,'SUPERSU','Super Usuario','Gestión de usuarios, permisos y roles');
/*!40000 ALTER TABLE `arquetipo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `arquetipo_permiso`
--

DROP TABLE IF EXISTS `arquetipo_permiso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `arquetipo_permiso` (
  `arquetipo_id` bigint NOT NULL,
  `permiso_id` bigint NOT NULL,
  PRIMARY KEY (`arquetipo_id`,`permiso_id`),
  UNIQUE KEY `arquetipo_permiso_permiso_id_arquetipo_id_unique` (`arquetipo_id`,`permiso_id`),
  KEY `arquetipo_permiso_arquetipo_id` (`arquetipo_id`),
  KEY `arquetipo_permiso_permiso_id` (`permiso_id`),
  CONSTRAINT `arquetipo_permiso_ibfk_1` FOREIGN KEY (`arquetipo_id`) REFERENCES `arquetipo` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `arquetipo_permiso_ibfk_2` FOREIGN KEY (`permiso_id`) REFERENCES `permiso` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `arquetipo_permiso`
--

LOCK TABLES `arquetipo_permiso` WRITE;
/*!40000 ALTER TABLE `arquetipo_permiso` DISABLE KEYS */;
INSERT INTO `arquetipo_permiso` VALUES (1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(1,8),(1,9),(1,10),(1,11),(1,12),(1,13),(1,14),(1,15),(1,16),(1,17),(1,18),(1,19),(1,20),(1,21),(1,22),(1,23),(1,24),(1,25),(1,26),(1,27),(1,28),(1,29),(1,30),(1,31),(1,32),(1,33),(1,34),(1,35),(1,36),(1,37),(1,38),(1,39),(1,40),(1,41),(1,42),(1,43),(1,44),(1,45),(1,46),(1,47),(2,1),(2,30),(2,39),(2,40),(3,1),(3,6),(3,30),(3,31),(4,1),(4,8),(4,13),(4,18),(4,22),(4,26),(4,30),(4,34),(4,36),(4,38),(4,39),(4,40),(4,41),(4,43),(5,8),(5,9),(5,10),(5,11),(5,12),(5,13),(5,14),(5,15),(5,16),(5,17),(5,43),(5,44),(5,45),(5,46),(5,47);
/*!40000 ALTER TABLE `arquetipo_permiso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permiso`
--

DROP TABLE IF EXISTS `permiso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permiso` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `codigo` varchar(100) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  UNIQUE KEY `permiso_codigo` (`codigo`),
  UNIQUE KEY `codigo_2` (`codigo`),
  UNIQUE KEY `codigo_3` (`codigo`),
  UNIQUE KEY `codigo_4` (`codigo`),
  UNIQUE KEY `codigo_5` (`codigo`),
  UNIQUE KEY `codigo_6` (`codigo`),
  UNIQUE KEY `codigo_7` (`codigo`),
  UNIQUE KEY `codigo_8` (`codigo`),
  UNIQUE KEY `codigo_9` (`codigo`),
  UNIQUE KEY `codigo_10` (`codigo`),
  UNIQUE KEY `codigo_11` (`codigo`),
  UNIQUE KEY `codigo_12` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permiso`
--

LOCK TABLES `permiso` WRITE;
/*!40000 ALTER TABLE `permiso` DISABLE KEYS */;
INSERT INTO `permiso` VALUES (1,'denuncias:ver','Ver denuncias'),(2,'denuncias:crear','Crear denuncias'),(3,'denuncias:editar','Editar denuncias'),(4,'denuncias:eliminar','Eliminar denuncias'),(5,'denuncias:asignar','Asignar denuncias'),(6,'denuncias:cambiar_estado','Cambiar estado de denuncias'),(7,'denuncias:reasignar','Reasignar denuncias'),(8,'usuarios:ver','Ver usuarios'),(9,'usuarios:crear','Crear usuarios'),(10,'usuarios:editar','Editar usuarios'),(11,'usuarios:eliminar','Eliminar usuarios'),(12,'usuarios:gestionar_roles','Gestionar roles de usuarios'),(13,'roles:ver','Ver roles'),(14,'roles:crear','Crear roles'),(15,'roles:editar','Editar roles'),(16,'roles:eliminar','Eliminar roles'),(17,'roles:gestionar_permisos','Gestionar permisos de roles'),(18,'empresas:ver','Ver empresas'),(19,'empresas:crear','Crear empresas'),(20,'empresas:editar','Editar empresas'),(21,'empresas:eliminar','Eliminar empresas'),(22,'estados:ver','Ver estados de denuncia'),(23,'estados:crear','Crear estados de denuncia'),(24,'estados:editar','Editar estados de denuncia'),(25,'estados:eliminar','Eliminar estados de denuncia'),(26,'tipos:ver','Ver tipos de denuncia'),(27,'tipos:crear','Crear tipos de denuncia'),(28,'tipos:editar','Editar tipos de denuncia'),(29,'tipos:eliminar','Eliminar tipos de denuncia'),(30,'adjuntos:ver','Ver adjuntos'),(31,'adjuntos:crear','Subir adjuntos'),(32,'adjuntos:editar','Editar adjuntos'),(33,'adjuntos:eliminar','Eliminar adjuntos'),(34,'canales:ver','Ver canales de denuncia'),(35,'canales:gestionar','Gestionar canales de denuncia'),(36,'auditoria:ver','Ver auditoría'),(37,'auditoria:eliminar','Eliminar auditoría'),(38,'auditoria:exportar','Exportar auditoría'),(39,'reportes:ver','Ver reportes'),(40,'reportes:exportar','Exportar reportes'),(41,'configuracion:ver','Ver configuración del sistema'),(42,'configuracion:editar','Editar configuración del sistema'),(43,'permisos:ver','Ver permisos'),(44,'permisos:crear','Crear permisos'),(45,'permisos:editar','Editar permisos'),(46,'permisos:eliminar','Eliminar permisos'),(47,'arquetipos:gestionar','Gestionar arquetipos');
/*!40000 ALTER TABLE `permiso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text,
  `arquetipo_id` bigint NOT NULL COMMENT 'Arquetipo base del cual hereda permisos',
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  UNIQUE KEY `rol_codigo` (`codigo`),
  UNIQUE KEY `codigo_2` (`codigo`),
  UNIQUE KEY `codigo_3` (`codigo`),
  UNIQUE KEY `codigo_4` (`codigo`),
  UNIQUE KEY `codigo_5` (`codigo`),
  UNIQUE KEY `codigo_6` (`codigo`),
  UNIQUE KEY `codigo_7` (`codigo`),
  UNIQUE KEY `codigo_8` (`codigo`),
  UNIQUE KEY `codigo_9` (`codigo`),
  UNIQUE KEY `codigo_10` (`codigo`),
  UNIQUE KEY `codigo_11` (`codigo`),
  UNIQUE KEY `codigo_12` (`codigo`),
  KEY `rol_arquetipo_id` (`arquetipo_id`),
  CONSTRAINT `rol_ibfk_1` FOREIGN KEY (`arquetipo_id`) REFERENCES `arquetipo` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` VALUES (1,'ADMIN','Administrador','Acceso completo al sistema',1),(2,'ANALISTA','Analista','Ver datos y generar reportes',2),(3,'SUPERVISOR','Supervisor','Gestión de denuncias asignadas: ver, comentar, cambiar estado',3),(4,'AUDITOR','Auditor','Acceso de solo lectura a todo el sistema',4),(5,'SUPERSU','Super Usuario','Gestión de usuarios, permisos y roles',5),(8,'SUPERVISOR_LEY_KARIN','Supervisor Ley Karin','',3),(14,'ADMIN PRUEBAS','admin pruebas','aa',1);
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol_categoria`
--

DROP TABLE IF EXISTS `rol_categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol_categoria` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `rol_id` bigint NOT NULL,
  `categoria_id` bigint NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rol_categoria_categoria_id_rol_id_unique` (`rol_id`,`categoria_id`),
  UNIQUE KEY `rol_categoria_rol_id_categoria_id` (`rol_id`,`categoria_id`),
  KEY `rol_categoria_rol_id` (`rol_id`),
  KEY `rol_categoria_categoria_id` (`categoria_id`),
  CONSTRAINT `rol_categoria_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `rol` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `rol_categoria_ibfk_2` FOREIGN KEY (`categoria_id`) REFERENCES `categoria_denuncia` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol_categoria`
--

LOCK TABLES `rol_categoria` WRITE;
/*!40000 ALTER TABLE `rol_categoria` DISABLE KEYS */;
INSERT INTO `rol_categoria` VALUES (1,14,1,'2025-12-22 20:58:12'),(2,14,13,'2025-12-22 20:58:12'),(3,14,4,'2025-12-22 20:58:12');
/*!40000 ALTER TABLE `rol_categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol_permiso`
--

DROP TABLE IF EXISTS `rol_permiso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol_permiso` (
  `rol_id` bigint NOT NULL,
  `permiso_id` bigint NOT NULL,
  PRIMARY KEY (`rol_id`,`permiso_id`),
  UNIQUE KEY `rol_permiso_permiso_id_rol_id_unique` (`rol_id`,`permiso_id`),
  KEY `rol_permiso_rol_id` (`rol_id`),
  KEY `rol_permiso_permiso_id` (`permiso_id`),
  CONSTRAINT `rol_permiso_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `rol` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `rol_permiso_ibfk_2` FOREIGN KEY (`permiso_id`) REFERENCES `permiso` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol_permiso`
--

LOCK TABLES `rol_permiso` WRITE;
/*!40000 ALTER TABLE `rol_permiso` DISABLE KEYS */;
INSERT INTO `rol_permiso` VALUES (1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(1,8),(1,9),(1,10),(1,11),(1,12),(1,13),(1,14),(1,15),(1,16),(1,17),(1,18),(1,19),(1,20),(1,21),(1,22),(1,23),(1,24),(1,25),(1,26),(1,27),(1,28),(1,29),(1,30),(1,31),(1,32),(1,33),(1,34),(1,35),(1,36),(1,37),(1,38),(1,39),(1,40),(1,41),(1,42),(1,43),(1,44),(1,45),(1,46),(1,47),(2,1),(2,30),(2,39),(2,40),(3,1),(3,6),(3,30),(3,31),(4,1),(4,8),(4,13),(4,18),(4,22),(4,26),(4,30),(4,34),(4,36),(4,38),(4,39),(4,40),(4,41),(4,43),(5,8),(5,9),(5,10),(5,11),(5,12),(5,13),(5,14),(5,15),(5,16),(5,17),(5,43),(5,44),(5,45),(5,46),(5,47),(8,1),(8,6),(8,30),(8,31),(14,1),(14,2),(14,3),(14,4),(14,5),(14,6),(14,7),(14,8),(14,9),(14,10),(14,11),(14,12),(14,13),(14,14),(14,15),(14,16),(14,17),(14,18),(14,19),(14,20),(14,21),(14,22),(14,23),(14,24),(14,25),(14,26),(14,27),(14,28),(14,29),(14,30),(14,31),(14,32),(14,33),(14,34),(14,35),(14,36),(14,37),(14,38),(14,39),(14,40),(14,41),(14,42),(14,43),(14,44),(14,45),(14,46),(14,47);
/*!40000 ALTER TABLE `rol_permiso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `rut` varchar(20) NOT NULL,
  `nombre_completo` varchar(200) NOT NULL,
  `email` varchar(255) NOT NULL,
  `pass_hash` varchar(255) NOT NULL,
  `must_change_password` tinyint NOT NULL DEFAULT '0',
  `activo` tinyint NOT NULL DEFAULT '1',
  `telefono` varchar(20) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `last_login_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rut` (`rut`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `usuario_rut` (`rut`),
  UNIQUE KEY `usuario_email` (`email`),
  UNIQUE KEY `rut_2` (`rut`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `rut_3` (`rut`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `rut_4` (`rut`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `rut_5` (`rut`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `rut_6` (`rut`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `rut_7` (`rut`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `rut_8` (`rut`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `rut_9` (`rut`),
  UNIQUE KEY `email_9` (`email`),
  UNIQUE KEY `rut_10` (`rut`),
  UNIQUE KEY `email_10` (`email`),
  UNIQUE KEY `rut_11` (`rut`),
  UNIQUE KEY `email_11` (`email`),
  UNIQUE KEY `rut_12` (`rut`),
  UNIQUE KEY `email_12` (`email`),
  KEY `usuario_activo` (`activo`),
  KEY `usuario_last_login_at` (`last_login_at`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'11111111-1','Usuario Admin','admin@example.com','$2b$10$fnb6sgD/llCVbwc4IhURpe3HnKZ9T8puYYV5E00GzOF4.ltur.zrS',0,1,NULL,'2025-12-15 04:03:40','2025-12-15 10:29:16','2026-01-14 02:22:50'),(2,'22222222-2','Usuario Supervisor','supervisor@example.com','$2b$10$fnb6sgD/llCVbwc4IhURpe3HnKZ9T8puYYV5E00GzOF4.ltur.zrS',0,1,NULL,'2025-12-15 04:03:40','2025-12-15 04:03:40','2026-01-13 05:31:14'),(3,'33333333-3','Usuario Auditor','auditor@example.com','$2b$10$fnb6sgD/llCVbwc4IhURpe3HnKZ9T8puYYV5E00GzOF4.ltur.zrS',0,1,NULL,'2025-12-15 04:03:40','2025-12-15 04:03:40','2026-01-07 21:27:38'),(4,'44444444-4','Usuario Analista','analista@example.com','$2b$10$fnb6sgD/llCVbwc4IhURpe3HnKZ9T8puYYV5E00GzOF4.ltur.zrS',0,1,NULL,'2025-12-15 04:03:40','2025-12-15 04:03:40','2026-01-13 05:42:42'),(5,'55555555-5','Usuario SuperSu','supersu@example.com','$2b$10$fnb6sgD/llCVbwc4IhURpe3HnKZ9T8puYYV5E00GzOF4.ltur.zrS',0,1,NULL,'2025-12-15 04:03:40','2025-12-15 04:03:40',NULL),(11,'20.731.153-7','SOFIA OLIVARES','benjamin.moralesc@estudiantes.uv.cl','$2b$10$5TMvSl3ZxOztUdQMdFgS1e5SVO.wo.1MXovM9nriIxblF7/eCMIIq',0,1,NULL,'2025-12-18 14:50:22','2025-12-22 20:58:23','2025-12-22 20:59:03');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario_categoria`
--

DROP TABLE IF EXISTS `usuario_categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario_categoria` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint NOT NULL,
  `categoria_id` bigint NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_usuario_categoria` (`usuario_id`,`categoria_id`),
  UNIQUE KEY `usuario_categoria_usuario_id_categoria_id` (`usuario_id`,`categoria_id`),
  KEY `idx_usuario_id` (`usuario_id`),
  KEY `idx_categoria_id` (`categoria_id`),
  KEY `usuario_categoria_usuario_id` (`usuario_id`),
  KEY `usuario_categoria_categoria_id` (`categoria_id`),
  CONSTRAINT `usuario_categoria_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usuario_categoria_ibfk_2` FOREIGN KEY (`categoria_id`) REFERENCES `categoria_denuncia` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario_categoria`
--

LOCK TABLES `usuario_categoria` WRITE;
/*!40000 ALTER TABLE `usuario_categoria` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuario_categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario_rol`
--

DROP TABLE IF EXISTS `usuario_rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario_rol` (
  `usuario_id` bigint NOT NULL,
  `rol_id` bigint NOT NULL,
  PRIMARY KEY (`usuario_id`,`rol_id`),
  UNIQUE KEY `usuario_rol_rol_id_usuario_id_unique` (`usuario_id`,`rol_id`),
  KEY `usuario_rol_usuario_id` (`usuario_id`),
  KEY `usuario_rol_rol_id` (`rol_id`),
  CONSTRAINT `usuario_rol_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usuario_rol_ibfk_2` FOREIGN KEY (`rol_id`) REFERENCES `rol` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario_rol`
--

LOCK TABLES `usuario_rol` WRITE;
/*!40000 ALTER TABLE `usuario_rol` DISABLE KEYS */;
INSERT INTO `usuario_rol` VALUES (1,1),(2,3),(3,4),(4,2),(5,5),(11,14);
/*!40000 ALTER TABLE `usuario_rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'denuncias_app'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-21 16:42:06
