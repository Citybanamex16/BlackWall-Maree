-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 18-04-2026 a las 22:32:41
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `mareebd`
--
CREATE DATABASE IF NOT EXISTS `mareebd` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `mareebd`;
SET FOREIGN_KEY_CHECKS = 0;

DELIMITER $$
--
-- Procedimientos
--
DROP PROCEDURE IF EXISTS `ActualizarIngrediente`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `ActualizarIngrediente` (IN `p_idInsumo` VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci, IN `p_nombre` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci, IN `p_categoria` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci, IN `p_precio` DECIMAL(10,2), IN `p_activo` TINYINT(1), IN `p_imagen` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci)   BEGIN
    DECLARE v_error_msg VARCHAR(500);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1 v_error_msg = MESSAGE_TEXT;
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_error_msg;
    END;

    START TRANSACTION;
        UPDATE insumo
        SET Nombre = p_nombre,
            `Categoría` = p_categoria,
            Precio = p_precio,
            Activo = p_activo,
            Imagen = p_imagen
        WHERE ID_Insumo = p_idInsumo;
    COMMIT;
END$$

DROP PROCEDURE IF EXISTS `EliminarIngrediente`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `EliminarIngrediente` (IN `p_idInsumo` VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci)   BEGIN
    DECLARE v_error_msg VARCHAR(500);
    -- Manejador de errores para la transacción
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1 v_error_msg = MESSAGE_TEXT;
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_error_msg;
    END;

    START TRANSACTION;
        -- Primero eliminamos la relación para evitar error de FK
        DELETE FROM producto_tiene_insumo WHERE ID_Insumo = p_idInsumo;
        -- Luego eliminamos el insumo
        DELETE FROM insumo WHERE ID_Insumo = p_idInsumo;
    COMMIT;
END$$

DROP PROCEDURE IF EXISTS `eliminarProducto`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `eliminarProducto` (IN `idProducto` VARCHAR(12) CHARSET utf8mb4)  DETERMINISTIC BEGIN


    DECLARE code_sql CHAR(5) DEFAULT '00000';
    DECLARE msg_text TEXT;

  
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        
        GET DIAGNOSTICS CONDITION 1 
            code_sql = RETURNED_SQLSTATE, msg_text = MESSAGE_TEXT;
        
    
        ROLLBACK;
       
        SELECT code_sql AS SQL_State, msg_text AS Error_Mensaje;
    END;

    START TRANSACTION;

        DELETE FROM producto_tiene_insumo 
        WHERE ID_Producto = idProducto COLLATE utf8mb4_spanish2_ci;
        
        DELETE FROM orden_tiene_producto
        WHERE ID_Producto = idProducto COLLATE utf8mb4_spanish2_ci;
        
        DELETE FROM producto_pertenece_evento
        WHERE ID_Producto = idProducto COLLATE utf8mb4_spanish2_ci;
        
        DELETE FROM producto_tiene_promocion
        WHERE ID_Producto = idProducto COLLATE utf8mb4_spanish2_ci;

        DELETE FROM producto 
        WHERE ID_Producto = idProducto COLLATE utf8mb4_spanish2_ci;

    COMMIT;
    SELECT 'Éxito' AS Estado, 'Producto eliminado correctamente' AS Error_Mensaje;
END$$

DROP PROCEDURE IF EXISTS `obtener_promociones_por_tipo`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `obtener_promociones_por_tipo` (IN `tipo_promo` VARCHAR(2))   BEGIN
    -- Lógica de Jerarquía EFRL (Event First, Royalty Last)
    
    IF tipo_promo = 'PE' THEN
        -- 1. EVENTO: Mandan sobre todas.
        SELECT 
            p.Nombre AS Producto, 
            promo.Nombre AS Plantilla_Promo, 
            promo.Descuento, -- Nuevo campo agregado
            'Evento' AS Origen
        FROM evento_contiene_promocion ecp
        JOIN producto_tiene_promocion ptp ON ecp.ID_Promocion = ptp.ID_Promocion
        JOIN Producto p ON ptp.ID_Producto = p.ID_Producto
        JOIN Promocion promo ON ptp.ID_Promocion = promo.ID_Promocion;

    ELSEIF tipo_promo = 'PU' THEN
        -- 2. ÚNICA: Solo si NO es Evento y NO es Royalty
        SELECT 
            p.Nombre AS Producto, 
            promo.Nombre AS Plantilla_Promo, 
            promo.Descuento, -- Nuevo campo agregado
            'Única' AS Origen
        FROM producto_tiene_promocion ptp
        JOIN Producto p ON p.ID_Producto = ptp.ID_Producto
        JOIN Promocion promo ON promo.ID_Promocion = ptp.ID_Promocion
        WHERE ptp.ID_Promocion NOT IN (SELECT ID_Promocion FROM evento_contiene_promocion)
          AND ptp.ID_Promocion NOT IN (SELECT ID_Promocion FROM estado_royalty_da_promociones);

    ELSEIF tipo_promo = 'PR' THEN
        -- 3. ROYALTY: El remanente (Si es Royalty pero NO es Evento)
        SELECT 
            p.Nombre AS Producto, 
            promo.Nombre AS Plantilla_Promo, 
            promo.Descuento, -- Nuevo campo agregado
            'Royalty' AS Origen
        FROM estado_royalty_da_promociones erp
        JOIN producto_tiene_promocion ptp ON erp.ID_Promocion = ptp.ID_Promocion
        JOIN Producto p ON ptp.ID_Producto = p.ID_Producto
        JOIN Promocion promo ON ptp.ID_Promocion = promo.ID_Promocion
        WHERE erp.ID_Promocion NOT IN (SELECT ID_Promocion FROM evento_contiene_promocion);

    ELSE
        -- Mensaje de error si el parámetro no es válido
        SELECT 'Error: El parámetro debe ser PU, PE o PR' AS Mensaje;
    END IF;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `calendario`
--

DROP TABLE IF EXISTS `calendario`;
CREATE TABLE `calendario` (
  `ID_Calendario` varchar(10) NOT NULL,
  `ID_Sucursal` varchar(10) NOT NULL,
  `Fecha` date NOT NULL,
  `Es_Laboral` tinyint(1) DEFAULT 0,
  `Descripción` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `calendario`
--

INSERT INTO `calendario` (`ID_Calendario`, `ID_Sucursal`, `Fecha`, `Es_Laboral`, `Descripción`) VALUES
('DT00753264', 'SC79425454', '2026-12-25', 0, 'Navidad'),
('DT12635400', 'SC62053621', '2026-09-18', 0, 'Día de independencia'),
('DT39546702', 'SC62053621', '2026-12-26', 1, 'Noche Buena'),
('DT46261464', 'SC79425454', '2026-04-30', 1, 'Día del niño'),
('DT57575231', 'SC36895371', '2026-12-24', 1, 'Noche Buena'),
('DT60551195', 'SC62053621', '2026-12-25', 0, 'Navidad'),
('DT79391490', 'SC36895371', '2026-04-30', 1, 'Día del niño'),
('DT80180879', 'SC36895371', '2026-09-16', 0, 'Día de independencia'),
('DT80215880', 'SC79425454', '2026-12-25', 1, 'Noche Buena'),
('DT80240500', 'SC79425454', '2026-09-17', 0, 'Día de independencia'),
('DT86514587', 'SC62053621', '2026-04-30', 1, 'Día del niño'),
('DT95274576', 'SC36895371', '2026-12-25', 0, 'Navidad');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoría`
--

DROP TABLE IF EXISTS `categoría`;
CREATE TABLE `categoría` (
  `Nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `categoría`
--

INSERT INTO `categoría` (`Nombre`) VALUES
('Bebidas'),
('Platillo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

DROP TABLE IF EXISTS `cliente`;
CREATE TABLE `cliente` (
  `Numero_Telefonico` varchar(20) NOT NULL,
  `Nombre_Royalty` varchar(50) DEFAULT NULL,
  `Nombre` varchar(100) NOT NULL,
  `Correo` varchar(100) DEFAULT NULL,
  `Genero` varchar(15) DEFAULT NULL,
  `Fecha_Nacimiento` date DEFAULT NULL,
  `Visitas_Actuales` int(11) DEFAULT 0,
  `ID_Rol` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` (`Numero_Telefonico`, `Nombre_Royalty`, `Nombre`, `Correo`, `Genero`, `Fecha_Nacimiento`, `Visitas_Actuales`, `ID_Rol`) VALUES
('55-1156-9800', 'Mega Fan', 'Andrea Iliana Cantú Mayorga', 'ailiana@gmail.com', 'f', '1977-04-01', 2, 'Usuario'),
('55-1579-6753', 'Super Fan', 'Eduardo Daniel Juárez Pineda', 'ejuarez@gmail.com', 'm', '1967-06-07', 16, 'Usuario'),
('55-1827-6651', 'Super Fan', 'David Antonio Gandara Ruiz', 'dgandara@gmail.com', 'm', '1975-07-03', 18, 'Usuario'),
('55-2006-6063', 'Fan', 'Isabela Ruiz Velasco Angeles', 'ivelasco@gmail.com', 'f', '1957-07-18', 16, 'Usuario'),
('55-2435-6781', 'Fan', 'Brenda Vázquez Rodríguez', 'bvazquez@gmail.com', 'f', '1971-06-10', 14, 'Usuario'),
('55-2669-1307', 'Fan', 'Ana Camila Cuevas González', 'acuevas@gmail.com', 'f', '1987-02-18', 14, 'Usuario'),
('55-2884-7043', 'Super Fan', 'Eduardo Hernández Alonso', 'ehernandez@gmail.com', 'm', '1995-04-19', 1, 'Usuario'),
('55-3225-9858', 'Super Fan', 'Alexis Yaocalli Berthou Haas', 'aberthou@gmail.com', 'm', '1958-09-24', 18, 'Usuario'),
('55-3251-9266', 'Fan', 'Ximena Guadalupe Córdoba Ángeles', 'xcordoba@gmail.com', 'f', '1965-02-10', 16, 'Usuario'),
('55-3647-8536', 'Fan', 'Dana Izel Martínez García', 'dmartinez@gmail.com', 'f', '1995-05-24', 7, 'Usuario'),
('55-3672-3148', 'Fan', 'Alejandro Contreras Magallanes', 'acontreras@gmail.com', 'm', '1956-12-27', 11, 'Usuario'),
('55-3885-6878', 'Fan', 'Mariana Frías Olguín', 'mfrias@gmail.com', 'f', '1991-09-12', 14, 'Usuario'),
('55-3938-1454', 'Super Fan', 'Hannah Carolina Hernández Reyes', 'hhernandez@gmail.com', 'f', '1976-10-27', 11, 'Usuario'),
('55-3975-4081', 'Mega Fan', 'Samantha García Cárdenas', 'sgarcia@gmail.com', 'f', '1992-03-07', 1, 'Usuario'),
('55-4203-5221', 'Super Fan', 'Ricardo Cortés Espinosa', 'rcortes@gmail.com', 'm', '1992-03-18', 18, 'Usuario'),
('55-4217-5522', 'Super Fan', 'Ilian Judith Castillo Beristain', 'icastillo@gmail.com', 'f', '1979-08-01', 6, 'Usuario'),
('55-4606-3624', 'Fan', 'Héctor Alejandro Barrón Tamayo', 'hbarron@gmail.com', 'm', '1956-03-04', 12, 'Usuario'),
('55-4768-9613', 'Mega Fan', 'Jessica Hernández Tejeda', 'jhernandez@gmail.com', 'f', '1961-02-07', 7, 'Usuario'),
('55-5018-5507', 'Mega Fan', 'Armando Montealegre Villagrán', 'amontealegre@gmail.com', 'm', '1952-10-08', 9, 'Usuario'),
('55-5824-6563', 'Super Fan', 'Suri Reyes Vega', 'sureyes@gmail.com', 'f', '1957-12-21', 7, 'Usuario'),
('55-6026-1598', 'Fan', 'Maria Fernanda Padme Lakshmi Martínez Jara', 'mlakshmi@gmail.com', 'f', '1999-01-06', 12, 'Usuario'),
('55-6624-7720', 'Mega Fan', 'Mariangel Aguirre Magallanes', 'maguirre@gmail.com', 'f', '1980-02-08', 17, 'Usuario'),
('55-6788-4484', 'Fan', 'Víctor Hugo Esquivel Feregrino', 'vesquivel@gmail.com', 'm', '1992-11-06', 1, 'Usuario'),
('55-7095-1397', 'Fan', 'Gabriela Frías Quiroz', 'gfrias@gmail.com', 'f', '1981-07-03', 19, 'Usuario'),
('55-7110-9468', 'Fan', 'Santiago Barjau Hernández', 'sbarjau@gmail.com', 'm', '1982-05-15', 5, 'Usuario'),
('55-7260-4596', 'Mega Fan', 'Fernanda Rosales Herrera', 'frosales@gmail.com', 'f', '1980-01-14', 5, 'Usuario'),
('55-7378-3019', 'Super Fan', 'Jonathan de Jesús Anaya Correa', 'janaya@gmail.com', 'm', '1952-12-21', 6, 'Usuario'),
('55-7564-5136', 'Mega Fan', 'Diego Alberto Pasaye González', 'dpasaye@gmail.com', 'm', '1994-10-08', 10, 'Usuario'),
('55-7634-3304', 'Fan', 'Carlos Delgado Contreras', 'cdelgado@gmail.com', 'm', '1995-08-20', 9, 'Usuario'),
('55-7731-4202', 'Fan', 'Renata Martínez Ozumbilla', 'rmartinez@gmail.com', 'f', '1994-07-09', 2, 'Usuario'),
('55-7869-6124', 'Fan', 'Emiliano Murillo Ruiz', 'emurillo@gmail.com', 'm', '1988-10-19', 20, 'Usuario'),
('55-7877-5755', 'Fan', 'Yamine Dávila Bejos', 'ydavila@gmail.com', 'f', '1997-09-08', 5, 'Usuario'),
('55-8034-2908', 'Mega Fan', 'Sofía Alondra Reyes Gómez', 'sreyes@gmail.com', 'f', '1968-02-18', 9, 'Usuario'),
('55-8069-3709', 'Mega Fan', 'Jesús Osvaldo Ramos Pérez', 'jramos@gmail.com', 'm', '1989-12-08', 5, 'Usuario'),
('55-8317-4862', 'Super Fan', 'Oscar Alexander Vilchis Soto', 'ovilchis@gmail.com', 'm', '1960-03-06', 20, 'Usuario'),
('55-8361-8067', 'Fan', 'Katya Jiménez Antonio', 'kjimenez@gmail.com', 'f', '1987-01-11', 13, 'Usuario'),
('55-8616-1973', 'Super Fan', 'Alberto Barba Arroyo', 'abarba@gmail.com', 'm', '2003-03-09', 5, 'Usuario'),
('55-8634-4784', 'Fan', 'Francisco Rafael Arreola Corona', 'farreola@gmail.com', 'm', '1973-07-12', 18, 'Usuario'),
('55-8842-2908', 'Super Fan', 'Ana Sofía Moreno Hernández', 'amoreno@gmail.com', 'f', '1975-05-12', 14, 'Usuario'),
('55-8913-8427', 'Super Fan', 'Fernanda Curiel Perez', 'fcuriel@gmail.com', 'f', '1997-11-18', 7, 'Usuario'),
('55-8962-5930', 'Fan', 'Juan Pablo Juárez Ortiz', 'jjuarez@@gmail.com', 'm', '1956-08-16', 4, 'Usuario'),
('55-9026-7777', 'Fan', 'Sebastián Mansilla Cots', 'smansilla@gmail.com', 'm', '1976-06-20', 9, 'Usuario'),
('55-9188-6863', 'Mega Fan', 'Iker Arnoldo Grajeda Campaña', 'igrajeda@gmail.com', 'm', '2000-01-01', 5, 'Usuario'),
('55-9221-5175', 'Mega Fan', 'Ana Valeria Machuca Miranda', 'amachuca@gmail.com', 'f', '1957-07-06', 6, 'Usuario'),
('55-9297-8935', 'Super Fan', 'Juan Pablo Domínguez Ángel', 'jdominguez@gmail.com', 'm', '1966-09-12', 9, 'Usuario'),
('55-9583-1422', 'Fan', 'Galia Lucía Castro Aboytes', 'gcastro@gmail.com', 'f', '1959-08-03', 1, 'Usuario'),
('55-9661-9093', 'Fan', 'Diego Serrano Pardo', 'dserrano@gmail.com', 'm', '2004-05-23', 8, 'Usuario'),
('55-9783-5924', 'Fan', 'Ricardo Antonio Gutiérrez García', 'rgutierrez@gmail.com', 'm', '1980-05-28', 13, 'Usuario'),
('55-9862-4951', 'Super Fan', 'Ramón Eliezer De Santos García', 'rgarcia@gmail.com', 'm', '1962-01-17', 6, 'Usuario'),
('55-9956-8802', 'Super Fan', 'Rodrigo Alejandro Hurtado Cortés', 'rhurtado@gmail.com', 'm', '1983-02-25', 2, 'Usuario');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente_canjea_promociones`
--

DROP TABLE IF EXISTS `cliente_canjea_promociones`;
CREATE TABLE `cliente_canjea_promociones` (
  `Numero_Telefonico` varchar(20) NOT NULL,
  `ID_Promocion` varchar(20) NOT NULL,
  `FECHA` date NOT NULL,
  `Canjeado` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `cliente_canjea_promociones`
--

INSERT INTO `cliente_canjea_promociones` (`Numero_Telefonico`, `ID_Promocion`, `FECHA`, `Canjeado`) VALUES
('55-1156-9800', 'PR83010754', '2025-03-18', 0),
('55-1579-6753', 'PR98448306', '2026-10-02', 0),
('55-2006-6063', 'PR56696931', '2026-11-07', 1),
('55-2669-1307', 'PR27804270', '2025-08-20', 0),
('55-2884-7043', 'PR45005334', '2025-08-18', 1),
('55-3225-9858', 'PR97994498', '2025-03-27', 0),
('55-3251-9266', 'PR44805876', '2026-10-04', 1),
('55-3647-8536', 'PR27804270', '2024-11-26', 0),
('55-3672-3148', 'PR33846028', '2024-05-12', 0),
('55-3885-6878', 'PR78222949', '2024-04-24', 1),
('55-3938-1454', 'PR97994498', '2026-12-22', 0),
('55-3975-4081', 'PR59583389', '2026-01-14', 1),
('55-4203-5221', 'PR62258980', '2026-12-05', 1),
('55-4217-5522', 'PR83010754', '2026-06-05', 0),
('55-4606-3624', 'PR48403051', '2025-12-14', 1),
('55-4768-9613', 'PR33846028', '2025-07-17', 0),
('55-6624-7720', 'PR76785851', '2025-12-10', 0),
('55-6788-4484', 'PR97688224', '2026-10-18', 0),
('55-7095-1397', 'PR78222949', '2026-10-15', 0),
('55-7110-9468', 'PR52091063', '2026-09-05', 1),
('55-7634-3304', 'PR43783578', '2024-09-15', 1),
('55-7731-4202', 'PR97688224', '2024-11-04', 0),
('55-7869-6124', 'PR45005334', '2026-08-25', 0),
('55-7877-5755', 'PR33274771', '2025-04-07', 0),
('55-8034-2908', 'PR98448306', '2025-08-24', 1),
('55-8069-3709', 'PR32616125', '2024-12-24', 1),
('55-8361-8067', 'PR62258980', '2025-11-16', 0),
('55-8616-1973', 'PR44088429', '2026-01-21', 0),
('55-8634-4784', 'PR21011143', '2024-03-27', 0),
('55-8842-2908', 'PR56696931', '2024-08-04', 1),
('55-8913-8427', 'PR19912809', '2026-04-12', 0),
('55-8962-5930', 'PR87134462', '2025-09-10', 1),
('55-9026-7777', 'PR33274771', '2025-01-16', 1),
('55-9188-6863', 'PR21011143', '2025-12-17', 0),
('55-9297-8935', 'PR59583389', '2024-04-23', 0),
('55-9583-1422', 'PR43783578', '2026-07-04', 1),
('55-9661-9093', 'PR32616125', '2026-09-15', 1),
('55-9783-5924', 'PR48403051', '2025-09-01', 0),
('55-9862-4951', 'PR87134462', '2026-07-02', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `codigo_verificacion`
--

DROP TABLE IF EXISTS `codigo_verificacion`;
CREATE TABLE `codigo_verificacion` (
  `Numero_Telefonico` varchar(20) NOT NULL,
  `Codigo` varchar(6) NOT NULL,
  `Fecha_Creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `Fecha_Expiracion` datetime NOT NULL,
  `Usado` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `codigo_verificacion`
--

INSERT INTO `codigo_verificacion` (`Numero_Telefonico`, `Codigo`, `Fecha_Creacion`, `Fecha_Expiracion`, `Usado`) VALUES
('55-3225-9858', '889-50', '2026-09-10 06:00:00', '2026-09-10 00:00:00', 1),
('55-3885-6878', '183-38', '2026-04-25 06:00:00', '2026-04-25 00:00:00', 0),
('55-4606-3624', '697-13', '2026-06-30 06:00:00', '2026-06-30 00:00:00', 1),
('55-7634-3304', '666-30', '2026-11-30 06:00:00', '2026-11-30 00:00:00', 0),
('55-8634-4784', '68-430', '2026-10-10 06:00:00', '2026-10-10 00:00:00', 1),
('55-8962-5930', '828-95', '2026-05-09 06:00:00', '2026-05-09 00:00:00', 1),
('55-9026-7777', '684-83', '2026-06-25 06:00:00', '2026-06-25 00:00:00', 1),
('55-9297-8935', '315-64', '2026-12-20 06:00:00', '2026-12-20 00:00:00', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `colaborador`
--

DROP TABLE IF EXISTS `colaborador`;
CREATE TABLE `colaborador` (
  `ID_Colaborador` varchar(20) NOT NULL,
  `ID_Rol` varchar(20) NOT NULL,
  `Nombre` varchar(100) NOT NULL,
  `Contraseña` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `colaborador`
--

INSERT INTO `colaborador` (`ID_Colaborador`, `ID_Rol`, `Nombre`, `Contraseña`) VALUES
('CL01474090', 'Colaborador', 'Dante Hernández Ramírez', 'CL033172!'),
('CL03142057', 'Colaborador', 'Benjamín Valdéz Aguirre', 'CL047938!'),
('CL04645360', 'Colaborador', 'Luis Eduardo Gutiérrez Chavarría', 'CL047182!'),
('CL05875991', 'Colaborador', 'Osiris Abdallah Garcia Hernandez', 'CL029737!'),
('CL05934130', 'Colaborador', 'Mia Yanet Escarcega Villareal', 'CL015562!'),
('CL08921121', 'Colaborador', 'Daniel Lopez Portillo', 'CL034832!'),
('CL10689770', 'Colaborador', 'Mariana Gayon Garcia', 'CL016318!'),
('CL12695174', 'Colaborador', 'Iker Rodríguez Amaro', 'CL049625!'),
('CL14041111', 'Colaborador', 'Juan Jose Garcia Escamilla', 'CL012659!'),
('CL15708348', 'Colaborador', 'Jacquelin Suarez Anaya', 'CL043804!'),
('CL16454454', 'Colaborador', 'Natalia Martinez Feregrino', 'CL018410!'),
('CL18100715', 'Colaborador', 'Juan Pablo Sanchez Gonzalez', 'CL003779!'),
('CL18831765', 'Colaborador', 'Covadonga Rodriguez Rodriguez', 'CL048471!'),
('CL20301137', 'Colaborador', 'Martin Mendoza-Ceja', 'CL011092!'),
('CL21614946', 'Colaborador', 'Maria Paulina Quezada Maldonado', 'CL034190!'),
('CL21985981', 'Colaborador', 'Pablo Israel Luna Lopez', 'CL040200!'),
('CL28628856', 'Colaborador', 'Jorge Rubén Nieto Vega', 'CL004521!'),
('CL29144982', 'Colaborador', 'Santiago Martín del Campo Soler', 'CL023140!'),
('CL30204267', 'Colaborador', 'Diego Lopez Pastor', 'CL016868!'),
('CL32789112', 'Colaborador', 'Dulce Sarai Gonzalez Gonzalez', 'CL039127!'),
('CL33315007', 'Colaborador', 'Daniela Ire Esquinca Caballero', 'CL013720!'),
('CL34960608', 'Colaborador', 'Mario Alberto Guzman Garza', 'CL045311!'),
('CL35064199', 'Colaborador', 'Valentina Gonzalez Salas', 'CL010209!'),
('CL35949578', 'Colaborador', 'Luis Fernando Martínez Barragán', 'CL008654!'),
('CL36735120', 'Colaborador', 'Jose Manuel Chavez', 'CL023086!'),
('CL41890499', 'Colaborador', 'Maria Emillia Morales', 'CL041603!'),
('CL46764962', 'Colaborador', 'César Daniel Aguilar Kuri', 'CL012431!'),
('CL47544031', 'Colaborador', 'Emilio Hernandez', 'CL032953!'),
('CL48022629', 'Colaborador', 'Alondra Lizeth Landín Vega', 'CL045706!'),
('CL48036451', 'Colaborador', 'Diana Itzel Guerra Calva', 'CL016564!'),
('CL48308362', 'Colaborador', 'Andrea Cifuentes Ortega', 'CL002431!'),
('CL49027022', 'Colaborador', 'Victor Adrián García Galván', 'CL038446!'),
('CL49028531', 'Colaborador', 'Maria Guadalupe Padilla Vazquez', 'CL036141!'),
('CL53489931', 'Colaborador', 'Joel Guadalupe García Guzmán', 'CL020618!'),
('CL56601272', 'Colaborador', 'Alejandro Beníitez Bravo', 'CL039310!'),
('CL56761259', 'Colaborador', 'Andra Nava Ortiz', 'CL020481!'),
('CL56859887', 'Colaborador', 'Renata Barcenas Mila', 'CL027272!'),
('CL60891415', 'Colaborador', 'David Espino Barron', 'CL030913!'),
('CL62526407', 'Colaborador', 'Pablo Solana', 'CL008096!'),
('CL64339447', 'Colaborador', 'Maria Jose Pedraza Padilla', 'CL016049!'),
('CL69273596', 'Colaborador', 'Iñaki Mancera Llano', 'CL033076!'),
('CL72018333', 'Colaborador', 'Marianna Quiroz Zuñiga', 'CL032764!'),
('CL78145878', 'Colaborador', 'David Alejandro Robles Camacho', 'CL034953!'),
('CL80532101', 'Colaborador', 'Ana Paula Ortega', 'CL030421!'),
('CL85062921', 'Colaborador', 'Daniela Suarez Loy', 'CL017635!'),
('CL85565990', 'Administrador', 'Juan Pablo Cedillo Peréz', 'CL006901!'),
('CL85772520', 'Colaborador', 'Sara Flores Gonzalez', 'CL026063!'),
('CL94221819', 'Colaborador', 'Grezia Trujillo', 'CL027249!'),
('CL95096755', 'Colaborador', 'Betzabeth Durán Solorza', 'CL039025!');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `colaborador_tiene_turno`
--

DROP TABLE IF EXISTS `colaborador_tiene_turno`;
CREATE TABLE `colaborador_tiene_turno` (
  `ID_Colaborador` varchar(20) NOT NULL,
  `ID_Turno` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `colaborador_tiene_turno`
--

INSERT INTO `colaborador_tiene_turno` (`ID_Colaborador`, `ID_Turno`) VALUES
('CL01474090', 'TN26496107'),
('CL03142057', 'TN26496107'),
('CL04645360', 'TN46937585'),
('CL05875991', 'TN46937585'),
('CL05934130', 'TN26496107'),
('CL08921121', 'TN26496107'),
('CL10689770', 'TN46937585'),
('CL12695174', 'TN46937585'),
('CL14041111', 'TN26496107'),
('CL15708348', 'TN47025996'),
('CL16454454', 'TN46937585'),
('CL18100715', 'TN47025996'),
('CL18831765', 'TN47025996'),
('CL20301137', 'TN46937585'),
('CL21614946', 'TN47025996'),
('CL21985981', 'TN46937585'),
('CL28628856', 'TN46937585'),
('CL29144982', 'TN46937585'),
('CL30204267', 'TN46937585'),
('CL32789112', 'TN46937585'),
('CL33315007', 'TN26496107'),
('CL34960608', 'TN46937585'),
('CL35064199', 'TN46937585'),
('CL35949578', 'TN46937585'),
('CL36735120', 'TN26496107'),
('CL41890499', 'TN26496107'),
('CL46764962', 'TN26496107'),
('CL47544031', 'TN47025996'),
('CL48022629', 'TN46937585'),
('CL48036451', 'TN46937585'),
('CL48308362', 'TN26496107'),
('CL49027022', 'TN26496107'),
('CL49028531', 'TN47025996'),
('CL53489931', 'TN26496107'),
('CL56601272', 'TN26496107'),
('CL56761259', 'TN46937585'),
('CL56859887', 'TN26496107'),
('CL60891415', 'TN26496107'),
('CL62526407', 'TN26496107'),
('CL64339447', 'TN47025996'),
('CL69273596', 'TN46937585'),
('CL72018333', 'TN47025996'),
('CL78145878', 'TN46937585'),
('CL80532101', 'TN46937585'),
('CL85062921', 'TN47025996'),
('CL85565990', 'TN26496107'),
('CL85772520', 'TN26496107'),
('CL94221819', 'TN46937585'),
('CL95096755', 'TN26496107');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_royalty`
--

DROP TABLE IF EXISTS `estado_royalty`;
CREATE TABLE `estado_royalty` (
  `Nombre_Royalty` varchar(50) NOT NULL,
  `Número_de_prioridad` int(11) NOT NULL,
  `Descripción` text NOT NULL,
  `Max_Visitas` int(11) NOT NULL,
  `Min_Visitas` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `estado_royalty`
--

INSERT INTO `estado_royalty` (`Nombre_Royalty`, `Número_de_prioridad`, `Descripción`, `Max_Visitas`, `Min_Visitas`) VALUES
('Fan', 1, '\"En este nivel normalmente se ofrecen beneficios exclusivos: acceso anticipado a contenido, mercancía especial, descuentos mayores, eventos privados, interacción más directa con el creador o la marca, e incluso reconocimiento público dentro de la comunidad. La idea es premiar la lealtad y el compromiso constante.\"', 10, 5),
('Mega Fan', 3, '\"El nivel mega fan va un paso más allá. Está pensado para quienes demuestran un compromiso más fuerte y continuo. En este nivel pueden ofrecerse ventajas más destacadas como experiencias más personalizadas, eventos exclusivos, productos especiales o menciones directas. Se convierte en un espacio más selecto dentro de la comunidad, donde el vínculo con la marca o creador es más cercano y visible.\nEs una especie de escalera de compromiso: cada nivel no solo ofrece beneficios, sino también mayor pertenencia y conexión.\"', 20, 16),
('Super Fan', 2, '\"Un nivel super fan representa a quienes ya no solo siguen el contenido, sino que participan activamente en la comunidad. Aquí suele haber beneficios atractivos como acceso anticipado a publicaciones, contenido exclusivo adicional, descuentos especiales o dinámicas privadas. También puede incluir interacción más cercana con el creador o reconocimiento dentro del grupo. La intención es recompensar la constancia y el entusiasmo.\"', 15, 11);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_royalty_da_eventos`
--

DROP TABLE IF EXISTS `estado_royalty_da_eventos`;
CREATE TABLE `estado_royalty_da_eventos` (
  `Nombre_Royalty` varchar(50) NOT NULL,
  `ID_Evento` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_royalty_da_promociones`
--

DROP TABLE IF EXISTS `estado_royalty_da_promociones`;
CREATE TABLE `estado_royalty_da_promociones` (
  `Nombre_Royalty` varchar(50) NOT NULL,
  `ID_Promocion` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `estado_royalty_da_promociones`
--

INSERT INTO `estado_royalty_da_promociones` (`Nombre_Royalty`, `ID_Promocion`) VALUES
('Fan', 'PR44805876'),
('Mega Fan', 'PR33274771'),
('Super Fan', 'PR19912809');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `evento`
--

DROP TABLE IF EXISTS `evento`;
CREATE TABLE `evento` (
  `ID_Evento` varchar(20) NOT NULL,
  `Nombre` varchar(100) NOT NULL,
  `Descripcion` text DEFAULT NULL,
  `Activo` tinyint(1) DEFAULT 0,
  `Fecha_Inicio` date NOT NULL,
  `Fecha_Final` date DEFAULT NULL,
  `Imagen` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `evento`
--

INSERT INTO `evento` (`ID_Evento`, `Nombre`, `Descripcion`, `Activo`, `Fecha_Inicio`, `Fecha_Final`, `Imagen`) VALUES
('EV00802058', 'Feria Sabores del Mundo en Crepa', '\"Evento internacional donde las crepas se inspiran en recetas de distintos países.\"', 0, '2019-04-26', '2022-07-26', NULL),
('EV03455709', 'Festival Giro Dorado', '\"Celebración dedicada al arte de lograr la crepa perfecta: delgada, uniforme y dorada. Incluye demostraciones en vivo y degustaciones especiales.\"', 0, '0006-06-26', '2028-07-26', NULL),
('EV11967402', 'Encuentro Sabores en Capas', '\"Evento gastronómico que explora distintas combinaciones de rellenos y texturas en cada crepa.\"', 0, '2015-04-26', '2016-08-26', NULL),
('EV28249203', 'Semana del Antojo Feliz', '\"Promoción extendida con descuentos y sabores especiales cada día.\"', 0, '2013-06-26', '0008-09-26', NULL),
('EV36081746', 'Noche Fuego y Nutella', '\"Evento nocturno centrado en crepas dulces preparadas al momento con chocolate y cremas untables.\"', 0, '0008-05-26', '2029-09-26', NULL),
('EV40845617', 'Torneo Maestro Game Dev', '\"Competencia entre chefs o participantes para crear la mejor crepa en sabor y presentación.\"', 0, '2028-04-26', '2030-12-26', NULL),
('EV41575412', 'Maratón 12 Sabores', '\"Reto gastronómico donde los asistentes prueban doce sabores distintos en una sola experiencia.\"', 0, '2022-04-26', '2012-12-26', NULL),
('EV47036119', 'Expo Toppings Infinitos', '\"Exhibición de ingredientes y coberturas variadas para personalizar cada crepa al gusto.\"', 1, '0003-05-26', '2011-07-26', NULL),
('EV47873322', 'Ruta de la Crepa Perfecta', '\"Experiencia de degustación donde los asistentes prueban distintas versiones hasta elegir su favorita.\"', 0, '0006-06-26', '2010-09-26', NULL),
('EV48230988', 'Brunch La Vuelta Francesa', '\"Brunch inspirado en la tradición francesa, con crepas acompañadas de café, mermeladas y opciones saladas.\"', 0, '2023-05-26', '2013-07-26', NULL),
('EV56656726', 'Feria Dulce Espiral', '\"Muestra enfocada en crepas dulces con combinaciones creativas, desde frutas frescas hasta salsas artesanales.\"', 1, '0008-06-26', '2030-07-26', NULL),
('EV63596263', 'Gala Sabor Circular', '\"Evento más formal que presenta crepas gourmet con ingredientes premium y presentación elegante.\"', 0, '0008-05-26', '2016-10-26', NULL),
('EV72477787', 'Carnaval Relleno Supremo', '\"Celebración con crepas de rellenos abundantes y combinaciones intensas, tanto dulces como saladas.\"', 0, '2028-04-26', '2011-08-26', NULL),
('EV72567097', 'Festival Crepa Lovers', '\"Celebración dedicada a los clientes frecuentes, con promociones y sabores exclusivos.\"', 1, '0001-07-26', '2030-09-26', NULL),
('EV78005678', 'Tarde Fruta & Chocolate', '\"Degustación enfocada en combinaciones clásicas de frutas frescas y chocolate fundido.\"', 1, '0008-03-26', '2027-12-26', NULL),
('EV91369328', 'Tarde Azúcar & Canela', '\"Evento temático con recetas tradicionales, destacando sabores cálidos y clásicos.\"', 0, '2010-02-26', '2013-09-26', NULL),
('EV94074382', 'Cumbre del Relleno Secreto', '\"Presentación de recetas especiales o de temporada que solo se revelan durante el evento.\"', 0, '0008-02-26', '2031-10-26', NULL),
('EV98982381', 'Sábado de Sartenes', '\"Día especial donde se preparan crepas frente al público, mostrando técnicas y recetas clásicas y modernas.\"', 0, '2026-02-26', '2016-10-26', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `evento_contiene_promocion`
--

DROP TABLE IF EXISTS `evento_contiene_promocion`;
CREATE TABLE `evento_contiene_promocion` (
  `ID_Evento` varchar(20) NOT NULL,
  `ID_Promocion` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `evento_contiene_promocion`
--

INSERT INTO `evento_contiene_promocion` (`ID_Evento`, `ID_Promocion`) VALUES
('EV03455709', 'PR44805876'),
('EV11967402', 'PR78222949'),
('EV36081746', 'PR27804270'),
('EV40845617', 'PR32616125'),
('EV40845617', 'PR45005334'),
('EV40845617', 'PR98448306'),
('EV47036119', 'PR62258980'),
('EV47873322', 'PR59583389'),
('EV48230988', 'PR97994498'),
('EV56656726', 'PR33274771'),
('EV72477787', 'PR21011143'),
('EV91369328', 'PR48403051'),
('EV94074382', 'PR97688224'),
('EV98982381', 'PR87134462');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `insumo`
--

DROP TABLE IF EXISTS `insumo`;
CREATE TABLE `insumo` (
  `ID_Insumo` varchar(10) NOT NULL,
  `Nombre` varchar(50) NOT NULL,
  `Categoría` varchar(50) NOT NULL,
  `Precio` decimal(10,2) DEFAULT 0.00,
  `Activo` tinyint(1) DEFAULT 1,
  `Imagen` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `insumo`
--

INSERT INTO `insumo` (`ID_Insumo`, `Nombre`, `Categoría`, `Precio`, `Activo`, `Imagen`) VALUES
('IN02201393', 'Leche de soya', 'Platillo', 14.00, 1, '15'),
('IN02803814', 'Rajas de chile poblano', 'Platillo', 20.00, 1, '15'),
('IN03374506', 'arugula', 'Platillo', 13.00, 1, '15'),
('IN04894004', 'Kinder Delice', 'Platillo', 19.00, 1, '15'),
('IN05269621', 'Cajeta de la casa', 'Platillo', 13.00, 1, '15'),
('IN06332851', 'Nutella', 'Platillo', 23.00, 1, '20'),
('IN07050794', 'Nuez', 'Platillo', 22.00, 1, '15'),
('IN07275176', 'Chai', 'Platillo', 11.00, 1, '15'),
('IN09130588', 'Mermelada de fresa', 'Platillo', 19.00, 0, '15'),
('IN09927406', 'Fresa ', 'Platillo', 18.00, 1, '15'),
('IN12080526', 'Miel de maple', 'Platillo', 13.00, 0, '15'),
('IN13297648', 'Mocha', 'Platillo', 21.00, 1, '15'),
('IN13442507', 'Coco Tostado', 'Platillo', 14.00, 1, '15'),
('IN15204720', 'Albahaca', 'Platillo', 12.00, 1, '15'),
('IN15500744', 'Zarzamora', 'Platillo', 24.00, 1, '15'),
('IN16420525', 'Avellana', 'Platillo', 17.00, 1, '15'),
('IN18602747', 'queso parmesano', 'Platillo', 10.00, 1, '15'),
('IN18968294', 'Pesto', 'Platillo', 12.00, 1, '15'),
('IN19746459', 'Fresa', 'Platillo', 16.00, 0, '15'),
('IN19821749', 'Paleta Magnum', 'Platillo', 16.00, 1, '15'),
('IN20877882', 'Nieve', 'Platillo', 17.00, 1, '25'),
('IN21283895', 'Snickers', 'Platillo', 15.00, 1, '15'),
('IN21585929', 'Oreo', 'Platillo', 10.00, 1, '15'),
('IN21882955', 'Fresas naturales', 'Platillo', 23.00, 1, '15'),
('IN22197307', 'Lechera', 'Platillo', 23.00, 0, '15'),
('IN22595885', 'jamón', 'Platillo', 21.00, 1, '15'),
('IN24527442', 'Crema de cacahuate', 'Platillo', 22.00, 0, '15'),
('IN25799043', 'tres quesos', 'Platillo', 10.00, 1, '15'),
('IN28033998', 'Plátano', 'Platillo', 24.00, 0, '15'),
('IN29033240', 'Chai', 'Platillo', 21.00, 1, '15'),
('IN29165394', 'Philadelphia', 'Platillo', 11.00, 0, '15'),
('IN33700399', 'Arándanos', 'Platillo', 22.00, 1, '15'),
('IN34568576', 'Nutella', 'Platillo', 21.00, 1, '15'),
('IN36386148', 'Chai', 'Platillo', 18.00, 1, '15'),
('IN36405225', 'frosting', 'Platillo', 25.00, 1, '15'),
('IN37891778', 'Bubulubu', 'Platillo', 18.00, 1, '15'),
('IN37997343', 'Vainilla', 'Platillo', 12.00, 1, '15'),
('IN38338698', 'Kit Kat', 'Platillo', 22.00, 1, '15'),
('IN44222704', 'Pollo', 'Platillo', 22.00, 1, '15'),
('IN45987803', 'Moras Azules', 'Platillo', 25.00, 1, '15'),
('IN48200057', 'Queso mozzarella', 'Platillo', 24.00, 1, '15'),
('IN50256666', 'Leche de avena', 'Platillo', 24.00, 1, '15'),
('IN51420289', 'Leche de coco', 'Platillo', 22.00, 1, '15'),
('IN51564559', 'Ferrero', 'Platillo', 20.00, 1, '15'),
('IN52715589', 'Caramelo', 'Platillo', 20.00, 1, '15'),
('IN53190866', 'Avellana', 'Platillo', 17.00, 1, '15'),
('IN53235582', 'Caramelo', 'Platillo', 25.00, 1, '15'),
('IN53462867', 'Mora Azul', 'Platillo', 11.00, 1, '15'),
('IN54232707', 'Salsa de tomate', 'Platillo', 15.00, 1, '15'),
('IN56899901', 'Chispas de Chocolate', 'Platillo', 19.00, 1, '15'),
('IN58134969', 'Almendra', 'Platillo', 23.00, 1, '15'),
('IN58688454', 'Crema Irlandesa', 'Platillo', 11.00, 1, '15'),
('IN58759482', 'Elote', 'Platillo', 12.00, 1, '15'),
('IN59087286', 'Azúcar', 'Platillo', 18.00, 1, '15'),
('IN59824502', 'Nutella', 'Platillo', 19.00, 1, '20'),
('IN60313355', 'Manzana', 'Platillo', 21.00, 1, '15'),
('IN61916404', 'pistache natural', 'Platillo', 12.00, 1, '15'),
('IN62252551', 'Crema Irlandesa', 'Platillo', 18.00, 1, '15'),
('IN63629622', 'Nutella', 'Platillo', 24.00, 1, '20'),
('IN63793176', 'crema de chile poblano', 'Platillo', 25.00, 1, '15'),
('IN65318693', 'Vainilla', 'Platillo', 15.00, 1, '15'),
('IN65885034', 'peperoni', 'Platillo', 11.00, 1, '15'),
('IN68263429', 'Mazapán', 'Platillo', 25.00, 1, '15'),
('IN68300439', 'Jamaica', 'Platillo', 22.00, 1, '15'),
('IN68496031', 'Nieve de vainilla', 'Platillo', 16.00, 1, '15'),
('IN68797428', 'Cajeta', 'Platillo', 19.00, 0, '15'),
('IN68810175', 'Huevo', 'Platillo', 14.00, 1, '15'),
('IN69166690', 'Crema Irlandesa', 'Platillo', 21.00, 1, '15'),
('IN70367614', 'Gansito', 'Platillo', 23.00, 1, '15'),
('IN70788691', 'Frambuesa', 'Platillo', 17.00, 1, '15'),
('IN73813019', 'Manzana verde', 'Platillo', 13.00, 0, '15'),
('IN74154670', 'Avellana', 'Platillo', 16.00, 1, '15'),
('IN74201967', 'Plátano', 'Platillo', 24.00, 1, '15'),
('IN74484938', 'Crema de pistáche', 'Platillo', 21.00, 1, '15'),
('IN74817391', 'Leche deslactosada', 'Platillo', 11.00, 1, '10'),
('IN75784983', 'Frambuesa', 'Platillo', 23.00, 1, '15'),
('IN76382864', 'Crema de almendra', 'Platillo', 11.00, 1, '15'),
('IN76712465', 'Chocolate blanco', 'Platillo', 21.00, 1, '15'),
('IN78060232', 'Limón', 'Platillo', 20.00, 1, '15'),
('IN80392027', 'Crema de lotus', 'Platillo', 16.00, 1, '15'),
('IN80740094', 'Canela', 'Platillo', 15.00, 1, '15'),
('IN80873458', 'Madreselva', 'Platillo', 11.00, 1, '15'),
('IN82503493', 'Fresa', 'Platillo', 19.00, 1, '15'),
('IN82598534', 'Zarzamora', 'Platillo', 21.00, 1, '15'),
('IN84684230', 'Jamón serrano', 'Platillo', 18.00, 1, '15'),
('IN84763568', 'Leche de almendra', 'Platillo', 21.00, 1, '15'),
('IN85641851', 'Chocolate cookies n\' cream', 'Platillo', 19.00, 1, '15'),
('IN87022030', 'galleta lotus', 'Platillo', 18.00, 1, '15'),
('IN90060430', 'Mocha', 'Platillo', 11.00, 1, '15'),
('IN90562067', 'Flor de naranja', 'Platillo', 24.00, 1, '15'),
('IN93347807', 'Caramelo', 'Platillo', 24.00, 1, '15'),
('IN93539227', 'M&M\'s', 'Platillo', 13.00, 1, '15'),
('IN97359153', 'Cebolla', 'Platillo', 13.00, 1, '15'),
('IN98136923', 'Mermelada de zarzamora', 'Platillo', 23.00, 0, '15'),
('IN99852788', 'Vainilla', 'Platillo', 12.00, 1, '15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensaje`
--

DROP TABLE IF EXISTS `mensaje`;
CREATE TABLE `mensaje` (
  `ID_Mensaje` varchar(20) NOT NULL,
  `Titulo` varchar(100) NOT NULL,
  `Texto` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `mensaje`
--

INSERT INTO `mensaje` (`ID_Mensaje`, `Titulo`, `Texto`) VALUES
('MS02241713', 'Mensaje de cumpleaños', '¡Feliz cumpleaños recoge tu crepa gratis!'),
('MS23917091', 'Promo 2x1', '¡Recoge tu crepa 2x1!'),
('MS86646393', 'Promo de fines de semana', '¡hoy tienes 30% de descuento!');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensaje_notifica_cliente`
--

DROP TABLE IF EXISTS `mensaje_notifica_cliente`;
CREATE TABLE `mensaje_notifica_cliente` (
  `Numero_Telefonico` varchar(20) NOT NULL,
  `ID_Mensaje` varchar(20) NOT NULL,
  `Fecha_Envio` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `mensaje_notifica_cliente`
--

INSERT INTO `mensaje_notifica_cliente` (`Numero_Telefonico`, `ID_Mensaje`, `Fecha_Envio`) VALUES
('55-1156-9800', 'MS23917091', '2025-06-09 06:00:00'),
('55-1579-6753', 'MS02241713', '2025-03-17 06:00:00'),
('55-1827-6651', 'MS86646393', '2026-07-18 06:00:00'),
('55-2669-1307', 'MS02241713', '2026-06-13 06:00:00'),
('55-2884-7043', 'MS02241713', '2025-04-03 06:00:00'),
('55-3225-9858', 'MS23917091', '2025-05-21 06:00:00'),
('55-3672-3148', 'MS23917091', '2026-11-26 06:00:00'),
('55-3885-6878', 'MS02241713', '2025-09-08 06:00:00'),
('55-4203-5221', 'MS86646393', '2026-12-28 06:00:00'),
('55-4606-3624', 'MS23917091', '2026-06-18 06:00:00'),
('55-6788-4484', 'MS86646393', '2025-10-27 06:00:00'),
('55-7634-3304', 'MS02241713', '2025-09-08 06:00:00'),
('55-8634-4784', 'MS23917091', '2025-05-22 06:00:00'),
('55-8962-5930', 'MS02241713', '2026-06-26 06:00:00'),
('55-9026-7777', 'MS02241713', '2025-10-14 06:00:00'),
('55-9297-8935', 'MS23917091', '2026-01-28 06:00:00'),
('55-9956-8802', 'MS02241713', '2026-05-09 06:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden`
--

DROP TABLE IF EXISTS `orden`;
CREATE TABLE `orden` (
  `ID_Orden` varchar(10) NOT NULL,
  `ID_Turno` varchar(20) NOT NULL,
  `Numero_Telefonico` varchar(20) DEFAULT NULL,
  `Tipo_Orden` enum('Sucursal','Pick-up','Delivery') NOT NULL,
  `Nombre_cliente` varchar(50) DEFAULT NULL,
  `Estado_Orden` enum('Pendiente','Preparando','Listo','Entregado','Cancelado') DEFAULT 'Pendiente',
  `Fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `orden`
--

INSERT INTO `orden` (`ID_Orden`, `ID_Turno`, `Numero_Telefonico`, `Tipo_Orden`, `Nombre_cliente`, `Estado_Orden`, `Fecha`) VALUES
('OD03274399', 'TN26496107', '55-8842-2908', 'Sucursal', 'Ana Sofía Moreno Hernández', 'Entregado', '2026-03-07 06:00:00'),
('OD03911196', 'TN46937585', '55-7877-5755', 'Sucursal', 'Yamine Dávila Bejos', 'Preparando', '2026-08-24 06:00:00'),
('OD04094069', 'TN47025996', '55-7564-5136', 'Pick-up', 'Diego Alberto Pasaye González', 'Entregado', '2026-11-16 06:00:00'),
('OD06185513', 'TN26496107', '55-9956-8802', 'Delivery', 'Rodrigo Alejandro Hurtado Cortés', 'Preparando', '2026-10-23 06:00:00'),
('OD06247561', 'TN46937585', '55-3975-4081', 'Sucursal', 'Samantha García Cárdenas', 'Preparando', '2026-07-27 06:00:00'),
('OD07290680', 'TN26496107', '55-8634-4784', 'Sucursal', 'Francisco Rafael Arreola Corona', 'Preparando', '2026-04-07 06:00:00'),
('OD13125507', 'TN46937585', '55-9188-6863', 'Delivery', 'Iker Arnoldo Grajeda Campaña', 'Entregado', '2026-11-11 06:00:00'),
('OD13593992', 'TN47025996', '55-5824-6563', 'Sucursal', 'Suri Reyes Vega', 'Preparando', '2026-07-24 06:00:00'),
('OD15848927', 'TN47025996', '55-2435-6781', 'Pick-up', 'Brenda Vázquez Rodríguez', 'Listo', '2026-11-16 06:00:00'),
('OD16211107', 'TN26496107', '55-8962-5930', 'Pick-up', 'Juan Pablo Juárez Ortiz', 'Preparando', '2026-12-11 06:00:00'),
('OD16481371', 'TN47025996', '55-9783-5924', 'Pick-up', 'Ricardo Antonio Gutiérrez García', 'Listo', '2026-11-01 06:00:00'),
('OD17661841', 'TN46937585', '55-4217-5522', 'Sucursal', 'Ilian Judith Castillo Beristain', 'Listo', '2026-03-02 06:00:00'),
('OD19367239', 'TN26496107', '55-7634-3304', 'Sucursal', 'Carlos Delgado Contreras', 'Entregado', '2026-07-11 06:00:00'),
('OD20045010', 'TN26496107', '55-3885-6878', 'Sucursal', 'Mariana Frías Olguín', 'Entregado', '2026-09-15 06:00:00'),
('OD23043487', 'TN26496107', '55-9297-8935', 'Pick-up', 'Juan Pablo Domínguez Ángel', 'Listo', '2026-01-27 06:00:00'),
('OD33014213', 'TN47025996', '55-8034-2908', 'Pick-up', 'Sofía Alondra Reyes Gómez', 'Listo', '2026-10-15 06:00:00'),
('OD33655470', 'TN46937585', '55-7110-9468', 'Pick-up', 'Santiago Barjau Hernández', 'Entregado', '2026-02-17 06:00:00'),
('OD33804496', 'TN46937585', '55-9583-1422', 'Pick-up', 'Galia Lucía Castro Aboytes', 'Preparando', '2026-12-17 06:00:00'),
('OD33951115', 'TN47025996', '55-2006-6063', 'Sucursal', 'Isabela Ruiz Velasco Angeles', 'Listo', '2026-09-21 06:00:00'),
('OD34843825', 'TN46937585', '55-8069-3709', 'Pick-up', 'Jesús Osvaldo Ramos Pérez', 'Listo', '2026-07-04 06:00:00'),
('OD37616868', 'TN46937585', '55-6624-7720', 'Delivery', 'Mariangel Aguirre Magallanes', 'Entregado', '2026-12-22 06:00:00'),
('OD37925699', 'TN26496107', '55-4606-3624', 'Sucursal', 'Héctor Alejandro Barrón Tamayo', 'Entregado', '2026-05-22 06:00:00'),
('OD38730521', 'TN26496107', '55-4203-5221', 'Delivery', 'Ricardo Cortés Espinosa', 'Entregado', '2026-09-25 06:00:00'),
('OD45723683', 'TN47025996', '55-5018-5507', 'Sucursal', 'Armando Montealegre Villagrán', 'Listo', '2026-12-02 06:00:00'),
('OD48634931', 'TN26496107', '55-3672-3148', 'Delivery', 'Alejandro Contreras Magallanes', 'Preparando', '2026-06-18 06:00:00'),
('OD51835069', 'TN46937585', '55-8616-1973', 'Pick-up', 'Alberto Barba Arroyo', 'Preparando', '2026-10-25 06:00:00'),
('OD52937565', 'TN26496107', '55-2884-7043', 'Sucursal', 'Eduardo Hernández Alonso', 'Listo', '2026-11-15 06:00:00'),
('OD54215310', 'TN47025996', '55-8361-8067', 'Delivery', 'Katya Jiménez Antonio', 'Listo', '2026-01-07 06:00:00'),
('OD54491099', 'TN26496107', '55-6788-4484', 'Sucursal', 'Víctor Hugo Esquivel Feregrino', 'Preparando', '2026-05-22 06:00:00'),
('OD55639966', 'TN47025996', '55-7731-4202', 'Delivery', 'Renata Martínez Ozumbilla', 'Entregado', '2026-07-08 06:00:00'),
('OD58196492', 'TN47025996', '55-3938-1454', 'Pick-up', 'Hannah Carolina Hernández Reyes', 'Preparando', '2026-08-15 06:00:00'),
('OD59250531', 'TN47025996', '55-3647-8536', 'Pick-up', 'Dana Izel Martínez García', 'Preparando', '2026-05-13 06:00:00'),
('OD62481224', 'TN26496107', '55-1156-9800', 'Pick-up', 'Andrea Iliana Cantú Mayorga', 'Preparando', '2026-08-06 06:00:00'),
('OD62573621', 'TN47025996', '55-7869-6124', 'Sucursal', 'Emiliano Murillo Ruiz', 'Preparando', '2026-06-10 06:00:00'),
('OD66638248', 'TN46937585', '55-8913-8427', 'Sucursal', 'Fernanda Curiel Perez', 'Listo', '2026-08-26 06:00:00'),
('OD68164439', 'TN26496107', '55-6026-1598', 'Pick-up', 'Maria Fernanda Padme Lakshmi Martínez Jara', 'Preparando', '2026-06-08 06:00:00'),
('OD68369798', 'TN26496107', '55-3225-9858', 'Delivery', 'Alexis Yaocalli Berthou Haas', 'Listo', '2026-08-19 06:00:00'),
('OD68555825', 'TN47025996', '55-7260-4596', 'Delivery', 'Fernanda Rosales Herrera', 'Entregado', '2026-07-21 06:00:00'),
('OD69891418', 'TN46937585', '55-8317-4862', 'Pick-up', 'Oscar Alexander Vilchis Soto', 'Preparando', '2026-02-18 06:00:00'),
('OD70011240', 'TN47025996', '55-9661-9093', 'Delivery', 'Diego Serrano Pardo', 'Listo', '2026-01-27 06:00:00'),
('OD73450134', 'TN46937585', '55-7095-1397', 'Delivery', 'Gabriela Frías Quiroz', 'Listo', '2026-05-16 06:00:00'),
('OD81178473', 'TN46937585', '55-7378-3019', 'Delivery', 'Jonathan de Jesús Anaya Correa', 'Listo', '2026-06-23 06:00:00'),
('OD81537460', 'TN26496107', '55-2669-1307', 'Pick-up', 'Ana Camila Cuevas González', 'Listo', '2026-04-06 06:00:00'),
('OD82644084', 'TN26496107', '55-1579-6753', 'Pick-up', 'Eduardo Daniel Juárez Pineda', 'Entregado', '2026-07-26 06:00:00'),
('OD94187424', 'TN26496107', '55-1827-6651', 'Sucursal', 'David Antonio Gandara Ruiz', 'Entregado', '2026-05-17 06:00:00'),
('OD96155417', 'TN46937585', '55-3251-9266', 'Pick-up', 'Ximena Guadalupe Córdoba Ángeles', 'Entregado', '2026-05-21 06:00:00'),
('OD96250697', 'TN26496107', '55-9221-5175', 'Pick-up', 'Ana Valeria Machuca Miranda', 'Listo', '2026-02-19 06:00:00'),
('OD96747780', 'TN26496107', '55-9026-7777', 'Sucursal', 'Sebastián Mansilla Cots', 'Listo', '2026-04-22 06:00:00'),
('OD97056014', 'TN46937585', '55-9862-4951', 'Delivery', 'Ramón Eliezer De Santos García', 'Entregado', '2026-12-27 06:00:00'),
('OD97294540', 'TN47025996', '55-4768-9613', 'Sucursal', 'Jessica Hernández Tejeda', 'Entregado', '2026-07-21 06:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_tiene_producto`
--

DROP TABLE IF EXISTS `orden_tiene_producto`;
CREATE TABLE `orden_tiene_producto` (
  `ID_Orden` varchar(10) NOT NULL,
  `ID_Producto` varchar(10) NOT NULL,
  `Cantidad` int(11) NOT NULL,
  `Precio_Venta` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `orden_tiene_producto`
--

INSERT INTO `orden_tiene_producto` (`ID_Orden`, `ID_Producto`, `Cantidad`, `Precio_Venta`) VALUES
('OD03274399', 'PD77475653', 2, 310.00),
('OD03911196', 'PD47763167', 2, 320.00),
('OD06185513', 'PD62833458', 2, 310.00),
('OD06247561', 'PD27175068', 5, 800.00),
('OD07290680', 'PD30894780', 3, 480.00),
('OD13125507', 'PD79889565', 3, 480.00),
('OD15848927', 'PD99905805', 2, 60.00),
('OD16211107', 'PD18516039', 5, 750.00),
('OD16481371', 'PD39713286', 5, 850.00),
('OD17661841', 'PD01400719', 3, 465.00),
('OD20045010', 'PD71724278', 4, 600.00),
('OD23043487', 'PD48628594', 1, 145.00),
('OD33014213', 'PD44220776', 5, 400.00),
('OD33655470', 'PD21109349', 5, 775.00),
('OD33804496', 'PD68133903', 5, 775.00),
('OD33951115', 'PD72174317', 1, 60.00),
('OD34843825', 'PD81370959', 2, 310.00),
('OD37616868', 'PD23031389', 1, 109.00),
('OD37925699', 'PD35805212', 3, 480.00),
('OD38730521', 'PD85252812', 2, 320.00),
('OD45723683', 'PD28020090', 5, 375.00),
('OD48634931', 'PD62321669', 5, 800.00),
('OD51835069', 'PD88828639', 1, 145.00),
('OD52937565', 'PD60339348', 3, 465.00),
('OD54215310', 'PD43258149', 4, 260.00),
('OD54491099', 'PD57856718', 1, 155.00),
('OD55639966', 'PD62596246', 2, 150.00),
('OD58196492', 'PD01993843', 1, 40.00),
('OD59250531', 'PD84176755', 5, 375.00),
('OD62573621', 'PD30843175', 2, 160.00),
('OD66638248', 'PD58041511', 4, 620.00),
('OD68164439', 'PD84630803', 1, 155.00),
('OD68369798', 'PD60185744', 3, 420.00),
('OD68555825', 'PD96745922', 1, 60.00),
('OD69891418', 'PD68599017', 5, 775.00),
('OD70011240', 'PD10782835', 3, 135.00),
('OD73450134', 'PD13048411', 1, 155.00),
('OD81178473', 'PD45693038', 1, 135.00),
('OD81537460', 'PD86903926', 5, 800.00),
('OD82644084', 'PD02624644', 4, 620.00),
('OD94187424', 'PD00387421', 4, 620.00),
('OD96155417', 'PD01887055', 5, 775.00),
('OD96250697', 'PD03687244', 5, 700.00),
('OD96747780', 'PD88871658', 2, 218.00),
('OD97056014', 'PD72945147', 1, 155.00),
('OD97294540', 'PD69673358', 1, 50.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pago`
--

DROP TABLE IF EXISTS `pago`;
CREATE TABLE `pago` (
  `ID_Pago` varchar(10) NOT NULL,
  `ID_Orden` varchar(10) NOT NULL,
  `Monto` decimal(10,2) NOT NULL,
  `Metodo_Pago` enum('Efectivo','Tarjeta','Transferencia','Puntos_Royalty') NOT NULL,
  `Fecha_Pago` timestamp NOT NULL DEFAULT current_timestamp(),
  `ID_Transacción` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `pago`
--

INSERT INTO `pago` (`ID_Pago`, `ID_Orden`, `Monto`, `Metodo_Pago`, `Fecha_Pago`, `ID_Transacción`) VALUES
('PY05991243', 'OD33951115', 185.00, 'Tarjeta', '2026-10-07 06:00:00', 'IT63217108'),
('PY06812386', 'OD16211107', 50.00, 'Tarjeta', '2026-12-10 06:00:00', 'IT41138333'),
('PY08713203', 'OD13125507', 95.00, 'Tarjeta', '2026-12-26 06:00:00', 'IT74289174'),
('PY10507736', 'OD54215310', 185.00, 'Tarjeta', '2026-02-10 06:00:00', 'IT12281705'),
('PY10864243', 'OD03274399', 67.00, 'Tarjeta', '2026-01-11 06:00:00', 'IT59649793'),
('PY10913087', 'OD33655470', 92.00, 'Tarjeta', '2026-01-02 06:00:00', 'IT28407344'),
('PY13497513', 'OD17661841', 97.00, 'Tarjeta', '2026-09-28 06:00:00', 'IT05197811'),
('PY13902928', 'OD45723683', 92.00, 'Tarjeta', '2026-09-13 06:00:00', 'IT15103157'),
('PY15277065', 'OD97056014', 195.00, 'Efectivo', '2026-03-12 06:00:00', 'IT04168569'),
('PY20036131', 'OD13593992', 50.00, 'Tarjeta', '2026-08-02 06:00:00', 'IT90116511'),
('PY20227263', 'OD06185513', 75.00, 'Tarjeta', '2026-09-18 06:00:00', 'IT43918149'),
('PY20778991', 'OD96747780', 88.00, 'Tarjeta', '2026-07-24 06:00:00', 'IT18590248'),
('PY22983393', 'OD68164439', 82.00, 'Tarjeta', '2026-11-26 06:00:00', 'IT42650753'),
('PY23477899', 'OD19367239', 42.00, 'Tarjeta', '2026-02-01 06:00:00', 'IT84041928'),
('PY25844302', 'OD07290680', 98.00, 'Tarjeta', '2026-02-09 06:00:00', 'IT27169474'),
('PY26336930', 'OD04094069', 62.00, 'Tarjeta', '2026-09-10 06:00:00', 'IT98818003'),
('PY27172961', 'OD68369798', 60.50, 'Tarjeta', '2026-07-25 06:00:00', 'IT90397367'),
('PY32408933', 'OD70011240', 92.00, 'Efectivo', '2026-12-06 06:00:00', 'IT55410928'),
('PY34841310', 'OD94187424', 85.00, 'Efectivo', '2026-05-07 06:00:00', 'IT84083825'),
('PY35476141', 'OD23043487', 70.00, 'Tarjeta', '2026-01-17 06:00:00', 'IT65669926'),
('PY39662919', 'OD73450134', 79.00, 'Efectivo', '2026-07-26 06:00:00', 'IT00523711'),
('PY43000837', 'OD15848927', 63.00, 'Efectivo', '2026-10-02 06:00:00', 'IT96980914'),
('PY59283669', 'OD82644084', 86.00, 'Efectivo', '2026-06-10 06:00:00', 'IT70535852'),
('PY61267087', 'OD06247561', 85.00, 'Tarjeta', '2026-08-27 06:00:00', 'IT04787016'),
('PY64162948', 'OD34843825', 59.00, 'Tarjeta', '2026-04-13 06:00:00', 'IT64789630'),
('PY64855250', 'OD69891418', 51.00, 'Efectivo', '2026-10-27 06:00:00', 'IT77090439'),
('PY65160659', 'OD51835069', 71.00, 'Tarjeta', '2026-01-14 06:00:00', 'IT01454650'),
('PY69780717', 'OD37616868', 82.00, 'Tarjeta', '2026-11-21 06:00:00', 'IT99522841'),
('PY69952889', 'OD38730521', 94.00, 'Tarjeta', '2026-12-17 06:00:00', 'IT50001987'),
('PY70611611', 'OD96155417', 99.00, 'Tarjeta', '2026-11-06 06:00:00', 'IT48825902'),
('PY71063700', 'OD33014213', 136.00, 'Tarjeta', '2026-03-11 06:00:00', 'IT65444443'),
('PY72279738', 'OD62573621', 190.00, 'Tarjeta', '2026-01-21 06:00:00', 'IT51343866'),
('PY72563594', 'OD16481371', 95.00, 'Tarjeta', '2026-10-13 06:00:00', 'IT36110392'),
('PY74081119', 'OD59250531', 192.00, 'Tarjeta', '2026-06-03 06:00:00', 'IT97060316'),
('PY75028785', 'OD96250697', 94.00, 'Tarjeta', '2026-04-16 06:00:00', 'IT61334209'),
('PY75053969', 'OD58196492', 95.00, 'Tarjeta', '2026-10-10 06:00:00', 'IT57438366'),
('PY75555646', 'OD20045010', 105.00, 'Efectivo', '2026-03-12 06:00:00', 'IT74263935'),
('PY75849805', 'OD81537460', 120.00, 'Efectivo', '2026-09-27 06:00:00', 'IT56196926'),
('PY79407811', 'OD62481224', 53.00, 'Tarjeta', '2026-02-06 06:00:00', 'IT87186268'),
('PY79664537', 'OD68555825', 149.00, 'Efectivo', '2026-10-28 06:00:00', 'IT74412335'),
('PY82441350', 'OD03911196', 160.00, 'Tarjeta', '2026-09-27 06:00:00', 'IT23261701'),
('PY83161224', 'OD97294540', 69.00, 'Tarjeta', '2026-05-26 06:00:00', 'IT61714056'),
('PY84226319', 'OD33804496', 89.00, 'Tarjeta', '2026-06-20 06:00:00', 'IT67913274'),
('PY86043606', 'OD66638248', 92.00, 'Tarjeta', '2026-11-06 06:00:00', 'IT07338011'),
('PY86273334', 'OD52937565', 96.00, 'Tarjeta', '2026-03-24 06:00:00', 'IT40379694'),
('PY87254274', 'OD54491099', 206.90, 'Efectivo', '2026-03-04 06:00:00', 'IT09369026'),
('PY87620370', 'OD81178473', 73.00, 'Tarjeta', '2026-06-16 06:00:00', 'IT11411076'),
('PY90975414', 'OD48634931', 88.00, 'Tarjeta', '2026-01-26 06:00:00', 'IT40243643'),
('PY98734169', 'OD55639966', 82.00, 'Tarjeta', '2026-10-05 06:00:00', 'IT30760986'),
('PY99910673', 'OD37925699', 85.00, 'Tarjeta', '2026-08-21 06:00:00', 'IT76542905');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `privilegio`
--

DROP TABLE IF EXISTS `privilegio`;
CREATE TABLE `privilegio` (
  `Privilegio` varchar(30) NOT NULL,
  `Transferible` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `privilegio`
--

INSERT INTO `privilegio` (`Privilegio`, `Transferible`) VALUES
('Agrega status royalty', 1),
('Agregar ingrediente', 1),
('Califica servicio', 1),
('Cancela pedido activo', 0),
('Confirma de pedido', 0),
('Consulta catalogo de eventos', 1),
('Consulta catalogo de ingredien', 1),
('Consulta catalogo de productos', 1),
('Consulta catalogo de promocion', 1),
('Consulta historial de pedidos ', 0),
('Consulta sección de empleados', 1),
('Crea status royalty', 1),
('Da de alta empleados', 0),
('Da de baja empleados', 0),
('Elimina evento', 1),
('Elimina eventos', 1),
('Elimina platillo', 1),
('Elimina promocion', 1),
('Elimina promociones', 1),
('Elimina status royalty', 1),
('Eliminar ingrediente', 0),
('Eliminar ingrediente de platil', 1),
('Modifica días hábiles', 1),
('Modifica evento', 0),
('Modifica eventos', 1),
('Modifica ingrediente de platil', 0),
('Modifica platillo existente', 0),
('Modifica promocion', 1),
('Modifica promociones', 0),
('Modifica roles y privilegios d', 0),
('Modifica royalty', 1),
('Modifica status royalty', 1),
('Modificar menu (tentativo)', 1),
('Privilegio', 1),
('Reclama premio royalty', 1),
('Regista inicio de sesión', 1),
('Registra creación de cuenta', 1),
('Registra días hábiles', 1),
('Registra evento', 0),
('Registra ingrediente agotado', 0),
('Registra ingrediente nuevo', 1),
('Registra nuevo mensaje a usuar', 0),
('Registra platillo agotado', 0),
('Registra platillo especial', 0),
('Registra platillo nuevo', 1),
('Registra promoción', 1),
('Registra promociones', 0),
('Registra visita del cliente', 1),
('Registrar creación de crepa', 1),
('Registrar ingrediente nuevo', 1),
('Registrar orden ', 1),
('Selecciona lugar de consumo', 1),
('Visualiza días hábiles', 1),
('Visualiza el nivel de lealtad ', 0),
('Visualiza feedback de clientes', 1),
('Visualiza historial de comenta', 1),
('Visualiza información royalty', 1),
('Visualiza la cantidad de visit', 1),
('Visualiza menu', 1),
('Visualiza métricas', 1),
('Visualiza promociones', 0),
('Visualiza resumen de pedido', 1),
('Visualiza su nivel de lealtad', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

DROP TABLE IF EXISTS `producto`;
CREATE TABLE `producto` (
  `ID_Producto` varchar(10) NOT NULL,
  `Tamaño` varchar(50) NOT NULL,
  `Categoría` varchar(50) NOT NULL,
  `Nombre` varchar(100) NOT NULL,
  `Precio` decimal(10,2) NOT NULL,
  `Disponible` tinyint(1) DEFAULT 1,
  `Tipo` varchar(50) NOT NULL,
  `Imagen` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`ID_Producto`, `Tamaño`, `Categoría`, `Nombre`, `Precio`, `Disponible`, `Tipo`, `Imagen`) VALUES
('PD00387421', 'Chico', 'Platillo', 'Oreo', 155.00, 1, 'Artesanal', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQdyxtqipw0WM6la2yQR9S8zAPHpytii7cIw&s'),
('PD01400719', 'Chico', 'Platillo', 'Cookies N\' Cream', 155.00, 1, 'Artesanal', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDPLJEYcnQ4U-l-lfscAIBi1troxfm3uEEmA&s'),
('PD01887055', 'Chico', 'Platillo', '4 Quesos', 155.00, 1, 'Salado', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbEZwXDbBsJy80jBGwxHhB04UgEuJ2Z95zmg&s'),
('PD01993843', 'Chico', 'Bebidas', 'Espresso con soya', 25.00, 0, 'Caliente', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxxdoFNAcppkd8DKoyJ9X1ppnP5pIlScEHJA&s'),
('PD02624644', 'Chico', 'Platillo', 'M&M´s', 155.00, 1, 'Artesanal', 'https://www.cocinadelirante.com/800x600/filters:format(webp):quality(75)/sites/default/files/images/2025/04/receta-de-crepas-con-queso-y-platano.jpg'),
('PD03687244', 'Chico', 'Platillo', 'Mazapán', 140.00, 0, 'Artesanal', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNmO4dfIq0PDJ7w8b4llpPzSmRef3nZKn15g&s'),
('PD09374303', 'Chico', 'Bebidas', 'Iced Latte', 85.00, 0, 'Frío', 'https://myeverydaytable.com/iced-latte/'),
('PD10782835', 'Chico', 'Bebidas', 'Refresco', 45.00, 1, 'Otros', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQocj0qc80fSGx0_CzOd5nU3AfC4eDh8NuXCw&s'),
('PD12662761', 'Chico', 'Bebidas', 'Jamaica con arándanos, lima y madreselva', 70.00, 1, 'Caliente', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_5wgNA6S_FGDGyR3WYZwiY5O23QrHfU9Lrg&s'),
('PD12929845', 'Chico', 'Bebidas', 'Mocha', 99.00, 1, 'Frío', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdeikbrU4NecryZO5GX72Ps13tZM2rns4Z2Q&s'),
('PD13048411', 'Chico', 'Platillo', 'La Champi', 155.00, 1, 'Salado', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpF5f5ZsW28SGIE8Igp1zibfeHx6ax2EHtag&s'),
('PD14332305', 'Chico', 'Bebidas', 'Matcha', 99.00, 1, 'Frío', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQywjNVWD6kkk6bBLkEhDKyKbmXkVRQ_pfknA&s'),
('PD16012525', 'Chico', 'Bebidas', 'Frapuccino', 99.00, 1, 'Frío', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjgDUxsc0OW5htUWs0YXGcJ0szHOrTtoTx_w&s'),
('PD18516039', 'Chico', 'Platillo', 'Coco Almond', 150.00, 1, 'Artesanal', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHATP_XWITucUtg6r4y4IYcxCrCVDpmEY0Sg&s'),
('PD18785978', 'Chico', 'Platillo', 'Dos ingredientes', 105.00, 1, 'Otros', 'https://www.directoalpaladar.com.mx/postres/como-hacer-masa-para-crepas-muy-ligeras-finitas-jugosas-ideal-para-hacer-crepas-dulces-saladas'),
('PD19634039', 'Chico', 'Bebidas', 'Matchai', 99.00, 1, 'Frío', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2XabaGar5zJxmaTKTPZHhB5kuJhrUxWTZlA&s'),
('PD20020753', 'Chico', 'Bebidas', 'Chai', 99.00, 1, 'Frío', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYbghvQZMQZiZwQyq4mahtzAnQcv0u-qaxgQ&s'),
('PD21109349', 'Chico', 'Platillo', 'Magnum', 155.00, 1, 'Artesanal', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4pAf7n3wHyF1F1DhJN9WZaGxr5ripsFZUXA&s'),
('PD22069675', 'Chico', 'Bebidas', 'Chocolate', 99.00, 1, 'Frío', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxqzWVbW43H-jfkxBGNHU8MGa1sN-Xbe3adg&s'),
('PD23031389', 'Chico', 'Platillo', 'La Dolce Phila', 109.00, 1, 'Artesanal', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSm7jFEBlC1JoRUIQwaZ4KAX4BhDuznYB6e-A&s'),
('PD27175068', 'Chico', 'Platillo', 'Rajas', 160.00, 1, 'Salado', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRX6B4tiaR3T6Ca3hGLra6B-yKPw0MsDb13ZQ&s'),
('PD27496576', 'Chico', 'Bebidas', 'Chamoyada Mango', 90.00, 1, 'Frío', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdmUFNnfEze_LjNdXoyBHTK_LfxCiCBpLxIg&s'),
('PD28020090', 'Chico', 'Bebidas', 'Flat Whiite', 75.00, 1, 'Caliente', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTod1nJcAwKG6BWdSpGAGmccz_Izh8D1S7Agw&s'),
('PD28985193', 'Chico', 'Bebidas', 'Carlos V', 99.00, 1, 'Frío', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFlI7CKVM0EqyWJxfTJn9wG0CQNXOFLkqGFw&s'),
('PD30843175', 'Chico', 'Bebidas', 'Chai Latte', 80.00, 1, 'Caliente', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDXlnqFGW57ScvZmnMq9d5AVe7f3qfw49KAg&s'),
('PD30894780', 'Chico', 'Platillo', 'White Pistachio', 160.00, 0, 'Artesanal', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-oOvHgSqNhQ90eLgrNy9ysZRzKaBFBDkyZw&s'),
('PD33834469', 'Chico', 'Bebidas', 'Oreo', 99.00, 1, 'Frío', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTX6mqLk65Z1VzgUa-Jp8ERgSaLdm03wQx1XQ&s'),
('PD34384229', 'Básico', 'Platillo', 'La crepa de crepas', 25.00, 1, 'Dulce', 'https://images.aws.nestle.recipes/resized/81bcf4cb38911cde6aa17357200368ba_pastel_de_crepas_de_chocolate_1200_628.jpg'),
('PD35805212', 'Chico', 'Platillo', 'Rol de Canela', 160.00, 0, 'Artesanal', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEr7uwCOR_RA9vz4wLYe_-l_Phk6_zCPff3A&s'),
('PD36110746', 'Básico', 'Platillo', 'Crepa de Pollo', 122.00, 1, 'Dulce', 'URL'),
('PD39713286', 'Chico', 'Platillo', 'Rosendo Nieblas', 170.00, 1, 'Salado', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvwpdUSumcZbObzis337Og907iWv7AeGalaQ&s'),
('PD41659387', 'Básico', 'Platillo', 'Crepa Sebas ', 300.00, 1, 'Dulce', 'https://blog.renaware.com/wp-content/uploads/2023/03/Crepas-con-frutos-rojos-1111477-scaled.jpg'),
('PD41719989', 'Básico', 'Platillo', 'Crepa De Platano', 100.00, 1, 'Dulce', 'URL'),
('PD42166765', 'Básico', 'Platillo', 'Smoothie Bowl Fresa', 122.00, 1, 'Dulce', 'URL'),
('PD43258149', 'Chico', 'Bebidas', 'Americano', 65.00, 1, 'Caliente', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxra9UmQTaLETHKRBIU29BR-Ae72sJW47L5w&s'),
('PD44220776', 'Chico', 'Bebidas', 'Mocha Latte', 80.00, 1, 'Caliente', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOy3668eBzYkJxeU7ltAs36hL7Xpj1jJedHA&s'),
('PD45693038', 'Chico', 'Platillo', 'Honey Honey', 135.00, 1, 'Artesanal', 'https://buenprovecho.hn/wp-content/uploads/2019/01/Crepas-de-fresa-1.jpg'),
('PD46783344', 'Chico', 'Bebidas', 'Mazapán', 95.00, 1, 'Frío', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnawgStunMhXfQQEmJ2SASocJm6e97QGGHlw&s'),
('PD47763167', 'Chico', 'Platillo', 'Maree Crepe', 160.00, 1, 'Salado', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_aO99Ddg3gA4Fr-dU5xZOwVOY9TOyx6L32w&s'),
('PD48593340', 'Chico', 'Platillo', 'Un ingrediente', 99.00, 1, 'Otros', 'https://www.cocinafacil.com.mx/recetas/crepas-con-frutas'),
('PD48628594', 'Chico', 'Platillo', 'Cinn-Almond Crepe', 145.00, 0, 'Artesanal', 'https://www.instagram.com/p/DOfBkVpjdBa/'),
('PD52816612', 'Chico', 'Bebidas', 'Nutella', 99.00, 1, 'Frío', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNwSeeZA_CqEouT5EN5W3bxIqrjCcRSsIx5Q&s'),
('PD52877596', 'Chico', 'Bebidas', 'Manzanilla con moras zules y albahaca', 70.00, 1, 'Caliente', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKHhRYPy6tcNXXSsLGU-cCF7HER2bPz4F0ig&s'),
('PD53218892', 'Chico', 'Bebidas', 'Dirty Chai Frappe', 109.00, 1, 'Frío', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoD2HGHi85Q8KG6CXwq_Up07nmoubrSA_e0g&s'),
('PD57856718', 'Chico', 'Platillo', 'Kinder Delice', 155.00, 0, 'Artesanal', 'https://revistamolcajete.com/wp-content/uploads/2019/03/IMG_9765-1.jpg'),
('PD58041511', 'Chico', 'Platillo', 'La Española', 155.00, 1, 'Salado', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkRuiFsXGBC9TZSeWDbTVjhMd-HVO85sBKow&s'),
('PD60185744', 'Chico', 'Platillo', 'Golden Bites', 140.00, 0, 'Artesanal', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRIpnMo4Rp39xPMWa1FLlXR11q6tHW7eWAjA&s'),
('PD60339348', 'Chico', 'Platillo', 'Kit Kat', 155.00, 1, 'Artesanal', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8Ji1HTWSQ4gmhIVCRgliuvE0NGcKAWdhing&s'),
('PD62154365', 'Chico', 'Bebidas', 'Iced Dirty Matcha', 105.00, 1, 'Frío', 'https://http2.mlstatic.com/D_NQ_NP_602534-MLM80622035266_112024-O.webp'),
('PD62321669', 'Chico', 'Platillo', 'Berry Lotus', 160.00, 0, 'Artesanal', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGlIK60yqu2i866dM9orvLUPwylIiCNv16xA&s'),
('PD62596246', 'Chico', 'Bebidas', 'Latte', 75.00, 1, 'Caliente', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrc2tPztEd3gDD0g_tw2hoFgQzY6oclHt3FQ&s'),
('PD62833458', 'Chico', 'Platillo', 'Snickers', 155.00, 1, 'Artesanal', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBgZ36J1BV_bl2NH4--AgCenT2hGylAviiJw&s'),
('PD63821765', 'Chico', 'Bebidas', 'Oreo', 99.00, 1, 'Frío', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnIqURpZHzlti1iF4xe2If7Am3HxJ8vQKwMw&s'),
('PD66334927', 'Chico', 'Bebidas', 'Vainilla', 99.00, 1, 'Frío', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRA3re4lXRJr_f8wr3HTkuXOi2NUbEnSFg2nA&s'),
('PD66451976', 'Chico', 'Bebidas', 'Motchai Frío', 89.00, 1, 'Frío', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQlE1qLRDats1qjW5dBXtkKcYd2tZh4ihRYA&s'),
('PD68133903', 'Chico', 'Platillo', 'La Pizzeria', 155.00, 1, 'Salado', 'https://sabrosano.com/wp-content/uploads/2020/05/Crepas_jamon_queso_principal.jpg'),
('PD68599017', 'Chico', 'Platillo', 'Manzane', 155.00, 1, 'Artesanal', 'https://lomaculinaria.com/wp-content/uploads/2023/03/Crepas-Loma-Culinaria-1200x800-1.jpg'),
('PD68787354', 'Chico', 'Bebidas', 'Chai Frío', 89.00, 1, 'Frío', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQlE1qLRDats1qjW5dBXtkKcYd2tZh4ihRYA&s'),
('PD69673358', 'Chico', 'Bebidas', 'Macchiato', 50.00, 1, 'Caliente', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGfcxDnQWVvTH1ycIUXZpNtd8TkPf-11oiRw&s'),
('PD71724278', 'Chico', 'Platillo', 'Cinn-Apple', 150.00, 0, 'Artesanal', 'https://www.laylita.com/recetas/wp-content/uploads/2017/04/Receta-de-las-crepas-francesas.jpg'),
('PD72174317', 'Chico', 'Bebidas', 'Té Verde Jazmín', 60.00, 1, 'Caliente', 'https://blogs.unitec.mx/hubfs/Imported_Blog_Media/cosas-que-debes-saber-del-cafe-1-Dec-17-2022-07-16-41-5859-PM.jpg'),
('PD72945147', 'Chico', 'Platillo', 'La Verde', 155.00, 1, 'Salado', 'https://editorialtelevisa.brightspotcdn.com/dims4/default/a5b31ad/2147483647/strip/true/crop/995x560+3+0/resize/1000x563!/quality/90/?url=https%3A%2F%2Fk2-prod-editorial-televisa.s3.us-east-1.amazonaws.com%2Fbrightspot%2Fwp-content%2Fuploads%2F2019%2F01%2Fcrepas-espinacas-consentir-paladar.jpg'),
('PD76693622', 'Chico', 'Bebidas', 'Matcha Frío', 89.00, 1, 'Frío', 'https://http2.mlstatic.com/D_NQ_NP_780150-MLM100986687321_122025-O.webp'),
('PD77126100', 'Chico', 'Bebidas', 'Dirty Matcha Frappe', 109.00, 1, 'Frío', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_Z7vVaeSVKy-lJ2S7VAO4sln1hHher0PdTg&s'),
('PD77411067', 'Básico', 'Platillo', 'Crepa CSS', 100.00, 1, 'Dulce', 'URL'),
('PD77475653', 'Chico', 'Platillo', 'Gansito', 155.00, 0, 'Artesanal', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYx0yyZD3mvwe1_wMSHsKGSH-6sz82D9PdoA&s'),
('PD79889565', 'Chico', 'Platillo', 'Poblana', 160.00, 1, 'Salado', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSs8l_-zvcAVaji7WJXPTliXRbQFDkqhzrzcw&s'),
('PD80503802', 'Chico', 'Bebidas', 'Cajeta', 99.00, 1, 'Frío', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1oayZLDSevinYYDe2FxteeZhq0DbQTCDFZA&s'),
('PD80603665', 'Chico', 'Bebidas', 'Fresa', 99.00, 1, 'Frío', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxqzWVbW43H-jfkxBGNHU8MGa1sN-Xbe3adg&s'),
('PD81370959', 'Chico', 'Platillo', 'Reese\'s', 155.00, 1, 'Artesanal', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSE_dc4i2TENpte8hxjVKtds0kOz2qj7I9oEw&s'),
('PD83401881', 'Chico', 'Bebidas', 'Americano Frío', 75.00, 1, 'Frío', 'https://thumbs.dreamstime.com/b/caf%C3%A9-de-americano-o-fr%C3%ADo-152844660.jpg'),
('PD84176755', 'Chico', 'Bebidas', 'Cappuccino', 75.00, 1, 'Caliente', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHMDzwvg_QgORdgVseVpUqGsqOnWE84bdZZw&ss'),
('PD84630803', 'Chico', 'Platillo', 'Bubulubu', 155.00, 1, 'Artesanal', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQk0i1_C3uCVTS8eZ9yaV4WJRlEWUEXRB1qfQ&s'),
('PD85252812', 'Chico', 'Platillo', 'Lotus de Nuez', 160.00, 0, 'Artesanal', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuNAWoxe4-U8ZuUNT2xmlononuW5dQUSntgg&s'),
('PD86903926', 'Chico', 'Platillo', 'Ferrero Rocher', 160.00, 0, 'Artesanal', 'https://cdn0.recetasgratis.net/es/posts/3/4/4/crepas_de_fresa_con_queso_crema_57443_orig.jpg'),
('PD87643434', 'Chico', 'Bebidas', 'Jamaica con fresa, limón y flor de naranja', 70.00, 1, 'Caliente', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2P-RIJ6PQkzxr_F5b9S65qYv-pvAzgKKwcw&s'),
('PD87820692', 'Básico', 'Platillo', 'Crepa Juarez ', 250.00, 1, 'Dulce', 'https://laespanolameats.com/img/cms/nocilla_1.jpg'),
('PD88828639', 'Chico', 'Platillo', 'Choco Berries', 145.00, 1, 'Artesanal', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRPgmlt1HohAFzJ1E7a5dQqmQTSAvb2LX2ww&s'),
('PD88871658', 'Chico', 'Platillo', 'Tres ingredientes', 109.00, 1, 'Otros', 'https://peopleenespanol.com/recetas/10075-masa-para-crepas-b-sica/'),
('PD88949720', 'Chico', 'Bebidas', 'Manzanilla con zarzamora, frambuesa y jamaica', 70.00, 1, 'Caliente', 'https://tofuu.getjusto.com/orioneat-local/resized2/nFs4qZ6WEoaNw8v8b-300-x.webp'),
('PD91949758', 'Básico', 'Platillo', 'Platillo Prueba de Unidad', 100.00, 1, 'Dulce', 'URL'),
('PD93614794', 'Básico', 'Platillo', 'Smoothie Bowl de Plátano ', 100.00, 1, 'Dulce', 'URL'),
('PD96171348', 'Chico', 'Bebidas', 'Iced Dirty Chai', 105.00, 1, 'Frío', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWkqU1Y47HvI9PdCuD0u_rWyDOM0gUMhqdLQ&s'),
('PD96745922', 'Chico', 'Bebidas', 'Té Verde Clásico', 60.00, 1, 'Caliente', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBy0eJCNbaXWLZYe2DMAF8fsrMXrByb109GA&s'),
('PD97764058', 'Chico', 'Bebidas', 'Chamoyada Jamaica', 90.00, 1, 'Frío', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_MhuGUKsc5AH44EDjIvPXoj_MQvwItHcexw&s'),
('PD99200939', 'Chico', 'Bebidas', 'Mocha Frío', 89.00, 1, 'Frío', 'https://images.sabroson.com.mx/insecure/fit/1000/1000/ce/0/plain/https://sabroson-assests.s3.us-west-2.amazonaws.com/af268c/prods/EhUJ8Es8eLkTBHguQPs7IoZ683xwohKsTDfpBkWX.png@webp'),
('PD99905805', 'Chico', 'Bebidas', 'Agua', 30.00, 1, 'Otros', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIROd_m5TqdXbs60Y_ajK7p9pygWly6Y3zVA&s');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_pertenece_evento`
--

DROP TABLE IF EXISTS `producto_pertenece_evento`;
CREATE TABLE `producto_pertenece_evento` (
  `ID_Evento` varchar(20) NOT NULL,
  `ID_Producto` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `producto_pertenece_evento`
--

INSERT INTO `producto_pertenece_evento` (`ID_Evento`, `ID_Producto`) VALUES
('EV00802058', 'PD03687244'),
('EV03455709', 'PD48593340'),
('EV11967402', 'PD71724278'),
('EV28249203', 'PD62833458'),
('EV36081746', 'PD86903926'),
('EV40845617', 'PD02624644'),
('EV40845617', 'PD43258149'),
('EV40845617', 'PD83401881'),
('EV41575412', 'PD77475653'),
('EV47036119', 'PD85252812'),
('EV47873322', 'PD48628594'),
('EV48230988', 'PD60185744'),
('EV56656726', 'PD88871658'),
('EV63596263', 'PD60339348'),
('EV72477787', 'PD30894780'),
('EV72567097', 'PD00387421'),
('EV78005678', 'PD84630803'),
('EV91369328', 'PD35805212'),
('EV94074382', 'PD57856718'),
('EV98982381', 'PD18516039');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_tiene_insumo`
--

DROP TABLE IF EXISTS `producto_tiene_insumo`;
CREATE TABLE `producto_tiene_insumo` (
  `ID_Producto` varchar(10) NOT NULL,
  `ID_Insumo` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `producto_tiene_insumo`
--

INSERT INTO `producto_tiene_insumo` (`ID_Producto`, `ID_Insumo`) VALUES
('PD00387421', 'IN33700399'),
('PD01400719', 'IN87022030'),
('PD01887055', 'IN04894004'),
('PD01993843', 'IN02201393'),
('PD01993843', 'IN05269621'),
('PD01993843', 'IN07050794'),
('PD01993843', 'IN68810175'),
('PD02624644', 'IN20877882'),
('PD03687244', 'IN76382864'),
('PD09374303', 'IN82503493'),
('PD12662761', 'IN63629622'),
('PD12929845', 'IN07050794'),
('PD13048411', 'IN93539227'),
('PD14332305', 'IN59824502'),
('PD16012525', 'IN03374506'),
('PD18516039', 'IN98136923'),
('PD18785978', 'IN22197307'),
('PD19634039', 'IN13297648'),
('PD20020753', 'IN61916404'),
('PD21109349', 'IN80392027'),
('PD22069675', 'IN84763568'),
('PD23031389', 'IN76712465'),
('PD27175068', 'IN05269621'),
('PD27496576', 'IN53235582'),
('PD28020090', 'IN09927406'),
('PD28985193', 'IN99852788'),
('PD30843175', 'IN53462867'),
('PD30894780', 'IN68797428'),
('PD33834469', 'IN36386148'),
('PD34384229', 'IN04894004'),
('PD34384229', 'IN07050794'),
('PD34384229', 'IN09130588'),
('PD34384229', 'IN22197307'),
('PD34384229', 'IN85641851'),
('PD35805212', 'IN12080526'),
('PD39713286', 'IN21882955'),
('PD41659387', 'IN02201393'),
('PD41659387', 'IN13297648'),
('PD41659387', 'IN13442507'),
('PD41659387', 'IN68263429'),
('PD41719989', 'IN02201393'),
('PD41719989', 'IN04894004'),
('PD41719989', 'IN15500744'),
('PD42166765', 'IN02201393'),
('PD42166765', 'IN07050794'),
('PD42166765', 'IN15500744'),
('PD43258149', 'IN68496031'),
('PD44220776', 'IN85641851'),
('PD45693038', 'IN59087286'),
('PD46783344', 'IN53190866'),
('PD47763167', 'IN38338698'),
('PD48593340', 'IN34568576'),
('PD48628594', 'IN24527442'),
('PD52816612', 'IN90060430'),
('PD52877596', 'IN52715589'),
('PD53218892', 'IN68810175'),
('PD57856718', 'IN58134969'),
('PD58041511', 'IN21585929'),
('PD60185744', 'IN19746459'),
('PD60339348', 'IN56899901'),
('PD62154365', 'IN63793176'),
('PD62321669', 'IN28033998'),
('PD62596246', 'IN70788691'),
('PD62833458', 'IN13442507'),
('PD63821765', 'IN50256666'),
('PD66334927', 'IN02201393'),
('PD66451976', 'IN18968294'),
('PD68133903', 'IN51564559'),
('PD68599017', 'IN74484938'),
('PD68787354', 'IN58759482'),
('PD69673358', 'IN70367614'),
('PD71724278', 'IN09130588'),
('PD72174317', 'IN65885034'),
('PD72945147', 'IN21283895'),
('PD76693622', 'IN51420289'),
('PD77126100', 'IN29033240'),
('PD77411067', 'IN02201393'),
('PD77475653', 'IN80740094'),
('PD79889565', 'IN68263429'),
('PD80503802', 'IN37997343'),
('PD80603665', 'IN51420289'),
('PD81370959', 'IN60313355'),
('PD83401881', 'IN02803814'),
('PD84176755', 'IN82598534'),
('PD84630803', 'IN74201967'),
('PD85252812', 'IN73813019'),
('PD86903926', 'IN07050794'),
('PD87643434', 'IN74817391'),
('PD87820692', 'IN03374506'),
('PD87820692', 'IN20877882'),
('PD87820692', 'IN93539227'),
('PD87820692', 'IN98136923'),
('PD88828639', 'IN36405225'),
('PD88871658', 'IN29165394'),
('PD88949720', 'IN62252551'),
('PD91949758', 'IN93539227'),
('PD91949758', 'IN98136923'),
('PD93614794', 'IN02201393'),
('PD93614794', 'IN07050794'),
('PD93614794', 'IN21585929'),
('PD96171348', 'IN97359153'),
('PD96745922', 'IN25799043'),
('PD97764058', 'IN58688454'),
('PD99200939', 'IN48200057');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_tiene_promocion`
--

DROP TABLE IF EXISTS `producto_tiene_promocion`;
CREATE TABLE `producto_tiene_promocion` (
  `ID_Producto` varchar(20) NOT NULL,
  `ID_Promocion` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `producto_tiene_promocion`
--

INSERT INTO `producto_tiene_promocion` (`ID_Producto`, `ID_Promocion`) VALUES
('PD01400719', 'PR83010754'),
('PD01887055', 'PR44805876'),
('PD01993843', 'PR97994498'),
('PD02624644', 'PR98448306'),
('PD09374303', 'PR76785851'),
('PD10782835', 'PR32616125'),
('PD12929845', 'PR19912809'),
('PD13048411', 'PR78222949'),
('PD14332305', 'PR62258980'),
('PD16012525', 'PR44805876'),
('PD18516039', 'PR87134462'),
('PD18785978', 'PR19912809'),
('PD19634039', 'PR97688224'),
('PD20020753', 'PR33274771'),
('PD21109349', 'PR52091063'),
('PD22069675', 'PR56696931'),
('PD23031389', 'PR76785851'),
('PD27175068', 'PR59583389'),
('PD27496576', 'PR97994498'),
('PD30843175', 'PR45005334'),
('PD30894780', 'PR21011143'),
('PD33834469', 'PR78222949'),
('PD35805212', 'PR48403051'),
('PD39713286', 'PR48403051'),
('PD43258149', 'PR62258980'),
('PD44220776', 'PR98448306'),
('PD46783344', 'PR48403051'),
('PD47763167', 'PR33274771'),
('PD48593340', 'PR44805876'),
('PD48628594', 'PR59583389'),
('PD52816612', 'PR59583389'),
('PD53218892', 'PR87134462'),
('PD57856718', 'PR97688224'),
('PD58041511', 'PR19912809'),
('PD60185744', 'PR97994498'),
('PD60339348', 'PR45005334'),
('PD62154365', 'PR43783578'),
('PD62321669', 'PR33846028'),
('PD62596246', 'PR97688224'),
('PD63821765', 'PR76785851'),
('PD66334927', 'PR32616125'),
('PD68133903', 'PR43783578'),
('PD68787354', 'PR44088429'),
('PD69673358', 'PR33846028'),
('PD71724278', 'PR78222949'),
('PD72174317', 'PR56696931'),
('PD72945147', 'PR87134462'),
('PD76693622', 'PR83010754'),
('PD77126100', 'PR27804270'),
('PD77475653', 'PR56696931'),
('PD79889565', 'PR21011143'),
('PD80503802', 'PR21011143'),
('PD81370959', 'PR32616125'),
('PD84176755', 'PR27804270'),
('PD85252812', 'PR62258980'),
('PD86903926', 'PR27804270'),
('PD88828639', 'PR44088429'),
('PD88871658', 'PR33274771'),
('PD88949720', 'PR98448306'),
('PD93614794', 'PR19912809'),
('PD96171348', 'PR52091063'),
('PD97764058', 'PR33846028');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `promocion`
--

DROP TABLE IF EXISTS `promocion`;
CREATE TABLE `promocion` (
  `ID_Promocion` varchar(20) NOT NULL,
  `Nombre` varchar(100) NOT NULL,
  `Descuento` decimal(5,2) NOT NULL,
  `Condiciones` text NOT NULL,
  `Activo` tinyint(1) DEFAULT 0,
  `Fecha_inicio` date NOT NULL,
  `Fecha_final` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `promocion`
--

INSERT INTO `promocion` (`ID_Promocion`, `Nombre`, `Descuento`, `Condiciones`, `Activo`, `Fecha_inicio`, `Fecha_final`) VALUES
('PR19912809', 'Promoción Navidad 2025', 0.20, '25 de diciembre y con INE vigente', 0, '2025-12-10', '2026-04-05'),
('PR21011143', 'Promoción Cumpleaños', 0.50, 'el dia de tu cumpleaños', 1, '0004-06-26', '2029-08-26'),
('PR27804270', 'Sábado de Sartenes', 0.25, 'Evento', 1, '0009-03-26', '0006-09-26'),
('PR32616125', 'Cumbre del Relleno Secreto', 0.10, 'Evento', 1, '0006-04-26', '0009-07-26'),
('PR33274771', 'Promoción Aniversario', 0.30, '5 de junio', 1, '2023-05-26', '2028-12-26'),
('PR33846028', 'Noche Crepas & Estrellas', 0.10, 'Evento', 1, '0001-07-26', '2013-09-26'),
('PR43783578', 'Maratón 12 Sabores', 0.10, 'Evento', 1, '0008-05-26', '0007-11-26'),
('PR44088429', 'Torneo Maestro Crepero', 0.10, 'Evento', 1, '2024-01-26', '0004-07-26'),
('PR44805876', 'Promoción San Valentin', 0.10, '14 de febrero', 1, '0004-04-26', '2026-07-26'),
('PR45005334', 'Carnaval Relleno Supremo', 0.20, 'Evento', 1, '2017-05-26', '2020-10-26'),
('PR48403051', 'Promoción Halloween', 0.10, '30 de octubre', 1, '2011-05-26', '2022-12-26'),
('PR52091063', 'Feria Sabores del Mundo en Crepa', 0.20, 'Evento', 1, '0007-04-26', '2010-10-26'),
('PR56696931', 'Noche Fuego y Nutella', 0.20, 'Evento', 1, '0006-04-26', '0009-11-26'),
('PR59583389', 'Promoción Semana Santa', 0.10, '2 y 3 de abril', 1, '2016-01-26', '2020-08-26'),
('PR62258980', 'Feria Dulce Espiral', 0.10, 'Evento', 1, '2030-03-26', '0004-08-26'),
('PR76785851', 'Gala Sabor Circular', 0.10, 'Evento', 1, '0007-03-26', '0009-08-26'),
('PR78222949', 'Promoción Dia de la independencia', 0.10, '16 de septiembre', 1, '2026-01-26', '2011-12-26'),
('PR83010754', 'Tarde Fruta & Chocolate', 0.10, 'Evento', 1, '2010-02-26', '2029-11-26'),
('PR87134462', 'Promoción Año Nuevo', 0.10, '1 de enero', 1, '2021-01-26', '2027-07-26'),
('PR97688224', 'Encuentro Sabores en Capas', 0.10, 'Evento', 1, '2023-03-26', '2022-09-26'),
('PR97994498', 'Festival Giro Dorado', 0.20, 'Evento', 1, '2018-04-26', '2023-11-26'),
('PR98448306', 'Brunch La Vuelta Francesa', 0.10, 'Evento', 1, '0004-06-26', '2024-07-26');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `review`
--

DROP TABLE IF EXISTS `review`;
CREATE TABLE `review` (
  `ID_Review` varchar(10) NOT NULL,
  `ID_Orden` varchar(10) NOT NULL,
  `Puntaje` int(11) DEFAULT NULL CHECK (`Puntaje` between 1 and 5),
  `Comentario` text DEFAULT NULL,
  `Fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `review`
--

INSERT INTO `review` (`ID_Review`, `ID_Orden`, `Puntaje`, `Comentario`, `Fecha`) VALUES
('RV00207889', 'OD20045010', 4, '\"Pedí un platillo específico y lo trajeron mal dos veces. Al final decidí quedarme con lo que trajeron porque ya había pasado demasiado tiempo. No hubo ninguna compensación por el error.\"', '2026-05-04 06:00:00'),
('RV00327279', 'OD52937565', 2, '\"El ambiente se siente poco acogedor. La iluminación es demasiado tenue y el mobiliario se ve desgastado.\"', '2026-10-09 06:00:00'),
('RV03307873', 'OD13593992', 5, '\"El lugar tenía un olor extraño al entrar, lo que no fue una buena señal.\"', '2026-02-14 06:00:00'),
('RV03714370', 'OD55639966', 3, '\"El personal parecía más enfocado en otras mesas que en la nuestra.\"', '2026-12-03 06:00:00'),
('RV04544279', 'OD81537460', 2, '\"No respetaron nuestra reservación y nos hicieron esperar más de 30 minutos. No ofrecieron ninguna disculpa clara por el inconveniente.\"', '2026-02-13 06:00:00'),
('RV08740311', 'OD13125507', 3, '\"La cuenta llegó con cargos incorrectos. Tuvimos que revisar cuidadosamente y pedir que la corrigieran.\"', '2026-03-13 06:00:00'),
('RV12546199', 'OD33655470', 5, '\"La sopa estaba tibia y parecía recalentada. No tenía la textura ni el sabor de algo recién preparado.\"', '2026-07-06 06:00:00'),
('RV13616182', 'OD16211107', 5, '\"El restaurante se veía descuidado. Las mesas estaban sucias y el piso tenía restos de comida. Eso genera desconfianza inmediata sobre la higiene en la cocina.\"', '2026-03-05 06:00:00'),
('RV15461338', 'OD34843825', 2, '\"Desde que llegamos notamos falta de organización. Tardaron en atendernos y el personal parecía confundido con las mesas. La comida no compensó la mala primera impresión.\"', '2026-09-26 06:00:00'),
('RV15543623', 'OD73450134', 1, '\"El restaurante se ve bonito, pero la experiencia no está a la altura de la imagen que proyecta.\"', '2026-04-03 06:00:00'),
('RV19984223', 'OD97056014', 5, '\"No hubo ninguna cortesía ni disculpa cuando cometieron errores en el pedido. La actitud fue indiferente.\"', '2026-03-25 06:00:00'),
('RV21373030', 'OD94187424', 3, '\"La comida estaba excesivamente salada. Intentaron justificarlo diciendo que era parte del estilo del platillo, pero claramente fue un error en la preparación.\"', '2026-09-27 06:00:00'),
('RV25600980', 'OD66638248', 2, '\"La carne estaba dura y difícil de cortar. No parecía un corte de buena calidad.\"', '2026-10-15 06:00:00'),
('RV29498819', 'OD04094069', 4, '\"La música no iba acorde al ambiente del lugar y resultaba incómoda.\"', '2026-02-15 06:00:00'),
('RV30244631', 'OD68369798', 1, '\"La carne estaba sobrecocida y seca. Cuando pedí que la cambiaran, regresó igual o incluso más hecha.\"', '2026-12-22 06:00:00'),
('RV31683814', 'OD37925699', 2, '\"El personal parecía desorganizado. Los meseros se confundían con las mesas y varios pedidos llegaron a personas equivocadas.\"', '2026-09-04 06:00:00'),
('RV37759634', 'OD62573621', 3, '\"El postre fue lo más decepcionante; estaba demasiado dulce y mal balanceado.\"', '2026-07-11 06:00:00'),
('RV45221385', 'OD06247561', 2, '\"El arroz estaba mal cocido y con textura extraña. Es un acompañamiento básico que debería estar bien hecho.\"', '2026-11-13 06:00:00'),
('RV45460656', 'OD38730521', 4, '\"Las bebidas tardaron demasiado en llegar, incluso más que los platillos principales. Es extraño tener que esperar tanto por algo tan básico.\"', '2026-10-13 06:00:00'),
('RV50953116', 'OD97294540', 2, '\"La comida llegó con exceso de grasa, lo que hizo que el platillo fuera pesado y poco agradable.\"', '2026-03-10 06:00:00'),
('RV52971113', 'OD51835069', 5, '\"El lugar estaba demasiado lleno y el ruido era excesivo. No se podía disfrutar la comida con tranquilidad.\"', '2026-03-06 06:00:00'),
('RV56152929', 'OD70011240', 5, '\"No se siente un trato personalizado ni interés en que el cliente regrese.\"', '2026-01-21 06:00:00'),
('RV56468800', 'OD33951115', 2, '\"La experiencia fue inconsistente: algunos detalles buenos, pero demasiados errores pequeños acumulados.\"', '2026-02-21 06:00:00'),
('RV56468822', 'OD97294540', 5, '¡Me encanto el servicio al cliente! sigan así Maree :)', '2026-04-08 16:30:17'),
('RV57850532', 'OD69891418', 3, '\"La comida tenía buena presentación, pero el sabor fue bastante simple y sin personalidad. Esperaba algo más elaborado por el precio que pagamos.\"', '2026-10-02 06:00:00'),
('RV58936868', 'OD45723683', 1, '\"Las porciones no corresponden al costo. Pagas más por la decoración que por la calidad.\"', '2026-03-08 06:00:00'),
('RV60602190', 'OD33804496', 1, '\"Las bebidas estaban aguadas y sin sabor. Parecía que habían reducido la calidad para ahorrar costos.\"', '2026-03-20 06:00:00'),
('RV63454513', 'OD68164439', 1, '\"La presentación del platillo fue descuidada, con salsa derramada en el borde del plato. Parece un detalle menor, pero suma a la percepción negativa.\"', '2026-03-27 06:00:00'),
('RV63730948', 'OD19367239', 5, '\"La comida llegó fría y claramente llevaba tiempo preparada. El sabor no era malo, pero la temperatura arruinó completamente la experiencia. Por el precio que cobran, esperaba mucho más cuidado.\"', '2026-08-20 06:00:00'),
('RV63888993', 'OD68555825', 1, '\"La ensalada no parecía fresca y los ingredientes estaban marchitos.\"', '2026-11-19 06:00:00'),
('RV64296584', 'OD06185513', 3, '\"El postre llegó congelado por dentro, lo que indica que no fue preparado correctamente. Fue el cierre perfecto para una mala experiencia.\"', '2026-12-18 06:00:00'),
('RV66036881', 'OD33014213', 2, '\"La espera para recibir la cuenta fue innecesariamente larga.\"', '2026-03-21 06:00:00'),
('RV66447302', 'OD15848927', 5, '\"En general, la visita dejó más frustración que satisfacción, y no considero que valga la pena repetirla.\"', '2026-04-05 06:00:00'),
('RV66828415', 'OD82644084', 4, '\"El servicio fue impersonal y poco atento. Nunca preguntaron si todo estaba bien o si necesitábamos algo adicional.\"', '2026-12-24 06:00:00'),
('RV67175891', 'OD07290680', 4, '\"La música estaba demasiado fuerte, lo que hacía imposible mantener una conversación tranquila. No es un ambiente cómodo para ir en familia o tener una reunión.\"', '2026-12-23 06:00:00'),
('RV67240690', 'OD96747780', 5, '\"El servicio fue extremadamente lento. Esperamos casi una hora por nuestros platillos y nadie se acercó a explicarnos la demora. La falta de comunicación fue lo más frustrante.\"', '2026-06-14 06:00:00'),
('RV71211324', 'OD17661841', 5, '\"El menú ofrecía muchas opciones, pero varias no estaban disponibles. Eso limitó bastante nuestra elección.\"', '2026-01-07 06:00:00'),
('RV73476287', 'OD54215310', 3, '\"El estacionamiento es muy limitado y no ofrecen alternativas claras\"', '2026-10-06 06:00:00'),
('RV74284346', 'OD54491099', 4, '\"El menú se ve atractivo, pero los sabores no cumplen lo que prometen. Mucha expectativa y poco resultado.\"', '2026-10-22 06:00:00'),
('RV77126879', 'OD96155417', 4, '\"Tuvimos que esperar mucho tiempo incluso para que nos trajeran cubiertos. Son detalles pequeños que hacen ver falta de atención.\"', '2026-01-08 06:00:00'),
('RV77194355', 'OD23043487', 4, '\"Las porciones son muy pequeñas en comparación con el precio. La presentación es buena, pero la cantidad no justifica el costo.\"', '2026-09-08 06:00:00'),
('RV78080393', 'OD96250697', 2, '\"La relación calidad-precio no es adecuada. Hay otros lugares con mejor sabor y mejor servicio por el mismo costo.\"', '2026-06-05 06:00:00'),
('RV79456498', 'OD03911196', 1, '\"La carne estaba dura y difícil de cortar. No parecía un corte de buena calidad.\"', '2026-01-17 06:00:00'),
('RV83171652', 'OD16481371', 4, '\"La iluminación es demasiado baja, lo que dificulta incluso leer el menú.\"', '2026-03-09 06:00:00'),
('RV83460592', 'OD62481224', 1, '\"La experiencia fue bastante decepcionante desde el inicio. Tardaron mucho en asignarnos una mesa aun cuando el lugar no estaba lleno. Además, el personal no fue amable ni atento durante el servicio\"', '2026-05-27 06:00:00'),
('RV87815418', 'OD03274399', 4, '\"En general, la experiencia no fue satisfactoria. Entre la demora, la falta de atención y la calidad promedio de la comida, no es un lugar al que regresaría ni recomendaría.\"', '2026-02-14 06:00:00'),
('RV89146407', 'OD81178473', 4, '\"El mesero nunca volvió a la mesa después de traer la comida. Tuvimos que levantarnos para pedir la cuenta.\"', '2026-11-23 06:00:00'),
('RV91277237', 'OD48634931', 3, '\"El baño estaba en malas condiciones, sin papel y con mal olor. Ese tipo de detalles influyen mucho en la percepción general del lugar.\"', '2026-07-04 06:00:00'),
('RV93786427', 'OD58196492', 2, '\"El servicio fue lento incluso en un día que no parecía estar muy concurrido.\"', '2026-05-07 06:00:00'),
('RV93822597', 'OD37616868', 5, '\"Nos trajeron los platillos en tiempos muy distintos, lo que hizo que unos terminaran de comer mientras otros apenas empezaban. Eso arruina la experiencia en grupo.\"', '2026-04-15 06:00:00'),
('RV96260005', 'OD59250531', 3, '\"La experiencia en general fue promedio, pero el precio sugiere algo mucho mejor.\"', '2026-11-10 06:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

DROP TABLE IF EXISTS `rol`;
CREATE TABLE `rol` (
  `Rol` varchar(15) NOT NULL,
  `Activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`Rol`, `Activo`) VALUES
('Administrador', 1),
('Colaborador', 1),
('Usuario', 1),
('Usuario No regi', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol_tiene_privilegio`
--

DROP TABLE IF EXISTS `rol_tiene_privilegio`;
CREATE TABLE `rol_tiene_privilegio` (
  `ID_Rol` varchar(15) NOT NULL,
  `ID_Privilegio` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `rol_tiene_privilegio`
--

INSERT INTO `rol_tiene_privilegio` (`ID_Rol`, `ID_Privilegio`) VALUES
('Administrador', 'Agrega status royalty'),
('Administrador', 'Agregar ingrediente'),
('Administrador', 'Califica servicio'),
('Administrador', 'Cancela pedido activo'),
('Administrador', 'Confirma de pedido'),
('Administrador', 'Consulta catalogo de eventos'),
('Administrador', 'Consulta catalogo de ingredien'),
('Administrador', 'Consulta catalogo de productos'),
('Administrador', 'Consulta catalogo de promocion'),
('Administrador', 'Consulta historial de pedidos '),
('Administrador', 'Consulta sección de empleados'),
('Administrador', 'Crea status royalty'),
('Administrador', 'Da de alta empleados'),
('Administrador', 'Da de baja empleados'),
('Administrador', 'Elimina evento'),
('Administrador', 'Elimina eventos'),
('Administrador', 'Elimina platillo'),
('Administrador', 'Elimina promocion'),
('Administrador', 'Elimina promociones'),
('Administrador', 'Elimina status royalty'),
('Administrador', 'Eliminar ingrediente'),
('Administrador', 'Eliminar ingrediente de platil'),
('Administrador', 'Modifica días hábiles'),
('Administrador', 'Modifica evento'),
('Administrador', 'Modifica eventos'),
('Administrador', 'Modifica ingrediente de platil'),
('Administrador', 'Modifica platillo existente'),
('Administrador', 'Modifica promocion'),
('Administrador', 'Modifica promociones'),
('Administrador', 'Modifica roles y privilegios d'),
('Administrador', 'Modifica royalty'),
('Administrador', 'Modifica status royalty'),
('Administrador', 'Modificar menu (tentativo)'),
('Administrador', 'Reclama premio royalty'),
('Administrador', 'Regista inicio de sesión'),
('Administrador', 'Registra creación de cuenta'),
('Administrador', 'Registra días hábiles'),
('Administrador', 'Registra evento'),
('Administrador', 'Registra ingrediente agotado'),
('Administrador', 'Registra ingrediente nuevo'),
('Administrador', 'Registra nuevo mensaje a usuar'),
('Administrador', 'Registra platillo agotado'),
('Administrador', 'Registra platillo especial'),
('Administrador', 'Registra platillo nuevo'),
('Administrador', 'Registra promoción'),
('Administrador', 'Registra promociones'),
('Administrador', 'Registrar orden '),
('Administrador', 'Selecciona lugar de consumo'),
('Administrador', 'Visualiza días hábiles'),
('Administrador', 'Visualiza el nivel de lealtad '),
('Administrador', 'Visualiza feedback de clientes'),
('Administrador', 'Visualiza historial de comenta'),
('Administrador', 'Visualiza información royalty'),
('Administrador', 'Visualiza la cantidad de visit'),
('Administrador', 'Visualiza menu'),
('Administrador', 'Visualiza métricas'),
('Administrador', 'Visualiza promociones'),
('Administrador', 'Visualiza resumen de pedido'),
('Administrador', 'Visualiza su nivel de lealtad'),
('Colaborador', 'Registrar ingrediente nuevo'),
('Usuario', 'Registrar creación de crepa'),
('Usuario No regi', 'Registra visita del cliente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sucursal`
--

DROP TABLE IF EXISTS `sucursal`;
CREATE TABLE `sucursal` (
  `ID_Sucursal` varchar(10) NOT NULL,
  `Nombre` varchar(50) NOT NULL,
  `Ciudad` varchar(50) NOT NULL,
  `Estado` varchar(50) NOT NULL,
  `País` varchar(50) NOT NULL,
  `Municipio` varchar(50) NOT NULL,
  `Calle` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `sucursal`
--

INSERT INTO `sucursal` (`ID_Sucursal`, `Nombre`, `Ciudad`, `Estado`, `País`, `Municipio`, `Calle`) VALUES
('SC36895371', 'Sucursal Mazatlan Original', 'Mazatlan', 'Sinaloa', 'Mexico', 'Mazatlan', '123. Av. Humberto'),
('SC62053621', 'Sucursal Zapopan Americas', 'Zapopan', 'Jalisco', 'Mexico', 'Gdl', '789. Av. Americas'),
('SC79425454', 'Sucursal Culiacán Zapata', 'Culiacán Rosales', 'Sinaloa', 'Mexico', 'Culiacan', '456. Blvd. Zapata');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tamaño`
--

DROP TABLE IF EXISTS `tamaño`;
CREATE TABLE `tamaño` (
  `Nombre` varchar(50) NOT NULL,
  `MultiplicadorPrecio` decimal(3,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `tamaño`
--

INSERT INTO `tamaño` (`Nombre`, `MultiplicadorPrecio`) VALUES
('Básico', 1.00),
('Chico', 0.75),
('Extra Grande', 1.50),
('Grande', 1.25);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipos`
--

DROP TABLE IF EXISTS `tipos`;
CREATE TABLE `tipos` (
  `nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `tipos`
--

INSERT INTO `tipos` (`nombre`) VALUES
('Artesanal'),
('Caliente'),
('Dulce'),
('Frío'),
('Otros'),
('Salado'),
('Vegano');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `turno`
--

DROP TABLE IF EXISTS `turno`;
CREATE TABLE `turno` (
  `ID_Turno` varchar(20) NOT NULL,
  `Nombre_Turno` varchar(50) NOT NULL,
  `Fecha` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `turno`
--

INSERT INTO `turno` (`ID_Turno`, `Nombre_Turno`, `Fecha`) VALUES
('TN26496107', 'Matutino', '2026-03-31'),
('TN46937585', 'Verpertino', '2026-04-03'),
('TN47025996', 'Nocturno', '2026-04-06');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `turno_tiene_sucursal`
--

DROP TABLE IF EXISTS `turno_tiene_sucursal`;
CREATE TABLE `turno_tiene_sucursal` (
  `ID_Turno` varchar(20) NOT NULL,
  `ID_Sucursal` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `turno_tiene_sucursal`
--

INSERT INTO `turno_tiene_sucursal` (`ID_Turno`, `ID_Sucursal`) VALUES
('TN26496107', 'SC36895371'),
('TN26496107', 'SC62053621'),
('TN26496107', 'SC79425454'),
('TN46937585', 'SC36895371'),
('TN46937585', 'SC62053621'),
('TN46937585', 'SC79425454'),
('TN47025996', 'SC36895371'),
('TN47025996', 'SC62053621'),
('TN47025996', 'SC79425454');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `calendario`
--
ALTER TABLE `calendario`
  ADD PRIMARY KEY (`ID_Calendario`),
  ADD KEY `ID_Sucursal` (`ID_Sucursal`);

--
-- Indices de la tabla `categoría`
--
ALTER TABLE `categoría`
  ADD PRIMARY KEY (`Nombre`);

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`Numero_Telefonico`),
  ADD KEY `Nombre_Royalty` (`Nombre_Royalty`),
  ADD KEY `ID_Rol` (`ID_Rol`);

--
-- Indices de la tabla `cliente_canjea_promociones`
--
ALTER TABLE `cliente_canjea_promociones`
  ADD PRIMARY KEY (`Numero_Telefonico`,`ID_Promocion`,`FECHA`),
  ADD KEY `ID_Promocion` (`ID_Promocion`);

--
-- Indices de la tabla `codigo_verificacion`
--
ALTER TABLE `codigo_verificacion`
  ADD PRIMARY KEY (`Numero_Telefonico`,`Codigo`);

--
-- Indices de la tabla `colaborador`
--
ALTER TABLE `colaborador`
  ADD PRIMARY KEY (`ID_Colaborador`),
  ADD KEY `ID_Rol` (`ID_Rol`);

--
-- Indices de la tabla `colaborador_tiene_turno`
--
ALTER TABLE `colaborador_tiene_turno`
  ADD PRIMARY KEY (`ID_Colaborador`,`ID_Turno`),
  ADD KEY `ID_Turno` (`ID_Turno`);

--
-- Indices de la tabla `estado_royalty`
--
ALTER TABLE `estado_royalty`
  ADD PRIMARY KEY (`Nombre_Royalty`);

--
-- Indices de la tabla `estado_royalty_da_eventos`
--
ALTER TABLE `estado_royalty_da_eventos`
  ADD PRIMARY KEY (`Nombre_Royalty`,`ID_Evento`),
  ADD KEY `fk_evento_id` (`ID_Evento`);

--
-- Indices de la tabla `estado_royalty_da_promociones`
--
ALTER TABLE `estado_royalty_da_promociones`
  ADD PRIMARY KEY (`Nombre_Royalty`,`ID_Promocion`),
  ADD KEY `ID_Promocion` (`ID_Promocion`);

--
-- Indices de la tabla `evento`
--
ALTER TABLE `evento`
  ADD PRIMARY KEY (`ID_Evento`);

--
-- Indices de la tabla `evento_contiene_promocion`
--
ALTER TABLE `evento_contiene_promocion`
  ADD PRIMARY KEY (`ID_Evento`,`ID_Promocion`),
  ADD KEY `ID_Promocion` (`ID_Promocion`);

--
-- Indices de la tabla `insumo`
--
ALTER TABLE `insumo`
  ADD PRIMARY KEY (`ID_Insumo`),
  ADD KEY `Categoría` (`Categoría`);

--
-- Indices de la tabla `mensaje`
--
ALTER TABLE `mensaje`
  ADD PRIMARY KEY (`ID_Mensaje`);

--
-- Indices de la tabla `mensaje_notifica_cliente`
--
ALTER TABLE `mensaje_notifica_cliente`
  ADD PRIMARY KEY (`Numero_Telefonico`,`ID_Mensaje`),
  ADD KEY `ID_Mensaje` (`ID_Mensaje`);

--
-- Indices de la tabla `orden`
--
ALTER TABLE `orden`
  ADD PRIMARY KEY (`ID_Orden`),
  ADD KEY `ID_Turno` (`ID_Turno`),
  ADD KEY `Numero_Telefonico` (`Numero_Telefonico`);

--
-- Indices de la tabla `orden_tiene_producto`
--
ALTER TABLE `orden_tiene_producto`
  ADD PRIMARY KEY (`ID_Orden`,`ID_Producto`),
  ADD KEY `ID_Producto` (`ID_Producto`);

--
-- Indices de la tabla `pago`
--
ALTER TABLE `pago`
  ADD PRIMARY KEY (`ID_Pago`),
  ADD KEY `ID_Orden` (`ID_Orden`);

--
-- Indices de la tabla `privilegio`
--
ALTER TABLE `privilegio`
  ADD PRIMARY KEY (`Privilegio`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`ID_Producto`),
  ADD KEY `Categoría` (`Categoría`),
  ADD KEY `Tamaño` (`Tamaño`),
  ADD KEY `fk_tipos` (`Tipo`);

--
-- Indices de la tabla `producto_pertenece_evento`
--
ALTER TABLE `producto_pertenece_evento`
  ADD PRIMARY KEY (`ID_Evento`,`ID_Producto`),
  ADD KEY `ID_Producto` (`ID_Producto`);

--
-- Indices de la tabla `producto_tiene_insumo`
--
ALTER TABLE `producto_tiene_insumo`
  ADD PRIMARY KEY (`ID_Producto`,`ID_Insumo`),
  ADD KEY `ID_Insumo` (`ID_Insumo`);

--
-- Indices de la tabla `producto_tiene_promocion`
--
ALTER TABLE `producto_tiene_promocion`
  ADD PRIMARY KEY (`ID_Producto`,`ID_Promocion`),
  ADD KEY `ID_Promocion` (`ID_Promocion`);

--
-- Indices de la tabla `promocion`
--
ALTER TABLE `promocion`
  ADD PRIMARY KEY (`ID_Promocion`);

--
-- Indices de la tabla `review`
--
ALTER TABLE `review`
  ADD PRIMARY KEY (`ID_Review`),
  ADD KEY `ID_Orden` (`ID_Orden`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`Rol`);

--
-- Indices de la tabla `rol_tiene_privilegio`
--
ALTER TABLE `rol_tiene_privilegio`
  ADD PRIMARY KEY (`ID_Rol`,`ID_Privilegio`),
  ADD KEY `ID_Privilegio` (`ID_Privilegio`);

--
-- Indices de la tabla `sucursal`
--
ALTER TABLE `sucursal`
  ADD PRIMARY KEY (`ID_Sucursal`);

--
-- Indices de la tabla `tamaño`
--
ALTER TABLE `tamaño`
  ADD PRIMARY KEY (`Nombre`);

--
-- Indices de la tabla `tipos`
--
ALTER TABLE `tipos`
  ADD PRIMARY KEY (`nombre`);

--
-- Indices de la tabla `turno`
--
ALTER TABLE `turno`
  ADD PRIMARY KEY (`ID_Turno`);

--
-- Indices de la tabla `turno_tiene_sucursal`
--
ALTER TABLE `turno_tiene_sucursal`
  ADD PRIMARY KEY (`ID_Turno`,`ID_Sucursal`),
  ADD KEY `ID_Sucursal` (`ID_Sucursal`);

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `calendario`
--
ALTER TABLE `calendario`
  ADD CONSTRAINT `calendario_ibfk_1` FOREIGN KEY (`ID_Sucursal`) REFERENCES `sucursal` (`ID_Sucursal`) ON DELETE CASCADE;

--
-- Filtros para la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD CONSTRAINT `cliente_ibfk_1` FOREIGN KEY (`Nombre_Royalty`) REFERENCES `estado_royalty` (`Nombre_Royalty`) ON DELETE SET NULL,
  ADD CONSTRAINT `cliente_ibfk_2` FOREIGN KEY (`ID_Rol`) REFERENCES `rol` (`Rol`);

--
-- Filtros para la tabla `cliente_canjea_promociones`
--
ALTER TABLE `cliente_canjea_promociones`
  ADD CONSTRAINT `cliente_canjea_promociones_ibfk_1` FOREIGN KEY (`Numero_Telefonico`) REFERENCES `cliente` (`Numero_Telefonico`),
  ADD CONSTRAINT `cliente_canjea_promociones_ibfk_2` FOREIGN KEY (`ID_Promocion`) REFERENCES `promocion` (`ID_Promocion`);

--
-- Filtros para la tabla `codigo_verificacion`
--
ALTER TABLE `codigo_verificacion`
  ADD CONSTRAINT `codigo_verificacion_ibfk_1` FOREIGN KEY (`Numero_Telefonico`) REFERENCES `cliente` (`Numero_Telefonico`) ON DELETE CASCADE;

--
-- Filtros para la tabla `colaborador`
--
ALTER TABLE `colaborador`
  ADD CONSTRAINT `colaborador_ibfk_1` FOREIGN KEY (`ID_Rol`) REFERENCES `rol` (`Rol`);

--
-- Filtros para la tabla `colaborador_tiene_turno`
--
ALTER TABLE `colaborador_tiene_turno`
  ADD CONSTRAINT `colaborador_tiene_turno_ibfk_1` FOREIGN KEY (`ID_Colaborador`) REFERENCES `colaborador` (`ID_Colaborador`) ON DELETE CASCADE,
  ADD CONSTRAINT `colaborador_tiene_turno_ibfk_2` FOREIGN KEY (`ID_Turno`) REFERENCES `turno` (`ID_Turno`) ON DELETE CASCADE;

--
-- Filtros para la tabla `estado_royalty_da_eventos`
--
ALTER TABLE `estado_royalty_da_eventos`
  ADD CONSTRAINT `fk_evento_id` FOREIGN KEY (`ID_Evento`) REFERENCES `evento` (`ID_Evento`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_royalty_nombre` FOREIGN KEY (`Nombre_Royalty`) REFERENCES `estado_royalty` (`Nombre_Royalty`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `estado_royalty_da_promociones`
--
ALTER TABLE `estado_royalty_da_promociones`
  ADD CONSTRAINT `estado_royalty_da_promociones_ibfk_1` FOREIGN KEY (`Nombre_Royalty`) REFERENCES `estado_royalty` (`Nombre_Royalty`),
  ADD CONSTRAINT `estado_royalty_da_promociones_ibfk_2` FOREIGN KEY (`ID_Promocion`) REFERENCES `promocion` (`ID_Promocion`);

--
-- Filtros para la tabla `evento_contiene_promocion`
--
ALTER TABLE `evento_contiene_promocion`
  ADD CONSTRAINT `evento_contiene_promocion_ibfk_1` FOREIGN KEY (`ID_Evento`) REFERENCES `evento` (`ID_Evento`) ON DELETE CASCADE,
  ADD CONSTRAINT `evento_contiene_promocion_ibfk_2` FOREIGN KEY (`ID_Promocion`) REFERENCES `promocion` (`ID_Promocion`) ON DELETE CASCADE;

--
-- Filtros para la tabla `insumo`
--
ALTER TABLE `insumo`
  ADD CONSTRAINT `insumo_ibfk_1` FOREIGN KEY (`Categoría`) REFERENCES `categoría` (`Nombre`);

--
-- Filtros para la tabla `mensaje_notifica_cliente`
--
ALTER TABLE `mensaje_notifica_cliente`
  ADD CONSTRAINT `mensaje_notifica_cliente_ibfk_1` FOREIGN KEY (`Numero_Telefonico`) REFERENCES `cliente` (`Numero_Telefonico`) ON DELETE CASCADE,
  ADD CONSTRAINT `mensaje_notifica_cliente_ibfk_2` FOREIGN KEY (`ID_Mensaje`) REFERENCES `mensaje` (`ID_Mensaje`) ON DELETE CASCADE;

--
-- Filtros para la tabla `orden`
--
ALTER TABLE `orden`
  ADD CONSTRAINT `orden_ibfk_1` FOREIGN KEY (`ID_Turno`) REFERENCES `turno` (`ID_Turno`),
  ADD CONSTRAINT `orden_ibfk_2` FOREIGN KEY (`Numero_Telefonico`) REFERENCES `cliente` (`Numero_Telefonico`) ON DELETE SET NULL;

--
-- Filtros para la tabla `orden_tiene_producto`
--
ALTER TABLE `orden_tiene_producto`
  ADD CONSTRAINT `orden_tiene_producto_ibfk_1` FOREIGN KEY (`ID_Orden`) REFERENCES `orden` (`ID_Orden`) ON DELETE CASCADE,
  ADD CONSTRAINT `orden_tiene_producto_ibfk_2` FOREIGN KEY (`ID_Producto`) REFERENCES `producto` (`ID_Producto`);

--
-- Filtros para la tabla `pago`
--
ALTER TABLE `pago`
  ADD CONSTRAINT `pago_ibfk_1` FOREIGN KEY (`ID_Orden`) REFERENCES `orden` (`ID_Orden`) ON DELETE CASCADE;

--
-- Filtros para la tabla `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `fk_tipos` FOREIGN KEY (`Tipo`) REFERENCES `tipos` (`nombre`) ON UPDATE CASCADE,
  ADD CONSTRAINT `producto_ibfk_1` FOREIGN KEY (`Categoría`) REFERENCES `categoría` (`Nombre`),
  ADD CONSTRAINT `producto_ibfk_2` FOREIGN KEY (`Tamaño`) REFERENCES `tamaño` (`Nombre`);

--
-- Filtros para la tabla `producto_pertenece_evento`
--
ALTER TABLE `producto_pertenece_evento`
  ADD CONSTRAINT `producto_pertenece_evento_ibfk_1` FOREIGN KEY (`ID_Evento`) REFERENCES `evento` (`ID_Evento`) ON DELETE CASCADE,
  ADD CONSTRAINT `producto_pertenece_evento_ibfk_2` FOREIGN KEY (`ID_Producto`) REFERENCES `producto` (`ID_Producto`) ON DELETE CASCADE;

--
-- Filtros para la tabla `producto_tiene_insumo`
--
ALTER TABLE `producto_tiene_insumo`
  ADD CONSTRAINT `producto_tiene_insumo_ibfk_1` FOREIGN KEY (`ID_Producto`) REFERENCES `producto` (`ID_Producto`) ON DELETE CASCADE,
  ADD CONSTRAINT `producto_tiene_insumo_ibfk_2` FOREIGN KEY (`ID_Insumo`) REFERENCES `insumo` (`ID_Insumo`) ON DELETE CASCADE;

--
-- Filtros para la tabla `producto_tiene_promocion`
--
ALTER TABLE `producto_tiene_promocion`
  ADD CONSTRAINT `producto_tiene_promocion_ibfk_1` FOREIGN KEY (`ID_Producto`) REFERENCES `producto` (`ID_Producto`) ON DELETE CASCADE,
  ADD CONSTRAINT `producto_tiene_promocion_ibfk_2` FOREIGN KEY (`ID_Promocion`) REFERENCES `promocion` (`ID_Promocion`) ON DELETE CASCADE;

--
-- Filtros para la tabla `review`
--
ALTER TABLE `review`
  ADD CONSTRAINT `review_ibfk_1` FOREIGN KEY (`ID_Orden`) REFERENCES `orden` (`ID_Orden`) ON DELETE CASCADE;

--
-- Filtros para la tabla `rol_tiene_privilegio`
--
ALTER TABLE `rol_tiene_privilegio`
  ADD CONSTRAINT `rol_tiene_privilegio_ibfk_1` FOREIGN KEY (`ID_Rol`) REFERENCES `rol` (`Rol`) ON DELETE CASCADE,
  ADD CONSTRAINT `rol_tiene_privilegio_ibfk_2` FOREIGN KEY (`ID_Privilegio`) REFERENCES `privilegio` (`Privilegio`) ON DELETE CASCADE;

--
-- Filtros para la tabla `turno_tiene_sucursal`
--
ALTER TABLE `turno_tiene_sucursal`
  ADD CONSTRAINT `turno_tiene_sucursal_ibfk_1` FOREIGN KEY (`ID_Turno`) REFERENCES `turno` (`ID_Turno`),
  ADD CONSTRAINT `turno_tiene_sucursal_ibfk_2` FOREIGN KEY (`ID_Sucursal`) REFERENCES `sucursal` (`ID_Sucursal`);

  SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
