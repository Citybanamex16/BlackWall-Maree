-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 06-03-2026 a las 00:03:55
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `prueba_maree`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `nombre` varchar(100) NOT NULL,
  `número_telefónico` varchar(20) NOT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `género` varchar(10) DEFAULT NULL,
  `fecha_de_nacimiento` date NOT NULL,
  `código_verificación` varchar(10) NOT NULL,
  `visitas_actual` int(11) NOT NULL,
  `nombre_royalty` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `colaborador`
--

CREATE TABLE `colaborador` (
  `nombre` varchar(100) NOT NULL,
  `turno` varchar(20) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `id_sucursal` varchar(10) NOT NULL,
  `nombre_rol` varchar(100) NOT NULL,
  `id_colaborador` varchar(10) NOT NULL,
  `contraseña` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `colaborador_orden`
--

CREATE TABLE `colaborador_orden` (
  `id_colaborador` varchar(10) NOT NULL,
  `id_orden` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `evento`
--

CREATE TABLE `evento` (
  `id_evento` varchar(10) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `descripción` longtext NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `evento_promocion`
--

CREATE TABLE `evento_promocion` (
  `id_promo` varchar(10) NOT NULL,
  `id_evento` varchar(10) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripción` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `insumo`
--

CREATE TABLE `insumo` (
  `id_insumo` varchar(10) NOT NULL,
  `nombre_insumo` varchar(100) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `precio` int(11) NOT NULL,
  `activo` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `insumo_producto`
--

CREATE TABLE `insumo_producto` (
  `id_insumo` varchar(10) NOT NULL,
  `id_producto` varchar(10) NOT NULL,
  `precio` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden`
--

CREATE TABLE `orden` (
  `id_orden` varchar(10) NOT NULL,
  `id_sucursal` varchar(10) NOT NULL,
  `número_cliente` varchar(20) NOT NULL,
  `id_producto` varchar(10) NOT NULL,
  `mesa` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `dirección` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `privilegio`
--

CREATE TABLE `privilegio` (
  `nombre` varchar(100) NOT NULL,
  `transferible` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `nombre_producto` varchar(100) NOT NULL,
  `id_producto` varchar(10) NOT NULL,
  `precio` int(11) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `etiqueta` varchar(100) NOT NULL,
  `tipo` varchar(100) NOT NULL,
  `tamaño` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_evento`
--

CREATE TABLE `producto_evento` (
  `id_evento` varchar(10) NOT NULL,
  `id_producto` varchar(10) NOT NULL,
  `cantidad` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `promociones`
--

CREATE TABLE `promociones` (
  `nombre` varchar(100) NOT NULL,
  `descuento` float NOT NULL,
  `condición` longtext NOT NULL,
  `id_promo` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `review`
--

CREATE TABLE `review` (
  `id_review` varchar(10) NOT NULL,
  `id_orden` varchar(10) NOT NULL,
  `puntaje` double NOT NULL,
  `fecha` date NOT NULL,
  `comentario` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `nombre` varchar(100) NOT NULL,
  `activo` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol_privilegio`
--

CREATE TABLE `rol_privilegio` (
  `nombre_rol` varchar(100) NOT NULL,
  `nombre_privilegio` varchar(100) NOT NULL,
  `activo` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `royalty_desbloquea_promocion`
--

CREATE TABLE `royalty_desbloquea_promocion` (
  `nombre_royalty` varchar(100) NOT NULL,
  `id_promociones` varchar(10) NOT NULL,
  `numero_visitas_desbloquear` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `status_royalty`
--

CREATE TABLE `status_royalty` (
  `nombre` varchar(100) NOT NULL,
  `descripción` longtext DEFAULT NULL,
  `max_visitas` int(11) NOT NULL,
  `min_visitas` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sucursal`
--

CREATE TABLE `sucursal` (
  `id_sucursal` varchar(10) NOT NULL,
  `país` varchar(100) NOT NULL,
  `ciudad` varchar(100) NOT NULL,
  `estado` varchar(100) NOT NULL,
  `municipio` varchar(100) NOT NULL,
  `calle` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tamaño`
--

CREATE TABLE `tamaño` (
  `tamaño` varchar(100) NOT NULL,
  `multiplicador` double NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`número_telefónico`),
  ADD KEY `fk_cliente_royalty` (`nombre_royalty`);

--
-- Indices de la tabla `colaborador`
--
ALTER TABLE `colaborador`
  ADD PRIMARY KEY (`id_colaborador`),
  ADD KEY `fk_sucursal` (`id_sucursal`),
  ADD KEY `fk_colaborador_rol` (`nombre_rol`);

--
-- Indices de la tabla `colaborador_orden`
--
ALTER TABLE `colaborador_orden`
  ADD PRIMARY KEY (`id_colaborador`,`id_orden`),
  ADD KEY `fk_colaborador` (`id_colaborador`),
  ADD KEY `fk_orden` (`id_orden`);

--
-- Indices de la tabla `evento`
--
ALTER TABLE `evento`
  ADD PRIMARY KEY (`id_evento`);

--
-- Indices de la tabla `evento_promocion`
--
ALTER TABLE `evento_promocion`
  ADD PRIMARY KEY (`id_promo`,`id_evento`),
  ADD KEY `fk_ep_promo` (`id_promo`),
  ADD KEY `fk_ep_evento` (`id_evento`);

--
-- Indices de la tabla `insumo`
--
ALTER TABLE `insumo`
  ADD PRIMARY KEY (`id_insumo`);

--
-- Indices de la tabla `insumo_producto`
--
ALTER TABLE `insumo_producto`
  ADD PRIMARY KEY (`id_insumo`,`id_producto`),
  ADD KEY `fk_ip_insumo` (`id_insumo`),
  ADD KEY `fk_ip_producto` (`id_producto`);

--
-- Indices de la tabla `orden`
--
ALTER TABLE `orden`
  ADD PRIMARY KEY (`id_orden`),
  ADD KEY `fk_orden_sucursal` (`id_sucursal`),
  ADD KEY `fk_orden_cliente` (`número_cliente`),
  ADD KEY `fk_orden_producto` (`id_producto`);

--
-- Indices de la tabla `privilegio`
--
ALTER TABLE `privilegio`
  ADD PRIMARY KEY (`nombre`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id_producto`);

--
-- Indices de la tabla `producto_evento`
--
ALTER TABLE `producto_evento`
  ADD PRIMARY KEY (`id_evento`,`id_producto`),
  ADD KEY `fk_pe_evento` (`id_evento`),
  ADD KEY `fk_pe_producto` (`id_producto`);

--
-- Indices de la tabla `promociones`
--
ALTER TABLE `promociones`
  ADD PRIMARY KEY (`id_promo`);

--
-- Indices de la tabla `review`
--
ALTER TABLE `review`
  ADD PRIMARY KEY (`id_review`),
  ADD KEY `fk_review_orden` (`id_orden`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`nombre`);

--
-- Indices de la tabla `rol_privilegio`
--
ALTER TABLE `rol_privilegio`
  ADD PRIMARY KEY (`nombre_rol`,`nombre_privilegio`),
  ADD KEY `fk_rp_rol` (`nombre_rol`),
  ADD KEY `fk_rp_privilegio` (`nombre_privilegio`);

--
-- Indices de la tabla `royalty_desbloquea_promocion`
--
ALTER TABLE `royalty_desbloquea_promocion`
  ADD PRIMARY KEY (`nombre_royalty`,`id_promociones`),
  ADD KEY `fk_rdp_royalty` (`nombre_royalty`),
  ADD KEY `fk_rdp_promo` (`id_promociones`);

--
-- Indices de la tabla `status_royalty`
--
ALTER TABLE `status_royalty`
  ADD PRIMARY KEY (`nombre`);

--
-- Indices de la tabla `sucursal`
--
ALTER TABLE `sucursal`
  ADD PRIMARY KEY (`id_sucursal`);

--
-- Indices de la tabla `tamaño`
--
ALTER TABLE `tamaño`
  ADD PRIMARY KEY (`tamaño`);

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD CONSTRAINT `fk_cliente_royalty` FOREIGN KEY (`nombre_royalty`) REFERENCES `status_royalty` (`nombre`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `colaborador`
--
ALTER TABLE `colaborador`
  ADD CONSTRAINT `fk_colaborador_rol` FOREIGN KEY (`nombre_rol`) REFERENCES `rol` (`nombre`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `colaborador_orden`
--
ALTER TABLE `colaborador_orden`
  ADD CONSTRAINT `fk_colaborador` FOREIGN KEY (`id_colaborador`) REFERENCES `colaborador` (`id_colaborador`),
  ADD CONSTRAINT `fk_orden` FOREIGN KEY (`id_orden`) REFERENCES `orden` (`id_orden`);

--
-- Filtros para la tabla `evento_promocion`
--
ALTER TABLE `evento_promocion`
  ADD CONSTRAINT `fk_ep_evento` FOREIGN KEY (`id_evento`) REFERENCES `evento` (`id_evento`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ep_promo` FOREIGN KEY (`id_promo`) REFERENCES `promociones` (`id_promo`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `insumo_producto`
--
ALTER TABLE `insumo_producto`
  ADD CONSTRAINT `fk_ip_insumo` FOREIGN KEY (`id_insumo`) REFERENCES `insumo` (`id_insumo`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ip_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `orden`
--
ALTER TABLE `orden`
  ADD CONSTRAINT `fk_orden_cliente` FOREIGN KEY (`número_cliente`) REFERENCES `cliente` (`número_telefónico`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_orden_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_orden_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `producto_evento`
--
ALTER TABLE `producto_evento`
  ADD CONSTRAINT `fk_pe_evento` FOREIGN KEY (`id_evento`) REFERENCES `evento` (`id_evento`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pe_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `review`
--
ALTER TABLE `review`
  ADD CONSTRAINT `fk_review_orden` FOREIGN KEY (`id_orden`) REFERENCES `orden` (`id_orden`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `rol_privilegio`
--
ALTER TABLE `rol_privilegio`
  ADD CONSTRAINT `fk_rp_privilegio` FOREIGN KEY (`nombre_privilegio`) REFERENCES `privilegio` (`nombre`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rp_rol` FOREIGN KEY (`nombre_rol`) REFERENCES `rol` (`nombre`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `royalty_desbloquea_promocion`
--
ALTER TABLE `royalty_desbloquea_promocion`
  ADD CONSTRAINT `fk_rdp_promo` FOREIGN KEY (`id_promociones`) REFERENCES `promociones` (`id_promo`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rdp_royalty` FOREIGN KEY (`nombre_royalty`) REFERENCES `status_royalty` (`nombre`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
