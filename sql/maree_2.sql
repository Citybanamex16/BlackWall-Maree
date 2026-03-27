-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 26, 2026 at 04:11 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `marée 2.0`
--

-- --------------------------------------------------------

--
-- Table structure for table `categoría`
--

CREATE TABLE `categoría` (
  `Categoría` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cliente`
--

CREATE TABLE `cliente` (
  `ID_Cliente` varchar(10) NOT NULL,
  `Nombre_Royalty` varchar(100) NOT NULL,
  `Nombre_Cliente` varchar(100) NOT NULL,
  `Numero telefonico` varchar(20) NOT NULL,
  `Correo` varchar(100) NOT NULL,
  `Genero` varchar(10) NOT NULL,
  `Fecha de nacimiento` date NOT NULL,
  `Edad` int(11) NOT NULL,
  `Visitas Actual` int(11) NOT NULL,
  `Codigo_verificacion` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cliente_notifica_mensaje`
--

CREATE TABLE `cliente_notifica_mensaje` (
  `ID_Cliente` varchar(10) NOT NULL,
  `ID_Mensaje` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `colaborador`
--

CREATE TABLE `colaborador` (
  `ID_Colaborador` varchar(10) NOT NULL,
  `Rol` varchar(100) NOT NULL,
  `Id_Sucursal` varchar(10) NOT NULL,
  `Nombre` varchar(20) NOT NULL,
  `Turno` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `estado_royalty`
--

CREATE TABLE `estado_royalty` (
  `Nombre_royalty` varchar(100) NOT NULL,
  `Numero de prioridad` int(11) NOT NULL,
  `Descripción` longtext NOT NULL,
  `Max_vistas` int(11) NOT NULL,
  `Min_vistas` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `evento`
--

CREATE TABLE `evento` (
  `ID_Evento` varchar(10) NOT NULL,
  `ID_Producto` varchar(10) NOT NULL,
  `Nombre_Royalty` varchar(100) NOT NULL,
  `ID_Promo` varchar(10) NOT NULL,
  `Nombre` varchar(100) NOT NULL,
  `Descripción` longtext NOT NULL,
  `Fecha_inicio` date NOT NULL,
  `Fecha_Final` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `insumo`
--

CREATE TABLE `insumo` (
  `ID_Insumo` varchar(10) NOT NULL,
  `Categoría` varchar(100) NOT NULL,
  `Nombre` varchar(40) NOT NULL,
  `Precio` float NOT NULL,
  `Activo` tinyint(5) NOT NULL,
  `Tipo` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mensaje`
--

CREATE TABLE `mensaje` (
  `ID_Mensaje` varchar(10) NOT NULL,
  `Texto` longtext NOT NULL,
  `Fecha` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orden`
--

CREATE TABLE `orden` (
  `ID_Orden` varchar(10) NOT NULL,
  `ID_Sucursal` varchar(10) NOT NULL,
  `ID_Cliente` int(11) NOT NULL,
  `Estado` varchar(100) NOT NULL,
  `Mesa` int(11) NOT NULL,
  `Fecha` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orden_participa_colaborador`
--

CREATE TABLE `orden_participa_colaborador` (
  `ID_Colaborador` varchar(10) NOT NULL,
  `ID_Orden` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orden_tiene_producto`
--

CREATE TABLE `orden_tiene_producto` (
  `ID_Orden` varchar(10) NOT NULL,
  `ID_producto` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `privilegio`
--

CREATE TABLE `privilegio` (
  `Privilegio` varchar(100) NOT NULL,
  `Transferible` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `producto`
--

CREATE TABLE `producto` (
  `ID_Producto` varchar(10) NOT NULL,
  `Tamaño` varchar(100) NOT NULL,
  `Categoría` varchar(100) NOT NULL,
  `Nombre` varchar(50) NOT NULL,
  `Precio` float NOT NULL,
  `Disponible` varchar(100) NOT NULL,
  `Tipo` varchar(100) NOT NULL,
  `Imagen` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `producto_tiene_insumo`
--

CREATE TABLE `producto_tiene_insumo` (
  `ID_Producto` varchar(10) NOT NULL,
  `ID_Insumo` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `promocion`
--

CREATE TABLE `promocion` (
  `ID_Promo` varchar(10) NOT NULL,
  `Nombre` varchar(100) NOT NULL,
  `Descuento` float NOT NULL,
  `Condiciones` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `review`
--

CREATE TABLE `review` (
  `ID_Review` varchar(10) NOT NULL,
  `ID_Orden` varchar(10) NOT NULL,
  `Puntaje` double NOT NULL,
  `Fecha` date NOT NULL,
  `Comentario` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rol`
--

CREATE TABLE `rol` (
  `Rol` varchar(100) NOT NULL,
  `Privilegio` varchar(100) NOT NULL,
  `Activo` tinyint(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sucursal`
--

CREATE TABLE `sucursal` (
  `ID_Sucursal` varchar(10) NOT NULL,
  `Ciudad` int(11) NOT NULL,
  `Estado` int(11) NOT NULL,
  `País` int(11) NOT NULL,
  `Municipio` int(11) NOT NULL,
  `Calle` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tamaño`
--

CREATE TABLE `tamaño` (
  `Tamaño` varchar(20) NOT NULL,
  `MultiplicadorPrecio` double NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categoría`
--
ALTER TABLE `categoría`
  ADD PRIMARY KEY (`Categoría`);

--
-- Indexes for table `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`ID_Cliente`,`Nombre_Royalty`),
  ADD KEY `Nombre_Royalty` (`Nombre_Royalty`);

--
-- Indexes for table `cliente_notifica_mensaje`
--
ALTER TABLE `cliente_notifica_mensaje`
  ADD PRIMARY KEY (`ID_Cliente`,`ID_Mensaje`),
  ADD KEY `ID_Mensaje` (`ID_Mensaje`);

--
-- Indexes for table `colaborador`
--
ALTER TABLE `colaborador`
  ADD PRIMARY KEY (`ID_Colaborador`,`Rol`,`Id_Sucursal`),
  ADD KEY `Id_Sucursal` (`Id_Sucursal`);

--
-- Indexes for table `estado_royalty`
--
ALTER TABLE `estado_royalty`
  ADD PRIMARY KEY (`Nombre_royalty`);

--
-- Indexes for table `evento`
--
ALTER TABLE `evento`
  ADD PRIMARY KEY (`ID_Evento`,`ID_Producto`,`Nombre_Royalty`,`ID_Promo`),
  ADD KEY `ID_Promo` (`ID_Promo`),
  ADD KEY `ID_Producto` (`ID_Producto`),
  ADD KEY `Nombre_Royalty` (`Nombre_Royalty`);

--
-- Indexes for table `insumo`
--
ALTER TABLE `insumo`
  ADD PRIMARY KEY (`ID_Insumo`,`Categoría`),
  ADD KEY `Categoría` (`Categoría`);

--
-- Indexes for table `mensaje`
--
ALTER TABLE `mensaje`
  ADD PRIMARY KEY (`ID_Mensaje`);

--
-- Indexes for table `orden`
--
ALTER TABLE `orden`
  ADD PRIMARY KEY (`ID_Orden`,`ID_Sucursal`,`ID_Cliente`),
  ADD KEY `ID_Sucursal` (`ID_Sucursal`);

--
-- Indexes for table `orden_participa_colaborador`
--
ALTER TABLE `orden_participa_colaborador`
  ADD PRIMARY KEY (`ID_Colaborador`,`ID_Orden`),
  ADD KEY `ID_Orden` (`ID_Orden`);

--
-- Indexes for table `orden_tiene_producto`
--
ALTER TABLE `orden_tiene_producto`
  ADD PRIMARY KEY (`ID_producto`,`ID_Orden`),
  ADD KEY `ID_Orden` (`ID_Orden`);

--
-- Indexes for table `privilegio`
--
ALTER TABLE `privilegio`
  ADD PRIMARY KEY (`Privilegio`);

--
-- Indexes for table `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`ID_Producto`,`Tamaño`,`Categoría`),
  ADD KEY `Tamaño` (`Tamaño`),
  ADD KEY `Categoría` (`Categoría`);

--
-- Indexes for table `producto_tiene_insumo`
--
ALTER TABLE `producto_tiene_insumo`
  ADD PRIMARY KEY (`ID_Producto`,`ID_Insumo`),
  ADD KEY `ID_Insumo` (`ID_Insumo`);

--
-- Indexes for table `promocion`
--
ALTER TABLE `promocion`
  ADD PRIMARY KEY (`ID_Promo`);

--
-- Indexes for table `review`
--
ALTER TABLE `review`
  ADD PRIMARY KEY (`ID_Review`,`ID_Orden`),
  ADD KEY `ID_Orden` (`ID_Orden`);

--
-- Indexes for table `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`Rol`,`Privilegio`),
  ADD KEY `Privilegio` (`Privilegio`);

--
-- Indexes for table `sucursal`
--
ALTER TABLE `sucursal`
  ADD PRIMARY KEY (`ID_Sucursal`);

--
-- Indexes for table `tamaño`
--
ALTER TABLE `tamaño`
  ADD PRIMARY KEY (`Tamaño`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cliente`
--
ALTER TABLE `cliente`
  ADD CONSTRAINT `cliente_ibfk_1` FOREIGN KEY (`ID_Cliente`) REFERENCES `cliente_notifica_mensaje` (`ID_Cliente`),
  ADD CONSTRAINT `cliente_ibfk_2` FOREIGN KEY (`Nombre_Royalty`) REFERENCES `estado_royalty` (`Nombre_royalty`);

--
-- Constraints for table `cliente_notifica_mensaje`
--
ALTER TABLE `cliente_notifica_mensaje`
  ADD CONSTRAINT `cliente_notifica_mensaje_ibfk_1` FOREIGN KEY (`ID_Mensaje`) REFERENCES `mensaje` (`ID_Mensaje`);

--
-- Constraints for table `colaborador`
--
ALTER TABLE `colaborador`
  ADD CONSTRAINT `colaborador_ibfk_1` FOREIGN KEY (`Id_Sucursal`) REFERENCES `sucursal` (`ID_Sucursal`);

--
-- Constraints for table `evento`
--
ALTER TABLE `evento`
  ADD CONSTRAINT `evento_ibfk_1` FOREIGN KEY (`ID_Promo`) REFERENCES `promocion` (`ID_Promo`),
  ADD CONSTRAINT `evento_ibfk_2` FOREIGN KEY (`ID_Producto`) REFERENCES `producto` (`ID_Producto`),
  ADD CONSTRAINT `evento_ibfk_3` FOREIGN KEY (`Nombre_Royalty`) REFERENCES `estado_royalty` (`Nombre_royalty`);

--
-- Constraints for table `insumo`
--
ALTER TABLE `insumo`
  ADD CONSTRAINT `insumo_ibfk_1` FOREIGN KEY (`Categoría`) REFERENCES `categoría` (`Categoría`);

--
-- Constraints for table `orden`
--
ALTER TABLE `orden`
  ADD CONSTRAINT `orden_ibfk_1` FOREIGN KEY (`ID_Sucursal`) REFERENCES `sucursal` (`ID_Sucursal`);

--
-- Constraints for table `orden_participa_colaborador`
--
ALTER TABLE `orden_participa_colaborador`
  ADD CONSTRAINT `orden_participa_colaborador_ibfk_1` FOREIGN KEY (`ID_Orden`) REFERENCES `orden` (`ID_Orden`),
  ADD CONSTRAINT `orden_participa_colaborador_ibfk_2` FOREIGN KEY (`ID_Colaborador`) REFERENCES `colaborador` (`ID_Colaborador`);

--
-- Constraints for table `orden_tiene_producto`
--
ALTER TABLE `orden_tiene_producto`
  ADD CONSTRAINT `orden_tiene_producto_ibfk_1` FOREIGN KEY (`ID_Orden`) REFERENCES `orden` (`ID_Orden`),
  ADD CONSTRAINT `orden_tiene_producto_ibfk_2` FOREIGN KEY (`ID_producto`) REFERENCES `producto` (`ID_Producto`);

--
-- Constraints for table `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `producto_ibfk_1` FOREIGN KEY (`Tamaño`) REFERENCES `tamaño` (`Tamaño`),
  ADD CONSTRAINT `producto_ibfk_2` FOREIGN KEY (`Categoría`) REFERENCES `categoría` (`Categoría`);

--
-- Constraints for table `producto_tiene_insumo`
--
ALTER TABLE `producto_tiene_insumo`
  ADD CONSTRAINT `producto_tiene_insumo_ibfk_1` FOREIGN KEY (`ID_Producto`) REFERENCES `producto` (`ID_Producto`),
  ADD CONSTRAINT `producto_tiene_insumo_ibfk_2` FOREIGN KEY (`ID_Insumo`) REFERENCES `insumo` (`ID_Insumo`);

--
-- Constraints for table `review`
--
ALTER TABLE `review`
  ADD CONSTRAINT `review_ibfk_1` FOREIGN KEY (`ID_Orden`) REFERENCES `orden` (`ID_Orden`);

--
-- Constraints for table `rol`
--
ALTER TABLE `rol`
  ADD CONSTRAINT `rol_ibfk_1` FOREIGN KEY (`Privilegio`) REFERENCES `privilegio` (`Privilegio`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
