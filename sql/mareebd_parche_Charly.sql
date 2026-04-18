-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 15-04-2026 a las 20:25:14
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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `calendario`
--

CREATE TABLE `calendario` (
  `ID_Calendario` varchar(10) NOT NULL,
  `ID_Sucursal` varchar(10) NOT NULL,
  `Fecha` date NOT NULL,
  `Es_Laboral` tinyint(1) DEFAULT 0,
  `Descripción` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoría`
--

CREATE TABLE `categoría` (
  `Nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente_canjea_promociones`
--

CREATE TABLE `cliente_canjea_promociones` (
  `Numero_Telefonico` varchar(20) NOT NULL,
  `ID_Promocion` varchar(20) NOT NULL,
  `FECHA` date NOT NULL,
  `Canjeado` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `codigo_verificacion`
--

CREATE TABLE `codigo_verificacion` (
  `Numero_Telefonico` varchar(20) NOT NULL,
  `Codigo` varchar(6) NOT NULL,
  `Fecha_Creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `Fecha_Expiracion` datetime NOT NULL,
  `Usado` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `colaborador`
--

CREATE TABLE `colaborador` (
  `ID_Colaborador` varchar(20) NOT NULL,
  `ID_Rol` varchar(20) NOT NULL,
  `Nombre` varchar(100) NOT NULL,
  `Contraseña` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `colaborador_tiene_turno`
--

CREATE TABLE `colaborador_tiene_turno` (
  `ID_Colaborador` varchar(20) NOT NULL,
  `ID_Turno` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_royalty`
--

CREATE TABLE `estado_royalty` (
  `Nombre_Royalty` varchar(50) NOT NULL,
  `Número_de_prioridad` int(11) NOT NULL,
  `Descripción` text NOT NULL,
  `Max_Visitas` int(11) NOT NULL,
  `Min_Visitas` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_royalty_da_promociones`
--

CREATE TABLE `estado_royalty_da_promociones` (
  `Nombre_Royalty` varchar(50) NOT NULL,
  `ID_Promocion` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `evento`
--

CREATE TABLE `evento` (
  `ID_Evento` varchar(20) NOT NULL,
  `Nombre` varchar(100) NOT NULL,
  `Descripcion` text DEFAULT NULL,
  `Activo` tinyint(1) DEFAULT 0,
  `Fecha_Inicio` date NOT NULL,
  `Fecha_Final` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `evento_contiene_promocion`
--

CREATE TABLE `evento_contiene_promocion` (
  `ID_Evento` varchar(20) NOT NULL,
  `ID_Promocion` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `insumo`
--

CREATE TABLE `insumo` (
  `ID_Insumo` varchar(10) NOT NULL,
  `Nombre` varchar(50) NOT NULL,
  `Categoría` varchar(50) NOT NULL,
  `Precio` decimal(10,2) DEFAULT 0.00,
  `Activo` tinyint(1) DEFAULT 1,
  `Tipo` varchar(20) DEFAULT NULL,
  `Imagen` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensaje`
--

CREATE TABLE `mensaje` (
  `ID_Mensaje` varchar(20) NOT NULL,
  `Titulo` varchar(100) NOT NULL,
  `Texto` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensaje_notifica_cliente`
--

CREATE TABLE `mensaje_notifica_cliente` (
  `Numero_Telefonico` varchar(20) NOT NULL,
  `ID_Mensaje` varchar(20) NOT NULL,
  `Fecha_Envio` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden`
--

CREATE TABLE `orden` (
  `ID_Orden` varchar(10) NOT NULL,
  `ID_Turno` varchar(20) NOT NULL,
  `Numero_Telefonico` varchar(20) DEFAULT NULL,
  `Tipo_Orden` enum('Sucursal','Pick-up','Delivery') NOT NULL,
  `Nombre_cliente` varchar(50) DEFAULT NULL,
  `Estado_Orden` enum('Pendiente','Preparando','Listo','Entregado','Cancelado') DEFAULT 'Pendiente',
  `Fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_tiene_producto`
--

CREATE TABLE `orden_tiene_producto` (
  `ID_Orden` varchar(10) NOT NULL,
  `ID_Producto` varchar(10) NOT NULL,
  `Cantidad` int(11) NOT NULL,
  `Precio_Venta` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pago`
--

CREATE TABLE `pago` (
  `ID_Pago` varchar(10) NOT NULL,
  `ID_Orden` varchar(10) NOT NULL,
  `Monto` decimal(10,2) NOT NULL,
  `Metodo_Pago` enum('Efectivo','Tarjeta','Transferencia','Puntos_Royalty') NOT NULL,
  `Fecha_Pago` timestamp NOT NULL DEFAULT current_timestamp(),
  `ID_Transacción` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `privilegio`
--

CREATE TABLE `privilegio` (
  `Privilegio` varchar(30) NOT NULL,
  `Transferible` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_pertenece_evento`
--

CREATE TABLE `producto_pertenece_evento` (
  `ID_Evento` varchar(20) NOT NULL,
  `ID_Producto` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_tiene_insumo`
--

CREATE TABLE `producto_tiene_insumo` (
  `ID_Producto` varchar(10) NOT NULL,
  `ID_Insumo` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_tiene_promocion`
--

CREATE TABLE `producto_tiene_promocion` (
  `ID_Producto` varchar(20) NOT NULL,
  `ID_Promocion` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `promocion`
--

CREATE TABLE `promocion` (
  `ID_Promocion` varchar(20) NOT NULL,
  `Nombre` varchar(100) NOT NULL,
  `Descuento` decimal(5,2) NOT NULL,
  `Condiciones` text NOT NULL,
  `Activo` tinyint(1) DEFAULT 0,
  `Fecha_inicio` date NOT NULL,
  `Fecha_final` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `review`
--

CREATE TABLE `review` (
  `ID_Review` varchar(10) NOT NULL,
  `ID_Orden` varchar(10) NOT NULL,
  `Puntaje` int(11) DEFAULT NULL CHECK (`Puntaje` between 1 and 5),
  `Comentario` text DEFAULT NULL,
  `Fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `Rol` varchar(15) NOT NULL,
  `Activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol_tiene_privilegio`
--

CREATE TABLE `rol_tiene_privilegio` (
  `ID_Rol` varchar(15) NOT NULL,
  `ID_Privilegio` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sucursal`
--

CREATE TABLE `sucursal` (
  `ID_Sucursal` varchar(10) NOT NULL,
  `Nombre` varchar(50) NOT NULL,
  `Ciudad` varchar(50) NOT NULL,
  `Estado` varchar(50) NOT NULL,
  `País` varchar(50) NOT NULL,
  `Municipio` varchar(50) NOT NULL,
  `Calle` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tamaño`
--

CREATE TABLE `tamaño` (
  `Nombre` varchar(50) NOT NULL,
  `MultiplicadorPrecio` decimal(3,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipos`
--

CREATE TABLE `tipos` (
  `nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `turno`
--

CREATE TABLE `turno` (
  `ID_Turno` varchar(20) NOT NULL,
  `Nombre_Turno` varchar(50) NOT NULL,
  `Fecha` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `turno_tiene_sucursal`
--

CREATE TABLE `turno_tiene_sucursal` (
  `ID_Turno` varchar(20) NOT NULL,
  `ID_Sucursal` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
